const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const { responderPergunta, gerarAula, iaConfigurada } = require('./ia-tutor');

const app = express();
const PORT = process.env.PORT || 3000;


// ============================================================
// CONFIGURAÇÕES
// ============================================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ============================================================
// SESSÃO DE LOGIN (permanece logado até "Fechar sessão")
// ============================================================

app.use(
    session({
        secret: 'biomentoria-segredo-2026',
        resave: false,
        saveUninitialized: false,
        rolling: true,

        cookie: {
            httpOnly: true,
            // 30 dias — só sai ao clicar em Fechar sessão
            maxAge: 1000 * 60 * 60 * 24 * 30,
            sameSite: 'lax'
        }
    })
);


// ============================================================
// BANCO DE DADOS
// ============================================================

const db = new sqlite3.Database(
    path.join(__dirname, 'biomentoria.db'),
    (err) => {
        if (err) {
            console.error('Erro ao abrir o banco de dados:', err.message);
        } else {
            console.log('Banco de dados conectado.');
        }
    }
);


// ============================================================
// CRIAR TABELAS
// ============================================================

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT,
            telefone TEXT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    `);

    // Aulas geradas pela IA e o progresso de cada aluno.
    db.run(`
        CREATE TABLE IF NOT EXISTS aulas_ia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER NOT NULL,
            tema TEXT NOT NULL,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            fonte TEXT NOT NULL,
            criada_em TEXT NOT NULL,
            concluida_em TEXT,
            acertos INTEGER,
            total INTEGER,
            FOREIGN KEY (aluno_id) REFERENCES clientes (id)
        )
    `);
});


// ============================================================
// MIDDLEWARE - EXIGIR LOGIN
// ============================================================

function exigirLogin(req, res, next) {
    if (!req.session.alunoId) {
        return res.redirect('/login.html');
    }
    next();
}


// ============================================================
// PROTEGER A PÁGINA DE AULAS
// (precisa ficar ANTES do express.static)
// ============================================================

app.get('/agendamentos.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'agendamentos.html'));
});


// ============================================================
// ARQUIVOS ESTÁTICOS (HTML, CSS, imagens)
// ============================================================

app.use(express.static(path.join(__dirname)));


// ============================================================
// CADASTRO
// ============================================================

app.post('/salvar-cliente', async (req, res) => {
    const {
        nome,
        cpf,
        telefone,
        email,
        senha,
        confirmarSenha
    } = req.body;

    if (!nome || !email || !senha || !confirmarSenha) {
        return res.status(400).send(`
            <h2>Cadastro incompleto</h2>
            <p>Preencha todos os campos obrigatórios.</p>
            <a href="/clientes.html">Voltar</a>
        `);
    }

    if (senha !== confirmarSenha) {
        return res.status(400).send(`
            <h2>Senhas diferentes</h2>
            <p>As senhas digitadas não são iguais.</p>
            <a href="/clientes.html">Voltar</a>
        `);
    }

    if (senha.length < 6) {
        return res.status(400).send(`
            <h2>Senha inválida</h2>
            <p>A senha precisa ter pelo menos 6 caracteres.</p>
            <a href="/clientes.html">Voltar</a>
        `);
    }

    const nomeLimpo = nome.trim();
    const cpfLimpo = cpf ? cpf.trim() : '';
    const telefoneLimpo = telefone ? telefone.trim() : '';
    const emailLimpo = email.trim().toLowerCase();

    db.get(
        `SELECT id FROM clientes WHERE email = ?`,
        [emailLimpo],
        async (err, aluno) => {
            if (err) {
                console.error(err);
                return res.status(500).send(`
                    <h2>Erro</h2>
                    <p>Erro ao consultar o banco de dados.</p>
                    <a href="/clientes.html">Voltar</a>
                `);
            }

            if (aluno) {
                return res.status(400).send(`
                    <h2>E-mail já cadastrado</h2>
                    <p>Este e-mail já possui uma conta.</p>
                    <a href="/login.html">Fazer login</a>
                `);
            }

            try {
                const senhaCriptografada = await bcrypt.hash(senha, 10);

                const sql = `
                    INSERT INTO clientes (nome, cpf, telefone, email, senha)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.run(
                    sql,
                    [nomeLimpo, cpfLimpo, telefoneLimpo, emailLimpo, senhaCriptografada],
                    function (err) {
                        if (err) {
                            console.error('Erro ao cadastrar:', err.message);
                            return res.status(500).send(`
                                <h2>Erro no cadastro</h2>
                                <p>Não foi possível criar sua conta.</p>
                                <a href="/clientes.html">Voltar</a>
                            `);
                        }

                        console.log('Novo aluno cadastrado:', nomeLimpo, '| ID:', this.lastID);
                        res.redirect('/login.html?ok=1');
                    }
                );
            } catch (hashErr) {
                console.error('Erro ao criptografar senha:', hashErr);
                return res.status(500).send(`
                    <h2>Erro no cadastro</h2>
                    <p>Não foi possível criar sua conta.</p>
                    <a href="/clientes.html">Voltar</a>
                `);
            }
        }
    );
});


// ============================================================
// LOGIN — erros voltam para login.html com aviso na tela
// ============================================================

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.redirect('/login.html?erro=1');
    }

    const emailLimpo = email.trim().toLowerCase();

    db.get(
        `SELECT id, nome, email, senha FROM clientes WHERE email = ?`,
        [emailLimpo],
        async (err, aluno) => {
            if (err) {
                console.error(err);
                return res.redirect('/login.html?erro=1');
            }

            if (!aluno) {
                return res.redirect('/login.html?erro=1');
            }

            let senhaCorreta = false;
            try {
                senhaCorreta = await bcrypt.compare(senha, aluno.senha);
            } catch (compareErr) {
                console.error('Erro ao comparar senha:', compareErr);
                return res.redirect('/login.html?erro=1');
            }

            if (!senhaCorreta) {
                return res.redirect('/login.html?erro=1');
            }

            req.session.regenerate((err) => {
                if (err) {
                    console.error('Erro ao criar sessão:', err);
                    return res.redirect('/login.html?erro=1');
                }

                req.session.alunoId = aluno.id;
                req.session.nomeAluno = aluno.nome;
                req.session.emailAluno = aluno.email;

                // Garante que a sessão seja salva antes do redirect
                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.error('Erro ao salvar sessão:', saveErr);
                        return res.redirect('/login.html?erro=1');
                    }
                    console.log('Aluno entrou:', aluno.nome, '| ID:', aluno.id);
                    res.redirect('/agendamentos.html');
                });
            });
        }
    );
});


// ============================================================
// DADOS DO ALUNO LOGADO
// ============================================================

app.get('/meu-aluno', exigirLogin, (req, res) => {
    db.get(
        `SELECT id, nome, email FROM clientes WHERE id = ?`,
        [req.session.alunoId],
        (err, aluno) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro no banco de dados.' });
            }
            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }
            res.json(aluno);
        }
    );
});


// ============================================================
// VERIFICAR LOGIN (usado pelo JavaScript da página de aulas)
// ============================================================

app.get('/verificar-login', (req, res) => {
    if (!req.session.alunoId) {
        return res.json({ logado: false });
    }

    res.json({
        logado: true,
        aluno: {
            id: req.session.alunoId,
            nome: req.session.nomeAluno,
            email: req.session.emailAluno
        }
    });
});


// ============================================================
// TUTOR DE BIOLOGIA COM IA
// ============================================================

function exigirLoginApi(req, res, next) {
    if (!req.session.alunoId) {
        return res.status(401).json({ erro: 'Entre na sua conta para usar o tutor.' });
    }
    next();
}

app.post('/api/ia-tutor', exigirLoginApi, async (req, res) => {
    const pergunta = typeof req.body.pergunta === 'string' ? req.body.pergunta.trim() : '';

    if (!pergunta) {
        return res.status(400).json({ erro: 'Escreva uma pergunta sobre Biologia.' });
    }

    if (pergunta.length > 500) {
        return res.status(400).json({ erro: 'A pergunta é muito longa. Use até 500 caracteres.' });
    }

    try {
        const { resposta, fonte } = await responderPergunta(pergunta);
        res.json({ resposta, fonte });
    } catch (erro) {
        console.error('Erro no tutor de IA:', erro);
        res.status(500).json({ erro: 'Não foi possível responder agora. Tente novamente.' });
    }
});


// ============================================================
// AULAS GERADAS PELA IA (salvas por aluno)
// ============================================================

// Remove o gabarito antes de enviar a aula para o navegador.
function aulaSemGabarito(conteudo) {
    return {
        tema: conteudo.tema,
        titulo: conteudo.titulo,
        secoes: conteudo.secoes,
        quiz: conteudo.quiz.map((questao) => ({
            pergunta: questao.pergunta,
            respostas: questao.respostas
        })),
        exercicios: conteudo.exercicios.map((questao) => ({
            pergunta: questao.pergunta,
            alternativas: questao.alternativas
        }))
    };
}

app.get('/api/aulas', exigirLoginApi, (req, res) => {
    db.all(
        `SELECT id, tema, titulo, fonte, criada_em, concluida_em, acertos, total
         FROM aulas_ia WHERE aluno_id = ? ORDER BY id`,
        [req.session.alunoId],
        (err, aulas) => {
            if (err) {
                console.error('Erro ao listar aulas:', err.message);
                return res.status(500).json({ erro: 'Erro ao carregar suas aulas.' });
            }
            res.json({ aulas });
        }
    );
});

app.get('/api/aulas/:id', exigirLoginApi, (req, res) => {
    db.get(
        `SELECT * FROM aulas_ia WHERE id = ? AND aluno_id = ?`,
        [req.params.id, req.session.alunoId],
        (err, aula) => {
            if (err) {
                console.error('Erro ao abrir aula:', err.message);
                return res.status(500).json({ erro: 'Erro ao abrir a aula.' });
            }
            if (!aula) {
                return res.status(404).json({ erro: 'Aula não encontrada.' });
            }

            res.json({
                id: aula.id,
                fonte: aula.fonte,
                criada_em: aula.criada_em,
                concluida_em: aula.concluida_em,
                acertos: aula.acertos,
                total: aula.total,
                aula: aulaSemGabarito(JSON.parse(aula.conteudo))
            });
        }
    );
});

app.post('/api/aulas/gerar', exigirLoginApi, (req, res) => {
    db.all(
        `SELECT tema FROM aulas_ia WHERE aluno_id = ?`,
        [req.session.alunoId],
        async (err, linhas) => {
            if (err) {
                console.error('Erro ao consultar temas já estudados:', err.message);
                return res.status(500).json({ erro: 'Erro ao gerar a aula.' });
            }

            try {
                const conteudo = await gerarAula(linhas.map((linha) => linha.tema));

                db.run(
                    `INSERT INTO aulas_ia (aluno_id, tema, titulo, conteudo, fonte, criada_em)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        req.session.alunoId,
                        conteudo.tema,
                        conteudo.titulo,
                        JSON.stringify(conteudo),
                        conteudo.fonte,
                        new Date().toISOString()
                    ],
                    function (erroInsert) {
                        if (erroInsert) {
                            console.error('Erro ao salvar aula:', erroInsert.message);
                            return res.status(500).json({ erro: 'Erro ao salvar a aula.' });
                        }

                        res.json({
                            id: this.lastID,
                            fonte: conteudo.fonte,
                            aula: aulaSemGabarito(conteudo)
                        });
                    }
                );
            } catch (erroIa) {
                console.error('Erro ao gerar aula:', erroIa);
                res.status(500).json({ erro: 'Não foi possível gerar a aula agora.' });
            }
        }
    );
});

app.post('/api/aulas/:id/responder', exigirLoginApi, (req, res) => {
    const respostasQuiz = Array.isArray(req.body.quiz) ? req.body.quiz : [];
    const respostasExercicios = Array.isArray(req.body.exercicios) ? req.body.exercicios : [];

    db.get(
        `SELECT * FROM aulas_ia WHERE id = ? AND aluno_id = ?`,
        [req.params.id, req.session.alunoId],
        (err, aula) => {
            if (err) {
                console.error('Erro ao corrigir aula:', err.message);
                return res.status(500).json({ erro: 'Erro ao corrigir a aula.' });
            }
            if (!aula) {
                return res.status(404).json({ erro: 'Aula não encontrada.' });
            }

            const conteudo = JSON.parse(aula.conteudo);

            const corrigir = (questoes, respostas) =>
                questoes.map((questao, indice) => ({
                    correta: questao.correta,
                    acertou: respostas[indice] === questao.correta
                }));

            const resultadoQuiz = corrigir(conteudo.quiz, respostasQuiz);
            const resultadoExercicios = corrigir(conteudo.exercicios, respostasExercicios);

            const acertos =
                resultadoQuiz.filter((item) => item.acertou).length +
                resultadoExercicios.filter((item) => item.acertou).length;
            const total = resultadoQuiz.length + resultadoExercicios.length;
            const concluidaEm = new Date().toISOString();

            db.run(
                `UPDATE aulas_ia SET concluida_em = ?, acertos = ?, total = ? WHERE id = ?`,
                [concluidaEm, acertos, total, aula.id],
                (erroUpdate) => {
                    if (erroUpdate) {
                        console.error('Erro ao salvar progresso:', erroUpdate.message);
                        return res.status(500).json({ erro: 'Erro ao salvar seu progresso.' });
                    }

                    res.json({
                        acertos,
                        total,
                        concluida_em: concluidaEm,
                        quiz: resultadoQuiz,
                        exercicios: resultadoExercicios
                    });
                }
            );
        }
    );
});


// ============================================================
// SAIR DA CONTA
// ============================================================

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao sair:', err);
        }
        res.redirect('/login.html');
    });
});


// ============================================================
// PÁGINA INICIAL
// ============================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ============================================================
// INICIAR SERVIDOR (compatível com Codespaces / terminal)
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
    console.log('==============================================');
    console.log('🚀 BioMentoria funcionando!');
    console.log(`🌐 http://localhost:${PORT}`);
    console.log('🔐 Sistema de cadastro e login ativado');
    console.log('📚 Aulas protegidas por login');
    console.log(
        iaConfigurada()
            ? '🤖 Tutor de IA ativo (OpenAI)'
            : '🤖 Tutor de IA respondendo com o conteúdo das aulas (defina OPENAI_API_KEY para usar a OpenAI)'
    );
    console.log('==============================================');
});

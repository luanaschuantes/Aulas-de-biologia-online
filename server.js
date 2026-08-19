const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: 'biomentoria-segredo-2026',
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30,
            sameSite: 'lax'
        }
    })
);

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
});

function exigirLogin(req, res, next) {
    if (!req.session.alunoId) {
        return res.redirect('/login.html');
    }
    next();
}

app.get('/agendamentos.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'agendamentos.html'));
});

app.get('/atividades.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'atividades.html'));
});

app.get('/atividade.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'atividade.html'));
});

app.get('/aula-citologia.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'aula-citologia.html'));
});

app.get('/aula-genetica.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'aula-genetica.html'));
});

app.get('/aula-ecologia.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'aula-ecologia.html'));
});

app.get('/aula-evolucao.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'aula-evolucao.html'));
});

app.get('/aula-fisiologia.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'aula-fisiologia.html'));
});

app.get('/aula-botanica.html', exigirLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'aula-botanica.html'));
});

app.use(express.static(path.join(__dirname)));

app.post('/salvar-cliente', async (req, res) => {
    const { nome, cpf, telefone, email, senha, confirmarSenha } = req.body;

    if (!nome || !email || !senha || !confirmarSenha) {
        return res.status(400).send('<h2>Cadastro incompleto</h2><p>Preencha todos os campos obrigatórios.</p><a href="/clientes.html">Voltar</a>');
    }

    if (senha !== confirmarSenha) {
        return res.status(400).send('<h2>Senhas diferentes</h2><p>As senhas digitadas não são iguais.</p><a href="/clientes.html">Voltar</a>');
    }

    if (senha.length < 6) {
        return res.status(400).send('<h2>Senha inválida</h2><p>A senha precisa ter pelo menos 6 caracteres.</p><a href="/clientes.html">Voltar</a>');
    }

    const nomeLimpo = nome.trim();
    const cpfLimpo = cpf ? cpf.trim() : '';
    const telefoneLimpo = telefone ? telefone.trim() : '';
    const emailLimpo = email.trim().toLowerCase();

    db.get(`SELECT id FROM clientes WHERE email = ?`, [emailLimpo], async (err, aluno) => {
        if (err) {
            console.error(err);
            return res.status(500).send('<h2>Erro</h2><p>Erro ao consultar o banco de dados.</p><a href="/clientes.html">Voltar</a>');
        }

        if (aluno) {
            return res.status(400).send('<h2>E-mail já cadastrado</h2><p>Este e-mail já possui uma conta.</p><a href="/login.html">Fazer login</a>');
        }

        try {
            const senhaCriptografada = await bcrypt.hash(senha, 10);
            db.run(
                `INSERT INTO clientes (nome, cpf, telefone, email, senha) VALUES (?, ?, ?, ?, ?)`,
                [nomeLimpo, cpfLimpo, telefoneLimpo, emailLimpo, senhaCriptografada],
                function (err) {
                    if (err) {
                        console.error('Erro ao cadastrar:', err.message);
                        return res.status(500).send('<h2>Erro no cadastro</h2><p>Não foi possível criar sua conta.</p><a href="/clientes.html">Voltar</a>');
                    }
                    console.log('Novo aluno cadastrado:', nomeLimpo, '| ID:', this.lastID);
                    res.redirect('/login.html?ok=1');
                }
            );
        } catch (hashErr) {
            console.error('Erro ao criptografar senha:', hashErr);
            return res.status(500).send('<h2>Erro no cadastro</h2><p>Não foi possível criar sua conta.</p><a href="/clientes.html">Voltar</a>');
        }
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.redirect('/login.html?erro=1');
    }

    const emailLimpo = email.trim().toLowerCase();

    db.get(`SELECT id, nome, email, senha FROM clientes WHERE email = ?`, [emailLimpo], async (err, aluno) => {
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

            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Erro ao salvar sessão:', saveErr);
                    return res.redirect('/login.html?erro=1');
                }
                console.log('Aluno entrou:', aluno.nome, '| ID:', aluno.id);
                res.redirect('/agendamentos.html');
            });
        });
    });
});

app.get('/meu-aluno', exigirLogin, (req, res) => {
    db.get(`SELECT id, nome, email FROM clientes WHERE id = ?`, [req.session.alunoId], (err, aluno) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no banco de dados.' });
        }
        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado.' });
        }
        res.json(aluno);
    });
});

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

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao sair:', err);
        }
        res.redirect('/login.html');
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('==============================================');
    console.log('🚀 BioMentoria funcionando!');
    console.log(`🌐 http://localhost:${PORT}`);
    console.log('🔐 Sistema de cadastro e login ativado');
    console.log('📚 Aulas e atividades protegidas por login');
    console.log('==============================================');
});

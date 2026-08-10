const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();


// ============================================================
// CONFIGURAÇÕES
// ============================================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ============================================================
// SESSÃO DE LOGIN
// ============================================================

app.use(
    session({
        secret: 'biomentoria-segredo-2026',
        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: 'lax'
        }
    })
);


// ============================================================
// BANCO DE DADOS
// ============================================================

const db =
    new sqlite3.Database('./biomentoria.db');


// ============================================================
// CRIAR TABELA DE ALUNOS
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

});


// ============================================================
// MIDDLEWARE - EXIGIR LOGIN
// ============================================================

function exigirLogin(req, res, next) {

    // Verifica se existe um aluno logado
    if (!req.session.alunoId) {

        // Se não estiver logado,
        // não permite acessar a página.
        return res.redirect('/login.html');

    }

    // Se estiver logado,
    // permite continuar.
    next();

}


// ============================================================
// PROTEGER A PÁGINA DE AULAS
// ============================================================
//
// IMPORTANTE:
// Esta rota precisa ficar ANTES de:
//
//     app.use(express.static('.'));
//
// Assim o Express não entrega
// agendamentos.html diretamente sem verificar login.
// ============================================================

app.get(
    '/agendamentos.html',
    exigirLogin,
    (req, res) => {

        res.sendFile(
            __dirname + '/agendamentos.html'
        );

    }
);


// ============================================================
// ARQUIVOS HTML / CSS / JS
// ============================================================
//
// Depois da rota protegida, liberamos os arquivos
// públicos do site.
//
// index.html
// clientes.html
// login.html
// estilo.css
// imagens
// JavaScript público
// etc.
// ============================================================

app.use(express.static('.'));


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


    // --------------------------------------------------------
    // VERIFICAR CAMPOS
    // --------------------------------------------------------

    if (
        !nome ||
        !email ||
        !senha ||
        !confirmarSenha
    ) {

        return res.status(400).send(`

            <h2>Cadastro incompleto</h2>

            <p>
                Preencha todos os campos obrigatórios.
            </p>

            <a href="/clientes.html">
                Voltar
            </a>

        `);

    }


    // --------------------------------------------------------
    // VERIFICAR SENHAS
    // --------------------------------------------------------

    if (senha !== confirmarSenha) {

        return res.status(400).send(`

            <h2>Senhas diferentes</h2>

            <p>
                As senhas digitadas não são iguais.
            </p>

            <a href="/clientes.html">
                Voltar
            </a>

        `);

    }


    // --------------------------------------------------------
    // TAMANHO DA SENHA
    // --------------------------------------------------------

    if (senha.length < 6) {

        return res.status(400).send(`

            <h2>Senha inválida</h2>

            <p>
                A senha precisa ter pelo menos
                6 caracteres.
            </p>

            <a href="/clientes.html">
                Voltar
            </a>

        `);

    }


    // --------------------------------------------------------
    // LIMPAR DADOS
    // --------------------------------------------------------

    const nomeLimpo =
        nome.trim();

    const cpfLimpo =
        cpf ? cpf.trim() : '';

    const telefoneLimpo =
        telefone ? telefone.trim() : '';

    const emailLimpo =
        email.trim().toLowerCase();


    // --------------------------------------------------------
    // VERIFICAR SE E-MAIL JÁ EXISTE
    // --------------------------------------------------------

    db.get(
        `
            SELECT id
            FROM clientes
            WHERE email = ?
        `,
        [emailLimpo],
        async (err, aluno) => {

            if (err) {

                console.error(err);

                return res.status(500).send(`

                    <h2>Erro</h2>

                    <p>
                        Erro ao consultar o banco de dados.
                    </p>

                    <a href="/clientes.html">
                        Voltar
                    </a>

                `);

            }


            // ------------------------------------------------
            // E-MAIL JÁ CADASTRADO
            // ------------------------------------------------

            if (aluno) {

                return res.status(400).send(`

                    <h2>E-mail já cadastrado</h2>

                    <p>
                        Este e-mail já possui uma conta.
                    </p>

                    <a href="/login.html">
                        Fazer login
                    </a>

                `);

            }


            // ------------------------------------------------
            // CRIPTOGRAFAR SENHA
            // ------------------------------------------------

            const senhaCriptografada =
                await bcrypt.hash(
                    senha,
                    10
                );


            // ------------------------------------------------
            // SALVAR ALUNO
            // ------------------------------------------------

            const sql = `

                INSERT INTO clientes
                (
                    nome,
                    cpf,
                    telefone,
                    email,
                    senha
                )

                VALUES (?, ?, ?, ?, ?)

            `;


            db.run(
                sql,
                [
                    nomeLimpo,
                    cpfLimpo,
                    telefoneLimpo,
                    emailLimpo,
                    senhaCriptografada
                ],
                function (err) {

                    if (err) {

                        console.error(
                            'Erro ao cadastrar:',
                            err.message
                        );

                        return res.status(500).send(`

                            <h2>Erro no cadastro</h2>

                            <p>
                                Não foi possível criar sua conta.
                            </p>

                            <a href="/clientes.html">
                                Voltar
                            </a>

                        `);

                    }


                    console.log(
                        'Novo aluno cadastrado:',
                        nomeLimpo,
                        '| ID:',
                        this.lastID
                    );


                    // ------------------------------------------------
                    // ENVIAR PARA LOGIN
                    // ------------------------------------------------

                    res.redirect(
                        '/login.html'
                    );

                }
            );

        }
    );

});


// ============================================================
// LOGIN
// ============================================================

app.post('/login', (req, res) => {

    const {
        email,
        senha
    } = req.body;


    // --------------------------------------------------------
    // VERIFICAR CAMPOS
    // --------------------------------------------------------

    if (!email || !senha) {

        return res.status(400).send(`

            <h2>Login incompleto</h2>

            <p>
                Digite seu e-mail e sua senha.
            </p>

            <a href="/login.html">
                Voltar para o login
            </a>

        `);

    }


    // --------------------------------------------------------
    // LIMPAR E-MAIL
    // --------------------------------------------------------

    const emailLimpo =
        email.trim().toLowerCase();


    // --------------------------------------------------------
    // PROCURAR ALUNO
    // --------------------------------------------------------

    db.get(
        `
            SELECT
                id,
                nome,
                email,
                senha
            FROM clientes
            WHERE email = ?
        `,
        [emailLimpo],
        async (err, aluno) => {

            if (err) {

                console.error(err);

                return res.status(500).send(`

                    <h2>Erro</h2>

                    <p>
                        Erro no banco de dados.
                    </p>

                    <a href="/login.html">
                        Voltar
                    </a>

                `);

            }


            // ------------------------------------------------
            // ALUNO NÃO ENCONTRADO
            // ------------------------------------------------

            if (!aluno) {

                return res.status(401).send(`

                    <h2>Login inválido</h2>

                    <p>
                        E-mail ou senha incorretos.
                    </p>

                    <a href="/login.html">
                        Tentar novamente
                    </a>

                `);

            }


            // ------------------------------------------------
            // COMPARAR SENHA
            // ------------------------------------------------

            const senhaCorreta =
                await bcrypt.compare(
                    senha,
                    aluno.senha
                );


            if (!senhaCorreta) {

                return res.status(401).send(`

                    <h2>Login inválido</h2>

                    <p>
                        E-mail ou senha incorretos.
                    </p>

                    <a href="/login.html">
                        Tentar novamente
                    </a>

                `);

            }


            // ------------------------------------------------
            // REGENERAR SESSÃO
            // ------------------------------------------------
            //
            // Isso cria uma nova sessão depois do login.
            // ------------------------------------------------

            req.session.regenerate(
                (err) => {

                    if (err) {

                        console.error(
                            'Erro ao criar sessão:',
                            err
                        );

                        return res.status(500).send(`

                            <h2>Erro no login</h2>

                            <p>
                                Não foi possível iniciar sua sessão.
                            </p>

                            <a href="/login.html">
                                Tentar novamente
                            </a>

                        `);

                    }


                    // ------------------------------------------------
                    // SALVAR DADOS DO ALUNO NA SESSÃO
                    // ------------------------------------------------

                    req.session.alunoId =
                        aluno.id;

                    req.session.nomeAluno =
                        aluno.nome;

                    req.session.emailAluno =
                        aluno.email;


                    console.log(
                        'Aluno entrou:',
                        aluno.nome,
                        '| ID:',
                        aluno.id
                    );


                    // ------------------------------------------------
                    // ENVIAR PARA AS AULAS
                    // ------------------------------------------------

                    res.redirect(
                        '/agendamentos.html'
                    );

                }
            );

        }
    );

});


// ============================================================
// DADOS DO ALUNO LOGADO
// ============================================================

app.get(
    '/meu-aluno',
    exigirLogin,
    (req, res) => {

        db.get(
            `
                SELECT
                    id,
                    nome,
                    email
                FROM clientes
                WHERE id = ?
            `,
            [req.session.alunoId],
            (err, aluno) => {

                if (err) {

                    return res.status(500).json({
                        erro:
                            'Erro no banco de dados.'
                    });

                }


                if (!aluno) {

                    return res.status(404).json({
                        erro:
                            'Aluno não encontrado.'
                    });

                }


                res.json(aluno);

            }
        );

    }
);


// ============================================================
// VERIFICAR LOGIN PELO JAVASCRIPT
// ============================================================

app.get(
    '/verificar-login',
    (req, res) => {

        if (!req.session.alunoId) {

            return res.json({
                logado: false
            });

        }


        res.json({

            logado: true,

            aluno: {

                id:
                    req.session.alunoId,

                nome:
                    req.session.nomeAluno,

                email:
                    req.session.emailAluno

            }

        });

    }
);


// ============================================================
// SAIR DA CONTA
// ============================================================

app.get(
    '/logout',
    (req, res) => {

        req.session.destroy(
            (err) => {

                if (err) {

                    console.error(
                        'Erro ao sair:',
                        err
                    );

                }


                res.redirect(
                    '/login.html'
                );

            }
        );

    }
);


// ============================================================
// PÁGINA INICIAL
// ============================================================

app.get(
    '/',
    (req, res) => {

        res.sendFile(
            __dirname + '/index.html'
        );

    }
);


// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(
    3000,
    () => {

        console.log(
            '=============================================='
        );

        console.log(
            '🚀 BioMentoria funcionando!'
        );

        console.log(
            '🌐 http://localhost:3000'
        );

        console.log(
            '🔐 Sistema de cadastro e login ativado'
        );

        console.log(
            '📚 Aulas protegidas por login'
        );

        console.log(
            '=============================================='
        );

    }
);

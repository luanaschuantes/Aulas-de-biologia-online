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
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);


// ============================================================
// ARQUIVOS HTML / CSS / JS
// ============================================================

app.use(express.static('.'));


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

                `);

            }


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


                    // ----------------------------------------
                    // MANDAR PARA LOGIN
                    // ----------------------------------------

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

                `);

            }


            // ------------------------------------------------
            // E-MAIL NÃO EXISTE
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
            // CRIAR LOGIN
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
            // IR PARA AS AULAS
            // ------------------------------------------------

            res.redirect(
                '/agendamentos.html'
            );

        }
    );

});


// ============================================================
// VERIFICAR SE ESTÁ LOGADO
// ============================================================

function exigirLogin(
    req,
    res,
    next
) {

    if (!req.session.alunoId) {

        return res.redirect(
            '/login.html'
        );

    }


    next();

}


// ============================================================
// PROTEGER A PÁGINA DE AULAS
// ============================================================

app.get(
    '/agendamentos.html',
    exigirLogin,
    (req, res) => {

        res.sendFile(
            __dirname +
            '/agendamentos.html'
        );

    }
);


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
// INÍCIO
// ============================================================

app.get(
    '/',
    (req, res) => {

        res.sendFile(
            __dirname +
            '/index.html'
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

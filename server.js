const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

/* =========================
   SESSÃO (LOGIN ADMIN)
========================= */
app.use(session({
    secret: 'biomentoria_secret',
    resave: false,
    saveUninitialized: true
}));

/* =========================
   BANCO
========================= */
const db = new sqlite3.Database('./siscristovao.db');

db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT,
        preco REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        servico_id INTEGER,
        data TEXT
    )`);
});

/* =========================
   ADMIN FIXO (VOCÊ)
========================= */
const ADMIN = {
    nome: "Luana Schuantes",
    senha: "luana2009"
};

/* =========================
   LOGIN ADMIN
========================= */
app.post('/login-admin', (req, res) => {
    const { nome, senha } = req.body;

    if (nome === ADMIN.nome && senha === ADMIN.senha) {
        req.session.admin = true;
        return res.redirect('/index.html');
    }

    res.send("Login inválido");
});

/* =========================
   PROTEÇÃO ADMIN
========================= */
function auth(req, res, next) {
    if (req.session.admin) next();
    else res.send("Acesso negado");
}

/* =========================
   LISTAR ALUNOS (ADMIN)
========================= */
app.get('/admin/alunos', auth, (req, res) => {
    db.all(`SELECT * FROM usuarios`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   CRIAR USUÁRIO (ALUNO)
========================= */
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    db.run(
        `INSERT INTO usuarios(nome,email,senha) VALUES (?,?,?)`,
        [nome, email, senha],
        () => res.redirect('/login.html')
    );
});

/* =========================
   CURSOS
========================= */
app.get('/cursos', (req, res) => {
    db.all(`SELECT * FROM servicos`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
    console.log("🚀 Sistema profissional rodando em http://localhost:3000");
});

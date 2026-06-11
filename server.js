const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

app.use(session({
    secret: 'biomentoria_secret_key',
    resave: false,
    saveUninitialized: false
}));

const db = new sqlite3.Database('./siscristovao.db');

/* =========================
   TABELAS
========================= */
db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        cpf TEXT,
        telefone TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);
});

/* =========================
   ADMIN FIXO
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
        return res.redirect('/admin.html');
    }

    return res.send("❌ Login inválido");
});

/* =========================
   LOGOUT
========================= */
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/index.html'));
});

/* =========================
   PROTEÇÃO ADMIN
========================= */
function auth(req, res, next) {
    if (req.session.admin) return next();
    return res.redirect('/login.html');
}

/* =========================
   CLIENTES
========================= */
app.post('/salvar-cliente', (req, res) => {
    const { nome, cpf, telefone } = req.body;

    db.run(
        `INSERT INTO clientes(nome,cpf,telefone) VALUES (?,?,?)`,
        [nome, cpf, telefone],
        () => res.redirect('/clientes.html')
    );
});

app.get('/listar-clientes', auth, (req, res) => {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   ADMIN ALUNOS
========================= */
app.get('/admin/alunos', auth, (req, res) => {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
    console.log("🚀 Rodando em http://localhost:3000");
});

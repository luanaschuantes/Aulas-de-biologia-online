const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

/* =========================
   SESSION
========================= */
app.use(session({
    secret: 'biomentoria_secret_key',
    resave: false,
    saveUninitialized: false
}));

/* =========================
   DB
========================= */
const db = new sqlite3.Database('./siscristovao.db');

db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        cpf TEXT,
        telefone TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT,
        preco REAL,
        tempo_estimado INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        data TEXT,
        responsavel TEXT,
        total REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS itens_agendamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agendamento_id INTEGER,
        servico_id INTEGER,
        preco_cobrado REAL
    )`);
});

/* =========================
   ADMIN
========================= */
const ADMIN = {
    nome: "Luana Schuantes",
    senha: "luana2009"
};

app.post('/login-admin', (req, res) => {
    const { nome, senha } = req.body;

    if (nome === ADMIN.nome && senha === ADMIN.senha) {
        req.session.admin = true;
        return res.redirect('/index.html');
    }

    res.send("Login inválido");
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});

/* =========================
   PROTEÇÃO (USO FUTURO)
========================= */
function auth(req, res, next) {
    if (req.session.admin) next();
    else res.status(403).send("Acesso negado");
}

/* =========================
   CLIENTES
========================= */
app.post('/salvar-cliente', (req, res) => {
    const { nome, cpf, telefone } = req.body;

    db.run(
        `INSERT INTO clientes VALUES (NULL,?,?,?)`,
        [nome, cpf, telefone],
        () => res.redirect('/clientes.html')
    );
});

app.get('/listar-clientes', (req, res) => {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   SERVIÇOS
========================= */
app.post('/salvar-servico', (req, res) => {
    const { descricao, preco, tempo_estimado } = req.body;

    db.run(
        `INSERT INTO servicos VALUES (NULL,?,?,?)`,
        [descricao, preco, tempo_estimado],
        () => res.redirect('/servicos.html')
    );
});

app.get('/listar-servicos', (req, res) => {
    db.all(`SELECT * FROM servicos`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   AGENDAMENTOS
========================= */
app.get('/listar-agendamentos', (req, res) => {
    db.all(`
        SELECT a.*, c.nome as nome_cliente
        FROM agendamentos a
        JOIN clientes c ON c.id = a.cliente_id
    `, [], (err, rows) => res.json(rows));
});

app.get('/detalhes-agendamento/:id', (req, res) => {
    db.all(`
        SELECT s.descricao, s.tempo_estimado, i.preco_cobrado
        FROM itens_agendamento i
        JOIN servicos s ON s.id = i.servico_id
        WHERE i.agendamento_id = ?
    `, [req.params.id], (err, rows) => res.json(rows));
});

/* =========================
   ADMIN
========================= */
app.get('/admin/alunos', auth, (req, res) => {
    db.all(`SELECT * FROM usuarios`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
    console.log("🚀 Sistema rodando em http://localhost:3000");
});

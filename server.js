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

/* =========================
   BANCO
========================= */
const db = new sqlite3.Database('./siscristovao.db');

db.serialize(() => {

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
    req.session.destroy(() => res.redirect('/login.html'));
});

/* =========================
   MIDDLEWARE ADMIN
========================= */
function auth(req, res, next) {
    if (req.session.admin) return next();
    return res.redirect('/login.html');
}

/* =========================
   CLIENTES (ALUNOS)
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
   ADMIN - ALUNOS
========================= */
app.get('/admin/alunos', auth, (req, res) => {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   SERVIÇOS (PLANOS / AULAS)
========================= */
app.post('/salvar-servico', (req, res) => {
    const { descricao, preco, tempo_estimado } = req.body;

    db.run(
        `INSERT INTO servicos(descricao,preco,tempo_estimado) VALUES (?,?,?)`,
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
   AGENDAMENTOS (MENSALIDADES)
========================= */
app.post('/salvar-agendamento', (req, res) => {

    const { cliente_id, data, responsavel, total, itens } = req.body;

    db.run(
        `INSERT INTO agendamentos(cliente_id,data,responsavel,total)
         VALUES (?,?,?,?)`,
        [cliente_id, data, responsavel, total],
        function () {

            const agendamentoId = this.lastID;

            if (Array.isArray(itens)) {
                itens.forEach(i => {
                    db.run(
                        `INSERT INTO itens_agendamento(agendamento_id,servico_id,preco_cobrado)
                         VALUES (?,?,?)`,
                        [agendamentoId, i.servico_id, i.preco]
                    );
                });
            }

            res.json({ ok: true });
        }
    );
});

/* =========================
   LISTAR AGENDAMENTOS
========================= */
app.get('/listar-agendamentos', auth, (req, res) => {

    db.all(`
        SELECT a.*, c.nome as nome_cliente
        FROM agendamentos a
        JOIN clientes c ON c.id = a.cliente_id
    `, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   DETALHES AGENDAMENTO
========================= */
app.get('/detalhes-agendamento/:id', auth, (req, res) => {

    db.all(`
        SELECT s.descricao, s.tempo_estimado, i.preco_cobrado
        FROM itens_agendamento i
        JOIN servicos s ON s.id = i.servico_id
        WHERE i.agendamento_id = ?
    `, [req.params.id], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
    console.log("🚀 Sistema rodando em http://localhost:3000");
});

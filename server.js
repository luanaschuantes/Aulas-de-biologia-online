const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

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

    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        servico_id INTEGER,
        data TEXT,
        status TEXT
    )`);
});

/* =========================
   CLIENTES (SEU SISTEMA)
========================= */
app.post('/salvar-cliente', (req, res) => {
    const { nome, cpf, telefone } = req.body;

    db.run(
        `INSERT INTO clientes(nome,cpf,telefone) VALUES (?,?,?)`,
        [nome, cpf, telefone],
        (err) => {
            if (err) return res.status(500).send("Erro ao salvar cliente");
            res.redirect('/clientes.html');
        }
    );
});

app.get('/listar-clientes', (req, res) => {
    db.all(`SELECT * FROM clientes`, [], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

/* =========================
   SERVIÇOS (CURSOS)
========================= */
app.post('/salvar-servico', (req, res) => {
    const { descricao, preco, tempo_estimado } = req.body;

    db.run(
        `INSERT INTO servicos(descricao,preco,tempo_estimado) VALUES (?,?,?)`,
        [descricao, preco, tempo_estimado],
        (err) => {
            if (err) return res.status(500).send("Erro ao salvar serviço");
            res.redirect('/servicos.html');
        }
    );
});

app.get('/listar-servicos', (req, res) => {
    db.all(`SELECT * FROM servicos`, [], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

/* =========================
   USUÁRIOS (ALUNOS)
========================= */
app.post('/cadastro-usuario', (req, res) => {
    const { nome, email, senha } = req.body;

    db.run(
        `INSERT INTO usuarios(nome,email,senha) VALUES (?,?,?)`,
        [nome, email, senha],
        (err) => {
            if (err) return res.status(400).send("Erro: email já cadastrado");
            res.redirect('/login.html');
        }
    );
});

app.post('/login-usuario', (req, res) => {
    const { email, senha } = req.body;

    db.get(
        `SELECT * FROM usuarios WHERE email=? AND senha=?`,
        [email, senha],
        (err, user) => {
            if (err) return res.status(500).send("Erro no login");
            if (!user) return res.status(401).send("Login inválido");

            res.json(user);
        }
    );
});

/* =========================
   COMPRA DE CURSO
========================= */
app.post('/comprar-curso', (req, res) => {
    const { usuario_id, servico_id } = req.body;

    if (!usuario_id || !servico_id) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    db.run(
        `INSERT INTO compras(usuario_id,servico_id,data,status)
         VALUES (?,?,?,?)`,
        [usuario_id, servico_id, new Date().toISOString(), 'pago'],
        (err) => {
            if (err) return res.status(500).json({ error: "Erro na compra" });
            res.json({ ok: true });
        }
    );
});

/* =========================
   CURSOS DO ALUNO
========================= */
app.get('/meus-cursos/:id', (req, res) => {

    db.all(`
        SELECT s.*
        FROM servicos s
        INNER JOIN compras c ON c.servico_id = s.id
        WHERE c.usuario_id = ?
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

/* =========================
   🔐 ADMIN (NOVO)
   LISTAR TODOS OS ALUNOS
========================= */
app.get('/admin/alunos', (req, res) => {

    db.all(`SELECT id, nome, email FROM usuarios`, [], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
    console.log("🚀 BioMentoria rodando em http://localhost:3000");
});

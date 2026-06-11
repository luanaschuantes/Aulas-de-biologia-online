const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

const db = new sqlite3.Database('./siscristovao.db');

/* =========================
   BANCO (SEU + NOVO)
========================= */
db.serialize(() => {

    // ===== SEU SISTEMA =====
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
        total REAL,
        tempo_total INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS itens_agendamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agendamento_id INTEGER,
        servico_id INTEGER,
        preco_cobrado REAL
    )`);

    // ===== PLATAFORMA ALUNO =====
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
        status TEXT DEFAULT 'pago'
    )`);
});

/* =========================
   SEU SISTEMA (NÃO ALTERADO)
========================= */
app.post('/salvar-cliente', (req,res)=>{
    const { nome, cpf, telefone } = req.body;

    db.run(
        `INSERT INTO clientes VALUES (NULL,?,?,?)`,
        [nome,cpf,telefone],
        () => res.redirect('/clientes.html')
    );
});

app.get('/listar-clientes', (req,res)=>{
    db.all(`SELECT * FROM clientes`, [], (err,rows)=>{
        res.json(rows);
    });
});

app.post('/salvar-servico', (req,res)=>{
    const { descricao, preco, tempo_estimado } = req.body;

    db.run(
        `INSERT INTO servicos VALUES (NULL,?,?,?)`,
        [descricao,preco,tempo_estimado],
        () => res.redirect('/servicos.html')
    );
});

app.get('/listar-servicos', (req,res)=>{
    db.all(`SELECT * FROM servicos`, [], (err,rows)=>{
        res.json(rows);
    });
});

/* =========================
   USUÁRIO (ALUNO)
========================= */
app.post('/cadastro-usuario',(req,res)=>{
    const { nome,email,senha } = req.body;

    db.run(
        `INSERT INTO usuarios(nome,email,senha) VALUES (?,?,?)`,
        [nome,email,senha],
        err=>{
            if(err) return res.send("Erro cadastro");
            res.redirect('/login.html');
        }
    );
});

app.post('/login-usuario',(req,res)=>{
    const { email,senha } = req.body;

    db.get(
        `SELECT * FROM usuarios WHERE email=? AND senha=?`,
        [email,senha],
        (err,user)=>{
            if(!user) return res.send("Login inválido");
            res.json(user);
        }
    );
});

/* =========================
   COMPRA (PIX FUTURO AQUI)
========================= */
app.post('/comprar-curso',(req,res)=>{
    const { usuario_id, servico_id } = req.body;

    db.run(
        `INSERT INTO compras(usuario_id,servico_id,data,status)
         VALUES (?,?,?,?)`,
        [usuario_id,servico_id,new Date().toISOString(),'pago'],
        () => res.json({ok:true})
    );
});

/* =========================
   CURSOS DO ALUNO
========================= */
app.get('/meus-cursos/:id',(req,res)=>{

    db.all(`
        SELECT s.*
        FROM servicos s
        INNER JOIN compras c ON c.servico_id = s.id
        WHERE c.usuario_id = ?
    `,[req.params.id],
    (err,rows)=>res.json(rows));
});

/* =========================
   START
========================= */
app.listen(3000,()=>{
    console.log("🚀 Sistema rodando em http://localhost:3000");
});

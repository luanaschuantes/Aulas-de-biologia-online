const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();


// ============================================================
// CONFIGURAÇÕES
// ============================================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

// Banco de dados
const db = new sqlite3.Database('./siscristovao.db');


// ============================================================
// CRIAÇÃO DAS TABELAS
// ============================================================

db.serialize(() => {

    // --------------------------------------------------------
    // TABELA DE ALUNOS
    // --------------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT,
            telefone TEXT,
            email TEXT,
            plano TEXT
        )
    `);


    // --------------------------------------------------------
    // ADICIONA COLUNAS AO BANCO ANTIGO, SE NECESSÁRIO
    // --------------------------------------------------------

    db.run(`ALTER TABLE clientes ADD COLUMN email TEXT`, (err) => {

        if (err && !err.message.includes('duplicate column name')) {
            console.log('Erro ao adicionar email:', err.message);
        }

    });


    db.run(`ALTER TABLE clientes ADD COLUMN plano TEXT`, (err) => {

        if (err && !err.message.includes('duplicate column name')) {
            console.log('Erro ao adicionar plano:', err.message);
        }

    });


    // --------------------------------------------------------
    // TABELA DE SERVIÇOS
    // --------------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            preco REAL NOT NULL,
            tempo_estimado INTEGER NOT NULL
        )
    `);


    // --------------------------------------------------------
    // TABELA DE AGENDAMENTOS
    // --------------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            responsavel TEXT NOT NULL,
            total REAL NOT NULL,
            tempo_total INTEGER NOT NULL,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        )
    `);


    // --------------------------------------------------------
    // TABELA DE ITENS DO AGENDAMENTO
    // --------------------------------------------------------

    db.run(`
        CREATE TABLE IF NOT EXISTS itens_agendamento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agendamento_id INTEGER NOT NULL,
            servico_id INTEGER NOT NULL,
            preco_cobrado REAL NOT NULL,
            FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
            FOREIGN KEY (servico_id) REFERENCES servicos(id)
        )
    `);

});


// ============================================================
// MÓDULO DE MATRÍCULA
// ============================================================


// ------------------------------------------------------------
// SALVAR NOVO ALUNO
// ------------------------------------------------------------

app.post('/salvar-cliente', (req, res) => {

    const {
        nome,
        cpf,
        telefone,
        email,
        plano
    } = req.body;


    // Verifica campos obrigatórios
    if (!nome || !email || !plano) {

        return res.status(400).send(`
            <h2>Erro na matrícula</h2>

            <p>
                Nome, e-mail e plano são obrigatórios.
            </p>

            <a href="/clientes.html">
                Voltar para matrícula
            </a>
        `);

    }


    const sql = `
        INSERT INTO clientes
        (
            nome,
            cpf,
            telefone,
            email,
            plano
        )
        VALUES (?, ?, ?, ?, ?)
    `;


    db.run(
        sql,
        [
            nome.trim(),
            cpf ? cpf.trim() : '',
            telefone ? telefone.trim() : '',
            email.trim().toLowerCase(),
            plano
        ],
        function (err) {

            if (err) {

                console.error(
                    'Erro ao salvar aluno:',
                    err.message
                );

                return res.status(500).send(`
                    <h2>Erro ao realizar matrícula</h2>

                    <p>
                        Não foi possível salvar o aluno.
                    </p>

                    <a href="/clientes.html">
                        Voltar
                    </a>
                `);

            }


            // ------------------------------------------------
            // ID EXATO DO ALUNO RECÉM-CADASTRADO
            // ------------------------------------------------

            const alunoId = this.lastID;


            console.log(
                'Novo aluno cadastrado:',
                nome,
                '| ID:',
                alunoId
            );


            // ------------------------------------------------
            // MANDA O ID PARA A PÁGINA DE CONTEÚDOS
            // ------------------------------------------------

            res.redirect(
                `/agendamentos.html?aluno_id=${alunoId}`
            );

        }
    );

});


// ============================================================
// BUSCAR ALUNO PELO ID
// ============================================================

app.get('/aluno/:id', (req, res) => {

    const alunoId = Number(req.params.id);


    if (!Number.isInteger(alunoId) || alunoId <= 0) {

        return res.status(400).json({
            error: 'ID de aluno inválido.'
        });

    }


    const sql = `
        SELECT
            id,
            nome,
            cpf,
            telefone,
            email,
            plano
        FROM clientes
        WHERE id = ?
    `;


    db.get(
        sql,
        [alunoId],
        (err, aluno) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            if (!aluno) {

                return res.status(404).json({
                    error: 'Aluno não encontrado.'
                });

            }


            res.json(aluno);

        }
    );

});


// ============================================================
// BUSCAR ÚLTIMO ALUNO CADASTRADO
// ============================================================

app.get('/ultimo-aluno', (req, res) => {

    const sql = `
        SELECT
            id,
            nome,
            cpf,
            telefone,
            email,
            plano
        FROM clientes
        ORDER BY id DESC
        LIMIT 1
    `;


    db.get(
        sql,
        [],
        (err, aluno) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            if (!aluno) {

                return res.status(404).json({
                    error: 'Nenhum aluno cadastrado.'
                });

            }


            res.json(aluno);

        }
    );

});


// ============================================================
// LISTAR ALUNOS
// ============================================================

app.get('/listar-clientes', (req, res) => {

    const sql = `
        SELECT
            id,
            nome,
            cpf,
            telefone,
            email,
            plano
        FROM clientes
        ORDER BY nome ASC
    `;


    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json(rows);

        }
    );

});


// ============================================================
// MÓDULO DE SERVIÇOS
// ============================================================


// ------------------------------------------------------------
// SALVAR SERVIÇO
// ------------------------------------------------------------

app.post('/salvar-servico', (req, res) => {

    const {
        descricao,
        preco,
        tempo_estimado
    } = req.body;


    const sql = `
        INSERT INTO servicos
        (
            descricao,
            preco,
            tempo_estimado
        )
        VALUES (?, ?, ?)
    `;


    db.run(
        sql,
        [
            descricao,
            parseFloat(preco),
            parseInt(tempo_estimado)
        ],
        (err) => {

            if (err) {

                return res.status(500).send(
                    'Erro ao salvar serviço: ' + err.message
                );

            }


            res.redirect('/servicos.html');

        }
    );

});


// ------------------------------------------------------------
// LISTAR SERVIÇOS
// ------------------------------------------------------------

app.get('/listar-servicos', (req, res) => {

    const sql = `
        SELECT *
        FROM servicos
        ORDER BY descricao ASC
    `;


    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json(rows);

        }
    );

});


// ============================================================
// MÓDULO DE AGENDAMENTOS
// ============================================================


// ------------------------------------------------------------
// FINALIZAR AGENDAMENTO
// ------------------------------------------------------------

app.post('/finalizar-agendamento', (req, res) => {

    const {
        cliente_id,
        data,
        responsavel,
        total,
        tempo_total,
        servicos
    } = req.body;


    if (!cliente_id || !data || !responsavel) {

        return res.status(400).json({
            success: false,
            error: 'Dados do agendamento incompletos.'
        });

    }


    const sqlMestre = `
        INSERT INTO agendamentos
        (
            cliente_id,
            data,
            responsavel,
            total,
            tempo_total
        )
        VALUES (?, ?, ?, ?, ?)
    `;


    db.run(
        sqlMestre,
        [
            cliente_id,
            data,
            responsavel,
            total,
            tempo_total
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: err.message
                });

            }


            const agendamentoId = this.lastID;


            const sqlDetalhe = `
                INSERT INTO itens_agendamento
                (
                    agendamento_id,
                    servico_id,
                    preco_cobrado
                )
                VALUES (?, ?, ?)
            `;


            const stmt = db.prepare(sqlDetalhe);


            if (Array.isArray(servicos)) {

                servicos.forEach(item => {

                    stmt.run(
                        agendamentoId,
                        item.id,
                        item.preco
                    );

                });

            }


            stmt.finalize((errFinalize) => {

                if (errFinalize) {

                    return res.status(500).json({
                        success: false,
                        error: errFinalize.message
                    });

                }


                res.json({
                    success: true,
                    agendamento_id: agendamentoId
                });

            });

        }
    );

});


// ------------------------------------------------------------
// LISTAR AGENDAMENTOS
// ------------------------------------------------------------

app.get('/listar-agendamentos', (req, res) => {

    const sql = `
        SELECT
            a.id,
            a.data,
            a.responsavel,
            a.total,
            a.tempo_total,
            c.nome AS nome_cliente
        FROM agendamentos a
        INNER JOIN clientes c
            ON a.cliente_id = c.id
        ORDER BY a.id DESC
    `;


    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json(rows);

        }
    );

});


// ------------------------------------------------------------
// DETALHES DO AGENDAMENTO
// ------------------------------------------------------------

app.get('/detalhes-agendamento/:id', (req, res) => {

    const { id } = req.params;


    const sql = `
        SELECT
            i.preco_cobrado,
            s.descricao,
            s.tempo_estimado
        FROM itens_agendamento i
        INNER JOIN servicos s
            ON i.servico_id = s.id
        WHERE i.agendamento_id = ?
    `;


    db.all(
        sql,
        [id],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.json(rows);

        }
    );

});


// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(3000, () => {

    console.log('==============================================');
    console.log('🚀 BioMentoria rodando na porta 3000');
    console.log('📂 Banco: siscristovao.db');
    console.log('👨‍🎓 Matrícula de alunos ativada');
    console.log('==============================================');

});

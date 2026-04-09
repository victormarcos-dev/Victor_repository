const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configurações para o cérebro entender mensagens e não brigar com o site
app.use(cors());
app.use(express.json());

// Criando a "gaveta" (Banco de Dados)
const db = new sqlite3.Database('./tarefas.db', (err) => {
    if (err) console.error("Erro ao criar o banco:", err.message);
    else console.log("Conectado ao cofre de tarefas!");
});

// Criando a tabela de tarefas (se ela não existir)
db.run(`CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    concluida INTEGER DEFAULT 0
)`);

// ROTA 1: Ver todas as tarefas (READ)
app.get('/tarefas', (req, res) => {
    db.all("SELECT * FROM tarefas", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ROTA 2: Criar uma tarefa nova (CREATE)
app.post('/tarefas', (req, res) => {
    const { titulo } = req.body;
    db.run("INSERT INTO tarefas (titulo) VALUES (?)", [titulo], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, titulo, concluida: 0 });
    });
});

// ROTA 3: Deletar uma tarefa (DELETE)
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM tarefas WHERE id = ?", id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Tarefa apagada!" });
    });
});

// Ligar o motor do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
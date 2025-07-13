// LivroLivre/backend/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'meu_banco_de_dados.db');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error(`[DATABASE ERROR] Erro ao conectar: ${err.message}`);
  } else {
    console.log('[DATABASE] Conectado ao SQLite.');
    createTablesAndPopulate();
  }
});

/* ------------------------------------------------------------------ */
/* 1. Criação das tabelas necessárias                                  */
/* ------------------------------------------------------------------ */
function createTablesAndPopulate() {
  const createUsersTableSql = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      nome     TEXT    NOT NULL,
      email    TEXT    UNIQUE NOT NULL,
      senha    TEXT    NOT NULL,
      chaveStellar TEXT,
      creditos INTEGER DEFAULT 0
    );
  `;

  const createLivrosTableSql = `
    CREATE TABLE IF NOT EXISTS livros (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo    TEXT NOT NULL,
      autor     TEXT NOT NULL,
      doador    TEXT NOT NULL,
      chaveStellarDoador TEXT,
      adotadoPor TEXT,
      hashTransacao TEXT,
      historico TEXT,
      imagem    TEXT
    );
  `;

  const createChatsTableSql = `
    CREATE TABLE IF NOT EXISTS chats (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      livroId   INTEGER NOT NULL,
      doador    TEXT NOT NULL,
      adotante  TEXT NOT NULL,
      mensagens TEXT DEFAULT '[]',
      resolvido BOOLEAN DEFAULT 0,
      criadoEm  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.serialize(() => {
    /* Apaga (caso exista) a antiga tabela de mensagens ─ segurança extra */
    db.run('DROP TABLE IF EXISTS mensagens');

    db.run(createUsersTableSql, err => logTable('usuarios', err));
    db.run(createLivrosTableSql, err => logTable('livros', err, insertInitialBooks));
    db.run(createChatsTableSql, err => logTable('chats', err));

    insertInitialUsers();    // popula usuários
  });
}

function logTable(nome, err, cb) {
  if (err) {
    console.error(`[DATABASE ERROR] Erro ao criar tabela '${nome}': ${err.message}`);
  } else {
    console.log(`[DATABASE] Tabela '${nome}' criada ou já existe.`);
    if (typeof cb === 'function') cb();
  }
}

/* ------------------------------------------------------------------ */
/* 2. Dados iniciais                                                   */
/* ------------------------------------------------------------------ */
function insertInitialUsers() {
  const initial = [
    {
      nome: "Mariana Costa", email: "mariana@example.com", senha: "senha123",
      chave: "GD6ZJ3PQ...", creditos: 5
    },
    {
      nome: "João Pereira", email: "joao@example.com", senha: "pwsd456",
      chave: "GCEEU7S7...", creditos: 10
    },
    {
      nome: "Fernanda Almeida", email: "fernanda@example.com", senha: "pass789",
      chave: "GAYJBEVF...", creditos: 20
    }
  ];
  const sql = `
    INSERT OR IGNORE INTO usuarios (nome,email,senha,chaveStellar,creditos)
    VALUES (?,?,?,?,?);
  `;
  initial.forEach(u =>
    db.run(sql, [u.nome, u.email, u.senha, u.chave, u.creditos])
  );
  console.log('[DATABASE] Usuários iniciais verificados.');
}

function insertInitialBooks() {
  const initial = [
    {
      titulo: "O Pequeno Príncipe",
      autor: "Antoine de Saint-Exupéry",
      doador: "mariana@example.com",
      chave: "GD6ZJ3PQ...",
      imagem: "uploads/pequeno_principe.jpg"
    },
    {
      titulo: "1984",
      autor: "George Orwell",
      doador: "joao@example.com",
      chave: "GCEEU7S7...",
      imagem: "uploads/1984.jpg"
    },
    {
      titulo: "Dom Quixote",
      autor: "Miguel de Cervantes",
      doador: "fernanda@example.com",
      chave: "GAYJBEVF...",
      imagem: "uploads/dom_quixote.jpg"
    },
    {
      titulo: "Princípios da Física",
      autor: "Eric Mazur",
      doador: "fernanda@example.com",
      chave: "GAYJBEVF...",
      imagem: "uploads/mazur.jpg"
    },
    {
      titulo: "Algoritmos",
      autor: "Thomas H. Cormen",
      doador: "joao@example.com",
      chave: "GCEEU7S7...",
      imagem: "uploads/algoritmos.jpg"
    }
  ];

  const sql = `
    INSERT OR IGNORE INTO livros
      (titulo, autor, doador, chaveStellarDoador, adotadoPor, hashTransacao, historico, imagem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  initial.forEach(b => {
    db.run(sql, [
      b.titulo,
      b.autor,
      b.doador,
      b.chave,
      null,
      null,
      JSON.stringify([]),
      b.imagem
    ]);
  });

  console.log('[DATABASE] Livros iniciais verificados.');
}


module.exports = db;

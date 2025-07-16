// Importa o driver do SQLite com suporte a recursos extras
const sqlite3 = require('sqlite3').verbose();

// Lida com os caminhos de arquivos
const path = require('path');

// Define o caminho para o arquivo do banco de dados
const DB_FILE = path.join(__dirname, 'meu_banco_de_dados.db');

// Cria ou abre (se nn tiver criado) o banco de dados
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error(`[DATABASE ERROR] Erro ao conectar: ${err.message}`);
  } else {
    console.log('[DATABASE] Conectado ao SQLite.');
    createTablesAndPopulate(); // Cria as tabelas se ainda não existirem
  }
});

// Cria todas as tabelas do sistema, se ainda não existirem
function createTablesAndPopulate() {

  // Criação da tabela de usuários
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

  // Criação da tabela de livros
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

  // Criação da tabela de chats
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

  // Executa as queries em série
  db.serialize(() => {
    
    // Apaga tabela antiga de mensagens, se existir (medida de segurança)
    db.run('DROP TABLE IF EXISTS mensagens');

    // Cria as tabelas
    db.run(createUsersTableSql, err => logTable('usuarios', err));
    db.run(createLivrosTableSql, err => logTable('livros', err));
    db.run(createChatsTableSql, err => logTable('chats', err));
  });
}

// Função auxiliar para logar o resultado da criação de tabela
function logTable(nome, err, cb) {
  if (err) {
    console.error(`[DATABASE ERROR] Erro ao criar tabela '${nome}': ${err.message}`);
  } else {
    console.log(`[DATABASE] Tabela '${nome}' criada ou já existe.`);
    if (typeof cb === 'function') cb(); // Se existir callback, executa
  }
}

// Exporta o banco de dados para uso em outros arquivos
module.exports = db;
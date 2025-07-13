// LivroLivre/backend/database.js

// Importa o módulo sqlite3. O '.verbose()' adiciona mais logs ao console, útil para debug.
const sqlite3 = require('sqlite3').verbose();

// Define o nome do arquivo do banco de dados. Este arquivo será criado na mesma pasta.
const DB_FILE = './meu_banco_de_dados.db';

// Cria ou conecta ao banco de dados SQLite.
// O callback é executado assim que a tentativa de conexão é feita.
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        // Se houver um erro ao conectar (ex: permissões de arquivo), loga e pode até encerrar o processo.
        console.error(`[DATABASE ERROR] Erro ao conectar ao banco de dados: ${err.message}`);
        // Em um ambiente de produção, você pode querer sair do processo aqui para evitar mais erros:
        // process.exit(1); 
    } else {
        // Conexão bem-sucedida.
        console.log('[DATABASE] Conectado ao banco de dados SQLite.');
        // Chama a função para criar as tabelas e popular o banco de dados.
        createTablesAndPopulate();
    }
});

/**
 * Função principal para criar todas as tabelas necessárias no banco de dados
 * e popular com dados iniciais, se elas não existirem.
 */
function createTablesAndPopulate() {
    // SQL para criar a tabela 'usuarios'.
    // id: Chave primária que auto-incrementa.
    // email: Texto, não pode ser nulo e deve ser único.
    const createUsersTableSql = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            chaveStellar TEXT,          -- Chave pública Stellar do usuário
            creditos INTEGER DEFAULT 0
        );
    `;

    // SQL para criar a tabela 'livros'.
    // id: Chave primária que auto-incrementa.
    // doador, chaveStellarDoador: Informações do doador.
    // adotadoPor: Email do adotante (nulo se disponível).
    // historico: Guardado como texto JSON.
    const createLivrosTableSql = `
    CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        doador TEXT NOT NULL,
        chaveStellarDoador TEXT,
        adotadoPor TEXT,
        hashTransacao TEXT,
        historico TEXT,
        imagem TEXT   -- Novo campo para armazenar o caminho da foto
    );
`;

    // db.serialize() garante que as operações SQL sejam executadas em sequência.
    db.serialize(() => {
        // 1. Executa a criação da tabela 'usuarios'.
        db.run(createUsersTableSql, (err) => {
            if (err) {
                console.error(`[DATABASE ERROR] Erro ao criar tabela 'usuarios': ${err.message}`);
            } else {
                console.log('[DATABASE] Tabela "usuarios" criada ou já existe.');
                insertInitialUsers(); // Chama a função para inserir usuários iniciais.
            }
        });

        // 2. Executa a criação da tabela 'livros'.
        db.run(createLivrosTableSql, (err) => {
            if (err) {
                console.error(`[DATABASE ERROR] Erro ao criar tabela 'livros': ${err.message}`);
            } else {
                console.log('[DATABASE] Tabela "livros" criada ou já existe.');
                insertInitialBooks(); // Chama a função para inserir livros iniciais.
            }
        });
    });
}

/**
 * Insere um conjunto de usuários iniciais na tabela 'usuarios'.
 * Usa INSERT OR IGNORE para evitar duplicatas em execuções subsequentes.
 */
function insertInitialUsers() {
    const initialUsers = [
        { nome: "Mariana Costa", email: "mariana@example.com", senha: "senha123", chaveStellar: "GD6ZJ3PQQBX4LGXG4RREXEGFX5QJX6LDN43GGH2VXJWICNBMQBUO7URZ", creditos: 5 },
        { nome: "João Pereira", email: "joao@example.com", senha: "pwsd456", chaveStellar: "GCEEU7S73ESFEIZRX3LJA3GRM37BIQLCLVT7EUWGRVFT3FCQLEH3NDMA", creditos: 10 },
        { nome: "Fernanda Almeida", email: "fernanda@example.com", senha: "pass789", chaveStellar: "GAYJBEVFEL33K7WKF2LNYXFYO5RG5SV6H44NFTBBIGSTZNQ54MHH4FDA", creditos: 20 }
    ];

    // SQL para inserir um usuário. 'INSERT OR IGNORE' não faz nada se a linha já existir (com base no UNIQUE email).
    const insertUserSql = `
        INSERT OR IGNORE INTO usuarios (nome, email, senha, chaveStellar, creditos)
        VALUES (?, ?, ?, ?, ?);
    `;

    db.serialize(() => {
        initialUsers.forEach(user => {
            // db.run() executa a instrução SQL. Os '?' são substituídos pelos valores do array.
            db.run(insertUserSql,
                [user.nome, user.email, user.senha, user.chaveStellar, user.creditos],
                function (err) { // Usamos 'function' em vez de '=>' para ter acesso ao 'this'
                    if (err) {
                        console.error(`[DATABASE ERROR] Erro ao inserir usuário inicial ${user.email}: ${err.message}`);
                    }
                }
            );
        });
        console.log('[DATABASE] Verificação de usuários iniciais concluída.');
    });
}

/**
 * Insere um conjunto de livros iniciais na tabela 'livros'.
 * Usa INSERT OR IGNORE (embora a tabela de livros não tenha um campo UNIQUE,
 * é uma boa prática para evitar inserções acidentais em massa).
 */
function insertInitialBooks() {
    const initialBooks = [
        { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", doador: "mariana@example.com", chaveStellarDoador: "GD6ZJ3PQQBX4LGXG4RREXEGFX5QJX6LDN43GGH2VXJWICNBMQBUO7URZ" },
        { titulo: "1984", autor: "George Orwell", doador: "joao@example.com", chaveStellarDoador: "GCEEU7S73ESFEIZRX3LJA3GRM37BIQLCLVT7EUWGRVFT3FCQLEH3NDMA" },
        { titulo: "Dom Quixote", autor: "Miguel de Cervantes", doador: "fernanda@example.com", chaveStellarDoador: "GAYJBEVFEL33K7WKF2LNYXFYO5RG5SV6H44NFTBBIGSTZNQ54MHH4FDA" }
    ];

    const insertBookSql = `
    INSERT OR IGNORE INTO livros (titulo, autor, doador, chaveStellarDoador, adotadoPor, hashTransacao, historico, imagem)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;


    db.serialize(() => {
        initialBooks.forEach(book => {
            // Para 'historico', salvamos um array vazio convertido para string JSON.
            db.run(insertBookSql,
                [book.titulo, book.autor, book.doador, book.chaveStellarDoador, null, null, JSON.stringify([]), 'uploads/capa_padrao.png'],
                function (err) {
                    if (err) {
                        console.error(`[DATABASE ERROR] Erro ao inserir livro inicial "${book.titulo}": ${err.message}`);
                    }
                }
            );
        });
        console.log('[DATABASE] Verificação de livros iniciais concluída.');
    });
}

// Exporta o objeto 'db'. Outros arquivos (como os modelos) vão usar 'require('./database')'
// para obter esta instância 'db' e interagir com o banco de dados.
module.exports = db;
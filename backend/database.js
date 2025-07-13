const sqlite3 = require('sqlite3').verbose();
const DB_FILE = './meu_banco_de_dados.db';

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error(`[DATABASE ERROR] Erro ao conectar ao banco de dados: ${err.message}`);
    } else {
        console.log('[DATABASE] Conectado ao banco de dados SQLite.');
        createTablesAndPopulate();
    }
});

function createTablesAndPopulate() {
    const createUsersTableSql = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            chaveStellar TEXT,
            creditos INTEGER DEFAULT 0
        );
    `;

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
            imagem TEXT
        );
    `;

    const createChatsTableSql = `
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            livroId INTEGER NOT NULL,
            doador TEXT NOT NULL,
            adotante TEXT NOT NULL,
            mensagens TEXT DEFAULT '[]',
            criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createMensagensTableSql = `
        CREATE TABLE IF NOT EXISTS mensagens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chatId INTEGER NOT NULL,
            remetente TEXT NOT NULL,
            texto TEXT NOT NULL,
            enviadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE
        );
    `;

    db.serialize(() => {
        db.run(createUsersTableSql, (err) => {
            if (err) console.error(`[DATABASE ERROR] Erro ao criar tabela 'usuarios': ${err.message}`);
            else {
                console.log('[DATABASE] Tabela "usuarios" criada ou já existe.');
                insertInitialUsers();
            }
        });

        db.run(createLivrosTableSql, (err) => {
            if (err) console.error(`[DATABASE ERROR] Erro ao criar tabela 'livros': ${err.message}`);
            else {
                console.log('[DATABASE] Tabela "livros" criada ou já existe.');
                insertInitialBooks();
            }
        });

        db.run(createChatsTableSql, (err) => {
            if (err) console.error(`[DATABASE ERROR] Erro ao criar tabela 'chats': ${err.message}`);
            else {
                console.log('[DATABASE] Tabela "chats" criada ou já existe.');
                ensureChatHasColumnResolvido();
            }
        });

        db.run(createMensagensTableSql, (err) => {
            if (err) console.error(`[DATABASE ERROR] Erro ao criar tabela 'mensagens': ${err.message}`);
            else console.log('[DATABASE] Tabela "mensagens" criada ou já existe.');
        });
    });
}

function ensureChatHasColumnResolvido() {
    db.get("PRAGMA table_info(chats);", (err, row) => {
        if (err) {
            console.error("[DATABASE ERROR] Falha ao verificar colunas da tabela 'chats':", err.message);
            return;
        }

        db.all("PRAGMA table_info(chats);", (err, columns) => {
            if (err) {
                console.error("[DATABASE ERROR] Erro ao listar colunas de 'chats':", err.message);
                return;
            }

            const hasResolvido = columns.some(col => col.name === 'resolvido');

            if (!hasResolvido) {
                db.run(`ALTER TABLE chats ADD COLUMN resolvido BOOLEAN DEFAULT 0;`, (err) => {
                    if (err) {
                        console.error("[DATABASE ERROR] Erro ao adicionar coluna 'resolvido':", err.message);
                    } else {
                        console.log("[DATABASE] Coluna 'resolvido' adicionada à tabela 'chats'.");
                    }
                });
            } else {
                console.log("[DATABASE] Coluna 'resolvido' já existe na tabela 'chats'.");
            }
        });
    });
}

function insertInitialUsers() {
    const initialUsers = [
        { nome: "Mariana Costa", email: "mariana@example.com", senha: "senha123", chaveStellar: "GD6ZJ3PQQBX4LGXG4RREXEGFX5QJX6LDN43GGH2VXJWICNBMQBUO7URZ", creditos: 5 },
        { nome: "João Pereira", email: "joao@example.com", senha: "pwsd456", chaveStellar: "GCEEU7S73ESFEIZRX3LJA3GRM37BIQLCLVT7EUWGRVFT3FCQLEH3NDMA", creditos: 10 },
        { nome: "Fernanda Almeida", email: "fernanda@example.com", senha: "pass789", chaveStellar: "GAYJBEVFEL33K7WKF2LNYXFYO5RG5SV6H44NFTBBIGSTZNQ54MHH4FDA", creditos: 20 }
    ];

    const insertUserSql = `
        INSERT OR IGNORE INTO usuarios (nome, email, senha, chaveStellar, creditos)
        VALUES (?, ?, ?, ?, ?);
    `;

    db.serialize(() => {
        initialUsers.forEach(user => {
            db.run(insertUserSql,
                [user.nome, user.email, user.senha, user.chaveStellar, user.creditos],
                function (err) {
                    if (err) {
                        console.error(`[DATABASE ERROR] Erro ao inserir usuário inicial ${user.email}: ${err.message}`);
                    }
                }
            );
        });
        console.log('[DATABASE] Verificação de usuários iniciais concluída.');
    });
}

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

module.exports = db;

// LivroLivre/backend/models/usuarioModel.js

const db = require('../database'); // Importa a conexão com o banco de dados

/* ---------- CRUD ---------- */

// Cria um novo usuário no banco de dados
function criarUsuario(nome, email, senha, chaveStellar) {
    const sql = `
        INSERT INTO usuarios (nome, email, senha, chaveStellar, creditos)
        VALUES (?, ?, ?, ?, ?);
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [nome, email, senha, chaveStellar, 0], async function(err) { // Callback async para usar await
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    const error = new Error(`UNIQUE_CONSTRAINT_FAILED: O e-mail ${email} já está cadastrado.`);
                    error.code = 'UNIQUE_CONSTRAINT_FAILED';
                    reject(error); 
                } else {
                    console.error(`[MODEL-USUARIO] Erro ao criar usuário: ${err.message}`); 
                    reject(err);
                }
            } else {
                const novoUsuario = {
                    id: this.lastID, // Obtém o ID da linha recém-inserida
                    nome, email, senha, chaveStellar, creditos: 0
                };
                console.log('[DEBUG-MODEL-USUARIO] Usuário cadastrado (relatado por db.run):', novoUsuario.email, '(ID:', novoUsuario.id, ')');

                // --- NOVO PASSO DE DEBUG: Tentar ler o usuário imediatamente após a inserção ---
                try {
                    const userJustCreated = await new Promise((res, rej) => {
                        db.get("SELECT * FROM usuarios WHERE id = ?", [this.lastID], (getErr, getRow) => {
                            if (getErr) {
                                console.error('[DEBUG-MODEL-USUARIO] Erro ao tentar ler usuário recém-criado:', getErr);
                                rej(getErr);
                            } else {
                                res(getRow);
                            }
                        });
                    });

                    if (userJustCreated) {
                        console.log('[DEBUG-MODEL-USUARIO] Usuário lido imediatamente após inserção INTERNAMENTE (sucesso):', userJustCreated.email, '(ID:', userJustCreated.id, ')');
                    } else {
                        console.warn('[DEBUG-MODEL-USUARIO] Usuário lido imediatamente após inserção INTERNAMENTE (falha): NÃO ENCONTRADO!');
                    }
                } catch (readError) {
                    console.error('[DEBUG-MODEL-USUARIO] Exceção ao ler usuário imediatamente após inserção:', readError);
                }
                // --- FIM NOVO PASSO DE DEBUG ---

                resolve(novoUsuario);
            }
        });
    });
}

// Busca um usuário pelo email no banco de dados
function buscarUsuarioPorEmail(email) {
    const sql = "SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE;";
    
    return new Promise((resolve, reject) => {
        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error(`[MODEL-USUARIO] Erro ao buscar usuário: ${err.message}`);
                reject(err);
            } else {
                if (row) {
                    const { senha, ...usuarioSemSenha } = row; // Remove a senha antes de retornar
                    resolve(usuarioSemSenha);
                } else {
                    resolve(null); // Retorna null se não encontrado
                }
            }
        });
    });
}

// Autentica um usuário pelo email e senha
function autenticarUsuario(email, senha) {
    // --- NOVO LOG ---
    console.log(`[MODEL-LOGIN] Buscando usuário no DB com email: '${email}', senha (recebida): '${senha}'`); 
    // --- FIM NOVO LOG ---
    const sql = "SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE AND senha = ?;";
    
    return new Promise((resolve, reject) => {
        db.get(sql, [email, senha], (err, row) => {
            if (err) {
                console.error(`[MODEL-LOGIN] Erro no DB ao buscar usuário para autenticação: ${err.message}`); 
                reject(err);
            } else {
                // --- NOVO LOG ---
                console.log(`[MODEL-LOGIN] Resultado da busca no DB para '${email}':`, row ? 'Linha encontrada no DB' : 'Nenhuma linha encontrada no DB'); 
                // --- FIM NOVO LOG ---
                if (row) {
                    const { senha: userSenha, ...usuarioSemSenha } = row; // Remove a senha antes de retornar
                    resolve(usuarioSemSenha);
                } else {
                    resolve(null);
                }
            }
        });
    });
}

/* ---------- CRÉDITOS ---------- */

// Adiciona uma quantidade de créditos a um usuário
function adicionarCredito(email, qtd = 1) {
    const sql = `
        UPDATE usuarios SET creditos = creditos + ? WHERE email = ? COLLATE NOCASE;
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [qtd, email], function(err) { // 'this.changes' só é válido na função 'function'
            if (err) {
                // --- NOVO LOG ---
                console.error(`[MODEL-USUARIO] Erro no DB ao adicionar crédito para '${email}': ${err.message}`); 
                // --- FIM NOVO LOG ---
                reject(err);
            } else {
                // --- NOVO LOG ---
                console.log(`[MODEL-USUARIO] Operação de adicionar crédito para '${email}' executada. Linhas afetadas: ${this.changes}.`); 
                // --- FIM NOVO LOG ---
                resolve(this.changes > 0); // Retorna true se 1 ou mais linhas foram afetadas
            }
        });
    });
}

// Usa uma quantidade de créditos de um usuário
function usarCredito(email, qtd = 1) {
    const sql = `
        UPDATE usuarios SET creditos = creditos - ? WHERE email = ? COLLATE NOCASE;
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [qtd, email], function(err) {
            if (err) {
                console.error(`[MODEL-USUARIO] Erro ao usar crédito: ${err.message}`);
                reject(err);
            } else {
                resolve(this.changes > 0); 
            }
        });
    });
}

// Consulta a quantidade de créditos de um usuário
function consultarCreditos(email) {
    const sql = "SELECT creditos FROM usuarios WHERE email = ? COLLATE NOCASE;";
    
    return new Promise((resolve, reject) => {
        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error(`[MODEL-USUARIO] Erro ao consultar créditos: ${err.message}`);
                reject(err);
            } else {
                resolve(row ? row.creditos : 0); 
            }
        });
    });
}

/* ---------- util opcional ---------- */

// Retorna todos os usuários cadastrados no banco de dados
function getTodosUsuarios() {
    const sql = "SELECT * FROM usuarios;";
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(`[MODEL-USUARIO] Erro ao obter todos os usuários: ${err.message}`);
                reject(err);
            } else {
                const usuariosSeguros = rows.map(row => {
                    const { senha, ...usuarioSemSenha } = row;
                    return usuarioSemSenha;
                });
                resolve(usuariosSeguros);
            }
        });
    });
}

module.exports = {
    criarUsuario,
    buscarUsuarioPorEmail,
    autenticarUsuario,
    adicionarCredito,
    usarCredito,
    consultarCreditos,
    getTodosUsuarios
};
// Conexão com o banco de dados
const db = require('../database');

// Cria um novo usuário no banco de dados
function criarUsuario(nome, email, senha, chaveStellar) {
    const sql = `
        INSERT INTO usuarios (nome, email, senha, chaveStellar, creditos)
        VALUES (?, ?, ?, ?, ?);
    `;
    
    return new Promise((resolve, reject) => {

        // Inserção com os valores fornecidos
        db.run(sql, [nome, email, senha, chaveStellar, 0], async function(err) {
            if (err) {
                // Trata erro específico de e-mail duplicado
                if (err.message.includes('UNIQUE constraint failed')) {
                    const error = new Error(`UNIQUE_CONSTRAINT_FAILED: O e-mail ${email} já está cadastrado.`);
                    error.code = 'UNIQUE_CONSTRAINT_FAILED';
                    reject(error); 
                } else {
                    console.error(`[USUARIO] Erro ao criar usuário: ${err.message}`); 
                    reject(err);
                }
            } else {

                // Cria o objeto representando o novo usuário
                const novoUsuario = {
                    id: this.lastID,
                    nome, 
                    email, 
                    senha, 
                    chaveStellar, 
                    creditos: 0
                };

                console.log('[USUARIO] Usuário cadastrado (relatado por db.run):', novoUsuario.email, '(ID:', novoUsuario.id, ')');

                // Tenta buscar o usuário recém-criado para fins de verificação
                try {
                    const userJustCreated = await new Promise((res, rej) => {
                        db.get("SELECT * FROM usuarios WHERE id = ?", [this.lastID], (getErr, getRow) => {
                            if (getErr) {
                                console.error('[USUARIO] Erro ao tentar ler usuário recém-criado:', getErr);
                                rej(getErr);
                            } else {
                                res(getRow);
                            }
                        });
                    });

                    if (userJustCreated) {
                        console.log('[USUARIO] Usuário lido imediatamente após inserção (sucesso):', userJustCreated.email, '(ID:', userJustCreated.id, ')');
                    } else {
                        console.warn('[USUARIO] Usuário lido imediatamente após inserção (falha): NÃO ENCONTRADO!');
                    }
                } catch (readError) {
                    console.error('[USUARIO] Exceção ao ler usuário imediatamente após inserção:', readError);
                }

                resolve(novoUsuario);
            }
        });
    });
}

// Busca usuário pelo email no banco de dados
function buscarUsuarioPorEmail(email) {
    const sql = "SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE;";
    
    return new Promise((resolve, reject) => {
        db.get(sql, [email], (err, row) => {
            if (err) {
                console.error(`[USUARIO] Erro ao buscar usuário: ${err.message}`);
                reject(err);
            } else {

                // Remove o campo de senha antes de retornar o objeto
                if (row) {
                    const { senha, ...usuarioSemSenha } = row;
                    resolve(usuarioSemSenha);
                } else {
                    resolve(null); // Usuário não encontrado
                }
            }
        });
    });
}

// Autentica um usuário pelo email e senha
function autenticarUsuario(email, senha) {
    console.log(`[LOGIN] Buscando usuário no DB com email: '${email}', senha (recebida): '${senha}'`); 

    const sql = "SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE AND senha = ?;";
    
    return new Promise((resolve, reject) => {
        db.get(sql, [email, senha], (err, row) => {
            if (err) {
                console.error(`[LOGIN] Erro no DB ao buscar usuário para autenticação: ${err.message}`); 
                reject(err);
            } else {
                console.log(`[LOGIN] Resultado da busca no DB para '${email}':`, row ? 'Linha encontrada no DB' : 'Nenhuma linha encontrada no DB'); 
                if (row) {
                    const { senha: userSenha, ...usuarioSemSenha } = row;
                    resolve(usuarioSemSenha);
                } else {
                    resolve(null);
                }
            }
        });
    });
}

// Adiciona um crédito ao usuário
function adicionarCredito(email, qtd = 1) {
    const sql = `
        UPDATE usuarios SET creditos = creditos + ? WHERE email = ? COLLATE NOCASE;
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [qtd, email], function(err) {
            if (err) {
                console.error(`[USUARIO] Erro no DB ao adicionar crédito para '${email}': ${err.message}`); 
                reject(err);
            } else {
                console.log(`[USUARIO] Operação de adicionar crédito para '${email}' executada. Linhas afetadas: ${this.changes}.`); 
                resolve(this.changes > 0); // true se a operação afetou alguma linha
            }
        });
    });
}

// Usa um crédito do usuário
function usarCredito(email, qtd = 1) {
    const sql = `
        UPDATE usuarios SET creditos = creditos - ? WHERE email = ? COLLATE NOCASE;
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [qtd, email], function(err) {
            if (err) {
                console.error(`[USUARIO] Erro ao usar crédito: ${err.message}`);
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
                console.error(`[USUARIO] Erro ao consultar créditos: ${err.message}`);
                reject(err);
            } else {
                resolve(row ? row.creditos : 0); 
            }
        });
    });
}

// Retorna todos os usuários cadastrados no banco de dados
function getTodosUsuarios() {
    const sql = "SELECT * FROM usuarios;";
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(`[MODEL-USUARIO] Erro ao obter todos os usuários: ${err.message}`);
                reject(err);
            } else {

                // Remove o campo de senha de todos os usuários retornados
                const usuariosSeguros = rows.map(row => {
                    const { senha, ...usuarioSemSenha } = row;
                    return usuarioSemSenha;
                });
                resolve(usuariosSeguros);
            }
        });
    });
}

// Exporta as funções para serem usadas em outras partes do código
module.exports = {
    criarUsuario,
    buscarUsuarioPorEmail,
    autenticarUsuario,
    adicionarCredito,
    usarCredito,
    consultarCreditos,
    getTodosUsuarios
};

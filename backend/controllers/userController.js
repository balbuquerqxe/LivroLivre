// LivroLivre/backend/controllers/userController.js

const {
    criarUsuario,
    buscarUsuarioPorEmail,
    // NAO IMPORTE 'autenticarUsuario' AQUI, pois sera definida neste controller
    adicionarCredito,
    consultarCreditos, 
    getTodosUsuarios
} = require('../models/usuarioModel');

const {
    gerarChaveStellar,
    criarTrustline,
    fundearConta
} = require('../services/stellarService');

// =========================================================================
// 1. cadastrarUsuario
// =========================================================================
async function cadastrarUsuario(req, res) { 
    const { nome, email, senha } = req.body; 

    // --- LOGS PARA DEBUG ---
    console.log("[CONTROLLER-USUARIO] 1. Recebido pedido de cadastro para:", email); 
    // --- FIM LOGS ---

    if (!nome || !email || !senha) {
        console.log("[CONTROLLER-USUARIO] Erro: Nome, e-mail e senha são obrigatórios."); 
        return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }

    try {
        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 2. Iniciando geracao de chave Stellar."); 
        // --- FIM LOGS ---
        const { publicKey, secret } = await gerarChaveStellar(); // Chamada para services/stellarService.js
        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 3. Chave Stellar gerada. PublicKey:", publicKey); 

        console.log("[CONTROLLER-USUARIO] 4. Iniciando fundeamento da conta."); 
        // --- FIM LOGS ---
        await fundearConta(publicKey); // Chamada para services/stellarService.js
        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 5. Conta fundeada com sucesso."); 

        console.log("[CONTROLLER-USUARIO] 6. Iniciando criacao de trustline."); 
        // --- FIM LOGS ---
        await criarTrustline(secret); // Chamada para services/stellarService.js
        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 7. Trustline criada com sucesso."); 
        // --- FIM LOGS ---

        // Validação se usuário já existe ANTES de tentar criar no DB.
        // O `criarUsuario` do modelo já tem UNIQUE_CONSTRAINT_FAILED, mas esta é uma pré-verificação.
        const existingUser = await buscarUsuarioPorEmail(email); 
        if (existingUser) { 
            console.warn(`[CONTROLLER-USUARIO] Usuário ${email} já existe antes de tentar criar.`); 
            return res.status(409).json({ erro: `O e-mail ${email} já está cadastrado.` });
        }


        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 8. Criando usuario no banco de dados."); 
        // --- FIM LOGS ---
        const novo = await criarUsuario(nome, email, senha, publicKey); // Chamada para models/usuarioModel.js
        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 9. Usuario criado no DB."); 
        // --- FIM LOGS ---
        
        res.status(201).json({
            id: novo.id,
            nome: novo.nome,
            email: novo.email,
            chavePublica: novo.chaveStellar,
            creditos: novo.creditos,
            chavePrivada: secret // Chave privada retornada APENAS no cadastro inicial
        });
        // --- LOGS PARA DEBUG ---
        console.log("[CONTROLLER-USUARIO] 10. Resposta enviada ao frontend."); 
        // --- FIM LOGS ---

    } catch (err) {
        // --- LOGS PARA DEBUG ---
        console.error(`[CONTROLLER-USUARIO] ERRO CAPTURADO NO TRY/CATCH: ${err.message}`); 
        console.error(err); // Loga o objeto de erro completo
        // --- FIM LOGS ---

        // Verifica se é um erro de email duplicado vindo do model
        if (err.code === 'UNIQUE_CONSTRAINT_FAILED') {
            return res.status(409).json({ erro: err.message }); 
        }
        
        // Se a resposta ainda não foi enviada (para outros tipos de erro)
        if (!res.headersSent) { 
            res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
        }
    }
}

// =========================================================================
// 2. autenticarUsuario
// =========================================================================
async function autenticarUsuario(req, res) { 
    const { email, senha } = req.body;

    // --- NOVO LOG ---
    console.log(`[CONTROLLER-LOGIN] Tentativa de login para email: '${email}', senha (recebida): '${senha}'`); 
    // --- FIM NOVO LOG ---

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Chama a função autenticarUsuario do MODEL (models/usuarioModel.js)
        const usuario = await require('../models/usuarioModel').autenticarUsuario(email, senha); 
        
        // --- NOVO LOG ---
        console.log(`[CONTROLLER-LOGIN] Resultado do modelo para ${email}:`, usuario ? 'Usuário encontrado com credenciais válidas' : 'Usuário não encontrado ou senha inválida');
        // --- FIM NOVO LOG ---

        if (!usuario) { 
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        res.json({ mensagem: 'Login bem-sucedido', usuario });

    } catch (err) {
        console.error(`[CONTROLLER-LOGIN] Erro ao autenticar usuário: ${err.message}`);
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ erro: 'Erro interno ao fazer login.' });
        }
    }
}

// =========================================================================
// 3. consultarCreditosUsuario
// =========================================================================
async function consultarCreditosUsuario(req, res) { 
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ erro: 'E-mail é obrigatório para consultar créditos.' });
    }

    try {
        // Chama a função consultarCreditos do MODEL (models/usuarioModel.js)
        const creditos = await require('../models/usuarioModel').consultarCreditos(email); 
        res.json({ creditos });
    }
     catch (err) {
        console.error(`[CONTROLLER-USUARIO] Erro ao consultar créditos para ${email}: ${err.message}`);
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ erro: 'Erro interno ao consultar créditos.' });
        }
    }
}

// =========================================================================
// 4. listarTodosUsuarios (Opcional, para fins administrativos/debug)
// =========================================================================
async function listarTodosUsuarios(req, res) {
    try {
        // Chama a função getTodosUsuarios do MODEL (models/usuarioModel.js)
        const usuarios = await require('../models/usuarioModel').getTodosUsuarios();
        res.json(usuarios);
    } catch (error) {
        console.error(`[CONTROLLER-USUARIO] Erro ao listar todos os usuários: ${error.message}`);
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ erro: 'Erro interno ao listar usuários.' });
        }
    }
}


// =========================================================================
// EXPORTAÇÕES
// =========================================================================
module.exports = {
    cadastrarUsuario,
    autenticarUsuario,
    consultarCreditosUsuario,
    listarTodosUsuarios
};
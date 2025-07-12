// Importa o serviço Stellar para gerar chaves e criar trustlines
const { gerarChaveStellar, criarTrustline } = require('../services/stellarService');

// Lista dos usuários cadastrados
const usuarios = [];

// Função que cria um novo usuário
async function cadastrarUsuario(req, res) {
  const { nome } = req.body;

  try {
    // Gera uma chave Stellar
    const { chavePublica, chaveSecreta } = await gerarChaveStellar();

    // Cria trustline para o token BOOK
    await criarTrustline(chaveSecreta);

    // Armazena o usuário!
    const usuario = { nome, chavePublica, chaveSecreta };
    usuarios.push(usuario);

    // Retorna os dados relevantes (sem mostrar a chave secreta)
    res.status(201).json({ nome, chavePublica });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
}

// Função que lista os usuários
function listarUsuarios(req, res) {
  const lista = usuarios.map(({ nome, chavePublica }) => ({ nome, chavePublica }));
  res.json(lista);
}

// Exporta as funções para serem usadas em outros arquivos
module.exports = { cadastrarUsuario, listarUsuarios };

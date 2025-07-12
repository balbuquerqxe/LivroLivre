// Lista dos usuários cadastrados
const usuarios = [];

// Função que cria um novo usuário
function criarUsuario(nome, email, senha, chaveStellar) {
    const novoUsuario = {
        id: usuarios.length + 1,
        nome,
        email,
        senha,
        chaveStellar, // Precisa da chave pública para aceitar transações.
    };
    // Adiciona o novo usuário na lista de usuários
    usuarios.push(novoUsuario);

    // Retorna o novo usuário criado
    return novoUsuario;
}

// Função que busca um usuário pelo email
function buscarUsuarioPorEmail(email) {
    return usuarios.find(u => u.email === email);
}

// Função que autentica um usuário com email e senha
function autenticarUsuario(email, senha) {
    return usuarios.find(u => u.email === email && u.senha === senha);
}

module.exports = {
    criarUsuario,
    buscarUsuarioPorEmail,
    autenticarUsuario,
};

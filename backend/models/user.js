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

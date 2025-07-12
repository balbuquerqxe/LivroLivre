// ===============================
// MODELO DE USUÁRIO COM CRÉDITOS
// ===============================
const usuarios = [];

/* ---------- CRUD ---------- */
function criarUsuario(nome, email, senha, chaveStellar) {
    if (buscarUsuarioPorEmail(email)) {
        console.warn(`[Usuário] ${email} já está cadastrado!`);
        return null;
    }

    const novoUsuario = {
        id: usuarios.length + 1,
        nome,
        email,
        senha,
        chaveStellar,
        creditos: 0
    };
    usuarios.push(novoUsuario);
    console.log('[DEBUG] Usuário cadastrado:', novoUsuario);
    console.log('[DEBUG] Total de usuários:', usuarios.length);
    return novoUsuario;
}

function buscarUsuarioPorEmail(email) {
  return usuarios.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
}

function autenticarUsuario(email, senha) {
    return usuarios.find(u => u.email === email && u.senha === senha);
}

/* ---------- CRÉDITOS ---------- */
function adicionarCredito(email) {
  const user = buscarUsuarioPorEmail(email);
  if (user) {
    user.creditos += 1;
    console.log(`[CRÉDITO] +1 crédito para ${email} (agora com ${user.creditos})`);
  } else {
    console.warn(`[CRÉDITO] Usuário ${email} não encontrado`);
  }
}


function usarCredito(email, qtd = 1) {
    const u = buscarUsuarioPorEmail(email);
    if (!u || u.creditos < qtd) return false;
    u.creditos -= qtd;
    return true;               // ← devolve sucesso!
}

function consultarCreditos(email) {
    const u = buscarUsuarioPorEmail(email);
    return u ? u.creditos : 0;
}

/* ---------- util opcional ---------- */
function getUsuarios() { return usuarios; }

module.exports = {
    criarUsuario,
    buscarUsuarioPorEmail,
    autenticarUsuario,
    adicionarCredito,
    usarCredito,
    consultarCreditos,
    getUsuarios
};

// LivroLivre/backend/app.js

// Importação do Framework Express
const express = require('express');

// CORS: ferramenta que possibilita a comunicação entre o frontend e o backend
const cors = require('cors');

// Carregamento das variáveis de ambiente do arquivo .env de forma segura
require('dotenv').config();

// --- NOVO: Importa e inicializa o banco de dados ---
// Isso garante que o arquivo database.js seja executado, criando o DB e as tabelas
// assim que a aplicação iniciar.
require('./database'); // Caminho correto para o database.js na pasta backend/

// Criação da instância do aplicativo Express!
const app = express();

// --- CONFIGURAÇÃO EXPLÍCITA DO CORS ---
// Substitua 'http://localhost:5173' pela URL COMPLETA do seu frontend.
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'; // Sua porta do frontend

const corsOptions = {
  origin: frontendOrigin, // Permite apenas requisições desta origem
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos que seu frontend pode enviar
  credentials: true, // Permite o envio de cookies de sessão, etc. (se você usar)
  optionsSuccessStatus: 204 // Responde com 204 No Content para requisições OPTIONS bem-sucedidas
};
app.use(cors(corsOptions)); // Aplica a configuração de CORS

// Middleware para analisar o corpo das requisições como JSON
app.use(express.json());

// --- NOVO: Middleware de Log para Requisições (Opcional, mas útil para debug) ---
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Importa as rotas
const userRoutes = require('./routes/userRoutes'); 
const bookRoutes = require('./routes/bookRoutes'); 

// --- ROTEAMENTO ---
// Usa as rotas de usuário com o prefixo '/api/usuarios'
app.use('/api/usuarios', userRoutes); 

// Usa as rotas de livros com o prefixo '/api/livros'
app.use('/api/livros', bookRoutes); 

// Rota de teste simples (ver se está funcionando)
app.get('/', (req, res) => {
  res.send('Servidor LivroLivre rodando! EBAAAA!');
});

// --- NOVO: Middleware para tratamento de erros genérico (RECOMENDADO) ---
// Este middleware captura erros que não foram tratados nas rotas/controllers
app.use((err, req, res, next) => {
    console.error(`[APP ERROR] ${err.stack}`);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
});


// Define a "porta" em que o servidor irá rodar
const PORT = process.env.PORT || 3001; 

// Inicia o servidor!
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse o backend em: http://localhost:${PORT}`);
  console.log(`Frontend esperado em: ${frontendOrigin}`);
});
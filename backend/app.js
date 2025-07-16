// Importa o Express
const express = require('express');

// Importa o CORS para permitir comunicação entre frontend e backend
const cors = require('cors');

// Importa o path para lidar com caminhos (necessário para servir imagens)
const path = require('path');

// Importa as rotas de chat
const chatRoutes = require('./routes/chatRoutes');

// Carrega as variáveis de ambiente do .env
require('dotenv').config();

// Conecta com o banco de dados SQLite
require('./database');

// Inicializa o app Express
const app = express();

// Define a origem permitida do frontend (pode vir do .env)
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configura as opções de CORS
const corsOptions = {
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Aplica o middleware de CORS
app.use(cors(corsOptions));

// Permite o uso de JSON no corpo das requisições
app.use(express.json());

// Serve arquivos estáticos da pasta 'uploads' (imagens)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log básico das requisições recebidas (para debug)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Importa as rotas de usuários e livros
const userRoutes = require('./routes/userRoutes'); 
const bookRoutes = require('./routes/bookRoutes'); 

// Usa as rotas com prefixos
app.use('/api/usuarios', userRoutes); 
app.use('/api/livros', bookRoutes); 
app.use('/api/chats', chatRoutes);

// Rota básica para testar se o servidor está no ar
app.get('/', (req, res) => {
  res.send('Servidor LivroLivre rodando! EBAAAA!');
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(`[APP ERROR] ${err.stack}`);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// Inicia o servidor na porta especificada
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse o backend em: http://localhost:${PORT}`);
  console.log(`Frontend esperado em: ${frontendOrigin}`);
});

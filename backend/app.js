// LivroLivre/backend/app.js

const express = require('express');
const cors = require('cors');
const path = require('path'); // 🆕 necessário para servir arquivos estáticos
require('dotenv').config();

require('./database');

const app = express();

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// 🆕 Serve arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log de requisições (debug)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Rotas
const userRoutes = require('./routes/userRoutes'); 
const bookRoutes = require('./routes/bookRoutes'); 

app.use('/api/usuarios', userRoutes); 
app.use('/api/livros', bookRoutes); 

// Rota teste
app.get('/', (req, res) => {
  res.send('Servidor LivroLivre rodando! EBAAAA!');
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(`[APP ERROR] ${err.stack}`);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// Inicia servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse o backend em: http://localhost:${PORT}`);
  console.log(`Frontend esperado em: ${frontendOrigin}`);
});

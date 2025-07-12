// Importação do Framework Express
const express = require('express');

// CORS: ferramenta que possibilita a comunicação entre o frontend e o backend
const cors = require('cors');

// Carregamento das variáveis de ambiente do arquivo .env de forma segura
require('dotenv').config();

// Criação da instância do aplicativo Express!
const app = express();

// Configuração do CORS para permitir requisições de diferentes origens
app.use(cors());

// Middleware para analisar o corpo das requisições como JSON
app.use(express.json());

// Importa as rotas de livros
const bookRoutes = require('./routes/bookRoutes');

// Usa as rotas de livros no caminho '/livros'
app.use('/livros', bookRoutes);

// Importa as rotas de usuários
const userRoutes = require('./routes/userRoutes');

// Usa as rotas de usuários no caminho '/usuarios'
app.use('/usuarios', userRoutes);

// Rota de teste simples (ver se está funcionando)
app.get('/', (req, res) => {
  res.send('Servidor LivroLivre rodando! EBAAAA!');
});

// Define a "porta" em que o servidor irá rodar
const PORT = process.env.PORT || 3001;

// Inicia o servidor!
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

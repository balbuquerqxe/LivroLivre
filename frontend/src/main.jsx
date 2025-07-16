// Importa o React e o ReactDOM
import React from 'react';
import ReactDOM from 'react-dom/client';

// Importa o componente principal da aplicação
import App from './App.jsx';

// Importa o BrowserRouter para navegação com rotas
import { BrowserRouter } from 'react-router-dom';

// Importa o contexto de autenticação
import { AuthProvider } from './contexts/AuthContext.jsx';

// Importa o CSS global
import './index.css';

// Renderiza a aplicação no elemento com id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter> {/* Habilita as rotas no React */}
    <AuthProvider> {/* Envolve o App com o contexto de autenticação */}
      <App />       {/* Componente principal da aplicação */}
    </AuthProvider>
  </BrowserRouter>
);
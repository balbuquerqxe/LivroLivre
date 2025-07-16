// Hooks e bibliotecas necessárias
import { useNavigate } from 'react-router-dom';
import Wave from 'react-wavify';
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoazul2.png';

export default function TelaInicial() {
  const navigate = useNavigate();

  // Define onde o conteúdo principal vai começar na tela
  const contentTopPosition = '30%';

  return (
    <div className="relative min-h-screen flex flex-col items-center text-center overflow-hidden bg-blue-900">
      
      {/* Botões no topo da tela (login e cadastro) */}
      <div className="absolute top-4 w-full flex justify-between px-6 z-10">
        {/* Botão para novo cadastro */}
        <button
          className="bg-yellow-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-100 font-semibold"
          onClick={() => navigate('/cadastro-usuario')}
        >
          Não possui cadastro?
        </button>

        {/* Botão para fazer login */}
        <button
          className="bg-pink-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-100 font-semibold"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>

      {/* Parte central com logo e mensagem de boas-vindas */}
      <div
        className="absolute left-1/2 -translate-x-1/2 px-8 z-10 w-full max-w-xl"
        style={{ top: contentTopPosition }}
      >
        {/* Logo grande centralizado */}
        <img src={logo} alt="Logo LivroLivre" className="w-64 h-auto mb-6 mx-auto" />

        {/* Texto principal da página */}
        <p className="text-lg text-white">
          Bem-vindo ao <strong>LivroLivre</strong>! Aqui você pode doar e adotar livros gratuitamente.
          Nosso objetivo é democratizar o acesso à leitura por meio de uma rede solidária entre leitores.
        </p>
      </div>

      {/* Ondas no fundo, compondo o visual animado da tela inicial */}

      {/* Primeira onda rosa claro */}
      <Wave
        fill="#FFC0CB"
        paused={false}
        options={{ height: 100, amplitude: 120, speed: 0.2, points: 7 }}
        className="absolute bottom-0 left-0 w-full h-[45vh] z-0"
      />

      {/* Segunda onda azul claro */}
      <Wave
        fill="#6abcdfff"
        paused={false}
        options={{ height: 100, amplitude: 120, speed: 0.1, points: 7 }}
        className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
      />

      {/* Terceira onda amarela clara */}
      <Wave
        fill="#e9cf7aff"
        paused={false}
        options={{ height: 100, amplitude: 120, speed: 0.2, points: 7 }}
        className="absolute bottom-0 left-0 w-full h-[30vh] z-0"
      />
    </div>
  );
}

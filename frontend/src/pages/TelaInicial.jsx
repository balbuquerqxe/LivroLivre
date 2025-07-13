import { useNavigate } from 'react-router-dom';
import Wave from 'react-wavify';
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoverde.png';

export default function TelaInicial() {
    const navigate = useNavigate();

    // Você pode ajustar este valor para controlar a altura do conteúdo
    const contentTopPosition = '30%'; // Exemplo: 30% do topo da tela

    return (
        <div className="relative min-h-screen flex flex-col items-center text-center overflow-hidden bg-blue-900">
            {/* Botões no topo */}
            <div className="absolute top-4 w-full flex justify-between px-6 z-10">
                {/* Botão: Cadastro */}
                <button
                    className="bg-yellow-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-100 font-semibold"
                    onClick={() => navigate('/cadastro-usuario')}
                >
                    Não possui cadastro?
                </button>

                {/* Botão: Login */}
                <button
                    className="bg-pink-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-100 font-semibold"
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
            </div>

            {/* Conteúdo principal (logo e texto) com altura ajustável */}
            <div
                className="absolute left-1/2 -translate-x-1/2 px-8 z-10 w-full max-w-xl"
                style={{ top: contentTopPosition }} // Usando a variável para controlar a altura
            >
                {/* ✅ Logo maior */}
                <img src={logo} alt="Logo LivroLivre" className="w-64 h-auto mb-6 mx-auto" />

                <p className="text-lg text-white">
                    Bem-vindo ao <strong>LivroLivre</strong>! Aqui você pode doar e adotar livros gratuitamente.
                    Nosso objetivo é democratizar o acesso à leitura por meio de uma rede solidária entre leitores.
                </p>
            </div>

            {/* Ondas na parte inferior */}
            {/* Onda Inferior: Amarela */}
            <Wave
                fill="#FFC0CB" // Amarela
                paused={false}
                options={{
                    height: 100,
                    amplitude: 120,
                    speed: 0.2,
                    points: 7,
                }}
                className="absolute bottom-0 left-0 w-full h-[45vh] z-0"
            />

            {/* Onda do Meio: Azul Claro */}
            <Wave
                fill="#6abcdfff" // Azul Claro
                paused={false}
                options={{
                    height: 100,
                    amplitude: 120,
                    speed: 0.1,
                    points: 7,
                }}
                className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
            />

            {/* Onda Superior: Rosa */}
            <Wave
                fill="#e9cf7aff" // Rosa
                paused={false}
                options={{
                    height: 100,
                    amplitude: 120,
                    speed: 0.2,
                    points: 7,
                }}
                className="absolute bottom-0 left-0 w-full h-[30vh] z-0"
            />
        </div>
    );
}
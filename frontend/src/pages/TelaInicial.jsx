import { useNavigate } from 'react-router-dom';
import Wave from 'react-wavify';
import logo from '/Users/buba/LivroLivre/LivroLivre/frontend/src/assets/logoverde.png';

export default function TelaInicial() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-green-700">
            {/* Onda grande e verde-claro */}
            <Wave
                fill="#56c27cff"
                paused={false}
                options={{
                    height: 80,
                    amplitude: 100,
                    speed: 0.25,
                    points: 5,
                }}
                className="absolute bottom-0 left-0 w-full h-[40vh] z-0"
            />

            {/* Conteúdo acima da onda */}
            <div className="z-10 px-8">
                {/* ✅ Logo no lugar do título */}
                <img src={logo} alt="Logo LivroLivre" className="w-48 h-auto mb-6 mx-auto" />

                <p className="text-lg text-white max-w-xl">
                    Bem-vindo ao <strong>LivroLivre</strong>! Aqui você pode doar e adotar livros gratuitamente.
                    Nosso objetivo é democratizar o acesso à leitura por meio de uma rede solidária entre leitores.
                </p>
            </div>

            {/* Botão: Login */}
            <button
                className="absolute bottom-6 right-6 bg-white text-green-700 px-4 py-2 rounded hover:bg-green-100 font-semibold z-10"
                onClick={() => navigate('/login')}
            >
                Login
            </button>

            {/* Botão: Cadastro */}
            <button
                className="absolute bottom-6 left-6 bg-white text-green-700 px-4 py-2 rounded hover:bg-green-100 font-semibold z-10"
                onClick={() => navigate('/cadastro-usuario')}
            >
                Não possui cadastro?
            </button>
        </div>
    );
}

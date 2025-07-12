// frontend/src/components/AdotarModal.jsx
import { useState } from 'react';

export default function AdotarModal({ livro, onClose, onAdotar }) {
  const [adotante, setAdotante] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adotante.trim() === '') return alert('Digite seu nome!');
    onAdotar(livro.id, adotante);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 shadow-lg w-96 relative">
        <h2 className="text-xl font-bold mb-4">Adotar "{livro.titulo}"</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Seu nome:
            </label>
            <input
              type="text"
              value={adotante}
              onChange={(e) => setAdotante(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Digite seu nome"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

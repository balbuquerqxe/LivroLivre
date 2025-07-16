import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

// Componente que exibe um modal de confirmação de adoção
export default function AdotarModal({ isOpen, onClose, onConfirm }) {
  const [carregando, setCarregando] = useState(false);

  const handleConfirmar = async () => {
    if (carregando) return; // Evita clique duplo
    setCarregando(true);

    try {
      await onConfirm(); // Chama a função que faz a adoção
      onClose(); // Fecha o modal após sucesso
    } catch (err) {
      console.error('Erro ao confirmar adoção:', err);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={carregando ? () => {} : onClose} // impede fechar enquanto carrega
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <DialogPanel className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">
        <DialogTitle className="text-lg font-bold mb-4">
          Confirmar Adoção
        </DialogTitle>

        <p className="mb-4 text-sm text-gray-700">
          Deseja realmente adotar este livro?
        </p>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={carregando}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={carregando}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {carregando ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
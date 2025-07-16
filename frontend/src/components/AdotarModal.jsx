// Importa o componente Dialog da biblioteca Headless UI
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

// Componente que exibe um modal de confirmação de adoção
export default function AdotarModal({ isOpen, onClose, onConfirm }) {
  return (

    // Modal com fundo escuro e centralizado
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      {/* Painel principal do conteúdo do modal */}
      <DialogPanel className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">

        {/* Título do modal */}
        <DialogTitle className="text-lg font-bold mb-4">
          Confirmar Adoção
        </DialogTitle>

        {/* Texto explicativo */}
        <p className="mb-4 text-sm text-gray-700">
          Deseja realmente adotar este livro?
        </p>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

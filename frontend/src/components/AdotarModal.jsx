// src/components/AdotarModal.jsx
import { Dialog } from '@headlessui/react';

export default function AdotarModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Dialog.Panel className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">
        <Dialog.Title className="text-lg font-bold mb-4">Confirmar Adoção</Dialog.Title>
        <p className="mb-4 text-sm text-gray-700">
          Deseja realmente adotar este livro?
        </p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Confirmar
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
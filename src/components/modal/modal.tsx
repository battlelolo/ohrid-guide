"use client";

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-8 bg-gray-800 text-white rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

import { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 z-10">✕</button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({ isOpen, onClose, onSave, defaultName }) => {
  const [name, setName] = React.useState(defaultName);

  React.useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista greiningu">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Sláðu inn heiti..."
        className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-kvenno-orange"
        autoFocus
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSave();
          }
        }}
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
        >
          Hætta við
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          Vista
        </button>
      </div>
    </Modal>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Hætta við',
  confirmVariant = 'danger',
}) => {
  const confirmColor =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-green-600 hover:bg-green-700';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-slate-700 mb-6">{message}</p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg transition ${confirmColor}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

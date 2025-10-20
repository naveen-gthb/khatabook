'use client';

import { Transaction, TransactionFormData } from '@/types/transaction';
import TransactionForm from './TransactionForm';
import { Contact } from '@/types/contact';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: TransactionFormData) => void;
  transaction: Transaction | null;
  contacts: Contact[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  contacts,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (formData: TransactionFormData) => {
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
          {transaction ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <TransactionForm
          onSubmit={handleSubmit}
          onClose={onClose} // Pass onClose down to the form
          initialData={transaction}
          contacts={contacts}
        />
      </div>
    </div>
  );
}

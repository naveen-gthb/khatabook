'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { Contact } from '@/types/contact';
import { Timestamp } from 'firebase/firestore';

// A specific type for our form's state to make handling dates and numbers easier.
interface TransactionFormState {
  contactId: string;
  amount: number | string; // Allow string for input flexibility
  date: string; // Store date as 'YYYY-MM-DDTHH:mm:ss' string for input
  purpose: string;
  type: 'lent' | 'received';
}

interface TransactionFormProps {
  onSubmit: (formData: TransactionFormData) => void;
  onClose: () => void;
  initialData: Transaction | null;
  contacts: Contact[];
}

// Helper to format a Date object to a 'YYYY-MM-DDTHH:mm:ss' string in the local timezone.
const toLocalDateTimeString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 19);
};


export default function TransactionForm({
  onSubmit,
  onClose,
  initialData,
  contacts,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormState>({
    contactId: '',
    amount: 0,
    date: toLocalDateTimeString(new Date()), // Use a local-date-aware function
    purpose: '',
    type: 'lent',
  });

  useEffect(() => {
    if (initialData) {
      // When editing, we now correctly format the timestamp to a local 'YYYY-MM-DDTHH:mm:ss' string.
      const localDateTimeString = toLocalDateTimeString(initialData.date.toDate());
      setFormData({
        contactId: initialData.contactId,
        amount: initialData.amount,
        date: localDateTimeString,
        purpose: initialData.purpose,
        type: initialData.type,
      });
    } else {
      // On new transaction, reset to default state with amount as 0
      setFormData({
        contactId: '',
        amount: 0,
        date: toLocalDateTimeString(new Date()),
        purpose: '',
        type: 'lent',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse the local date-time string from the form and create a timestamp.
    const date = new Date(formData.date);

    const amount = (typeof formData.amount === 'string' && formData.amount.trim() === '')
      ? 0
      : typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount;


    const dataToSubmit: TransactionFormData = {
      ...formData,
      amount: amount,
      date: Timestamp.fromDate(date),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
        <select id="contactId" name="contactId" value={formData.contactId} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base">
          <option value="">Select a contact</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>{contact.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
        <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base" />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date and Time</label>
        <input type="datetime-local" id="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base" step="1" />
      </div>

      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
        <input type="text" id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base" />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base">
          <option value="lent">Lent</option>
          <option value="received">Received</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Cancel
        </button>
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Save Transaction
        </button>
      </div>
    </form>
  );
}

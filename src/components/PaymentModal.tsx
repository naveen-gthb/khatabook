'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

// Helper to format a Date object to a 'YYYY-MM-DDTHH:mm:ss' string in the local timezone.
const toLocalDateTimeString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 19);
};

interface PaymentModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSubmit: (paymentAmount: number, paymentDate: Timestamp) => void;
}

export default function PaymentModal({ transaction, onClose, onSubmit }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toLocalDateTimeString(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    const paymentDate = Timestamp.fromDate(new Date(date));
    if (!isNaN(paymentAmount) && paymentAmount > 0) {
      onSubmit(paymentAmount, paymentDate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-xl font-semibold dark:text-white">Add Payment</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Transaction with {transaction.contactName} for {formatCurrency(transaction.amount)}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
              placeholder="Enter payment amount"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date and Time</label>
            <input 
              type="datetime-local" 
              id="date" 
              name="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base" 
              step="1"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Cancel
            </button>
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

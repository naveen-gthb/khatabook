'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Timestamp } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';

interface PaymentModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSubmit: (paymentAmount: number, paymentDate: Timestamp, details: string) => void;
}

export default function PaymentModal({ transaction, onClose, onSubmit }: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<number | string>('');
  
  const getLocalDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  
  const [paymentDate, setPaymentDate] = useState(getLocalDateTimeString());
  const [details, setDetails] = useState('');

  const remainingAmount = transaction.remainingAmount ?? transaction.amount - (transaction.paidAmount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = typeof paymentAmount === 'string' ? parseFloat(paymentAmount) : paymentAmount;
    if (amount > 0) {
        const date = new Date(paymentDate);
        onSubmit(amount as number, Timestamp.fromDate(date), details);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);

    if (value === '') {
        setPaymentAmount('');
    } else if (!isNaN(numValue) && numValue >= 0 && numValue <= remainingAmount) {
        setPaymentAmount(value);
    } else if (numValue > remainingAmount) {
        setPaymentAmount(remainingAmount.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Add Payment</h2>
        <p className="mb-2 dark:text-gray-300">To: <span className="font-semibold">{transaction.contactName}</span></p>
        <p className="mb-4 dark:text-gray-300">For: <span className="font-semibold">{transaction.purpose}</span></p>
        <p className="mb-4 dark:text-gray-300">Remaining Amount: <span className="font-semibold text-orange-500">{formatCurrency(remainingAmount)}</span></p>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={handleAmountChange}
                    className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    max={remainingAmount}
                    step="0.01"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                    type="datetime-local"
                    id="paymentDate"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details (Optional)</label>
                <input
                    type="text"
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700">
                    Add Payment
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

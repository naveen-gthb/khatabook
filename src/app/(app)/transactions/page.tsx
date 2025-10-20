'use client';

import { useState, useEffect } from 'react';
import TransactionModal from '@/components/TransactionModal';
import PaymentModal from '@/components/PaymentModal';
import ComboBox from '@/components/ComboBox';
import { Transaction, TransactionFormData, PaymentHistoryItem } from '@/types/transaction';
import { useAuth } from '@/hooks/useAuth';
import { getUserContacts } from '@/services/contactService';
import { Contact } from '@/types/contact';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc, Timestamp, updateDoc, orderBy, getDoc, runTransaction } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';

export default function ActiveLoansPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (user && contacts.length > 0) {
      const db = getFirestore();
      let transactionsQuery = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid),
        where("type", "==", "lent"),
        where("status", "!=", "paid"),
        orderBy("status"),
        orderBy("date", "desc")
      );

      if (selectedContactId) {
        transactionsQuery = query(transactionsQuery, where("contactId", "==", selectedContactId));
      }

      const unsubscribe = onSnapshot(transactionsQuery, async (querySnapshot) => {
        const transactionsDataPromises = querySnapshot.docs.map(async (doc) => {
          const transaction = { ...doc.data(), id: doc.id } as unknown as Transaction;
          const contact = contacts.find(c => c.id === transaction.contactId);
          transaction.contactName = contact ? contact.name : 'Unknown Contact';
          return transaction;
        });
        const transactionsData = await Promise.all(transactionsDataPromises);
        setTransactions(transactionsData.filter(tx => !tx.parentTransactionId));
      }, (error) => {
        console.error("Error fetching transactions: ", error);
      });

      return () => unsubscribe();
    }
  }, [user, selectedContactId, contacts]);

  const fetchContacts = async () => {
    if (!user) return;
    try {
      const userContacts = await getUserContacts(user.uid);
      setContacts(userContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const saveTransaction = async (formData: TransactionFormData) => {
    if (!user) return;

    const confirmSave = selectedTransaction
    ? window.confirm("Are you sure you want to save changes to this transaction?")
    : true;

    if (confirmSave) {
        try {
            const db = getFirestore();
            const newTransaction = {
                ...formData,
                userId: user.uid,
                createdAt: Timestamp.now(),
                paidAmount: 0,
                remainingAmount: formData.amount,
                paymentHistory: [],
                status: 'pending' as 'pending' | 'partial' | 'paid',
            };

            if (selectedTransaction) {
              const docRef = doc(db, 'transactions', selectedTransaction.id);
              await updateDoc(docRef, { ...formData });
            } else {
              await addDoc(collection(db, 'transactions'), newTransaction); 
            }
            handleCloseModal();
          } catch (e) {
            console.error('Error saving transaction: ', e);
          }
    }

  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (confirmDelete) {
        try {
            const db = getFirestore();
            const docRef = doc(db, "transactions", id);
            await deleteDoc(docRef);
          } catch (error) {
            console.error("Error deleting transaction:", error);
          }
    }

    setOpenMenuId(null);
  };

  const handleAddPayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsPaymentModalOpen(true);
    setOpenMenuId(null);
  };

  const handleMarkAsPaid = async (transaction: Transaction) => {
    const remainingAmount = transaction.amount - (transaction.paidAmount || 0);
    if (remainingAmount <= 0) return;

    if (!user) return;

    const confirmPaid = window.confirm("Are you sure you want to mark this loan as fully paid?");
    if (!confirmPaid) {
        setOpenMenuId(null);
        return;
    }

    try {
        await runTransaction(getFirestore(), async (t) => {
            const newPaymentRef = doc(collection(getFirestore(), "transactions"));
            const paymentDate = Timestamp.now();

            t.set(newPaymentRef, {
                amount: remainingAmount,
                contactId: transaction.contactId,
                date: paymentDate,
                type: 'received',
                purpose: `Payment for transaction ${transaction.id}`,
                userId: user.uid,
                parentTransactionId: transaction.id,
                createdAt: Timestamp.now(),
            });

            const newPaymentHistoryItem: PaymentHistoryItem = {
                transactionId: newPaymentRef.id,
                amount: remainingAmount,
                date: paymentDate,
            };

            const transactionRef = doc(getFirestore(), "transactions", transaction.id);
            t.update(transactionRef, {
                paidAmount: transaction.amount,
                status: 'paid',
                remainingAmount: 0,
                paymentHistory: [...(transaction.paymentHistory || []), newPaymentHistoryItem],
            });
        });
    } catch (error) {
        console.error("Error marking as paid: ", error);
    }
    setOpenMenuId(null);
  };

  const handlePaymentSubmit = async (paymentAmount: number, paymentDate: Timestamp) => {
    if (!selectedTransaction || !user) return;

    const newPaidAmount = (selectedTransaction.paidAmount || 0) + paymentAmount;
    const isClosingLoan = newPaidAmount >= selectedTransaction.amount;

    if (isClosingLoan) {
        const confirmClose = window.confirm("This payment will close the loan. Are you sure you want to proceed?");
        if (!confirmClose) {
            return;
        }
    }

    try {
        await runTransaction(getFirestore(), async (t) => {
            const newPaymentRef = doc(collection(getFirestore(), "transactions"));

            t.set(newPaymentRef, {
                amount: paymentAmount,
                contactId: selectedTransaction.contactId,
                date: paymentDate,
                type: 'received',
                purpose: `Partial payment for transaction ${selectedTransaction.id}`,
                userId: user.uid,
                parentTransactionId: selectedTransaction.id,
                createdAt: Timestamp.now(),
            });

            const newPaymentHistoryItem: PaymentHistoryItem = {
                transactionId: newPaymentRef.id,
                amount: paymentAmount,
                date: paymentDate,
            };

            const transactionRef = doc(getFirestore(), "transactions", selectedTransaction.id);
            const newRemainingAmount = selectedTransaction.amount - newPaidAmount;
            const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

            t.update(transactionRef, {
                paidAmount: newPaidAmount,
                status: newStatus,
                remainingAmount: newRemainingAmount,
                paymentHistory: [...(selectedTransaction.paymentHistory || []), newPaymentHistoryItem],
            });
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
    }

    setIsPaymentModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Invalid Date';
    if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
    }
    return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  const totalLent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPending = transactions.reduce((acc, t) => acc + (t.remainingAmount !== undefined ? t.remainingAmount : t.amount - (t.paidAmount || 0)), 0);

  const toggleMenu = (transactionId: string) => {
    setOpenMenuId(openMenuId === transactionId ? null : transactionId);
  };

  const contactOptions = contacts.map(c => ({ id: c.id!, name: c.name }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Active Loans</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Loan
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="contactFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Contact</label>
        <ComboBox
            options={contactOptions}
            value={selectedContactId}
            onChange={setSelectedContactId}
            placeholder="All Contacts"
        />
    </div>

    <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold dark:text-white mb-2">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-lg font-semibold text-red-800 dark:text-red-200">Total Lent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">{formatCurrency(totalLent)}</p>
          </div>
          <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">Total Pending</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-lg dark:text-gray-200">{transaction.contactName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{transaction.purpose}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                </div>
                <div className="flex items-center">
                    <div>
                        <p className="text-xl font-bold font-mono text-red-500">
                            -{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-right text-orange-500 font-mono">
                           -{formatCurrency(transaction.remainingAmount !== undefined ? transaction.remainingAmount : transaction.amount - (transaction.paidAmount || 0))}
                        </p>
                    </div>
                    <div className="relative ml-4">
                        <button onClick={() => toggleMenu(transaction.id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                        </button>
                        {openMenuId === transaction.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                             <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => handleDeleteTransaction(transaction.id!)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                            Delete
                            </button>
                            {transaction.type === 'lent' && transaction.status !== 'paid' && (
                                <>
                                <button
                                    onClick={() => handleAddPayment(transaction)}
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Add Payment
                                </button>
                                <button
                                    onClick={() => handleMarkAsPaid(transaction)}
                                    className="block w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Mark as Paid
                                </button>
                                </>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                }`}>
                    {transaction.status}
                </span>
                {transaction.paidAmount > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paid: {formatCurrency(transaction.paidAmount)}
                    </p>
                )}
                </div>
            </div>
            {transaction.paymentHistory && transaction.paymentHistory.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment History</h4>
                    <ul className="mt-2 space-y-2">
                        {transaction.paymentHistory.map((payment, index) => (
                             <li key={index} className="text-xs text-gray-500 dark:text-gray-400">
                             - {formatCurrency(payment.amount)} on {formatDate(payment.date)}
                         </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        ))}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={saveTransaction}
        transaction={selectedTransaction}
        contacts={contacts}
      />

      {isPaymentModalOpen && selectedTransaction && (
        <PaymentModal
          transaction={selectedTransaction}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
}

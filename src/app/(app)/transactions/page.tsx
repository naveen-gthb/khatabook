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
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ActiveLoansPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            setErrorMessage("Failed to save transaction. Please try again.");
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
            setErrorMessage("Failed to delete transaction. Please try again.");
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
    if(!user) return;

    const confirmPaid = window.confirm("Are you sure you want to mark this loan as fully paid?");
    if (!confirmPaid) {
        setOpenMenuId(null);
        return;
    }

    const transactionRef = doc(getFirestore(), "transactions", transaction.id);

    try {
        await runTransaction(getFirestore(), async (t) => {
            const transactionDoc = await t.get(transactionRef);
            if (!transactionDoc.exists()) {
                throw "Transaction document does not exist!";
            }
            const transactionData = transactionDoc.data() as Transaction;
            const remainingAmount = transactionData.amount - (transactionData.paidAmount || 0);
            if (remainingAmount <= 0) return;

            const newPaymentRef = doc(collection(getFirestore(), "transactions"));
            const paymentDate = Timestamp.now();

            t.set(newPaymentRef, {
                amount: remainingAmount,
                contactId: transactionData.contactId,
                date: paymentDate,
                type: 'received',
                purpose: `Payment for "${transactionData.purpose}"`,
                userId: user.uid,
                parentTransactionId: transactionDoc.id,
                createdAt: Timestamp.now(),
            });

            const newPaymentHistoryItem: PaymentHistoryItem = {
                transactionId: newPaymentRef.id,
                amount: remainingAmount,
                date: paymentDate,
                details: "Loan closed with this payment",
            };

            t.update(transactionRef, {
                paidAmount: transactionData.amount,
                status: 'paid',
                remainingAmount: 0,
                paymentHistory: [...(transactionData.paymentHistory || []), newPaymentHistoryItem],
            });
        });
    } catch (error) {
        console.error("Error marking as paid: ", error);
        setErrorMessage("Failed to mark as paid. Please try again.");
    }
    setOpenMenuId(null);
  };

  const handlePaymentSubmit = async (paymentAmount: number, paymentDate: Timestamp, details: string) => {
    if (!selectedTransaction || !user) return;

    const isClosingLoan = (selectedTransaction.paidAmount || 0) + paymentAmount >= selectedTransaction.amount;

    if (isClosingLoan) {
        const confirmClose = window.confirm("This payment will close the loan. Are you sure you want to proceed?");
        if (!confirmClose) {
            return;
        }
    }

    const transactionRef = doc(getFirestore(), "transactions", selectedTransaction.id);

    try {
        await runTransaction(getFirestore(), async (t) => {
            const transactionDoc = await t.get(transactionRef);
            if (!transactionDoc.exists()) {
                throw "Transaction document does not exist!";
            }
            const transactionData = transactionDoc.data() as Transaction;

            const newPaidAmount = (transactionData.paidAmount || 0) + paymentAmount;
            
            const newPaymentRef = doc(collection(getFirestore(), "transactions"));

            t.set(newPaymentRef, {
                amount: paymentAmount,
                contactId: transactionData.contactId,
                date: paymentDate,
                type: 'received',
                purpose: `Partial payment for "${transactionData.purpose}"`,
                userId: user.uid,
                parentTransactionId: transactionDoc.id,
                createdAt: Timestamp.now(),
            });

            const newPaymentHistoryItem: PaymentHistoryItem = {
                transactionId: newPaymentRef.id,
                amount: paymentAmount,
                date: paymentDate,
            };

            if (details) {
                newPaymentHistoryItem.details = details;
            }

            const newRemainingAmount = transactionData.amount - newPaidAmount;
            const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

            t.update(transactionRef, {
                paidAmount: newPaidAmount,
                status: newStatus,
                remainingAmount: newRemainingAmount,
                paymentHistory: [...(transactionData.paymentHistory || []), newPaymentHistoryItem],
            });
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        setErrorMessage("Failed to add payment. Please try again.");
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
        return new Date(date).toLocaleString();
    }
    return date.toDate ? date.toDate().toLocaleString() : new Date(date).toLocaleString();
  };

  const totalLent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPending = transactions.reduce((acc, t) => acc + (t.remainingAmount !== undefined ? t.remainingAmount : t.amount - (t.paidAmount || 0)), 0);

  const toggleMenu = (transactionId: string) => {
    setOpenMenuId(openMenuId === transactionId ? null : transactionId);
  };

  const contactOptions = contacts.map(c => ({ id: c.id!, name: c.name }));

  return (
    <div className="container mx-auto p-4">
      {errorMessage && <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
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
                <div className="flex items-center">
                    <p className="font-semibold text-xl dark:text-gray-200 mr-2">{transaction.purpose}</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {transaction.status}
                    </span>
                </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{transaction.contactName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-md font-mono">{formatDate(transaction.date)}</p>
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
            {transaction.paymentHistory && transaction.paymentHistory.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment History</h4>
                    <ul className="mt-2 space-y-2">
                        {transaction.paymentHistory.map((payment, index) => (
                             <li key={index} className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                             - {formatDate(payment.date)}: <span className="text-green-500">+{formatCurrency(payment.amount)}</span>{payment.details ? ` (${payment.details})` : ''}
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

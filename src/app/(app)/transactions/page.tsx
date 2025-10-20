'use client';

import { useState, useEffect } from 'react';
import TransactionModal from '@/components/TransactionModal';
import ComboBox from '@/components/ComboBox';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { useAuth } from '@/hooks/useAuth';
import { getUserContacts } from '@/services/contactService';
import { Contact } from '@/types/contact';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc, Timestamp, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { updateTotal } from '@/lib/transactionUtils';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const db = getFirestore();
      let transactionsQuery = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );

      if (selectedContactId) {
        transactionsQuery = query(transactionsQuery, where("contactId", "==", selectedContactId));
      }

      const unsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
        const transactionsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as unknown as Transaction);
        setTransactions(transactionsData);
      }, (error) => {
        console.error("Error fetching transactions: ", error);
      });

      return () => unsubscribe();
    }
  }, [user, selectedContactId]);

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
            if (selectedTransaction) {
              const docRef = doc(db, 'transactions', selectedTransaction.id);
              const oldTransactionSnap = await getDoc(docRef);
              if (oldTransactionSnap.exists()) {
                const oldTransactionData = oldTransactionSnap.data() as Transaction;
                // Revert the old amount
                await updateTotal(user.uid, -oldTransactionData.amount, oldTransactionData.type);
              }
              await updateDoc(docRef, { ...formData });
              // Add the new amount
              await updateTotal(user.uid, formData.amount, formData.type);
            } else {
              await addDoc(collection(db, 'transactions'), {
                ...formData,
                userId: user.uid,
                createdAt: Timestamp.now(),
              });
              await updateTotal(user.uid, formData.amount, formData.type);
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
            const oldTransactionSnap = await getDoc(docRef);
            if (oldTransactionSnap.exists()) {
              const oldTransactionData = oldTransactionSnap.data() as Transaction;
              await updateTotal(user.uid, -oldTransactionData.amount, oldTransactionData.type);
            }
            await deleteDoc(docRef);
          } catch (error) {
            console.error("Error deleting transaction:", error);
          }
    }

    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const getContactName = (contactId: string) => {
    return contacts.find(c => c.id === contactId)?.name || 'Unknown Contact';
  };

  const formatDate = (date: any) => {
    if (!date) return 'Invalid Date';
    return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  const totalReceived = transactions.filter(t => t.type === 'received').reduce((acc, t) => acc + t.amount, 0);
  const totalLent = transactions.filter(t => t.type === 'lent').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalReceived - totalLent;

  const toggleMenu = (transactionId: string) => {
    setOpenMenuId(openMenuId === transactionId ? null : transactionId);
  };

  const contactOptions = contacts.map(c => ({ id: c.id!, name: c.name }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Transactions</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Transaction
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">Total Received</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">Rs.{totalReceived.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-lg font-semibold text-red-800 dark:text-red-200">Total Lent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">Rs.{totalLent.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">Net Balance</p>
            <p className={`text-2xl font-bold font-mono ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {netBalance >= 0 ? `Rs.${netBalance.toFixed(2)}` : `-Rs.${Math.abs(netBalance).toFixed(2)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg dark:text-gray-200">{getContactName(transaction.contactId)}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{transaction.purpose}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(transaction.date)}</p>
            </div>
            <div className="flex items-center">
                <p className={`text-xl font-bold font-mono ${transaction.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'received' ? '+' : '-'}Rs.{transaction.amount.toFixed(2)}
                </p>
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
                    </div>
                    )}
                </div>
            </div>
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
    </div>
  );
}

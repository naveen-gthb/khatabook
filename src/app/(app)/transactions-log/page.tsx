'use client';

import { useState, useEffect } from 'react';
import ComboBox from '@/components/ComboBox';
import { Transaction } from '@/types/transaction';
import { useAuth } from '@/hooks/useAuth';
import { getUserContacts } from '@/services/contactService';
import { Contact } from '@/types/contact';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';

export default function TransactionsLogPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

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
        
        // Sort transactions by date in descending order
        const sortedTransactions = transactionsData.sort((a, b) => {
            const dateA = a.date.toDate ? a.date.toDate().getTime() : 0;
            const dateB = b.date.toDate ? b.date.toDate().getTime() : 0;
            return dateB - dateA;
        });

        setTransactions(sortedTransactions);
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

  const formatDate = (date: any) => {
    if (!date) return 'Invalid Date';
    if (typeof date === 'string') {
        return new Date(date).toLocaleString();
    }
    return date.toDate ? date.toDate().toLocaleString() : new Date(date).toLocaleString();
  };

  const contactOptions = contacts.map(c => ({ id: c.id!, name: c.name }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Transactions Log</h1>
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

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-lg dark:text-gray-200">{transaction.contactName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{transaction.purpose}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                     {transaction.parentTransactionId && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">Payment for: {transaction.parentTransactionId}</p>
                    )}
                </div>
                <div className="flex items-center">
                    <p className={`text-xl font-bold font-mono ${transaction.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.type === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

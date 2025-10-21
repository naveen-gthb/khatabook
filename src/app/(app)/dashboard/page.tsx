'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, Timestamp, runTransaction } from "firebase/firestore";
import { Transaction, PaymentHistoryItem } from "@/types/transaction";
import PaymentModal from "@/components/PaymentModal";
import ErrorMessage from "@/components/ui/ErrorMessage";

// Define interfaces for the data
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: Date;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [totalLent, setTotalLent] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, async (snapshot) => {
        let lentTotal = 0;
        let pendingTotal = 0;
        const transactionsPromises = snapshot.docs.map(async (docSnapshot) => {
            const transactionData = docSnapshot.data() as Transaction;
            if (transactionData.type === 'lent' && transactionData.status !== 'paid') {
                lentTotal += transactionData.amount;
                pendingTotal += transactionData.remainingAmount !== undefined 
                    ? transactionData.remainingAmount 
                    : transactionData.amount - (transactionData.paidAmount || 0);
            }

            if (transactionData.parentTransactionId) {
              return null;
            }

            let contactName = 'Unknown Contact';
            if (transactionData.contactId) {
                const contactDocRef = doc(db, 'contacts', transactionData.contactId);
                const contactSnap = await getDoc(contactDocRef);
                if (contactSnap.exists()) {
                    contactName = contactSnap.data().name;
                }
            }
            
            return {
                id: docSnapshot.id,
                ...transactionData,
                date: (transactionData.date as any).toDate(),
                contactName: contactName,
            } as Transaction;
        });

        const transactions = (await Promise.all(transactionsPromises)).filter(Boolean) as Transaction[];
        setTotalLent(lentTotal);
        setPendingAmount(pendingTotal);
        setRecentTransactions(transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5));
        setLoading(false);
    });

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as Order[];
      
      setActiveOrders(orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length);
      setRecentOrders(orders.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5));
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeOrders();
    };
  }, [user]);

  const handleAddPayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = async (transaction: Transaction) => {
    if(!user) return;

    const confirmPaid = window.confirm("Are you sure you want to mark this loan as fully paid?");
    if (!confirmPaid) return;

    const transactionRef = doc(db, "transactions", transaction.id);

    try {
        await runTransaction(db, async (t) => {
            const transactionDoc = await t.get(transactionRef);
            if (!transactionDoc.exists()) {
                throw "Transaction document does not exist!";
            }
            const transactionData = transactionDoc.data() as Transaction;

            const remainingAmount = transactionData.amount - (transactionData.paidAmount || 0);
            if (remainingAmount <= 0) return;

            const newPaymentRef = doc(collection(db, "transactions"));
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

    const transactionRef = doc(db, "transactions", selectedTransaction.id);

    try {
        await runTransaction(db, async (t) => {
            const transactionDoc = await t.get(transactionRef);
            if (!transactionDoc.exists()) {
                throw "Transaction document does not exist!";
            }
            const transactionData = transactionDoc.data() as Transaction;

            const newPaidAmount = (transactionData.paidAmount || 0) + paymentAmount;
            
            const newPaymentRef = doc(collection(db, "transactions"));

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

            const newPaymentHistoryItem: Partial<PaymentHistoryItem> = {
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

    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  // Navigation handlers
  const handleAddContact = () => router.push("/contacts");
  const handleAddMoney = () => router.push("/transactions");
  const handleAddOrder = () => router.push("/orders");
  const handleImportExport = () => router.push("/import-export");

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {errorMessage && <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} />}

      {isModalOpen && selectedTransaction && (
        <PaymentModal
          transaction={selectedTransaction}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Active Loans Total
          </h2>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalLent)}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Pending Amount
          </h2>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(pendingAmount)}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Active Orders
          </h2>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {activeOrders}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Recent Transactions
        </h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          {recentTransactions.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.map((tx) => (
                <li key={tx.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900 dark:text-white text-lg mr-2">{tx.purpose}</p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          tx.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {tx.status}
                        </span>
                        </div>
                        <p className="text-md text-gray-500 dark:text-gray-400">{tx.contactName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'lent' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'lent' ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{new Date(tx.date).toLocaleString()}</p>
                    </div>
                  </div>
                  {tx.paymentHistory && tx.paymentHistory.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment History</h4>
                        <ul className="mt-2 space-y-2">
                            {tx.paymentHistory.map(payment => (
                                <li key={payment.transactionId} className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    - {new Date((payment.date as any).toDate()).toLocaleString()}: <span className="text-green-500">+{formatCurrency(payment.amount)}</span>{payment.details ? ` (${payment.details})` : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No recent transactions found.
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Order Status
        </h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
         {recentOrders.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.map((order) => (
                <li key={order.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">#{order.orderNumber} - {order.customerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total: {formatCurrency(order.total)}</p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No orders found.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <button
            onClick={handleAddContact}
            className="rounded-md bg-blue-50 p-4 text-center text-blue-700 shadow-sm hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            Add Contact
          </button>

          <button
            onClick={handleAddMoney}
            className="rounded-md bg-green-50 p-4 text-center text-green-700 shadow-sm hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
          >
            Add Money
          </button>

          <button
            onClick={handleAddOrder}
            className="rounded-md bg-amber-50 p-4 text-center text-amber-700 shadow-sm hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            Add Order
          </button>

          <button
            onClick={handleImportExport}
            className="rounded-md bg-purple-50 p-4 text-center text-purple-700 shadow-sm hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
          >
            Import/Export
          </button>
        </div>
      </div>
    </div>
  );
}

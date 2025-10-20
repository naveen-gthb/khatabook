'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDocs, writeBatch } from "firebase/firestore";

// Define interfaces for the data
interface Transaction {
  id: string;
  type: 'lent' | 'received';
  amount: number;
  contactName: string;
  date: Date;
}

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

  const recalculateTotals = async () => {
    if (!user) return;

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(transactionsQuery);
    let lentTotal = 0;
    let receivedTotal = 0;

    querySnapshot.forEach((doc) => {
      const tx = doc.data();
      if (tx.type === 'lent') {
        lentTotal += tx.amount;
      } else if (tx.type === 'received') {
        receivedTotal += tx.amount;
      }
    });

    const totalsRef = doc(db, "totals", user.uid);
    const batch = writeBatch(db);
    batch.set(totalsRef, { totalLent: lentTotal, totalReceived: receivedTotal });
    await batch.commit();
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const totalsRef = doc(db, "totals", user.uid);
    const unsubscribeTotals = onSnapshot(totalsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const lentTotal = data.totalLent || 0;
        const receivedTotal = data.totalReceived || 0;
        setTotalLent(lentTotal);
        setPendingAmount(lentTotal - receivedTotal);
      } else {
        setTotalLent(0);
        setPendingAmount(0);
      }
      setLoading(false);
    });

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      })) as Transaction[];

      setRecentTransactions(transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5));
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
      unsubscribeTotals();
      unsubscribeTransactions();
      unsubscribeOrders();
    };
  }, [user]);

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
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Total Lent
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
        <button
          onClick={recalculateTotals}
          className="rounded-md bg-purple-50 p-4 text-center text-purple-700 shadow-sm hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
        >
          Recalculate Totals
        </button>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Recent Transactions
        </h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          {recentTransactions.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentTransactions.map((tx) => (
                <li key={tx.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tx.contactName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date.toLocaleDateString()}</p>
                  </div>
                  <p className={`font-semibold ${tx.type === 'lent' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'lent' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </p>
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

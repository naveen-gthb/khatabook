"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [totalLent, setTotalLent] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);

  // In a real app, we would fetch this data from Firebase
  useEffect(() => {
    // Placeholder data
    setTotalLent(10000);
    setPendingAmount(5000);
    setActiveOrders(15);
  }, []);

  // Navigation handlers
  const handleAddContact = () => {
    router.push("/contacts");
  };

  const handleAddMoney = () => {
    router.push("/transactions");
  };

  const handleAddOrder = () => {
    router.push("/orders");
  };

  const handleImportExport = () => {
    router.push("/import-export");
  };

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
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Recent Transactions
        </h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No recent transactions found.
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Order Status
        </h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No orders found.
          </div>
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

// Made with Bob

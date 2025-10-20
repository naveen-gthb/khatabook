"use client";

import { useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Orders</h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Add Order
        </button>
      </div>

      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="order-status"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Status:
          </label>
          <select
            id="order-status"
            className="rounded-md border border-gray-300 bg-white py-1 pl-3 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">{/* Order items would go here */}</div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-800">
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
            No orders found
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Add your first order to start tracking your purchases
          </p>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Add Order
          </button>
        </div>
      )}
    </div>
  );
}

// Made with Bob

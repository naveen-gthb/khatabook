"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  // Redirect to dashboard if authenticated (will implement later)
  // For now, we'll just show the landing page

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-5xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-blue-600">KhataBook</h1>
        <p className="mb-8 text-xl text-gray-600">
          Track money lent to friends and monitor your orders in one place
        </p>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">
              Track Money
            </h2>
            <p className="text-gray-600">
              Keep track of all the money you lend to friends and family
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">
              Monitor Orders
            </h2>
            <p className="text-gray-600">
              Track delivery status, returns, and refunds for all your orders
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">
              Import/Export
            </h2>
            <p className="text-gray-600">
              Easily import and export data using CSV files
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-blue-600 bg-white px-6 py-3 text-blue-600 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

// Made with Bob

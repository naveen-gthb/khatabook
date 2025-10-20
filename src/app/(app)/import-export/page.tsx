"use client";

import { useState } from "react";

export default function ImportExportPage() {
  const [importType, setImportType] = useState("contacts");
  const [exportType, setExportType] = useState("contacts");
  const [file, setFile] = useState<File | null>(null);

  const handleImportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setImportType(e.target.value);
  };

  const handleExportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportType(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    // In a real app, we would process the CSV file here
    console.log("Importing", importType, "from", file?.name);
  };

  const handleExport = () => {
    // In a real app, we would generate and download a CSV file here
    console.log("Exporting", exportType);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Import/Export</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Import Data
        </h2>

        <div className="mb-4">
          <label
            htmlFor="import-type"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data Type
          </label>
          <select
            id="import-type"
            value={importType}
            onChange={handleImportTypeChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="contacts">Contacts</option>
            <option value="transactions">Transactions</option>
            <option value="orders">Orders</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="csv-file"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Upload CSV File
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <button className="rounded-md border border-blue-600 bg-white px-4 py-2 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:bg-transparent dark:text-blue-500 dark:hover:bg-blue-900/30">
            Download Template
          </button>
        </div>

        <button
          onClick={handleImport}
          disabled={!file}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Import Data
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">
          Export Data
        </h2>

        <div className="mb-4">
          <label
            htmlFor="export-type"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Data Type
          </label>
          <select
            id="export-type"
            value={exportType}
            onChange={handleExportTypeChange}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="contacts">Contacts</option>
            <option value="transactions">Transactions</option>
            <option value="orders">Orders</option>
          </select>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="start-date"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="end-date"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleExport}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
}

// Made with Bob

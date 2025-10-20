"use client";

import { useState, useEffect } from "react";
import {
  checkFirebaseInitialization,
  logFirebaseConfig,
} from "@/lib/firebase-error-handler";
import { auth, db, storage } from "@/lib/firebase";
import Link from "next/link";

export default function FirebaseDebugPage() {
  const [initStatus, setInitStatus] = useState<{
    isInitialized: boolean;
    issues: string[];
  }>({
    isInitialized: false,
    issues: [],
  });
  const [configLogged, setConfigLogged] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "checking" | "success" | "error"
  >("checking");
  const [dbStatus, setDbStatus] = useState<"checking" | "success" | "error">(
    "checking"
  );
  const [storageStatus, setStorageStatus] = useState<
    "checking" | "success" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check Firebase initialization
    const status = checkFirebaseInitialization();
    setInitStatus(status);

    // Log Firebase config
    logFirebaseConfig();
    setConfigLogged(true);

    // Check Auth
    try {
      if (auth && auth.app) {
        setAuthStatus("success");
      } else {
        setAuthStatus("error");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthStatus("error");
    }

    // Check Firestore
    try {
      if (db && db.app) {
        setDbStatus("success");
      } else {
        setDbStatus("error");
      }
    } catch (error) {
      console.error("Firestore check error:", error);
      setDbStatus("error");
    }

    // Check Storage
    try {
      if (storage && storage.app) {
        setStorageStatus("success");
      } else {
        setStorageStatus("error");
      }
    } catch (error) {
      console.error("Storage check error:", error);
      setStorageStatus("error");
    }
  }, []);

  const testFirestore = async () => {
    try {
      setErrorMessage(null);
      // Import Firestore functions
      const { collection, getDocs, query, limit } = await import(
        "firebase/firestore"
      );

      // Try to fetch a single document from any collection
      const testQuery = query(collection(db, "test_collection"), limit(1));
      await getDocs(testQuery);

      alert("Firestore connection successful! Check console for details.");
      console.log("Firestore test query executed successfully");
    } catch (error: any) {
      console.error("Firestore test error:", error);
      setErrorMessage(error.message || "Unknown Firestore error");
    }
  };

  const testAuth = async () => {
    try {
      setErrorMessage(null);
      // Just check if auth is initialized
      if (auth && auth.app) {
        alert("Auth is properly initialized! Check console for details.");
        console.log("Auth initialized with app:", auth.app.name);
      } else {
        throw new Error("Auth is not properly initialized");
      }
    } catch (error: any) {
      console.error("Auth test error:", error);
      setErrorMessage(error.message || "Unknown Auth error");
    }
  };

  const testStorage = async () => {
    try {
      setErrorMessage(null);
      // Import Storage functions
      const { ref, listAll } = await import("firebase/storage");

      // Try to list files in the root of the storage bucket
      const rootRef = ref(storage);
      await listAll(rootRef);

      alert("Storage connection successful! Check console for details.");
      console.log("Storage test completed successfully");
    } catch (error: any) {
      console.error("Storage test error:", error);
      setErrorMessage(error.message || "Unknown Storage error");
    }
  };

  const getStatusColor = (status: "checking" | "success" | "error") => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Firebase Debug Page</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">
          Firebase Initialization Status
        </h2>
        <div className="mb-4">
          <p
            className={`text-lg ${
              initStatus.isInitialized ? "text-green-500" : "text-red-500"
            }`}
          >
            Status:{" "}
            {initStatus.isInitialized ? "Initialized" : "Not Initialized"}
          </p>
          {initStatus.issues.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-500">Issues:</p>
              <ul className="ml-5 list-disc">
                {initStatus.issues.map((issue, index) => (
                  <li key={index} className="text-red-400">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="mb-2 font-medium">
            Config Logged to Console: {configLogged ? "✅" : "❌"}
          </p>
          <p className="text-sm text-gray-500">
            Check your browser console for Firebase config details
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Authentication</h3>
            <p className={`mb-3 ${getStatusColor(authStatus)}`}>
              Status:{" "}
              {authStatus === "checking"
                ? "Checking..."
                : authStatus === "success"
                ? "Ready"
                : "Error"}
            </p>
            <button
              onClick={testAuth}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Test Auth
            </button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Firestore</h3>
            <p className={`mb-3 ${getStatusColor(dbStatus)}`}>
              Status:{" "}
              {dbStatus === "checking"
                ? "Checking..."
                : dbStatus === "success"
                ? "Ready"
                : "Error"}
            </p>
            <button
              onClick={testFirestore}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Test Firestore
            </button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Storage</h3>
            <p className={`mb-3 ${getStatusColor(storageStatus)}`}>
              Status:{" "}
              {storageStatus === "checking"
                ? "Checking..."
                : storageStatus === "success"
                ? "Ready"
                : "Error"}
            </p>
            <button
              onClick={testStorage}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Test Storage
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <p className="font-medium text-red-800 dark:text-red-200">Error:</p>
            <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">
          Common Issues & Solutions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">400 Error with "Unknown SID"</h3>
            <p className="text-gray-600 dark:text-gray-300">
              This often occurs when there's an issue with Firebase project
              permissions or configuration.
            </p>
            <ul className="ml-5 mt-2 list-disc text-gray-600 dark:text-gray-300">
              <li>
                Verify your Firebase project exists and is properly set up
              </li>
              <li>
                Check that all environment variables in .env.local are correct
              </li>
              <li>
                Ensure Firestore and Authentication are enabled in the Firebase
                console
              </li>
              <li>
                Verify your Firebase security rules allow the operations you're
                trying to perform
              </li>
              <li>
                Try creating a new Firebase project and updating the credentials
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Firebase Initialization Failures</h3>
            <ul className="ml-5 mt-2 list-disc text-gray-600 dark:text-gray-300">
              <li>Make sure you're not initializing Firebase multiple times</li>
              <li>
                Check for any errors in the browser console during
                initialization
              </li>
              <li>
                Verify that your Firebase project has the necessary services
                enabled
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Made with Bob

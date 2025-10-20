/**
 * Firebase Error Handler
 * 
 * This utility helps diagnose and handle common Firebase errors.
 */

// Common Firebase error codes and their user-friendly messages
const errorMessages: Record<string, string> = {
  // Auth errors
  'auth/user-not-found': 'No user found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/invalid-email': 'Invalid email address format.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled for this project.',
  'auth/requires-recent-login': 'This operation requires re-authentication. Please log in again.',
  
  // Firestore errors
  'permission-denied': 'You do not have permission to access this resource.',
  'unavailable': 'The service is currently unavailable. Please try again later.',
  'not-found': 'The requested document was not found.',
  'already-exists': 'The document already exists.',
  
  // Storage errors
  'storage/unauthorized': 'You do not have permission to access this storage bucket.',
  'storage/canceled': 'The operation was canceled.',
  'storage/unknown': 'An unknown error occurred in storage.',
  
  // Generic errors
  'network-request-failed': 'Network connection failed. Please check your internet connection.',
  'deadline-exceeded': 'The operation timed out. Please try again.',
  'resource-exhausted': 'Too many requests. Please try again later.',
};

/**
 * Get a user-friendly error message from a Firebase error
 */
export function getFirebaseErrorMessage(error: any): string {
  // Extract the error code
  const errorCode = error.code || (error.message && error.message.includes(':') 
    ? error.message.split(':')[0].trim() 
    : '');
  
  // Log the full error for debugging
  console.error('Firebase Error:', {
    code: errorCode,
    message: error.message,
    fullError: error
  });
  
  // Return a user-friendly message or the original message
  return errorMessages[errorCode] || error.message || 'An unknown error occurred';
}

/**
 * Check if Firebase is properly initialized
 */
export function checkFirebaseInitialization(): { isInitialized: boolean; issues: string[] } {
  const issues: string[] = [];
  let isInitialized = true;
  
  try {
    // Check if Firebase app is initialized
    const { app } = require('./firebase');
    if (!app || !app.name) {
      issues.push('Firebase app is not properly initialized');
      isInitialized = false;
    }
    
    // Check if Firebase auth is initialized
    const { auth } = require('./firebase');
    if (!auth || !auth.app) {
      issues.push('Firebase auth is not properly initialized');
      isInitialized = false;
    }
    
    // Check if Firestore is initialized
    const { db } = require('./firebase');
    if (!db || !db.app) {
      issues.push('Firestore is not properly initialized');
      isInitialized = false;
    }
    
    // Check if Storage is initialized
    const { storage } = require('./firebase');
    if (!storage || !storage.app) {
      issues.push('Firebase storage is not properly initialized');
      isInitialized = false;
    }
  } catch (error) {
    issues.push(`Error checking Firebase initialization: ${error}`);
    isInitialized = false;
  }
  
  return { isInitialized, issues };
}

/**
 * Log Firebase configuration for debugging (don't use in production)
 */
export function logFirebaseConfig(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Firebase config logging should only be used in development');
    return;
  }
  
  console.log('Firebase Config:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '✓ Set' : '✗ Missing',
  });
}

// Made with Bob

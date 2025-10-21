'use client';

import { Timestamp } from "firebase/firestore";

// Defines the structure for a payment item in the history of a lent transaction.
export interface PaymentHistoryItem {
    transactionId: string; // The ID of the payment transaction
    amount: number; // The amount of the payment
    date: Timestamp; // The date of the payment
    details?: string; // Optional details about the payment
  }
  
  // Defines the structure of a transaction record
  export interface Transaction {
    id: string; // Unique identifier for the transaction
    contactId: string; // ID of the contact associated with the transaction
    amount: number; // The amount of the transaction
    purpose: string; // A brief description of the transaction
    type: 'lent' | 'received'; // The type of transaction (e.g., money received or money spent)
    date: Timestamp; // The date of the transaction
    createdAt: Timestamp; // The timestamp when the transaction was created
    userId: string; // The ID of the user who created the transaction
    status?: 'pending' | 'paid' | 'partial'; // The status of the transaction
    paidAmount?: number; // The amount that has been paid
    remainingAmount?: number; // The amount remaining to be paid
    parentTransactionId?: string; // Links a received payment to an original lent transaction
    paymentHistory?: PaymentHistoryItem[]; // A list of payments made against a lent transaction
    contactName?: string; // The name of the contact, denormalized for easier display
  }
  
  // Defines the structure for the data required to create or update a transaction.
  export interface TransactionFormData {
    contactId: string;
    amount: number;
    date: Timestamp;
    purpose: string;
    type: 'lent' | 'received';
  }
  
import { Timestamp } from 'firebase/firestore';

export type RepaymentStatus = 'pending' | 'partial' | 'completed';

export interface Transaction {
  id: string;
  contactId: string;
  amount: number;
  date: Timestamp;
  purpose: string;
  repaymentStatus: RepaymentStatus;
  repaymentDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For use in forms and when creating new transactions
export type TransactionFormData = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

// Extended transaction with contact information for display
export interface TransactionWithContact extends Transaction {
  contact: {
    id: string;
    name: string;
    phone: string;
  };
}

// Made with Bob

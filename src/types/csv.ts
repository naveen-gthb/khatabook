export interface ContactCSV {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface TransactionCSV {
  contactName: string;
  contactPhone: string;
  amount: string;
  date: string;
  purpose: string;
  repaymentStatus: string;
  notes?: string;
}

export interface OrderCSV {
  orderId: string;
  vendor: string;
  amount: string;
  date: string;
  deliveryStatus: string;
  returnStatus: string;
  refundStatus: string;
  notes?: string;
}

export type CSVDataType = 'contacts' | 'transactions' | 'orders';

export interface CSVImportResult {
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

// Made with Bob

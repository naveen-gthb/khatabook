import { Timestamp } from 'firebase/firestore';

export type DeliveryStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type ReturnStatus = 'none' | 'requested' | 'in_progress' | 'completed';
export type RefundStatus = 'none' | 'requested' | 'in_progress' | 'completed';

export interface Order {
  id: string;
  orderId: string;
  vendor: string;
  amount: number;
  date: Timestamp;
  deliveryStatus: DeliveryStatus;
  returnStatus: ReturnStatus;
  refundStatus: RefundStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For use in forms and when creating new orders
export type OrderFormData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

// Made with Bob

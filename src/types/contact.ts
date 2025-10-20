import { Timestamp } from 'firebase/firestore';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For use in forms and when creating new contacts
export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

// Made with Bob

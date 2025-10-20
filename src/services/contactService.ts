import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Contact, ContactFormData } from '@/types/contact';
import { User } from 'firebase/auth';

const COLLECTION_NAME = 'contacts';

// Get all contacts for a user
export async function getUserContacts(userId: string): Promise<Contact[]> {
  try {
    const contactsRef = collection(db, COLLECTION_NAME);
    const q = query(
      contactsRef,
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Contact));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

// Get a single contact by ID
export async function getContactById(contactId: string): Promise<Contact | null> {
  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId);
    const contactSnap = await getDoc(contactRef);
    
    if (contactSnap.exists()) {
      return {
        id: contactSnap.id,
        ...contactSnap.data()
      } as Contact;
    }
    return null;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

// Add a new contact
export async function addContact(user: User, contactData: ContactFormData): Promise<Contact> {
  try {
    const now = Timestamp.now();
    const newContact = {
      ...contactData,
      userId: user.uid,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newContact);
    return {
      id: docRef.id,
      ...newContact
    } as Contact;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

// Update an existing contact
export async function updateContact(contactId: string, contactData: Partial<ContactFormData>): Promise<void> {
  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId);
    await updateDoc(contactRef, {
      ...contactData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

// Delete a contact
export async function deleteContact(contactId: string): Promise<void> {
  try {
    const contactRef = doc(db, COLLECTION_NAME, contactId);
    await deleteDoc(contactRef);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

// Search contacts by name or phone
export async function searchContacts(userId: string, searchTerm: string): Promise<Contact[]> {
  try {
    // Get all contacts for the user first
    const contacts = await getUserContacts(userId);
    
    // Filter locally - Firestore doesn't support complex text search
    const lowerSearchTerm = searchTerm.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerSearchTerm) || 
      contact.phone.includes(searchTerm) ||
      (contact.email && contact.email.toLowerCase().includes(lowerSearchTerm))
    );
  } catch (error) {
    console.error('Error searching contacts:', error);
    throw error;
  }
}

// Made with Bob

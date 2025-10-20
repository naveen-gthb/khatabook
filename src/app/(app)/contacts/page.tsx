"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Contact } from "@/types/contact";
import {
  getUserContacts,
  addContact,
  updateContact,
  deleteContact,
  searchContacts,
} from "@/services/contactService";
import ContactCard from "@/components/contacts/ContactCard";
import ContactModal from "@/components/contacts/ContactModal";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { debounce } from "@/lib/utils";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  const { user } = useAuth();

  // Fetch contacts on component mount
  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setIsLoading(false);
      setError("You must be logged in to view contacts");
    }
  }, [user]);

  // Apply sorting and filtering
  useEffect(() => {
    if (contacts.length > 0) {
      let sorted = [...contacts];

      // Apply sorting
      switch (sortBy) {
        case "name-asc":
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "recent":
          sorted.sort(
            (a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis()
          );
          break;
        // We'll add amount sorting when we implement transactions
      }

      // Apply search filter if there's a search term
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        sorted = sorted.filter(
          (contact) =>
            contact.name.toLowerCase().includes(lowerSearchTerm) ||
            contact.phone.includes(searchTerm) ||
            (contact.email &&
              contact.email.toLowerCase().includes(lowerSearchTerm))
        );
      }

      setFilteredContacts(sorted);
    } else {
      setFilteredContacts([]);
    }
  }, [contacts, searchTerm, sortBy]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedContacts = await getUserContacts(user.uid);
      setContacts(fetchedContacts);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const handleAddContact = () => {
    setCurrentContact(undefined);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user) return;

    try {
      await deleteContact(contactId);
      setContacts((prevContacts) =>
        prevContacts.filter((c) => c.id !== contactId)
      );
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      setError("Failed to delete contact. Please try again later.");
    }
  };

  const handleSaveContact = async (data: any) => {
    if (!user) return;

    try {
      if (currentContact) {
        // Update existing contact
        await updateContact(currentContact.id, data);
        setContacts((prevContacts) =>
          prevContacts.map((c) =>
            c.id === currentContact.id
              ? { ...c, ...data, updatedAt: new Date() }
              : c
          )
        );
      } else {
        // Add new contact
        const newContact = await addContact(user, data);
        setContacts((prevContacts) => [...prevContacts, newContact]);
      }
    } catch (err: any) {
      console.error("Error saving contact:", err);
      setError("Failed to save contact. Please try again later.");
    }
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Contacts</h1>
        <button
          onClick={handleAddContact}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          aria-label="Add new contact"
        >
          Add Contact
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={dismissError} />
        </div>
      )}

      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search contacts..."
            aria-label="Search contacts"
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="sort-by"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort contacts by"
            className="rounded-md border border-gray-300 bg-white py-1 pl-3 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="recent">Recent</option>
            <option value="amount-high">Amount (High-Low)</option>
            <option value="amount-low">Amount (Low-High)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-800">
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
            {searchTerm ? "No contacts match your search" : "No contacts found"}
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "Try a different search term"
              : "Add your first contact to start tracking money lent to friends"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddContact}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Contact
            </button>
          )}
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={currentContact}
      />
    </div>
  );
}

// Made with Bob

import { useState } from "react";
import { Contact } from "@/types/contact";
import { formatPhoneNumber } from "@/lib/utils";
import {
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
}: ContactCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete(contact.id);
    } catch (error) {
      console.error("Error deleting contact:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {contact.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(contact)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label={`Edit ${contact.name}`}
              title={`Edit ${contact.name}`}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700 dark:hover:text-red-400"
              aria-label={`Delete ${contact.name}`}
              title={`Delete ${contact.name}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <PhoneIcon className="mr-2 h-4 w-4" />
            <span>{formatPhoneNumber(contact.phone)}</span>
          </div>

          {contact.email && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <EnvelopeIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}

          {contact.notes && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              <p className="line-clamp-2">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob

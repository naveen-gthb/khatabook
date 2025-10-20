import { useState } from "react";
import { Contact, ContactFormData } from "@/types/contact";
import Modal from "@/components/ui/Modal";
import ContactForm from "./ContactForm";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
  contact?: Contact;
}

export default function ContactModal({
  isOpen,
  onClose,
  onSave,
  contact,
}: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Error saving contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? "Edit Contact" : "Add New Contact"}
      size="md"
    >
      <ContactForm
        contact={contact}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}

// Made with Bob

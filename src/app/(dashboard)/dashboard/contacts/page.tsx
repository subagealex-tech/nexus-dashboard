"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { countries } from "@/components/ui/country-codes";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Active" | "Lead" | "Inactive";
}

const initialContacts: Contact[] = [
  { id: "1", name: "John Smith", email: "john.smith@techcorp.com", phone: "+1 555-123-4567", company: "TechCorp", status: "Active" },
  { id: "2", name: "Sarah Johnson", email: "sarah.j@startup.io", phone: "+44 20-7946-0958", company: "Startup.io", status: "Active" },
  { id: "3", name: "Michael Brown", email: "m.brown@enterprise.com", phone: "+91 98765-43210", company: "Enterprise Inc", status: "Lead" },
  { id: "4", name: "Emily Davis", email: "emily.d@creative.co", phone: "+81 90-1234-5678", company: "Creative Co", status: "Inactive" },
  { id: "5", name: "David Wilson", email: "d.wilson@global.net", phone: "+49 30-1234-5678", company: "Global Net", status: "Active" },
  { id: "6", name: "Lisa Anderson", email: "lisa.a@innovate.tech", phone: "+33 1-23-45-67-89", company: "Innovate Tech", status: "Lead" },
  { id: "7", name: "James Taylor", email: "j.taylor@solutions.com", phone: "+34 91-123-4567", company: "Solutions LLC", status: "Active" },
  { id: "8", name: "Amanda White", email: "a.white@digital.co", phone: "+61 4-1234-5678", company: "Digital Co", status: "Active" },
  { id: "9", name: "Robert Martinez", email: "r.martinez@cloudtech.io", phone: "+52 55-1234-5678", company: "CloudTech", status: "Lead" },
  { id: "10", name: "Jennifer Lee", email: "j.lee@webdev.com", phone: "+82 10-1234-5678", company: "WebDev", status: "Inactive" },
  { id: "11", name: "Christopher Garcia", email: "c.garcia@mediapro.com", phone: "+55 11-9876-5432", company: "MediaPro", status: "Active" },
  { id: "12", name: "Michelle Thompson", email: "m.thompson@finance.group", phone: "+44 131-496-0123", company: "Finance Group", status: "Active" },
];

const statusColors = {
  Active: "bg-green-500/20 text-green-400 border-green-500/30",
  Lead: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Contact>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Lead" as Contact["status"],
    countryCode: "+1",
  });

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("contacts");
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      setContacts(initialContacts);
      localStorage.setItem("contacts", JSON.stringify(initialContacts));
    }
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem("contacts", JSON.stringify(contacts));
    }
  }, [contacts]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, phone: `${selectedCountry.code} ` }));
  }, [selectedCountry]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      const aVal = a[sortField].toLowerCase();
      const bVal = b[sortField].toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredContacts, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);
  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.company.trim()) errors.company = "Company is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? { ...formData, id: editingContact.id } : c))
      );
    } else {
      const newContact: Contact = {
        ...formData,
        id: Date.now().toString(),
      };
      setContacts((prev) => [...prev, newContact]);
    }
    closeModal();
  };

  const handleEdit = (contact: Contact) => {
    const existingCode = countries.find((c) => contact.phone.startsWith(c.code))?.code || "+1";
    const country = countries.find((c) => c.code === existingCode) || countries[0];
    setEditingContact(contact);
    setSelectedCountry(country);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      status: contact.status,
      countryCode: existingCode,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({ name: "", email: "", phone: "", company: "", status: "Lead", countryCode: "+1" });
    setFormErrors({});
    setIsCountryDropdownOpen(false);
  };

  const handleSort = (field: keyof Contact) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary font-[family-name:var(--font-outfit)]">
          Contact Management
        </h1>
        <p className="text-text-muted mt-2">Manage your contacts and leads</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-2 focus:ring-accent-cyan/20 transition-all"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent-cyan text-bg-primary font-semibold rounded-xl hover:bg-accent-cyan/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      <div className="glass rounded-2xl border border-glass-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border bg-glass-bg">
                {[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "phone", label: "Phone Number" },
                  { key: "company", label: "Company" },
                  { key: "status", label: "Status" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as keyof Contact)}
                    className="px-6 py-4 text-left text-sm font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortField === col.key && (
                        sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No contacts found
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-glass-border hover:bg-glass-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {contact.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-text-primary">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{contact.email}</td>
                    <td className="px-6 py-4 text-text-secondary">{contact.phone}</td>
                    <td className="px-6 py-4 text-text-secondary">{contact.company}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", statusColors[contact.status])}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-2 rounded-lg text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sortedContacts.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-sm text-text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedContacts.length)} of {sortedContacts.length} contacts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-glass-border text-text-muted hover:bg-glass-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 rounded-lg font-medium transition-all",
                  currentPage === page
                    ? "bg-accent-cyan text-bg-primary"
                    : "border border-glass-border text-text-muted hover:bg-glass-bg"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-glass-border text-text-muted hover:bg-glass-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass rounded-2xl border border-glass-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary">
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass-bg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                    placeholder="John Doe"
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                    placeholder="john@example.com"
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary hover:bg-glass-bg/80 transition-all min-w-[100px]"
                      >
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.code}</span>
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      </button>
                      {isCountryDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-y-auto glass rounded-xl border border-glass-border shadow-xl">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search country..."
                              onChange={(e) => {
                                const search = e.target.value.toLowerCase();
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-glass-bg border border-glass-border text-text-primary text-sm mb-2"
                            />
                          </div>
                          {countries.map((country) => (
                            <button
                              key={`${country.code}-${country.name}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setIsCountryDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-glass-bg transition-colors"
                            >
                              <span>{country.flag}</span>
                              <span className="text-text-primary text-sm">{country.name}</span>
                              <span className="text-text-muted text-sm ml-auto">{country.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: `${selectedCountry.code} ${e.target.value}` })}
                      className="flex-1 px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                      placeholder="123-4567"
                    />
                  </div>
                  {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                    placeholder="TechCorp"
                  />
                  {formErrors.company && <p className="text-red-400 text-sm mt-1">{formErrors.company}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Contact["status"] })}
                    className="w-full px-4 py-3 rounded-xl bg-glass-bg border border-glass-border text-text-primary focus:outline-none focus:border-accent-cyan/50 transition-all"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-xl border border-glass-border text-text-muted hover:bg-glass-bg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-accent-cyan text-bg-primary font-semibold hover:bg-accent-cyan/90 transition-all"
                  >
                    {editingContact ? "Save Changes" : "Add Contact"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
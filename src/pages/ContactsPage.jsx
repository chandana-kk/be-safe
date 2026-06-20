import { useState } from 'react';
import { UserPlus, Trash2, Phone, User } from 'lucide-react';
import { getContacts, addContact, deleteContact } from '../lib/storage';
import EmptyState from '../components/common/EmptyState';
import { Users } from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState(getContacts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const contact = addContact({
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship.trim() || 'Emergency contact',
    });
    setContacts([...getContacts()]);
    setForm({ name: '', phone: '', relationship: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    deleteContact(id);
    setContacts(getContacts());
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emergency Contacts</h1>
          <p className="text-sm text-charcoal/60 dark:text-offwhite/60">People who get SOS alerts</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm py-2.5 px-4"
          aria-expanded={showForm}
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 mb-6 space-y-4" noValidate>
          <div>
            <label htmlFor="contact-name" className="text-sm font-medium block mb-1.5">Name *</label>
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-charcoal/5 dark:bg-white/5 border border-transparent focus:border-accent focus:outline-none"
              placeholder="e.g. Mom"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-coral text-xs mt-1" role="alert">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contact-phone" className="text-sm font-medium block mb-1.5">Phone *</label>
            <input
              id="contact-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-charcoal/5 dark:bg-white/5 border border-transparent focus:border-accent focus:outline-none"
              placeholder="+91 98765 43210"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-coral text-xs mt-1" role="alert">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="contact-rel" className="text-sm font-medium block mb-1.5">Relationship</label>
            <input
              id="contact-rel"
              type="text"
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-charcoal/5 dark:bg-white/5 border border-transparent focus:border-accent focus:outline-none"
              placeholder="Sister, friend..."
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Save contact</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add at least one trusted person who will receive your SOS alerts."
          action={
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Add first contact
            </button>
          }
        />
      ) : (
        <ul className="space-y-3" role="list">
          {contacts.map((c) => (
            <li key={c.id} className="card p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-sm text-charcoal/50 dark:text-offwhite/50 flex items-center gap-1">
                  <Phone className="w-3 h-3" aria-hidden="true" />
                  {c.phone}
                </p>
                {c.relationship && (
                  <p className="text-xs text-charcoal/40 dark:text-offwhite/40">{c.relationship}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-xl text-coral/60 hover:text-coral hover:bg-coral/10 transition-colors focus-visible:ring-2 focus-visible:ring-coral"
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

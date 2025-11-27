'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-[#FAF6F1] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-[#2C1810] mb-8 text-center">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-[#2C1810] mb-6">Get in Touch</h2>
            <p className="text-gray-700 mb-8">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="text-[#C1502E] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-[#2C1810]">Email</h3>
                  <p className="text-gray-700">info@africabags.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-[#C1502E] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-[#2C1810]">Phone</h3>
                  <p className="text-gray-700">+254 700 000 000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="text-[#C1502E] mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-[#2C1810]">Address</h3>
                  <p className="text-gray-700">
                    Nairobi, Kenya<br />
                    East Africa
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#D4A574] focus:border-[#C1502E] focus:outline-none transition-colors"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

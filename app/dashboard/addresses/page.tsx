'use client';

import { useState } from 'react';
import { useAddresses } from '@/lib/api'; // Modern React Query way
import { useToast } from '@/contexts/ToastContext';

import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Star,
  StarOff,
  Phone,
  Building,
  Loader2,
} from 'lucide-react';
import type { Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AddressesPage() {
  const { showToast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: 'Kenya',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // React Query — clean & cached
  const {
    data: addressesData,
    isLoading,
    error,
    refetch,
  } = useAddresses.all();

  const { mutate: createAddress, isPending: creating } = useAddresses.create();
  const { mutate: updateAddress, isPending: updating } = useAddresses.update();
  const { mutate: deleteAddress, isPending: deleting } = useAddresses.delete();
  const { mutate: setDefaultAddress } = useAddresses.setDefault();

  const addresses = addressesData?.addresses || [];

  const resetForm = () => {
    setForm({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      country: 'Kenya',
      postalCode: '',
    });
    setErrors({});
    setEditingAddress(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+254\d{9}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Use format: +254712345678';

    if (!form.street.trim()) newErrors.street = 'Street address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'County/State is required';
    if (!form.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      phone: form.phone.replace(/\s/g, ''),
    };

    if (editingAddress) {
      updateAddress(
        { id: editingAddress.id, data: payload },
        {
          onSuccess: () => {
            showToast('Address updated successfully', 'success');
            setOpenDialog(false);
            resetForm();
          },
          onError: () => showToast('Failed to update address', 'error'),
        }
      );
    } else {
      createAddress(payload, {
        onSuccess: () => {
          showToast('Address added successfully', 'success');
          setOpenDialog(false);
          resetForm();
        },
        onError: () => showToast('Failed to add address', 'error'),
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    });
    setOpenDialog(true);
  };

  const handleDelete = (address: Address) => {
    if (!confirm('Delete this address permanently?')) return;

    deleteAddress(address.id, {
      onSuccess: () => showToast('Address deleted', 'success'),
      onError: () => showToast('Failed to delete', 'error'),
    });
  };

  const handleSetDefault = (address: Address) => {
    if (address.isDefault) return;

    setDefaultAddress(address.id, {
      onSuccess: () => showToast('Default address updated', 'success'),
      onError: () => showToast('Failed to set default', 'error'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load addresses</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#2C1810]">My Addresses</h1>
          <p className="text-[#8B6F47] mt-1">Manage your shipping addresses</p>
        </div>
        <Button onClick={() => { resetForm(); setOpenDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Empty State */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <MapPin className="mx-auto h-12 w-12 text-[#8B6F47] mb-4" />
            <h3 className="text-xl font-semibold text-[#2C1810] mb-2">No addresses yet</h3>
            <p className="text-[#8B6F47] mb-6">Add your first address for faster checkout</p>
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address: any) => (
            <Card key={address.id} className="relative hover:shadow-lg transition-shadow">
              {address.isDefault && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Badge className="bg-[#C1502E] text-white">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#C1502E]" />
                  <CardTitle className="text-lg">{address.fullName}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-[#8B6F47]">
                  <Phone className="h-4 w-4" />
                  <span>{address.phone}</span>
                </div>

                <div className="text-sm text-[#8B6F47] space-y-1">
                  <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 mt-0.5" />
                    <div>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state}</p>
                      <p>{address.country} • {address.postalCode}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(address)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto"
                      onClick={() => handleSetDefault(address)}
                    >
                      <StarOff className="h-4 w-4 mr-1" />
                      Make Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={(o) => !o && (setOpenDialog(false), resetForm())}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+254712345678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <Label>Street Address</Label>
              <Input
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="123 Ngong Road"
                className={errors.street ? 'border-red-500' : ''}
              />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Nairobi"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label>County/State</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Nairobi County"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Kenya"
                  disabled
                />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="00100"
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpenDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={creating || updating}
            >
              {(creating || updating) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingAddress ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
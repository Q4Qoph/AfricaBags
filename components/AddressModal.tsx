import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (address: AddressFormData) => void;
}

export interface AddressFormData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export function AddressModal({ open, onOpenChange, onSubmit }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isDefault: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.addressLine1 || !formData.city || !formData.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit(formData);
    setFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      isDefault: false,
    });
    onOpenChange(false);
  };

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Add New Address
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your delivery address details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="addressLine1" className="text-sm font-medium">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addressLine1"
                placeholder="Street address, P.O. box"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="addressLine2" className="text-sm font-medium">
                Address Line 2
              </Label>
              <Input
                id="addressLine2"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-sm font-medium">
                  State/Province
                </Label>
                <Input
                  id="state"
                  placeholder="State or Province"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country" className="text-sm font-medium">
                  Country <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="postalCode" className="text-sm font-medium">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  placeholder="Postal/ZIP code"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange("isDefault", checked as boolean)}
              />
              <Label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Set as default address
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-warm hover:opacity-90">
              Save Address
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

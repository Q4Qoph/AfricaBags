"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth as useUser } from "@/lib/api";
import { User, Mail, Lock, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // React Query hooks
  const { mutate: updateProfile, isPending: updatingProfile } =
    useUser.updateProfile();
  const { mutate: changePassword, isPending: changingPassword } =
    useUser.changePassword();

  const toggleVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!profileForm.name.trim()) newErrors.name = "Name is required";
    if (!profileForm.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profileForm.email))
      newErrors.email = "Invalid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) newErrors.currentPassword = "Required";
    if (!passwordForm.newPassword) newErrors.newPassword = "Required";
    else if (passwordForm.newPassword.length < 6)
      newErrors.newPassword = "Min 6 characters";
    if (!passwordForm.confirmPassword) newErrors.confirmPassword = "Required";
    else if (passwordForm.newPassword !== passwordForm.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (passwordForm.currentPassword === passwordForm.newPassword)
      newErrors.newPassword = "New password must be different";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    updateProfile(profileForm, {
      onSuccess: () => showToast("Profile updated successfully", "success"),
      onError: () => showToast("Failed to update profile", "error"),
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    changePassword(
      {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
      {
        onSuccess: () => {
          showToast("Password changed successfully", "success");
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setErrors({});
        },
        onError: () => showToast("Failed to change password", "error"),
      }
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#2C1810] mb-2">
          Profile Settings
        </h1>
        <p className="text-[#8B6F47]">Manage your account and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#C1502E]" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Your full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={updatingProfile}
                className="w-full"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-[#C1502E]" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="relative">
                <Label>Current Password</Label>
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className={errors.currentPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("current")}
                  className="absolute right-3 top-9 text-[#8B6F47] hover:text-[#2C1810]"
                >
                  {showPasswords.current ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="relative">
                <Label>New Password</Label>
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Min 6 characters"
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("new")}
                  className="absolute right-3 top-9 text-[#8B6F47] hover:text-[#2C1810]"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div className="relative">
                <Label>Confirm New Password</Label>
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("confirm")}
                  className="absolute right-3 top-9 text-[#8B6F47] hover:text-[#2C1810]"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={changingPassword}
                variant="secondary"
                className="w-full"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#C1502E]" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Label className="text-[#2C1810]">Account Type</Label>
              <p className="text-[#8B6F47] font-medium capitalize">
                {user.role}
              </p>
            </div>
            <div>
              <Label className="text-[#2C1810]">Member Since</Label>
              <p className="text-[#8B6F47]">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <Label className="text-[#2C1810]">Status</Label>
              <p className="text-green-600 font-medium">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

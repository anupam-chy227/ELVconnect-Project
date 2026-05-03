"use client";

import { useMemo, useRef, useState } from "react";
import { Award, Briefcase, Mail, Palette, Phone, Save, Upload, User, X } from "lucide-react";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@/hooks/useMutation";
import { useToast } from "@/components/Toast";

const avatarColors = [
  { value: "#6d28d9", className: "bg-violet-700" },
  { value: "#0f766e", className: "bg-teal-700" },
  { value: "#dc2626", className: "bg-red-600" },
  { value: "#2563eb", className: "bg-blue-600" },
  { value: "#be123c", className: "bg-rose-700" },
  { value: "#7c2d12", className: "bg-orange-900" },
  { value: "#4338ca", className: "bg-indigo-700" },
  { value: "#15803d", className: "bg-green-700" },
];

function makeAvatar(name: string, color: string) {
  const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" rx="56" fill="${color}"/>
      <circle cx="196" cy="62" r="34" fill="rgba(255,255,255,0.16)"/>
      <circle cx="56" cy="206" r="48" fill="rgba(255,255,255,0.12)"/>
      <text x="128" y="152" text-anchor="middle" font-family="Arial, sans-serif" font-size="116" font-weight="700" fill="white">${initial}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const initialForm = useMemo(
    () => ({
      profile: {
        fullName: user?.profile.fullName || "",
        companyName: user?.profile.companyName || "",
        phone: user?.profile.phone || "",
        bio: user?.profile.bio || "",
        avatar: user?.profile.avatar || "",
      },
    }),
    [user?.profile.avatar, user?.profile.bio, user?.profile.companyName, user?.profile.fullName, user?.profile.phone]
  );

  const [draftForm, setDraftForm] = useState(initialForm);
  const formData = isEditing ? draftForm : initialForm;

  const beginEditing = () => {
    setDraftForm(formData);
    setIsEditing(true);
  };

  const updateProfileMutation = useMutation({
    method: "patch",
    url: "/users/me",
    onSuccess: async () => {
      await refreshUser();
      setIsEditing(false);
      addToast("Profile updated successfully", "success");
    },
    successMessage: "Profile updated successfully",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setIsEditing(true);
    setDraftForm((prev) => ({
      ...prev,
      profile: { ...prev.profile, [name]: value },
    }));
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please choose an image file", "error");
      return;
    }

    if (file.size > 900_000) {
      addToast("Please choose an image below 900 KB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraftForm((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatar: String(reader.result || "") },
      }));
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutate(formData);
  };

  const displayAvatar = formData.profile.avatar;

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-gray-600">
            Manage your account, avatar, contact details, and public profile.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-36 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-blue-600" />

          <div className="px-6 pb-8">
            <div className="-mt-16 mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-6">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-purple-100 shadow-md">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-purple-500" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formData.profile.fullName || user?.email}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4" />
                  Upload image
                </button>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={beginEditing}
                    className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Create your avatar</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {avatarColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setDraftForm((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          avatar: makeAvatar(prev.profile.fullName || user?.email || "User", color.value),
                        },
                      }));
                      setIsEditing(true);
                    }}
                    className={`h-12 w-12 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-105 ${color.className}`}
                    aria-label={`Create avatar with ${color.value}`}
                  />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ProfileField
                label="Full Name"
                icon={<User className="h-5 w-5 text-gray-400" />}
                editing={isEditing}
                name="fullName"
                value={formData.profile.fullName}
                onChange={handleChange}
                onActivate={beginEditing}
              />
              <ProfileField
                label="Company Name"
                icon={<Briefcase className="h-5 w-5 text-gray-400" />}
                editing={isEditing}
                name="companyName"
                value={formData.profile.companyName}
                placeholder="Company or team name"
                onChange={handleChange}
                onActivate={beginEditing}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-500">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <ProfileField
                label="Phone Number"
                icon={<Phone className="h-5 w-5 text-gray-400" />}
                editing={isEditing}
                name="phone"
                value={formData.profile.phone}
                placeholder="+91 98765 43210"
                onChange={handleChange}
                onActivate={beginEditing}
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.profile.bio}
                  onChange={handleChange}
                  placeholder="Tell clients about your company, projects, service areas, and ELV expertise."
                  className="min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              ) : (
                <button
                  type="button"
                  onClick={beginEditing}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-left text-gray-900 hover:border-purple-300"
                >
                  {formData.profile.bio || "No bio set"}
                </button>
              )}
            </div>

            {user?.role === "service_provider" && user?.serviceProvider && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-blue-900">
                  <Award className="h-5 w-5" />
                  Service Provider Details
                </h3>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <p><span className="text-gray-600">Specializations:</span> {user.serviceProvider.specializations?.map((s) => s.replace(/_/g, " ")).join(", ") || "Not set"}</p>
                  <p><span className="text-gray-600">Experience:</span> {user.serviceProvider.yearsOfExperience || 0} years</p>
                  <p><span className="text-gray-600">Rating:</span> {user.serviceProvider.averageRating?.toFixed(1) || "N/A"}</p>
                  <p><span className="text-gray-600">Jobs Completed:</span> {user.serviceProvider.totalJobsCompleted || 0}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftForm(initialForm);
                      setIsEditing(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-300"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={beginEditing}
                  className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

function ProfileField({
  label,
  icon,
  editing,
  name,
  value,
  placeholder,
  onChange,
  onActivate,
}: {
  label: string;
  icon: React.ReactNode;
  editing: boolean;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onActivate: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus-within:border-purple-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100">
        {icon}
        {editing ? (
          <input
            type="text"
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
          />
        ) : (
          <button
            type="button"
            onClick={onActivate}
            className="flex-1 text-left text-gray-900"
          >
            {value || "Not set"}
          </button>
        )}
      </div>
    </div>
  );
}

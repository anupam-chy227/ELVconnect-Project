"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@/hooks/useMutation";
import { useToast } from "@/components/Toast";
import { ZodError } from "zod";
import { createJobSchema, type CreateJobFormData } from "@/schemas/job.schema";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ELVCategory } from "@/types";
import { getLocationByName } from "@/lib/experience-preferences";
import {
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<CreateJobFormData>({
    title: "",
    description: "",
    category: [],
    visibility: "public",
    budget: {
      type: "fixed",
      min: 0,
      max: 0,
      currency: "USD",
    },
    location: {
      address: "",
      city: "",
      country: "",
    },
    timeline: {
      startDate: "",
      deadline: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const createJobMutation = useMutation({
    method: "post",
    url: "/jobs",
    onSuccess: () => {
      addToast("Job posted successfully!", "success");
      router.push("/dashboard/jobs");
    },
    successMessage: "Job posted successfully",
  });

  const categories: ELVCategory[] = [
    "cctv",
    "access_control",
    "fire_alarm",
    "structured_cabling",
    "pa_system",
    "bms",
    "intercom",
    "gate_automation",
    "av_integration",
    "other",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("budget.")) {
      const field = name.replace("budget.", "");
      setFormData((prev) => ({
        ...prev,
        budget: {
          ...prev.budget,
          [field]: field === "type" ? value : parseFloat(value) || 0,
        },
      }));
    } else if (name.startsWith("location.")) {
      const field = name.replace("location.", "");
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else if (name.startsWith("timeline.")) {
      const field = name.replace("timeline.", "");
      setFormData((prev) => ({
        ...prev,
        timeline: { ...prev.timeline, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategoryToggle = (category: ELVCategory) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form
      const validatedData = createJobSchema.parse(formData);

      const selectedLocation = getLocationByName(validatedData.location.city);
      const payload = {
        ...validatedData,
        budget: {
          ...validatedData.budget,
          currency: validatedData.budget.currency || "INR",
        },
        location: {
          ...validatedData.location,
          country: validatedData.location.country || "India",
          coordinates: [
            selectedLocation.lng || 78.6569,
            selectedLocation.lat || 22.9734,
          ],
        },
        timeline: {
          startDate: new Date(validatedData.timeline.startDate).toISOString(),
          deadline: new Date(validatedData.timeline.deadline).toISOString(),
        },
      };

      await createJobMutation.mutate(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation errors
        const formErrors: Record<string, string | undefined> = {};
        error.errors.forEach((err) => {
            const field = err.path.join(".");
            formErrors[field] = err.message;
          });
        setErrors(formErrors);
      } else {
        addToast("Failed to post job. Please try again.", "error");
      }
    }
  };

  const getFieldError = (fieldPath: string) => errors[fieldPath];

  return (
    <ProtectedRoute requiredRole="customer">
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Post a New Job</h2>
            <p className="text-gray-600 mt-1">
              Share details about your ELV project to find qualified service providers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">
                Basic Information
              </h3>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., CCTV Installation for Office Building"
                  maxLength={100}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                    getFieldError("title")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {getFieldError("title") && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("title")}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project in detail..."
                  rows={6}
                  maxLength={5000}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                    getFieldError("description")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/5000 characters
                </p>
                {getFieldError("description") && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("description")}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories * <span className="text-xs text-gray-500">(Select at least one)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.category.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors capitalize">
                        {cat.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
                {getFieldError("category") && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("category")}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Location</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                      getFieldError("location.address")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("location.address") && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError("location.address")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="Dubai"
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                      getFieldError("location.city")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("location.city") && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError("location.city")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    placeholder="UAE"
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                      getFieldError("location.country")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("location.country") && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError("location.country")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Budget</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Type *
                  </label>
                  <select
                    name="budget.type"
                    value={formData.budget.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="range">Price Range</option>
                    <option value="get_quotes">Get Quotes</option>
                  </select>
                </div>

                {formData.budget.type !== "get_quotes" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.budget.type === "fixed"
                          ? "Amount"
                          : "Minimum Amount"}{" "}
                        *
                      </label>
                      <input
                        type="number"
                        name="budget.min"
                        value={formData.budget.min}
                        onChange={handleInputChange}
                        placeholder="0"
                        step="100"
                        min="0"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring"
                      />
                    </div>

                    {formData.budget.type === "range" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Amount *
                        </label>
                        <input
                          type="number"
                          name="budget.max"
                          value={formData.budget.max}
                          onChange={handleInputChange}
                          placeholder="0"
                          step="100"
                          min="0"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Timeline</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="timeline.startDate"
                    value={formData.timeline.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                      getFieldError("timeline.startDate")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("timeline.startDate") && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError("timeline.startDate")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    name="timeline.deadline"
                    value={formData.timeline.deadline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary-ring transition-colors ${
                      getFieldError("timeline.deadline")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("timeline.deadline") && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {getFieldError("timeline.deadline")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Visibility</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === "public"}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Public</p>
                    <p className="text-sm text-gray-600">
                      Anyone can see and apply for this job
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    value="invite_only"
                    checked={formData.visibility === "invite_only"}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Invite Only</p>
                    <p className="text-sm text-gray-600">
                      Only invited service providers can see this job
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createJobMutation.loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary shadow-sm shadow-primary/20 transition-colors hover:bg-primary-container disabled:bg-gray-400"
              >
                {createJobMutation.loading ? "Posting..." : "Post Job"}
                {!createJobMutation.loading && <ChevronRight className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border-2 border-primary/25 px-6 py-3 font-semibold text-primary transition-colors hover:border-primary/45 hover:bg-primary-subtle"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

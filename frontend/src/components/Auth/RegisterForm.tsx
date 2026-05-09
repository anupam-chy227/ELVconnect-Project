"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  customerRegisterSchema,
  serviceProviderRegisterSchema,
} from "@/schemas/auth.schema";
import { useToast } from "@/components/Toast";
import { ZodError } from "zod";
import {
  Mail,
  Lock,
  User,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { markDashboardNavigationIntent } from "@/components/Dashboard/DashboardLandingGuard";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [userType, setUserType] = useState<"customer" | "service_provider">(
    "customer"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profile: {
      fullName: "",
      companyName: "",
      phone: "",
    },
    serviceProvider: {
      specializations: [] as string[],
      yearsOfExperience: 0,
    },
    industry: "other",
    city: "",
    country: "India",
    licenseNumber: "",
    serviceRadius: 25,
    agreeToTerms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name.startsWith("profile.")) {
      const field = name.replace("profile.", "");
      setFormData((prev) => ({
        ...prev,
        profile: { ...prev.profile, [field]: value },
      }));
    } else if (name.startsWith("serviceProvider.")) {
      const field = name.replace("serviceProvider.", "");
      setFormData((prev) => ({
        ...prev,
        serviceProvider: {
          ...prev.serviceProvider,
          [field]:
            field === "yearsOfExperience" ? parseInt(value) || 0 : value,
        },
      }));
    } else if (name === "serviceRadius") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
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

  const handleSpecializationChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceProvider: {
        ...prev.serviceProvider,
        specializations: prev.serviceProvider.specializations.includes(
          category
        )
          ? prev.serviceProvider.specializations.filter((s) => s !== category)
          : [...prev.serviceProvider.specializations, category],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (userType === "service_provider") {
        const validatedData = serviceProviderRegisterSchema.parse(formData);

        await register(
          {
            fullName: validatedData.profile.fullName,
            companyName: validatedData.profile.companyName,
            email: validatedData.email,
            phone: validatedData.profile.phone,
            password: validatedData.password,
            city: validatedData.city,
            country: validatedData.country,
            specializations: validatedData.serviceProvider.specializations,
            yearsOfExperience: validatedData.serviceProvider.yearsOfExperience,
            licenseNumber: validatedData.licenseNumber,
            serviceRadius: validatedData.serviceRadius,
          },
          true
        );
      } else {
        const validatedData = customerRegisterSchema.parse(formData);

        await register(
          {
            fullName: validatedData.profile.fullName,
            companyName: validatedData.profile.companyName,
            email: validatedData.email,
            phone: validatedData.profile.phone,
            password: validatedData.password,
            city: validatedData.city,
            country: validatedData.country,
            industry: validatedData.industry,
          },
          false
        );
      }

      // Redirect to dashboard
      markDashboardNavigationIntent();
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation errors
        const formErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
            const field = err.path.join(".");
            formErrors[field] = err.message;
          });
        setErrors(formErrors);
      } else {
        // API error
        addToast("Registration failed. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const SPECIALIZATIONS = [
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

  const getFieldError = (fieldPath: string) => {
    return errors[fieldPath];
  };

  return (
    <div className="relative z-10 w-full max-w-2xl">
      <div className="premium-glass rounded-md p-7">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-[11px] font-black uppercase text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified marketplace onboarding
        </div>
        <h1 className="mb-2 text-3xl font-black text-foreground">Join ELV Connect</h1>
        <p className="mb-8 text-sm leading-6 text-muted-foreground">Create your client or engineer account and start with secure, location-led workflows.</p>

        {/* User Type Selection */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setUserType("customer");
              setErrors({});
            }}
            className={`group relative cursor-pointer rounded-md border p-4 text-left shadow-sm transition-all ${
              userType === "customer"
                ? "border-primary bg-primary-subtle"
                : "border-border-subtle bg-surface hover:border-primary/35"
            }`}
          >
            <div className="flex items-center gap-3">
              <User
                className={`h-6 w-6 ${
                  userType === "customer" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-semibold ${
                    userType === "customer"
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  Customer
                </p>
                <p className="text-sm text-muted-foreground">Post jobs & hire engineers</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setUserType("service_provider");
              setErrors({});
            }}
            className={`group relative cursor-pointer rounded-md border p-4 text-left shadow-sm transition-all ${
              userType === "service_provider"
                ? "border-primary bg-primary-subtle"
                : "border-border-subtle bg-surface hover:border-primary/35"
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase
                className={`h-6 w-6 ${
                  userType === "service_provider"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-semibold ${
                    userType === "service_provider"
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  Service Provider
                </p>
                <p className="text-sm text-muted-foreground">Find & apply for jobs</p>
              </div>
            </div>
          </button>
        </div>

        <GoogleAuthButton
          label={`Continue with Google as ${
            userType === "service_provider" ? "Service Provider" : "Customer"
          }`}
          role={userType}
        />

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-2 text-muted-foreground">or create account with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="profile.fullName" className="mb-2 block text-sm font-bold text-foreground">
              Full Name *
            </label>
            <input
              type="text"
              id="profile.fullName"
              name="profile.fullName"
              value={formData.profile.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                getFieldError("profile.fullName")
                  ? "border-red-500"
                  : "border-border-subtle"
              }`}
            />
            {getFieldError("profile.fullName") && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {getFieldError("profile.fullName")}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="profile.companyName" className="mb-2 block text-sm font-bold text-foreground">
              Company Name
            </label>
            <input
              type="text"
              id="profile.companyName"
              name="profile.companyName"
              value={formData.profile.companyName}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                getFieldError("profile.companyName")
                  ? "border-red-500"
                  : "border-border-subtle"
              }`}
            />
            {getFieldError("profile.companyName") && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {getFieldError("profile.companyName")}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="profile.phone" className="mb-2 block text-sm font-bold text-foreground">
              Phone Number
            </label>
            <input
              type="tel"
              id="profile.phone"
              name="profile.phone"
              value={formData.profile.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                getFieldError("profile.phone")
                  ? "border-red-500"
                  : "border-border-subtle"
              }`}
            />
            {getFieldError("profile.phone") && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {getFieldError("profile.phone")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-bold text-foreground">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                  getFieldError("city") ? "border-red-500" : "border-border-subtle"
                }`}
              />
              {getFieldError("city") && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError("city")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="mb-2 block text-sm font-bold text-foreground">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                  getFieldError("country") ? "border-red-500" : "border-border-subtle"
                }`}
              />
              {getFieldError("country") && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError("country")}
                </p>
              )}
            </div>

            {userType === "customer" ? (
              <div>
                <label htmlFor="industry" className="mb-2 block text-sm font-bold text-foreground">
                  Industry *
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                    getFieldError("industry") ? "border-red-500" : "border-border-subtle"
                  }`}
                >
                  <option value="real_estate">Real Estate</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
                {getFieldError("industry") && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("industry")}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="licenseNumber" className="mb-2 block text-sm font-bold text-foreground">
                  License / Reg. No.
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-border-subtle bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus"
                />
              </div>
            )}
          </div>

          {/* Service Provider Only Fields */}
          {userType === "service_provider" && (
            <>
              {/* Specializations */}
              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">
                  Specializations * <span className="text-xs text-muted-foreground">(Select at least one)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALIZATIONS.map((spec) => (
                    <label
                      key={spec}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.serviceProvider.specializations.includes(
                          spec
                        )}
                        onChange={() => handleSpecializationChange(spec)}
                        disabled={isSubmitting}
                        className="h-4 w-4 cursor-pointer rounded accent-primary"
                      />
                      <span className="text-sm capitalize text-foreground transition-colors group-hover:text-primary">
                        {spec.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
                {getFieldError("serviceProvider.specializations") && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("serviceProvider.specializations")}
                  </p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label htmlFor="serviceProvider.yearsOfExperience" className="mb-2 block text-sm font-bold text-foreground">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="serviceProvider.yearsOfExperience"
                  name="serviceProvider.yearsOfExperience"
                  value={formData.serviceProvider.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  disabled={isSubmitting}
                  className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                    getFieldError("serviceProvider.yearsOfExperience")
                      ? "border-red-500"
                      : "border-border-subtle"
                  }`}
                />
                {getFieldError("serviceProvider.yearsOfExperience") && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("serviceProvider.yearsOfExperience")}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="serviceRadius" className="mb-2 block text-sm font-bold text-foreground">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  id="serviceRadius"
                  name="serviceRadius"
                  value={formData.serviceRadius}
                  onChange={handleChange}
                  min="1"
                  max="200"
                  disabled={isSubmitting}
                  className={`w-full rounded-md border bg-surface px-4 py-2 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                    getFieldError("serviceRadius")
                      ? "border-red-500"
                      : "border-border-subtle"
                  }`}
                />
                {getFieldError("serviceRadius") && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {getFieldError("serviceRadius")}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-foreground">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-surface py-2 pl-10 pr-4 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                  getFieldError("email")
                    ? "border-red-500"
                    : "border-border-subtle"
                }`}
              />
            </div>
            {getFieldError("email") && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-foreground">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-surface py-2 pl-10 pr-4 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                  getFieldError("password")
                    ? "border-red-500"
                    : "border-border-subtle"
                }`}
              />
            </div>
            {getFieldError("password") && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError("password")}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-foreground">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-surface py-2 pl-10 pr-4 text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:shadow-focus ${
                  getFieldError("confirmPassword")
                    ? "border-red-500"
                    : "border-border-subtle"
                }`}
              />
            </div>
            {getFieldError("confirmPassword") && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError("confirmPassword")}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-4 w-4 cursor-pointer rounded accent-primary"
            />
            <span className="text-sm text-foreground">
              I agree to the Terms & Conditions *
            </span>
          </label>
          {getFieldError("agreeToTerms") && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {getFieldError("agreeToTerms")}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-black text-on-primary shadow-glow transition duration-200 hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-floating disabled:bg-gray-400 disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
            {!isSubmitting && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-6 text-center text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold text-primary transition-colors hover:text-secondary"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

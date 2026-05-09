"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { markDashboardNavigationIntent } from "@/components/Dashboard/DashboardLandingGuard";
import { authAPI, apiClient, usersAPI } from "@/lib/api";
import { clearTokens, getUserFromToken, isAuthenticated as hasValidToken, saveTokens } from "@/lib/auth";
import type {
  CustomerRegisterPayload,
  JobCategory,
  LoginPayload,
  LoginResponse,
  ProviderRegisterPayload,
  User as ApiUser,
  UserProfile as ApiUserProfile,
  UserRole,
} from "@/types/api";
import type {
  CustomerRegisterPayload as LegacyCustomerRegisterPayload,
  ELVCategory,
  RegisterPayload as LegacyRegisterPayload,
  ServiceProviderRegisterPayload as LegacyServiceProviderRegisterPayload,
} from "@/types";

export type AuthUser = {
  _id: string;
  id: string;
  email: string;
  role: UserRole;
  profile: {
    fullName: string;
    companyName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
  };
  serviceProvider?: {
    specializations?: ELVCategory[];
    yearsOfExperience?: number;
    certifications?: string[];
    gstNumber?: string;
    serviceArea?: {
      city?: string;
      country?: string;
    };
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
    serviceRadius?: number;
    isVerified?: boolean;
    averageRating?: number;
    totalReviews?: number;
    totalJobsCompleted?: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

type LoginFunction = {
  (email: string, password: string): Promise<void>;
  (payload: LoginPayload): Promise<void>;
};

type AuthContextType = Omit<AuthState, "login"> & {
  login: LoginFunction;
  loading: boolean;
  loginWithGoogle: (credential: string, role?: "customer" | "service_provider") => Promise<void>;
  register: (payload: LegacyRegisterPayload, isServiceProvider: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
};

type FlexibleApiProfile = ApiUserProfile & {
  fullName?: string;
  companyName?: string;
  avatar?: string;
};

type FlexibleApiServiceProvider = NonNullable<ApiUser["serviceProvider"]> & {
  specializations?: string[];
  averageRating?: number;
  totalReviews?: number;
  totalJobsCompleted?: number;
  isVerified?: boolean;
  serviceArea?: {
    city?: string;
    country?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
};

type GoogleLoginResponse =
  | LoginResponse
  | {
      accessToken?: string;
      token?: string;
      refreshToken?: string;
      user: LoginResponse["user"];
    };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || firstName;

  return { firstName, lastName };
}

function normalizeServiceRadius(value?: number): ProviderRegisterPayload["serviceRadius"] {
  if (!value || value <= 10) return 10;
  if (value <= 25) return 25;
  if (value <= 50) return 50;
  return 100;
}

function normalizeCategory(value: ELVCategory): JobCategory | null {
  if (value === "cctv") return "cctv";
  if (value === "access_control") return "access_control";
  if (value === "fire_alarm") return "fire_safety";
  if (value === "structured_cabling") return "data_networking";
  return null;
}

function getDashboardPath(role: UserRole) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "service_provider") return "/dashboard/engineer";
  return "/dashboard/customer";
}

function getProfileFullName(profile: FlexibleApiProfile) {
  if (profile.fullName) {
    return profile.fullName;
  }

  return `${profile.firstName} ${profile.lastName}`.trim() || "ELV user";
}

function normalizeUser(user: ApiUser | LoginResponse["user"]): AuthUser {
  const profile = user.profile as FlexibleApiProfile;
  const serviceProvider = "serviceProvider" in user ? (user.serviceProvider as FlexibleApiServiceProvider | undefined) : undefined;
  const categories = serviceProvider?.categories ?? serviceProvider?.specializations ?? [];

  return {
    _id: user._id,
    id: user._id,
    email: user.email,
    role: user.role,
    profile: {
      fullName: getProfileFullName(profile),
      companyName: profile.companyName,
      phone: profile.phone,
      avatar: profile.avatar ?? profile.avatarUrl,
      bio: profile.bio,
    },
    serviceProvider: serviceProvider
      ? {
          specializations: categories as ELVCategory[],
          yearsOfExperience: serviceProvider.yearsOfExperience,
          certifications: serviceProvider.certifications,
          gstNumber: serviceProvider.gstNumber,
          serviceArea: serviceProvider.serviceArea,
          location: serviceProvider.location,
          serviceRadius: serviceProvider.serviceRadius,
          isVerified: serviceProvider.isVerified ?? serviceProvider.verificationStatus === "verified",
          averageRating: serviceProvider.averageRating ?? serviceProvider.rating,
          totalReviews: serviceProvider.totalReviews,
          totalJobsCompleted: serviceProvider.totalJobsCompleted ?? serviceProvider.totalJobs,
        }
      : undefined,
    createdAt: "createdAt" in user ? user.createdAt : undefined,
    updatedAt: "updatedAt" in user ? user.updatedAt : undefined,
  };
}

function normalizeGoogleResponse(payload: GoogleLoginResponse): LoginResponse {
  const token = "token" in payload && payload.token ? payload.token : "accessToken" in payload ? payload.accessToken : undefined;

  if (!token) {
    throw new Error("Google login response did not include an access token");
  }

  return {
    token,
    refreshToken: payload.refreshToken ?? "",
    user: payload.user,
  };
}

function mapCustomerPayload(payload: LegacyCustomerRegisterPayload): CustomerRegisterPayload {
  const { firstName, lastName } = splitName(payload.fullName);

  return {
    firstName,
    lastName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    city: payload.city,
  };
}

function mapProviderPayload(payload: LegacyServiceProviderRegisterPayload): ProviderRegisterPayload {
  const { firstName, lastName } = splitName(payload.fullName);
  const categories = payload.specializations.map(normalizeCategory).filter((category): category is JobCategory => Boolean(category));

  return {
    firstName,
    lastName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    city: payload.city,
    businessName: payload.companyName || payload.fullName,
    gstNumber: payload.licenseNumber,
    yearsOfExperience: payload.yearsOfExperience ?? 0,
    categories,
    serviceRadius: normalizeServiceRadius(payload.serviceRadius),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    const profile = await usersAPI.getMyProfile();
    setUser(normalizeUser(profile));
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!hasValidToken()) {
          clearTokens();
          setUser(null);
          return;
        }

        const tokenUser = getUserFromToken();
        if (tokenUser) {
          setUser({
            _id: tokenUser.id,
            id: tokenUser.id,
            email: tokenUser.email,
            role: tokenUser.role,
            profile: {
              fullName: tokenUser.email,
            },
          });
        }

        await refetchUser();
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [refetchUser]);

  const login = useCallback<LoginFunction>(
    async (emailOrPayload: string | LoginPayload, password?: string) => {
      const payload: LoginPayload =
        typeof emailOrPayload === "string"
          ? {
              email: emailOrPayload,
              password: password ?? "",
            }
          : emailOrPayload;

      setIsLoading(true);

      try {
        const response = await authAPI.login(payload);
        saveTokens(response.token, response.refreshToken);

        try {
          const profile = await usersAPI.getMyProfile();
          setUser(normalizeUser(profile));
          markDashboardNavigationIntent();
          router.push(getDashboardPath(profile.role));
        } catch {
          const normalizedUser = normalizeUser(response.user);
          setUser(normalizedUser);
          markDashboardNavigationIntent();
          router.push(getDashboardPath(normalizedUser.role));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const loginWithGoogle = useCallback(
    async (credential: string, role: "customer" | "service_provider" = "customer") => {
      setIsLoading(true);

      try {
        const response = normalizeGoogleResponse(await apiClient.post<GoogleLoginResponse>("/auth/google", { credential, role }));
        saveTokens(response.token, response.refreshToken);
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);
        markDashboardNavigationIntent();
        router.push(getDashboardPath(normalizedUser.role));
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(async (payload: LegacyRegisterPayload, isServiceProvider: boolean) => {
    if (isServiceProvider) {
      await authAPI.registerServiceProvider(mapProviderPayload(payload as LegacyServiceProviderRegisterPayload));
      return;
    }

    await authAPI.registerCustomer(mapCustomerPayload(payload as LegacyCustomerRegisterPayload));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Local sign-out should still complete when the server has already invalidated the refresh token.
    } finally {
      clearTokens();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading: isLoading,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser: refetchUser,
      refetchUser,
    }),
    [isLoading, login, loginWithGoogle, logout, refetchUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

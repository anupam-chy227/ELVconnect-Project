import { useState, useCallback } from "react";
import { ApiClientError, apiClient } from "@/lib/api";
import { useToast } from "@/components/Toast/ToastContext";

type HttpMethod = "post" | "patch" | "put" | "delete";

interface UseMutationOptions<T> {
  method: HttpMethod;
  url: string;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiClientError) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: ApiClientError | null;
}

/**
 * Custom hook for making mutations (POST, PATCH, PUT, DELETE) to API
 * Handles loading, error, and success states
 */
export function useMutation<T = unknown, R = unknown>(
  options: UseMutationOptions<R>
): UseMutationState<R> & {
  mutate: (payload?: T) => Promise<R | null>;
} {
  const {
    method,
    url,
    onSuccess,
    onError,
    showSuccessToast = true,
    successMessage = "Operation completed successfully",
  } = options;

  const [state, setState] = useState<UseMutationState<R>>({
    data: null,
    loading: false,
    error: null,
  });

  const { addToast } = useToast();

  const mutate = useCallback(
    async (payload?: T): Promise<R | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        let data: R;

        switch (method) {
          case "post":
            data = await apiClient.post<R>(url, payload);
            break;
          case "patch":
            data = await apiClient.patch<R>(url, payload);
            break;
          case "put":
            data = await apiClient.put<R>(url, payload);
            break;
          case "delete":
            data = await apiClient.delete<R>(url);
            break;
          default:
            throw new Error(`Unknown method: ${method}`);
        }

        setState({ data, loading: false, error: null });

        if (showSuccessToast) {
          addToast(successMessage, "success");
        }

        onSuccess?.(data);
        return data;
      } catch (error) {
        const apiError = error instanceof ApiClientError ? error : new ApiClientError("Operation failed");
        setState({ data: null, loading: false, error: apiError });

        const errorMessage = apiError.message || "Operation failed";
        addToast(errorMessage, "error");
        onError?.(apiError);
        return null;
      }
    },
    [method, url, onSuccess, onError, showSuccessToast, successMessage, addToast]
  );

  return { ...state, mutate };
}

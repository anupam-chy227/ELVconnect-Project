import { useEffect, useState, useCallback, useRef } from "react";
import { ApiClientError, apiClient } from "@/lib/api";
import { useToast } from "@/components/Toast/ToastContext";

interface UseQueryOptions {
  enabled?: boolean;
  retry?: boolean;
  retryCount?: number;
  showErrorToast?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiClientError) => void;
}

interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: ApiClientError | null;
}

/**
 * Custom hook for fetching data from API
 * Handles loading, error, and success states
 */
export function useQuery<T = unknown>(
  url: string | null,
  options: UseQueryOptions = {}
): UseQueryState<T> & { refetch: () => Promise<void> } {
  const {
    enabled = true,
    retry = true,
    retryCount = 3,
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseQueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const { addToast } = useToast();
  const optionsRef = useRef({
    onSuccess,
    onError,
    addToast,
  });

  useEffect(() => {
    optionsRef.current = { onSuccess, onError, addToast };
  }, [onSuccess, onError, addToast]);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    let lastError: ApiClientError | null = null;
    const maxAttempts = retry ? retryCount + 1 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const data = await apiClient.get<T>(url);

        setState({ data, loading: false, error: null });
        optionsRef.current.onSuccess?.(data);
        return;
      } catch (error) {
        const apiError = error instanceof ApiClientError ? error : new ApiClientError("Failed to fetch data");
        lastError = apiError;
        const shouldRetry =
          attempt < maxAttempts - 1 &&
          apiError.status !== 401 &&
          apiError.status !== 403 &&
          apiError.status !== 429;

        if (!shouldRetry) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }

    const finalError = lastError ?? new ApiClientError("Failed to fetch data");
    setState({ data: null, loading: false, error: finalError });
    const errorMessage = finalError.message || "Failed to fetch data";
    if (showErrorToast) {
      optionsRef.current.addToast(errorMessage, "error");
    }
    optionsRef.current.onError?.(finalError);
  }, [url, enabled, retry, retryCount, showErrorToast]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [url, enabled, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

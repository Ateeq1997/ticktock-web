import { useState, useCallback } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: "",
  });

  const execute = useCallback(
    async (options?: RequestInit) => {
      setState({ data: null, loading: true, error: "" });
      try {
        const res = await fetch(url, options);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Request failed");
        setState({ data: json.data ?? json, loading: false, error: "" });
        return json;
      } catch (err: any) {
        const msg = err.message || "An error occurred";
        setState((s) => ({ ...s, loading: false, error: msg }));
        throw err;
      }
    },
    [url]
  );

  return { ...state, execute };
}

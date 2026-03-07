const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

type ApiError = { message: string };

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });

    let body: any = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const message =
        body?.error ||
        body?.message ||
        `Request failed (${response.status})`;

      return { data: null, error: { message } };
    }

    return { data: body as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: "Network error. Please check connection." },
    };
  }
}
export const BASE_API_URL = "https://api-token.llm7.io";
export const ID_TOKEN_KEY = "id_token";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60;

function tokenCookieAttributes(maxAgeSeconds: number) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `path=/; max-age=${maxAgeSeconds}; SameSite=Strict${secure}`;
}

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

export const persistCookie = (name: string, value: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${tokenCookieAttributes(TOKEN_COOKIE_MAX_AGE_SECONDS)}`;
};

export const clearCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; ${tokenCookieAttributes(0)}`;
};

export const persistIdToken = (token: string) => {
  try {
    sessionStorage.setItem(ID_TOKEN_KEY, token);
    localStorage.removeItem(ID_TOKEN_KEY);
    persistCookie(ID_TOKEN_KEY, token);
  } catch {
    // ignore
  }
};

export const clearIdToken = () => {
  try {
    sessionStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
  } catch {
    // ignore
  }
  clearCookie(ID_TOKEN_KEY);
};

export async function issueApiToken(
  idToken: string,
  persistApiToken: (token: string) => void,
): Promise<string | null> {
  try {
    const listRes = await fetch(`${BASE_API_URL}/tokens`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (listRes.ok) {
      const tokens = await listRes.json().catch(() => []);
      if (Array.isArray(tokens) && tokens.length > 0 && tokens[0].token) {
        persistApiToken(tokens[0].token as string);
        return tokens[0].token as string;
      }
    }
  } catch {
    // ignore and try creating
  }

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  try {
    const createRes = await fetch(`${BASE_API_URL}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name: "Web chat token", expires_at: expiresAt }),
    });
    if (createRes.ok) {
      const data = await createRes.json().catch(() => ({}));
      if (data?.token) {
        persistApiToken(data.token as string);
        return data.token as string;
      }
    }
  } catch {
    // ignore token creation errors
  }
  return null;
}

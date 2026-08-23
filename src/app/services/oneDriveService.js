const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Inicia o fluxo OAuth2 do OneDrive; o backend faz a troca do code e o refresh_token.
export async function startOneDriveLogin() {
  const response = await fetch(`${API_BASE_URL}/api-onedrive/auth/login`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Não foi possível iniciar a conexão com o OneDrive. Tente novamente.");
  }

  const data = await response.json();

  if (!data?.authUrl) {
    throw new Error("O servidor não retornou o link de autorização do OneDrive.");
  }

  return data;
}

import { api } from "../provider/api";

// Inicia o fluxo OAuth2 do OneDrive; o backend retorna a URL de autorização da Microsoft
export async function startOneDriveLogin() {
  const response = await api.get("/api-onedrive/auth/login");
  const data = response.data;

  // O Swagger indica um Map/Objeto (ex: { url: "..." } ou { authUrl: "..." }) ou string direta
  const authUrl =
    typeof data === "string"
      ? data
      : data?.authUrl || data?.url || data?.loginUrl || data?.redirectUrl || Object.values(data || {})[0];

  if (!authUrl || typeof authUrl !== "string" || !authUrl.startsWith("http")) {
    throw new Error("O servidor não retornou um link válido de autorização do OneDrive.");
  }

  return { authUrl };
}

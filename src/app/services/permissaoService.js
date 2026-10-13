import { api } from "../provider/api";

export async function listarPermissoes() {
  const response = await api.get("/permissoes");
  return response.data;
}

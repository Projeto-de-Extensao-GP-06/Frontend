import { api } from "../provider/api";

export async function atualizarUsuario(id, dados) {
  // dados esperados pelo Swagger: { nome, email, cargoId, ativo }
  const response = await api.put(`/usuarios/${id}`, dados);
  return response.data;
}

export function getUsuarioLogado() {
  try {
    const user = localStorage.getItem("@sgpj:user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.warn("Não foi possível ler o usuário salvo localmente:", error);
    localStorage.removeItem("@sgpj:user");
    return null;
  }
}

export function salvarUsuarioLogado(usuario) {
  localStorage.setItem("@sgpj:user", JSON.stringify(usuario));
}

export async function buscarPerfilAtual() {
  const response = await api.get("/auth/me");
  const usuario = response.data;
  salvarUsuarioLogado(usuario);
  return usuario;
}

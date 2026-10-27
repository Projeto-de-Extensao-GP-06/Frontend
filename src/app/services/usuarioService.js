import { api } from "../provider/api";

export async function listarUsuarios() {
  const response = await api.get("/usuarios");
  return response.data;
}

export async function listarUsuariosPorCargo(cargo) {
  const response = await api.get("/usuarios/cargo", {
    params: { cargo },
  });
  return response.data;
}

export async function pesquisarUsuarios(pesquisa) {
  const response = await api.get("/usuarios/pesquisar", {
    params: { pesquisa },
  });
  return response.data;
}

export async function criarUsuario(dados) {
  // dados esperados pelo Swagger: { nome, email, cargoId }
  const response = await api.post("/usuarios", dados);
  return response.data;
}

export async function atualizarUsuario(id, dados) {
  // dados esperados pelo Swagger: { nome, email, cargoId, ativo }
  const response = await api.put(`/usuarios/${id}`, dados);
  return response.data;
}

export async function reativarUsuario(id) {
  const response = await api.post(`/usuarios/reactivate/${id}`);
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

export async function alterarMinhaSenha({ senhaAtual, novaSenha }) {
  const response = await api.patch("/usuarios/minha-senha", {
    senhaAtual,
    novaSenha,
  });
  return response.data;
}

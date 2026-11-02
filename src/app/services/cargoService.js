import { api } from "../provider/api";

export async function listarCargos({ page = 0, size = 50, sort = "nome,asc" } = {}) {
  const response = await api.get("/cargos", {
    params: { page, size, sort },
  });
  return response.data;
}

export async function criarCargo(nome) {
  const response = await api.post("/cargos", { nome });
  return response.data;
}

export async function renomearCargo(cargoId, nome) {
  const response = await api.put(`/cargos/${cargoId}`, { nome });
  return response.data;
}

export async function atualizarPermissoesCargo(cargoId, permissaoIds) {
  const response = await api.put(`/cargos/${cargoId}/permissoes`, { permissaoIds });
  return response.data;
}

export async function excluirCargo(cargoId) {
  await api.delete(`/cargos/${cargoId}`);
}

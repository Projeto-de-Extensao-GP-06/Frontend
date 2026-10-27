import { api } from "../provider/api";

export async function buscarDadosGeraisDashboard() {
  const response = await api.get("/dashboard");
  return response.data;
}


export async function buscarDadosFiltradosDashboard(dateFrom, dateTo) {
  const response = await api.get("/dashboard/filter", {
    params: {
      dateFrom,
      dateTo,
    },
  });
  return response.data;
}

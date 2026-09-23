import { api } from "../provider/api";

function formatarData(dataIso) {
  if (!dataIso) return "—";
  const [data] = dataIso.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export async function listarProcessos() {
  const response = await api.get("/processos");
  
  const conteudo = response.data.content || [];

  return conteudo.map((p) => ({
    id: p.id,
    cnj: p.numeroProcesso || "-",
    clientName: p.clientNomeRazaoSocial || "Sem nome",
    tribunal: p.siglaTribunal?.nome?.toUpperCase() || "-",
    hearingDate: formatarData(p.dataAudiencia),
    status: p.status ? p.status.toLowerCase() : "ativo",
    priority: p.prioridade?.nome ? p.prioridade.nome.toLowerCase() : "baixa",
    phase: p.faseProcesso?.nome || "-",
    raw: p // objeto original 
  }));
}
import api from "./api";

/**
 * Envia uma nova solicitação/dúvida a partir do formulário público.
 *
 * @param {Object} dados Objeto compatível com SolicitacaoDuvidaCriacaoRequest
 * @returns {Promise<any>}
 */
export const criarSolicitacao = async (dados) => {
  const response = await api.post("/solicitacoes", dados);
  return response.data;
};

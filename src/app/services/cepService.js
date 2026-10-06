const VIACEP_URL = "https://viacep.com.br/ws";

export async function buscarEnderecoPorCEP(cep, { signal } = {}) {
  const cepSanitizado = String(cep ?? "").replace(/\D/g, "");

  if (cepSanitizado.length !== 8) {
    throw new Error("O CEP deve conter exatamente 8 dígitos.");
  }

  let response;
  try {
    response = await fetch(`${VIACEP_URL}/${cepSanitizado}/json/`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.");
  }

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP. Tente novamente.");
  }

  let endereco;
  try {
    endereco = await response.json();
  } catch {
    throw new Error("A resposta da consulta de CEP é inválida.");
  }

  if (endereco.erro === "true" || endereco.erro === true) {
    throw new Error("CEP não encontrado. Confira o número ou preencha o endereço manualmente.");
  }

  return {
    logradouro: endereco.logradouro || "",
    bairro: endereco.bairro || "",
    localidade: endereco.localidade || "",
    uf: endereco.uf || "",
  };
}

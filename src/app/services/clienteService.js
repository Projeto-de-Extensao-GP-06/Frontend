import { api } from "./api";

const normalize = (cliente) => {
  const isPF = cliente.isPF;
  const primaryContact = (cliente.contatos || []).find(c => c.principal) || (cliente.contatos || [])[0];
  
  return {
    ...cliente,
    name: cliente.nomeRazaoSocial,
    type: isPF ? "PF" : "PJ",
    cpf: isPF ? cliente.cpfCnpj : undefined,
    cnpj: isPF ? undefined : cliente.cpfCnpj,
    status: (cliente.status?.nome || cliente.statusNome || "").toLowerCase(),
    comoConheceu: typeof cliente.comoConheceu === 'string' ? cliente.comoConheceu : cliente.comoConheceu?.name() || "INDICACAO",
    email: cliente.email || (isPF ? primaryContact?.email : null),
    profession: cliente.profession || (isPF ? primaryContact?.profissao : null),
    address: cliente.endereco || { cep: "", logradouro: "", numero: "", bairro: "", cidade: "", estado: "", complemento: "" },
    contacts: (cliente.contatos || []).map((contact) => ({
      ...contact,
      name: contact.nome,
      phone: contact.telefone,
      profession: contact.profissao,
      isPrimary: contact.principal,
    })),
  };
};

const toRequest = (data) => ({
  nomeRazaoSocial: data.name,
  cpfCnpj: data.document.replace(/\D/g, ""),
  isPF: data.type === "PF",
  rg: data.rg || null,
  comoConheceu: data.comoConheceu || "INDICACAO",
  statusClienteId: Number(data.statusClienteId || 1),
  endereco: data.address,
  contatos: data.contacts.map((contact, index) => ({
    nome: contact.name,
    email: contact.email,
    telefone: contact.phone,
    profissao: contact.profession || null,
    principal: index === 0,
  })),
});

export const clienteService = {
  async list() {
    const response = await api.get("/clientes");
    return (response.data || []).map(normalize);
  },
  async getById(id) {
    const response = await api.get(`/clientes/${id}`);
    return normalize(response.data);
  },
  async create(data) {
    const response = await api.post("/clientes", toRequest(data));
    return normalize(response.data);
  },
  async update(id, data) {
    const response = await api.put(`/clientes/${id}`, toRequest(data));
    return normalize(response.data);
  },
  async remove(id) {
    await api.delete(`/clientes/${id}`);
  },
};

export function getClienteError(error) {
  return error?.originalError?.response?.data?.erro || error?.message || "Não foi possível concluir a operação.";
}

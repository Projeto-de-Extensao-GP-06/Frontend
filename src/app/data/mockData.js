export const mockClients = [{
  id: "c1",
  type: "PF",
  name: "João Paulo Ferreira",
  cpf: "123.456.789-00",
  rg: "12.345.678-9",
  email: "joao.ferreira@email.com",
  phone: "(11) 98765-4321",
  profession: "Engenheiro Civil",
  status: "ativo",
  address: {
    cep: "01310-100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    complemento: "Apto 42"
  },
  contacts: [{
    id: "ct1",
    name: "Maria Ferreira",
    email: "maria.ferreira@email.com",
    phone: "(11) 97654-3210",
    profession: "Professora",
    isPrimary: true
  }]
}, {
  id: "c2",
  type: "PJ",
  name: "Construtech Soluções LTDA",
  cnpj: "12.345.678/0001-90",
  email: "contato@construtech.com.br",
  status: "ativo",
  address: {
    cep: "04794-000",
    logradouro: "Rua das Inovações",
    numero: "500",
    bairro: "Santo Amaro",
    cidade: "São Paulo",
    estado: "SP"
  },
  contacts: [{
    id: "ct2",
    name: "Carlos Mendes",
    email: "carlos@construtech.com.br",
    phone: "(11) 3344-5566",
    profession: "Diretor Executivo",
    isPrimary: true
  }, {
    id: "ct3",
    name: "Priscila Rocha",
    email: "priscila@construtech.com.br",
    phone: "(11) 3344-5577",
    profession: "Gerente Jurídico",
    isPrimary: false
  }]
}, {
  id: "c3",
  type: "PF",
  name: "Ana Beatriz Santos",
  cpf: "987.654.321-00",
  rg: "98.765.432-1",
  email: "ana.santos@gmail.com",
  phone: "(21) 99876-5432",
  profession: "Médica",
  status: "ativo",
  address: {
    cep: "20040-020",
    logradouro: "Rua da Assembleia",
    numero: "10",
    bairro: "Centro",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    complemento: "Sala 1205"
  },
  contacts: []
}, {
  id: "c4",
  type: "PJ",
  name: "Delta Comércio e Serviços S/A",
  cnpj: "98.765.432/0001-10",
  email: "juridico@deltacomercio.com.br",
  status: "inativo",
  address: {
    cep: "80020-010",
    logradouro: "Rua XV de Novembro",
    numero: "700",
    bairro: "Centro",
    cidade: "Curitiba",
    estado: "PR"
  },
  contacts: [{
    id: "ct4",
    name: "Roberto Lima",
    email: "roberto@deltacomercio.com.br",
    phone: "(41) 3300-1122",
    profession: "Sócio-Diretor",
    isPrimary: true
  }]
}];
export const mockProcesses = [{
  id: "p1",
  cnj: "0001234-56.2024.8.26.0100",
  clientId: "c1",
  clientName: "João Paulo Ferreira",
  phase: "Citação",
  status: "ativo",
  priority: "alta",
  tribunal: "TJSP",
  hearingDate: "15/08/2026",
  hearingTime: "14:30",
  filingDate: "03/01/2024",
  instance: "1ª Instância",
  secrecyLevel: "Segredo de Justiça",
  processualClass: "Ação Trabalhista",
  judgingBody: "1ª Vara do Trabalho de São Paulo",
  tribunalSystem: "PJe",
  responsible: "Thauany Bezerra",
  value: 85000.00,
  description: "O caso se refere ao cliente João Paulo Ferreira que processou a empresa Construtora Alfa LTDA por justa causa por ter sido dispensado sem justa causa após 8 anos de serviço, requerendo verbas rescisórias, horas extras não pagas e danos morais.",
  observations: [{
    id: "o1",
    text: "O cliente tem documentação que comprova o pagamento irregular de horas extras nos últimos 3 anos. Solicita agilidade no processo.",
    createdAt: "05/01/2024 09:30"
  }, {
    id: "o2",
    text: "Audiência de conciliação agendada para agosto. Cliente foi orientado a não contactar a empresa diretamente.",
    createdAt: "20/03/2024 14:15"
  }],
  documents: [{
    id: "d1",
    name: "Petição Inicial",
    type: "PDF",
    path: "/onedrive/joaoferreira/processo001/peticao_inicial.pdf",
    uploadedAt: "03/01/2024"
  }, {
    id: "d2",
    name: "Contra-Cheque_Jan2024",
    type: "JPEG",
    path: "/onedrive/joaoferreira/processo001/contracheque_jan2024.jpg",
    uploadedAt: "05/01/2024"
  }],
  history: [{
    id: "h1",
    type: "abertura",
    description: "Abertura do processo",
    timestamp: "08:00 03/01/2024"
  }, {
    id: "h2",
    type: "arquivo",
    description: "Adição de arquivo: Contra-Cheque_Jan2024",
    timestamp: "10:30 05/01/2024"
  }, {
    id: "h3",
    type: "observacao",
    description: "Observação adicionada: O cliente tem documentação que comprova o pagamento irregular...",
    timestamp: "09:30 05/01/2024"
  }, {
    id: "h4",
    type: "mudanca_status",
    description: "Mudança de fase: Inicial → Citação",
    timestamp: "11:00 15/03/2024"
  }]
}, {
  id: "p2",
  cnj: "0005678-90.2023.8.26.0050",
  clientId: "c2",
  clientName: "Construtech Soluções LTDA",
  phase: "Sentença",
  status: "ativo",
  priority: "média",
  tribunal: "TJSP",
  hearingDate: "22/09/2026",
  hearingTime: "10:00",
  filingDate: "14/06/2023",
  instance: "2ª Instância",
  secrecyLevel: "Público",
  processualClass: "Ação de Cobrança",
  judgingBody: "5ª Câmara de Direito Privado",
  tribunalSystem: "e-SAJ",
  responsible: "Thauany Bezerra",
  value: 320000.00,
  description: "O caso se refere à empresa Construtech Soluções LTDA que ingressou com ação de cobrança contra a empresa Delta Comércio e Serviços S/A por inadimplemento contratual referente a serviços de construção civil prestados durante o ano de 2022.",
  observations: [{
    id: "o3",
    text: "A empresa possui notas fiscais e contratos assinados que corroboram todos os valores cobrados. Réu apresentou contestação questionando a qualidade dos serviços.",
    createdAt: "20/06/2023 15:00"
  }],
  documents: [{
    id: "d3",
    name: "Contrato_Servicos_2022",
    type: "PDF",
    path: "/onedrive/construtech/processo002/contrato_servicos_2022.pdf",
    uploadedAt: "14/06/2023"
  }],
  history: [{
    id: "h5",
    type: "abertura",
    description: "Abertura do processo",
    timestamp: "09:00 14/06/2023"
  }, {
    id: "h6",
    type: "mudanca_status",
    description: "Sentença: Parcialmente procedente em 1ª instância",
    timestamp: "14:00 10/01/2024"
  }, {
    id: "h7",
    type: "mudanca_status",
    description: "Saneamento → Sentença: Recurso de apelação interposto",
    timestamp: "10:00 15/02/2024"
  }]
}, {
  id: "p3",
  cnj: "0009012-34.2024.8.19.0001",
  clientId: "c3",
  clientName: "Ana Beatriz Santos",
  phase: "Inicial",
  status: "ativo",
  priority: "baixa",
  tribunal: "TJRJ",
  hearingDate: "10/10/2026",
  hearingTime: "15:30",
  filingDate: "22/02/2024",
  instance: "1ª Instância",
  secrecyLevel: "Público",
  processualClass: "Ação de Indenização",
  judgingBody: "3ª Vara Cível do Rio de Janeiro",
  tribunalSystem: "PROJUDI",
  responsible: "Thauany Bezerra",
  value: 50000.00,
  description: "O caso se refere à cliente Ana Beatriz Santos que ingressou com ação de indenização por danos morais e materiais contra plano de saúde por negativa de cobertura de procedimento médico de emergência.",
  observations: [],
  documents: [],
  history: [{
    id: "h8",
    type: "abertura",
    description: "Abertura do processo",
    timestamp: "10:00 22/02/2024"
  }]
}, {
  id: "p4",
  cnj: "0003456-78.2022.8.26.0200",
  clientId: "c1",
  clientName: "João Paulo Ferreira",
  phase: "Penhora",
  status: "encerrado",
  priority: "baixa",
  tribunal: "TJSP",
  hearingDate: "—",
  filingDate: "10/03/2022",
  instance: "1ª Instância",
  secrecyLevel: "Público",
  processualClass: "Ação de Despejo",
  judgingBody: "2ª Vara Cível de Campinas",
  tribunalSystem: "e-SAJ",
  responsible: "Thauany Bezerra",
  value: 12000.00,
  description: "Ação de despejo por falta de pagamento de aluguel referente a imóvel comercial. Encerrado com acordo extrajudicial.",
  observations: [],
  documents: [{
    id: "d4",
    name: "Acordo_Extrajudicial",
    type: "PDF",
    path: "/onedrive/joaoferreira/processo004/acordo_extrajudicial.pdf",
    uploadedAt: "15/08/2023"
  }],
  history: [{
    id: "h9",
    type: "abertura",
    description: "Abertura do processo",
    timestamp: "09:00 10/03/2022"
  }, {
    id: "h10",
    type: "fechamento",
    description: "Fechamento do processo: Acordo extrajudicial firmado",
    timestamp: "16:00 20/08/2023"
  }]
}];
export const mockRequests = [{
  id: "r1",
  name: "Fernanda Oliveira",
  email: "fernanda.oliveira@gmail.com",
  phone: "(11) 94567-8901",
  state: "SP",
  description: "Preciso de orientação jurídica sobre uma demissão que considero injusta. Trabalhei por 5 anos na empresa e fui dispensada sem receber as verbas rescisórias corretamente.",
  processNumber: "",
  createdAt: "28/05/2026",
  status: "pendente"
}, {
  id: "r2",
  name: "Ricardo Nascimento",
  email: "ricardo.nascimento@email.com",
  phone: "(21) 98234-5678",
  state: "RJ",
  description: "Meu locatário está inadimplente há 4 meses e preciso retomar o imóvel urgentemente. Tenho contrato assinado e todas as notificações feitas.",
  processNumber: "0001234-56.2024.8.19.0001",
  createdAt: "25/05/2026",
  status: "pendente",
  // Dados buscados automaticamente
  filingDate: "10/03/2024",
  instance: "1ª Instância",
  secrecyLevel: "Público",
  judgingBody: "2ª Vara Cível do Rio de Janeiro",
  tribunalSystem: "PROJUDI",
  processualClass: "Ação de Despejo"
}, {
  id: "r3",
  name: "Marcela Souza",
  email: "marcela.souza@empresa.com",
  phone: "(31) 97890-1234",
  state: "MG",
  description: "Nossa empresa sofreu um acidente de trabalho grave e precisamos de assessoria jurídica para lidar com o processo trabalhista e garantir os direitos de todos os envolvidos.",
  processNumber: "",
  createdAt: "20/05/2026",
  status: "aceita"
}, {
  id: "r4",
  name: "Paulo Henrique Costa",
  email: "paulo.costa@outlook.com",
  phone: "(41) 96543-2109",
  state: "PR",
  description: "Sofri um acidente de trânsito e a seguradora está se recusando a pagar a indenização. Tenho boletim de ocorrência e laudo médico.",
  processNumber: "",
  createdAt: "15/05/2026",
  status: "negada"
}, {
  id: "r5",
  name: "Larissa Mendonça",
  email: "larissa@email.com",
  phone: "(51) 95432-1098",
  state: "RS",
  description: "Preciso de ajuda com inventário de bens após falecimento de familiar. Há divergências entre os herdeiros sobre a divisão.",
  processNumber: "",
  createdAt: "10/05/2026",
  status: "pendente"
}];
export const mockUsers = [{
  id: "u1",
  name: "Thauany Bezerra",
  email: "thauany@thauanybezerra.adv.br",
  role: "Administrador",
  status: "ativo"
}, {
  id: "u2",
  name: "Carolina Almeida",
  email: "carolina@thauanybezerra.adv.br",
  role: "Assistente",
  status: "ativo"
}, {
  id: "u3",
  name: "Rafael Monteiro",
  email: "rafael@thauanybezerra.adv.br",
  role: "Advogado",
  status: "ativo"
}, {
  id: "u4",
  name: "Isabela Corrêa",
  email: "isabela@thauanybezerra.adv.br",
  role: "Assistente",
  status: "inativo"
}];
export const phases = ["Inicial", "Citação", "Saneamento", "Sentença", "Cumprimento de sentença", "Penhora"];
export const tribunals = ["TJSP", "TJAL", "TJAP", "TJAM", "TJBA", "TJCE", "TJDFT", "TJES", "TJGO", "TJMA", "TJMT", "TJMS", "TJMG", "TJPA", "TJPB", "TJPR", "TJPE", "TJPI", "TJRJ", "TJRN", "TJRS", "TJRO", "TJRR", "TJSC", "TJAC", "TJSE", "TJTO"];
export const brazilStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
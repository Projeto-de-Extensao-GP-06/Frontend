/**
 * chartColors.js
 * Configuração centralizada da paleta de cores para os gráficos do SGPJ.
 *
 * Diretrizes:
 * 1. Cores Semânticas de Status:
 *    - Processos ativos / principais: Azul
 *    - Processos encerrados: Vermelho (e família de vermelho para subcategorias)
 *    - Processos suspensos: Amarelo/Âmbar (e família de âmbar para subcategorias)
 *    - Processos novos: Verde
 *
 * 2. Cores Categóricas e Sequenciais:
 *    - Derivadas da identidade visual institucional do SGPJ (Azul Marinho #0F2357 e Ouro #C9A96E)
 *    - Alto contraste, acessibilidade e harmonia com o tema claro (#FFFFFF / #F4F6FA)
 */

export const chartColors = {
  // ---------------------------------------------------------------------------
  // 1. Identidade Institucional SGPJ
  // ---------------------------------------------------------------------------
  brand: {
    primary: "#0F2357",   // Azul marinho profundo institucional (títulos, barras padrão)
    secondary: "#162D6B", // Azul intermediário (hover e variantes)
    accent: "#C9A96E",    // Dourado/ouro de prestígio (destaques, fases líderes)
    royal: "#1D4ED8",     // Azul de ação / destaque (linhas e elementos ativos)
  },

  // ---------------------------------------------------------------------------
  // 2. Cores Semânticas de Status (Obrigatórias em toda a dashboard)
  // ---------------------------------------------------------------------------
  semantic: {
    active: "#1D4ED8",    // AZUL - Processos ativos / informação principal
    closed: "#DC2626",    // VERMELHO - Processos encerrados
    suspended: "#D97706", // AMARELO/ÂMBAR - Processos suspensos (legível em fundo branco)
    new: "#16A34A",       // VERDE - Processos novos
  },

  // ---------------------------------------------------------------------------
  // 3. Família Coordenada de Vermelho (Processos Encerrados por categoria)
  // Mantém a semântica de "encerrado" com contraste e diferenciação entre motivos.
  // ---------------------------------------------------------------------------
  closedFamily: {
    base: "#DC2626",
    acordo: "#EF4444",              // Vermelho médio equilibrado (resolução consensual)
    semResolucao: "#DC2626",        // Vermelho semântico padrão (sem resolução de mérito)
    penhoraTotal: "#B91C1C",        // Vermelho escuro/intenso (execução forçada)
    pagamentoVoluntario: "#F87171", // Coral/vermelho suave (adimplemento espontâneo)
    outros: "#991B1B",              // Carmesim/vinho profundo (demais motivos)
  },

  // ---------------------------------------------------------------------------
  // 4. Família Coordenada de Amarelo/Âmbar (Processos Suspensos por categoria)
  // Mantém a semântica de "suspenso" com alto contraste e sem tom "marca-texto".
  // ---------------------------------------------------------------------------
  suspendedFamily: {
    base: "#D97706",
    acordoParcelado: "#F59E0B",     // Âmbar vibrante (suspensão por parcelamento)
    tratativas: "#D97706",          // Âmbar semântico base (negociações em andamento)
    ausenciaBens: "#B45309",        // Âmbar escuro / conhaque (falta de patrimônio)
    determinacaoJudicial: "#FBBF24",// Âmbar dourado (ordem do juízo)
    outros: "#92400E",              // Âmbar profundo (demais motivos)
  },

  // ---------------------------------------------------------------------------
  // 5. Escala Sequencial Temporal (Tempo de Duração de Processos Ativos)
  // Progressão do azul claro ao marinho profundo: quanto mais tempo, mais escuro.
  // ---------------------------------------------------------------------------
  duration: [
    "#93C5FD", // 0–6 meses: azul claro / recente
    "#60A5FA", // 6–12 meses: azul suave
    "#3B82F6", // 1–2 anos: azul médio
    "#1D4ED8", // 2–5 anos: azul royal
    "#0F2357", // +5 anos: azul marinho profundo SGPJ
  ],

  // ---------------------------------------------------------------------------
  // 6. Formas de Entrada de Clientes
  // Padronizadas no azul institucional principal do sistema (#0F2357).
  // ---------------------------------------------------------------------------
  channels: {
    instagram: "#0F2357", // Azul institucional SGPJ
    site: "#0F2357",      // Azul institucional SGPJ
    indicacao: "#0F2357", // Azul institucional SGPJ
  },
  channelsList: ["#0F2357", "#0F2357", "#0F2357"],

  // ---------------------------------------------------------------------------
  // 7. Funil de Atendimento (Etapas de Conversão de Solicitações)
  // Azul marinho institucional para entrada, ouro SGPJ para conversão.
  // ---------------------------------------------------------------------------
  funnel: {
    recebidas: "#0F2357", // Topo do funil (volume recebido)
    aceitas: "#C9A96E",   // Sucesso / conversão qualificada em processo
  },
  funnelList: ["#0F2357", "#C9A96E"],

  // ---------------------------------------------------------------------------
  // 8. Processos por Fase
  // ---------------------------------------------------------------------------
  phase: {
    default: "#0F2357",   // Azul institucional dos processos ativos
    highlight: "#C9A96E", // Dourado SGPJ para a etapa com maior volume
  },

  // ---------------------------------------------------------------------------
  // 9. Elementos Estruturais e UI dos Gráficos
  // ---------------------------------------------------------------------------
  ui: {
    grid: "#F0F4FA",
    label: "#0F2357",
    axis: "#6B7280",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "rgba(229, 231, 235, 0.5)",
  },
};

// Formatação de textos que vêm do banco em CAIXA ALTA ("INICIAL", "ANDAMENTO", ...).
// O banco continua guardando como está; só a exibição é padronizada.

const PALAVRAS_MINUSCULAS = new Set([
  "de", "da", "do", "das", "dos", "e", "em", "na", "no", "a", "o",
]);

// "INICIAL" -> "Inicial" | "AUDIÊNCIA DE CONCILIAÇÃO" -> "Audiência de Conciliação"
export function formatLabel(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text || text === "-" || text === "—") return text;

  return text
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, i) =>
      i > 0 && PALAVRAS_MINUSCULAS.has(palavra)
        ? palavra
        : palavra.charAt(0).toUpperCase() + palavra.slice(1)
    )
    .join(" ");
}

// "Lucas Pereira Silva" -> "Lucas P."  |  "LUCAS PEREIRA" -> "Lucas P."  |  "Lucas" -> "Lucas"
export function abreviarNome(nome) {
  if (!nome || !String(nome).trim()) return null;

  const texto = String(nome).trim();
  const normalizado = texto === texto.toUpperCase() ? formatLabel(texto) : texto;
  const partes = normalizado
    .split(/\s+/)
    .filter((p, i) => i === 0 || !PALAVRAS_MINUSCULAS.has(p.toLowerCase()));

  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1].charAt(0).toUpperCase()}.`;
}
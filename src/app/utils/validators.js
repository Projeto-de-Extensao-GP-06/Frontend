/**
 * Funções de validação de dados para formulários.
 * Mantém paridade com as regras de validação do Backend (DTO / Entities).
 */

/**
 * Validação de CNPJ (suporta numérico e alfanumérico padrão RFB).
 * Algoritmo Mod11 compatível com CpfCnpjValidator do backend.
 */
export function isValidCNPJ(value) {
  if (!value) return false;
  const stripped = String(value).toUpperCase().replace(/[.\-/]/g, "");

  if (stripped.length !== 14) return false;
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(stripped)) return false;

  // Rejeita sequências com todos os caracteres iguais
  if (/^(.)\1+$/.test(stripped)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Dígito '0'-'9' => 0..9, Letra 'A'-'Z' => 17..42 (c.charCodeAt(0) - 48)
  const getCharVal = (ch) => ch.charCodeAt(0) - 48;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += getCharVal(stripped[i]) * weights1[i];
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (firstDigit !== Number(stripped[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += getCharVal(stripped[i]) * weights2[i];
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return secondDigit === Number(stripped[13]);
}

/**
 * Validação de formato de e-mail.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Validação de telefone brasileiro (DDD + 8 ou 9 dígitos).
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  // Telefone fixo (10 dígitos) ou celular (11 dígitos)
  if (digits.length !== 10 && digits.length !== 11) return false;

  // Rejeita sequências repetidas (ex: 0000000000 ou 99999999999)
  if (/^(.)\1+$/.test(digits)) return false;

  // DDD válido no Brasil (de 11 a 99)
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;

  return true;
}

/**
 * Validação de número de processo CNJ (opcional).
 * Se preenchido, deve conter 20 dígitos numéricos.
 */
export function isValidCNJ(cnj) {
  if (!cnj) return true;
  const digits = cnj.replace(/\D/g, "");
  if (digits.length === 0) return true;
  return digits.length === 20;
}

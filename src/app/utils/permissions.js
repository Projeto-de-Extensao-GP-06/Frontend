export const PERMISSIONS = {
  CRIAR_PROCESSO: "CRIAR PROCESSO",
  EDITAR_PROCESSO: "EDITAR PROCESSO",
  EXCLUIR_PROCESSO: "EXCLUIR PROCESSO",
  ACEITAR_SOLICITACAO: "ACEITAR SOLICITAÇÃO",
  NEGAR_SOLICITACAO: "NEGAR SOLICITAÇÃO",
  CRIAR_CLIENTE: "CRIAR CLIENTE",
  EDITAR_CLIENTE: "EDITAR CLIENTE",
  EXCLUIR_CLIENTE: "EXCLUIR CLIENTE",
  CRIAR_CARGO: "CRIAR CARGO",
  EDITAR_CARGO: "EDITAR CARGO",
  EXCLUIR_CARGO: "EXCLUIR CARGO",
  CRIAR_USUARIO: "CRIAR USUÁRIO",
  EDITAR_USUARIO: "EDITAR USUÁRIO",
  EXCLUIR_USUARIO: "EXCLUIR USUÁRIO",
  CRIAR_DOCUMENTO: "CRIAR DOCUMENTO",
  EDITAR_DOCUMENTO: "EDITAR DOCUMENTO",
  EXCLUIR_DOCUMENTO: "EXCLUIR DOCUMENTO",
  TODAS_AS_PERMISSOES: "TODAS AS PERMISSÕES",
  SEM_PERMISSOES: "SEM PERMISSÕES",
};

const ALL_PERMISSIONS = PERMISSIONS.TODAS_AS_PERMISSOES;
const NO_PERMISSIONS = PERMISSIONS.SEM_PERMISSOES;

export const USER_MODULE_PERMISSIONS = [
  PERMISSIONS.CRIAR_USUARIO,
  PERMISSIONS.EDITAR_USUARIO,
  PERMISSIONS.EXCLUIR_USUARIO,
];

export const ROLE_MODULE_PERMISSIONS = [
  PERMISSIONS.CRIAR_CARGO,
  PERMISSIONS.EDITAR_CARGO,
  PERMISSIONS.EXCLUIR_CARGO,
];

export function normalizePermission(permission) {
  const raw =
    typeof permission === "object" && permission !== null
      ? permission.nome || permission.name || ""
      : permission;
  return String(raw || "")
    .trim()
    .toLocaleUpperCase("pt-BR");
}

export function hasPermission(user, permission) {
  const permissions = Array.isArray(user?.permissoes) ? user.permissoes : [];
  const normalized = normalizePermission(permission);

  if (!normalized || normalized === NO_PERMISSIONS) {
    return false;
  }

  return permissions.some((item) => {
    const userPermission = normalizePermission(item);
    if (!userPermission || userPermission === NO_PERMISSIONS) return false;
    return userPermission === ALL_PERMISSIONS || userPermission === normalized;
  });
}

export function hasAnyPermission(user, permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.some((permission) => hasPermission(user, permission));
}

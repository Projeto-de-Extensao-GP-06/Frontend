const ALL_PERMISSIONS = "TODAS AS PERMISSÕES";

export function normalizePermission(permission) {
  return String(permission || "")
    .trim()
    .toLocaleUpperCase("pt-BR");
}

export function hasPermission(user, permission) {
  const permissions = Array.isArray(user?.permissoes) ? user.permissoes : [];
  const normalized = normalizePermission(permission);

  return permissions.some((item) => {
    const userPermission = normalizePermission(item);
    return userPermission === ALL_PERMISSIONS || userPermission === normalized;
  });
}

export function hasAnyPermission(user, permissions) {
  return permissions.some((permission) => hasPermission(user, permission));
}

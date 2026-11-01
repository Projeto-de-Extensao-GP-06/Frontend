import { useAuth } from "../contexts/AuthContext";
import { hasAnyPermission } from "../utils/permissions";
import AccessDeniedPage from "../pages/AccessDeniedPage";

export default function PermissionRoute({
  permissions = [],
  resourceName,
  children,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const allowed = hasAnyPermission(user, permissions);

  if (!allowed) {
    return <AccessDeniedPage resourceName={resourceName} />;
  }

  return children;
}

import { useAuth } from "@/contexts/AuthContext";
import { useCrmStore } from "@/store/crmStore";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";

interface PermissionGuardProps {
  /** The action key to check, e.g. "delete_leads", "export_data" */
  action?: string;
  /** The section key to check, e.g. "settings", "reports" */
  section?: string;
  /** What to render when the user has permission */
  children: ReactNode;
  /** Optional: render something else instead of hiding. Defaults to null */
  fallback?: ReactNode;
  /** If true, shows a disabled/locked version instead of hiding */
  showLocked?: boolean;
  /** Tooltip message shown when locked */
  lockMessage?: string;
}

/**
 * RBAC Permission Guard
 * Wraps a component and only renders it if the current user has
 * the required action or section permission.
 *
 * All hooks are called unconditionally to comply with React's rules.
 */
export function PermissionGuard({
  action,
  section,
  children,
  fallback = null,
  showLocked = false,
  lockMessage = "No tienes permiso para esta acción",
}: PermissionGuardProps) {
  // Always call hooks first — no conditional hooks
  const { isAdmin, user } = useAuth();
  const config = useCrmStore(state => state.config);

  // Admins always have full access
  if (isAdmin) return <>{children}</>;

  // Find the CRM user matching the current auth user
  const crmUser = (config?.users || []).find(
    u => u.email === user?.email || u.name === user?.email
  );

  // Get their stored permissions, or fall back to defaults
  const perms = crmUser ? (config?.userPermissions?.[crmUser.id] || null) : null;

  // Check the requested permission
  let hasPermission = false;

  if (action) {
    hasPermission = perms?.actions?.[action] ?? false;
  } else if (section) {
    hasPermission = perms?.sections?.[section] ?? false;
  } else {
    // No specific check requested, allow by default
    hasPermission = true;
  }

  if (hasPermission) return <>{children}</>;

  if (showLocked) {
    return (
      <div className="relative group inline-flex">
        <div className="opacity-40 pointer-events-none select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/90 border border-border/60 shadow-lg text-[10px] font-black text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            <Lock size={10} className="text-amber-500" />
            {lockMessage}
          </div>
        </div>
        <Lock size={10} className="absolute -top-1 -right-1 text-amber-500 bg-background rounded-full" />
      </div>
    );
  }

  return <>{fallback}</>;
}

/**
 * Hook to programmatically check permissions.
 * Returns { can: boolean, isAdmin: boolean }
 */
export function usePermission(action?: string, section?: string) {
  // Always call hooks unconditionally
  const { isAdmin, user } = useAuth();
  const config = useCrmStore(state => state.config);

  if (isAdmin) return { can: true, isAdmin: true };

  const crmUser = (config?.users || []).find(
    u => u.email === user?.email || u.name === user?.email
  );

  const perms = crmUser ? (config?.userPermissions?.[crmUser.id] || null) : null;

  let can = false;
  if (action) can = perms?.actions?.[action] ?? false;
  else if (section) can = perms?.sections?.[section] ?? false;
  else can = true;

  return { can, isAdmin: false };
}

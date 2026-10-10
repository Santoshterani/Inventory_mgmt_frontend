// Role constants mirror the backend `roles` table. Keep in sync with FR-08 / section 3.
export const ROLES = {
  ADMIN: 'ADMIN',
  BASE_COMMANDER: 'BASE_COMMANDER',
  LOGISTICS_OFFICER: 'LOGISTICS_OFFICER',
};

// Screen-level visibility rules used only to hide navigation (section 3.5: this is
// NOT a security boundary — the backend re-checks every request).
const SCREEN_ACCESS = {
  dashboard: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  inventory: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  purchases: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  transfers: [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER],
  assignments: [ROLES.ADMIN, ROLES.BASE_COMMANDER],
  expenditures: [ROLES.ADMIN, ROLES.BASE_COMMANDER],
  users: [ROLES.ADMIN, ROLES.BASE_COMMANDER], //only admin can create users, but base commander can view users
  bases: [ROLES.ADMIN],
  equipmentTypes: [ROLES.ADMIN],
  auditLogs: [ROLES.ADMIN],
};

export function canAccessScreen(role, screenKey) {
  if (!role) return false;
  const allowed = SCREEN_ACCESS[screenKey];
  return Array.isArray(allowed) && allowed.includes(role);
}

// FR-08 / section 3.4: Admin creation is always allowed; Base Commander creation is a
// configurable, project-approved permission. `user.canCreateUsers` should come from
// GET /api/auth/me so the flag lives on the backend, not hardcoded here.
export function canCreateUsers(user) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.BASE_COMMANDER) return Boolean(user.canCreateUsers);
  return false;
}

export function canManageAssignmentsAndExpenditures(role) {
  return role === ROLES.ADMIN || role === ROLES.BASE_COMMANDER;
}

export function canManagePurchasesAndTransfers(role) {
  return [ROLES.ADMIN, ROLES.BASE_COMMANDER, ROLES.LOGISTICS_OFFICER].includes(role);
}

export function isBaseScoped(role) {
  return role === ROLES.BASE_COMMANDER || role === ROLES.LOGISTICS_OFFICER;
}

export function roleLabel(role) {
  switch (role) {
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.BASE_COMMANDER:
      return 'Base Commander';
    case ROLES.LOGISTICS_OFFICER:
      return 'Logistics Officer';
    default:
      return role || '—';
  }
}

import { StaffMember, StaffRole } from '../types';

export const ROLE_HIERARCHY_ORDER: Record<StaffRole, number> = {
  'Owner': 1,
  'Co-Owner': 2,
  'Manager': 3,
  'Senior Admin': 4,
  'Admin': 5,
  'Junior Admin': 6,
  'Developer': 7,
  'Senior Moderator': 8,
  'Moderator': 9,
  'Junior Moderator': 10,
  'Helper': 11,
  'Staff': 12,
};

export const getRoleRank = (role: string): number => {
  return ROLE_HIERARCHY_ORDER[role as StaffRole] ?? 99;
};

/**
 * Sorts staff members strictly by role hierarchy order (Owner -> Co-Owner -> Manager ... -> Staff).
 * Keeps relative order of staff within the same role tier.
 */
export const sortStaffByHierarchy = (list: StaffMember[]): StaffMember[] => {
  return [...list].sort((a, b) => {
    const rankA = getRoleRank(a.role);
    const rankB = getRoleRank(b.role);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return 0; // retain current index order within same role tier
  });
};

/**
 * Moves a staff member UP within their own role tier.
 * Cannot move above members of a higher role rank.
 */
export const moveStaffUp = (list: StaffMember[], staffId: string): StaffMember[] => {
  const sorted = sortStaffByHierarchy(list);
  const target = sorted.find((s) => s.id === staffId);
  if (!target) return sorted;

  // Find all indices of staff members in the same role
  const sameRoleIndices = sorted
    .map((s, idx) => (s.role === target.role ? idx : -1))
    .filter((idx) => idx !== -1);

  const targetIdxInSorted = sorted.findIndex((s) => s.id === staffId);
  const posInGroup = sameRoleIndices.indexOf(targetIdxInSorted);

  // If already at top of its same-role tier, do nothing
  if (posInGroup <= 0) return sorted;

  // Swap with the previous item in the same role tier
  const currentIdx = sameRoleIndices[posInGroup];
  const prevIdx = sameRoleIndices[posInGroup - 1];

  const result = [...sorted];
  const temp = result[currentIdx];
  result[currentIdx] = result[prevIdx];
  result[prevIdx] = temp;

  return result;
};

/**
 * Moves a staff member DOWN within their own role tier.
 * Cannot move below members of a lower role rank.
 */
export const moveStaffDown = (list: StaffMember[], staffId: string): StaffMember[] => {
  const sorted = sortStaffByHierarchy(list);
  const target = sorted.find((s) => s.id === staffId);
  if (!target) return sorted;

  // Find all indices of staff members in the same role
  const sameRoleIndices = sorted
    .map((s, idx) => (s.role === target.role ? idx : -1))
    .filter((idx) => idx !== -1);

  const targetIdxInSorted = sorted.findIndex((s) => s.id === staffId);
  const posInGroup = sameRoleIndices.indexOf(targetIdxInSorted);

  // If already at bottom of its same-role tier, do nothing
  if (posInGroup === -1 || posInGroup >= sameRoleIndices.length - 1) return sorted;

  // Swap with the next item in the same role tier
  const currentIdx = sameRoleIndices[posInGroup];
  const nextIdx = sameRoleIndices[posInGroup + 1];

  const result = [...sorted];
  const temp = result[currentIdx];
  result[currentIdx] = result[nextIdx];
  result[nextIdx] = temp;

  return result;
};

/**
 * Checks if a staff member can be moved up in their tier.
 */
export const canMoveUpInTier = (list: StaffMember[], staffId: string): boolean => {
  const sorted = sortStaffByHierarchy(list);
  const target = sorted.find((s) => s.id === staffId);
  if (!target) return false;

  const sameRoleIndices = sorted
    .map((s, idx) => (s.role === target.role ? idx : -1))
    .filter((idx) => idx !== -1);

  const targetIdxInSorted = sorted.findIndex((s) => s.id === staffId);
  const posInGroup = sameRoleIndices.indexOf(targetIdxInSorted);

  return posInGroup > 0;
};

/**
 * Checks if a staff member can be moved down in their tier.
 */
export const canMoveDownInTier = (list: StaffMember[], staffId: string): boolean => {
  const sorted = sortStaffByHierarchy(list);
  const target = sorted.find((s) => s.id === staffId);
  if (!target) return false;

  const sameRoleIndices = sorted
    .map((s, idx) => (s.role === target.role ? idx : -1))
    .filter((idx) => idx !== -1);

  const targetIdxInSorted = sorted.findIndex((s) => s.id === staffId);
  const posInGroup = sameRoleIndices.indexOf(targetIdxInSorted);

  return posInGroup !== -1 && posInGroup < sameRoleIndices.length - 1;
};

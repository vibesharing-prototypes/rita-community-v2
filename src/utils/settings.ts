import type { AppRole, SettingsUser } from "../types/settings.js";

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  systemAdministrator: "System administrator",
  boardAdmin: "Board admin",
  boardMember: "Board member",
  boardStaff: "Board staff",
  policyAdmin: "Policy admin",
  libraryAdmin: "Library admin",
};

export function userBelongsToCommittee(
  user: Pick<SettingsUser, "committees">,
  committeeName: string,
): boolean {
  return (
    user.committees.includes("All committees") ||
    user.committees.some((c) => c.toLowerCase() === committeeName.toLowerCase())
  );
}

export function formatUserDisplayName(user: {
  firstName: string;
  middleInitial?: string;
  lastName: string;
}): string {
  const middle = user.middleInitial?.trim();
  return [user.firstName, middle, user.lastName].filter(Boolean).join(" ");
}

export function formatMeetingReleaseDays(days: number): string {
  if (days < 0) return "No gate";
  if (days === 0) return "Same day";
  if (days === 1) return "1 day before";
  return `${days} days before`;
}

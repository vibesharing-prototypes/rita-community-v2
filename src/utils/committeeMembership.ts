import { normalizeCommittee } from "./committeeSettings.js";
import { userBelongsToCommittee } from "./settings.js";
import type {
  CommitteeAccessRoleKey,
  SettingsCommittee,
  SettingsUser,
} from "../types/settings.js";

export const ALL_COMMITTEES_LABEL = "All committees";

const DEFAULT_ROLE_ON_ADD: CommitteeAccessRoleKey = "administrator";

export function isAllCommitteesUser(user: Pick<SettingsUser, "committees">): boolean {
  return user.committees.includes(ALL_COMMITTEES_LABEL);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function countCommitteeMembers(committeeName: string, users: SettingsUser[]): number {
  return users.filter((user) => userBelongsToCommittee(user, committeeName)).length;
}

export function recalculateMemberCounts(
  committees: SettingsCommittee[],
  users: SettingsUser[],
): SettingsCommittee[] {
  return committees.map((committee) => ({
    ...committee,
    memberCount: countCommitteeMembers(committee.name, users),
  }));
}

function removeUserIdFromAccess(
  userAccess: SettingsCommittee["userAccess"],
  userId: string,
): SettingsCommittee["userAccess"] {
  const next = { ...userAccess };
  for (const role of Object.keys(next) as CommitteeAccessRoleKey[]) {
    next[role] = next[role].filter((id) => id !== userId);
  }
  return next;
}

function addUserIdToRoles(
  userAccess: SettingsCommittee["userAccess"],
  userId: string,
  roles: CommitteeAccessRoleKey[],
): SettingsCommittee["userAccess"] {
  const next = removeUserIdFromAccess(userAccess, userId);
  const rolesToApply = roles.length > 0 ? roles : [DEFAULT_ROLE_ON_ADD];
  for (const role of rolesToApply) {
    if (!next[role].includes(userId)) {
      next[role] = [...next[role], userId];
    }
  }
  return next;
}

function findCommitteeByName(
  committees: SettingsCommittee[],
  name: string,
): SettingsCommittee | undefined {
  return committees.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export type MembershipUpdateResult = {
  users: SettingsUser[];
  committees: SettingsCommittee[];
};

export function setUserCommitteeMembership(
  users: SettingsUser[],
  committees: SettingsCommittee[],
  userId: string,
  committeeNames: string[],
): MembershipUpdateResult {
  const user = users.find((item) => item.id === userId);
  if (!user || isAllCommitteesUser(user)) {
    return { users, committees };
  }

  const previous = new Set(user.committees);
  const nextNames = new Set(committeeNames);

  let nextCommittees = committees.map((committee) => ({
    ...committee,
    userAccess: { ...committee.userAccess },
  }));

  for (const committee of committees) {
    const wasMember = previous.has(committee.name);
    const isMember = nextNames.has(committee.name);
    if (!wasMember && isMember) {
      nextCommittees = nextCommittees.map((item) =>
        item.id === committee.id
          ? {
              ...item,
              userAccess: addUserIdToRoles(item.userAccess, userId, [DEFAULT_ROLE_ON_ADD]),
            }
          : item,
      );
    } else if (wasMember && !isMember) {
      nextCommittees = nextCommittees.map((item) =>
        item.id === committee.id
          ? { ...item, userAccess: removeUserIdFromAccess(item.userAccess, userId) }
          : item,
      );
    }
  }

  const nextUsers = users.map((item) =>
    item.id === userId
      ? { ...item, committees: committeeNames, lastModifiedDate: todayIsoDate() }
      : item,
  );

  return {
    users: nextUsers,
    committees: recalculateMemberCounts(nextCommittees, nextUsers),
  };
}

export function addUsersToCommittee(
  users: SettingsUser[],
  committees: SettingsCommittee[],
  committeeName: string,
  userIds: string[],
  roles: CommitteeAccessRoleKey[] = [DEFAULT_ROLE_ON_ADD],
): MembershipUpdateResult {
  const committee = findCommitteeByName(committees, committeeName);
  if (!committee || userIds.length === 0) {
    return { users, committees };
  }

  let nextCommittees = committees.map((item) =>
    item.id === committee.id
      ? {
          ...item,
          userAccess: userIds.reduce(
            (access, userId) => addUserIdToRoles(access, userId, roles),
            { ...item.userAccess },
          ),
        }
      : item,
  );

  const nextUsers = users.map((user) => {
    if (!userIds.includes(user.id) || isAllCommitteesUser(user)) return user;
    if (user.committees.includes(committeeName)) return user;
    return {
      ...user,
      committees: [...user.committees, committeeName],
      lastModifiedDate: todayIsoDate(),
    };
  });

  return {
    users: nextUsers,
    committees: recalculateMemberCounts(nextCommittees, nextUsers),
  };
}

export function removeUserFromCommittee(
  users: SettingsUser[],
  committees: SettingsCommittee[],
  committeeName: string,
  userId: string,
): MembershipUpdateResult {
  const committee = findCommitteeByName(committees, committeeName);
  const user = users.find((item) => item.id === userId);
  if (!committee || !user || isAllCommitteesUser(user)) {
    return { users, committees };
  }

  const nextCommittees = committees.map((item) =>
    item.id === committee.id
      ? { ...item, userAccess: removeUserIdFromAccess(item.userAccess, userId) }
      : item,
  );

  const nextUsers = users.map((item) =>
    item.id === userId
      ? {
          ...item,
          committees: item.committees.filter((name) => name !== committeeName),
          lastModifiedDate: todayIsoDate(),
        }
      : item,
  );

  return {
    users: nextUsers,
    committees: recalculateMemberCounts(nextCommittees, nextUsers),
  };
}

export function normalizeCommitteesList(committees: SettingsCommittee[]): SettingsCommittee[] {
  return committees.map((committee) => normalizeCommittee(committee));
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import settingsCommitteesData from "../data/settingsCommittees.json";
import settingsUsersData from "../data/settingsUsers.json";
import type { CommitteeAccessRoleKey, SettingsCommittee, SettingsUser } from "../types/settings.js";
import {
  addUsersToCommittee,
  normalizeCommitteesList,
  recalculateMemberCounts,
  removeUserFromCommittee,
  setUserCommitteeMembership,
} from "../utils/committeeMembership.js";

type SettingsDataState = {
  users: SettingsUser[];
  committees: SettingsCommittee[];
};

type SettingsDataContextValue = SettingsDataState & {
  committeeNames: string[];
  setUsers: React.Dispatch<React.SetStateAction<SettingsUser[]>>;
  updateUser: (userId: string, patch: Partial<SettingsUser>) => void;
  setUserCommittees: (userId: string, committeeNames: string[]) => void;
  addMembersToCommittee: (
    committeeName: string,
    userIds: string[],
    roles?: CommitteeAccessRoleKey[],
  ) => void;
  removeMemberFromCommittee: (committeeName: string, userId: string) => void;
  patchCommittee: (committeeId: string, patch: Partial<SettingsCommittee>) => void;
  getCommitteeById: (id: string) => SettingsCommittee | undefined;
};

const SettingsDataContext = createContext<SettingsDataContextValue | null>(null);

function buildInitialState(): SettingsDataState {
  const users = settingsUsersData.items as SettingsUser[];
  const committees = normalizeCommitteesList(settingsCommitteesData.items as SettingsCommittee[]);
  return {
    users,
    committees: recalculateMemberCounts(committees, users),
  };
}

export function SettingsDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<SettingsDataState>(buildInitialState);

  const applyMembershipUpdate = useCallback(
    (
      updater: (currentUsers: SettingsUser[], currentCommittees: SettingsCommittee[]) => {
        users: SettingsUser[];
        committees: SettingsCommittee[];
      },
    ) => {
      setData((prev) => {
        const result = updater(prev.users, prev.committees);
        return { users: result.users, committees: result.committees };
      });
    },
    [],
  );

  const setUsers = useCallback((action: React.SetStateAction<SettingsUser[]>) => {
    setData((prev) => {
      const nextUsers = typeof action === "function" ? action(prev.users) : action;
      return {
        users: nextUsers,
        committees: recalculateMemberCounts(prev.committees, nextUsers),
      };
    });
  }, []);

  const updateUser = useCallback((userId: string, patch: Partial<SettingsUser>) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...patch } : user)));
  }, [setUsers]);

  const setUserCommittees = useCallback(
    (userId: string, committeeNames: string[]) => {
      applyMembershipUpdate((users, committees) =>
        setUserCommitteeMembership(users, committees, userId, committeeNames),
      );
    },
    [applyMembershipUpdate],
  );

  const addMembersToCommittee = useCallback(
    (committeeName: string, userIds: string[], roles?: CommitteeAccessRoleKey[]) => {
      applyMembershipUpdate((users, committees) =>
        addUsersToCommittee(users, committees, committeeName, userIds, roles),
      );
    },
    [applyMembershipUpdate],
  );

  const removeMemberFromCommittee = useCallback(
    (committeeName: string, userId: string) => {
      applyMembershipUpdate((users, committees) =>
        removeUserFromCommittee(users, committees, committeeName, userId),
      );
    },
    [applyMembershipUpdate],
  );

  const patchCommittee = useCallback((committeeId: string, patch: Partial<SettingsCommittee>) => {
    setData((prev) => ({
      ...prev,
      committees: prev.committees.map((committee) =>
        committee.id === committeeId ? { ...committee, ...patch } : committee,
      ),
    }));
  }, []);

  const getCommitteeById = useCallback(
    (id: string) => data.committees.find((committee) => committee.id === id),
    [data.committees],
  );

  const committeeNames = useMemo(
    () => data.committees.map((committee) => committee.name),
    [data.committees],
  );

  const value = useMemo(
    () => ({
      users: data.users,
      committees: data.committees,
      committeeNames,
      setUsers,
      updateUser,
      setUserCommittees,
      addMembersToCommittee,
      removeMemberFromCommittee,
      patchCommittee,
      getCommitteeById,
    }),
    [
      data.users,
      data.committees,
      committeeNames,
      setUsers,
      updateUser,
      setUserCommittees,
      addMembersToCommittee,
      removeMemberFromCommittee,
      patchCommittee,
      getCommitteeById,
    ],
  );

  return <SettingsDataContext.Provider value={value}>{children}</SettingsDataContext.Provider>;
}

export function useSettingsData(): SettingsDataContextValue {
  const context = useContext(SettingsDataContext);
  if (!context) {
    throw new Error("useSettingsData must be used within SettingsDataProvider");
  }
  return context;
}

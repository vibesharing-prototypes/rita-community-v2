/** Community V2 application roles (BoardDocs RBAC mapping). */
export type AppRole =
  | "systemAdministrator"
  | "boardAdmin"
  | "boardMember"
  | "boardStaff"
  | "policyAdmin"
  | "libraryAdmin";

export type UserStatus = "Active" | "Inactive";

export interface SettingsUser {
  id: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  username: string;
  /** Display name derived from name parts. */
  name: string;
  email: string;
  appRole: AppRole;
  committees: string[];
  status: UserStatus;
  lastModifiedDate: string;
}

export type SettingsUserFormValues = Pick<
  SettingsUser,
  "firstName" | "middleInitial" | "lastName" | "username" | "email"
> & {
  password: string;
  confirmPassword: string;
};

export type CommitteeGroupType = "committee" | "advisoryGroup" | "workingGroup" | "other";
export type CommitteeVisibility = "private" | "public";

export type CommitteeAccessRoleKey =
  | "superPublisher"
  | "publisher"
  | "executive"
  | "votingBoard"
  | "administratorsExecutive"
  | "administrator"
  | "moderator";

export interface CommitteeEmailNotifications {
  meetingPublished: boolean;
  agendaPublished: boolean;
  agendaItemUpdated: boolean;
  minutesPublished: boolean;
  workflowReminder: boolean;
}

export type AgendaMeetingSecurity = "public" | "private";
export type AgendaStyle = "detailed" | "summary" | "simple";
export type AgendaNumberingStyle = "decimalPadded" | "decimal" | "roman";

export type AgendaItemTypeKey =
  | "action"
  | "actionConsent"
  | "discussion"
  | "information"
  | "minutes"
  | "procedural";

export interface CommitteeAgendaSettings {
  defaultMeetingSecurity: AgendaMeetingSecurity;
  agendaStyle: AgendaStyle;
  defaultNumbering: AgendaNumberingStyle;
  agendaItemTypes: AgendaItemTypeKey[];
  showMotionToPublicBeforeAction: boolean;
  goalTrackingEnabled: boolean;
  administrativeContentEnabled: boolean;
  executiveContentEnabled: boolean;
  showConsentParagraph: boolean;
  consentParagraphText: string;
  publicTemplate: string;
}

export type RequireApproval = "forAllItems" | "none" | "selectedItems";
export type DefaultAgendaItemAccess = "public" | "private";

export interface CommitteeWorkflowSettings {
  requireApproval: RequireApproval;
  allowAdminViewDraftItems: boolean;
  allowAdminSubmitItems: boolean;
  allowExecutiveViewDraftItems: boolean;
  defaultAgendaItemAccess: DefaultAgendaItemAccess;
  allowSubmitterSetPublic: boolean;
  historyShowToPublic: boolean;
  historyShowToAdmin: boolean;
  historyShowToExecutive: boolean;
}

export type VotingMode = "manual" | "electronic" | "disabled";

export interface CommitteeTimerPreset {
  minutes: number;
  seconds: number;
}

export interface CommitteeMeetingControlSettings {
  votingMode: VotingMode;
  voteLabels: {
    yea: string;
    nay: string;
    abstain: string;
    notPresentAtVote: string;
  };
  actionLabels: {
    unanimous: string;
    motionCarries: string;
    motionFails: string;
  };
  includeOriginalResolutionForConsent: boolean;
  timerPresets: [CommitteeTimerPreset, CommitteeTimerPreset, CommitteeTimerPreset];
}

export type CommitteeSettingsTab =
  | "setup"
  | "userAccess"
  | "email"
  | "agenda"
  | "workflow"
  | "members"
  | "meetingControl";

export interface SettingsCommittee {
  id: string;
  name: string;
  memberCount: number;
  /** Days before meeting date public users can see it; -1 disables the gate. */
  meetingReleaseDays: number;
  allowAdminViewDraftItems: boolean;
  allowExecViewDraft: boolean;
  allowAdminSubmitItems: boolean;
  groupType: CommitteeGroupType;
  visibility: CommitteeVisibility;
  userAccess: Record<CommitteeAccessRoleKey, string[]>;
  emailNotifications: CommitteeEmailNotifications;
  agenda: CommitteeAgendaSettings;
  workflow: CommitteeWorkflowSettings;
  meetingControl: CommitteeMeetingControlSettings;
  lastModifiedDate: string;
}

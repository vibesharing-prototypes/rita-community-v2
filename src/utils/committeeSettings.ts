import type {
  AgendaItemTypeKey,
  AgendaMeetingSecurity,
  AgendaNumberingStyle,
  AgendaStyle,
  CommitteeAccessRoleKey,
  CommitteeAgendaSettings,
  CommitteeEmailNotifications,
  CommitteeGroupType,
  CommitteeVisibility,
  CommitteeMeetingControlSettings,
  CommitteeWorkflowSettings,
  DefaultAgendaItemAccess,
  RequireApproval,
  SettingsCommittee,
  VotingMode,
} from "../types/settings.js";

export const COMMITTEE_GROUP_TYPES: { value: CommitteeGroupType; label: string }[] = [
  { value: "committee", label: "Committee" },
  { value: "advisoryGroup", label: "Advisory group" },
  { value: "workingGroup", label: "Working group" },
  { value: "other", label: "Other" },
];

export const COMMITTEE_VISIBILITY_OPTIONS: { value: CommitteeVisibility; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

export const COMMITTEE_ACCESS_ROLES: { key: CommitteeAccessRoleKey; label: string; description?: string }[] = [
  { key: "superPublisher", label: "SuperPublisher", description: "Org-wide administrators for this committee" },
  { key: "publisher", label: "Publisher" },
  { key: "executive", label: "Executive" },
  { key: "votingBoard", label: "Voting board", description: "Executive with voting rights" },
  {
    key: "administratorsExecutive",
    label: "Administrators (executives)",
    description: "Board staff with executive-tier read access",
  },
  { key: "administrator", label: "Administrator" },
  { key: "moderator", label: "Moderator", description: "Meeting control panel and minutes" },
];

export const DEFAULT_EMAIL_NOTIFICATIONS: CommitteeEmailNotifications = {
  meetingPublished: true,
  agendaPublished: true,
  agendaItemUpdated: false,
  minutesPublished: true,
  workflowReminder: true,
};

export const PUBLIC_RELEASE_OPTIONS: { value: number; label: string }[] = [
  { value: -1, label: "No public release gate" },
  { value: 0, label: "On the meeting date" },
  { value: 1, label: "1 day before the meeting" },
  { value: 2, label: "2 days before the meeting" },
  { value: 3, label: "3 days before the meeting" },
  { value: 4, label: "4 days before the meeting" },
  { value: 5, label: "5 days before the meeting" },
  { value: 7, label: "7 days before the meeting" },
  { value: 14, label: "14 days before the meeting" },
];

export const AGENDA_MEETING_SECURITY_OPTIONS: { value: AgendaMeetingSecurity; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export const AGENDA_STYLE_OPTIONS: { value: AgendaStyle; label: string }[] = [
  { value: "detailed", label: "Detailed" },
  { value: "summary", label: "Summary" },
  { value: "simple", label: "Simple" },
];

export const AGENDA_NUMBERING_OPTIONS: { value: AgendaNumberingStyle; label: string }[] = [
  { value: "decimalPadded", label: "1.01, 2.02, 3.03" },
  { value: "decimal", label: "1, 2, 3" },
  { value: "roman", label: "I, II, III" },
];

export const AGENDA_ITEM_TYPE_OPTIONS: { value: AgendaItemTypeKey; label: string }[] = [
  { value: "action", label: "Action" },
  { value: "actionConsent", label: "Action (Consent)" },
  { value: "discussion", label: "Discussion" },
  { value: "information", label: "Information" },
  { value: "minutes", label: "Minutes" },
  { value: "procedural", label: "Procedural" },
];

export const DEFAULT_AGENDA_ITEM_TYPES: AgendaItemTypeKey[] = AGENDA_ITEM_TYPE_OPTIONS.map(
  (o) => o.value,
);

export const YES_NO_OPTIONS: { value: boolean; label: string }[] = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const REQUIRE_APPROVAL_OPTIONS: { value: RequireApproval; label: string }[] = [
  { value: "forAllItems", label: "For All Items" },
  { value: "selectedItems", label: "For Selected Items" },
  { value: "none", label: "None" },
];

export const DEFAULT_AGENDA_ITEM_ACCESS_OPTIONS: { value: DefaultAgendaItemAccess; label: string }[] =
  [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

export const VOTING_MODE_OPTIONS: { value: VotingMode; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "electronic", label: "Electronic" },
  { value: "disabled", label: "Disabled" },
];

export const DEFAULT_MEETING_CONTROL_SETTINGS: CommitteeMeetingControlSettings = {
  votingMode: "manual",
  voteLabels: {
    yea: "Yea",
    nay: "Nay",
    abstain: "Abstain",
    notPresentAtVote: "Not Present at Vote",
  },
  actionLabels: {
    unanimous: "Unanimous",
    motionCarries: "Motion Carries",
    motionFails: "Motion Fails",
  },
  includeOriginalResolutionForConsent: true,
  timerPresets: [
    { minutes: 5, seconds: 0 },
    { minutes: 10, seconds: 0 },
    { minutes: 15, seconds: 0 },
  ],
};

export const DEFAULT_WORKFLOW_SETTINGS: CommitteeWorkflowSettings = {
  requireApproval: "forAllItems",
  allowAdminViewDraftItems: true,
  allowAdminSubmitItems: true,
  allowExecutiveViewDraftItems: true,
  defaultAgendaItemAccess: "public",
  allowSubmitterSetPublic: true,
  historyShowToPublic: false,
  historyShowToAdmin: true,
  historyShowToExecutive: true,
};

export function buildWorkflowSettings(committee: SettingsCommittee): CommitteeWorkflowSettings {
  return {
    ...DEFAULT_WORKFLOW_SETTINGS,
    ...committee.workflow,
    allowAdminViewDraftItems:
      committee.workflow?.allowAdminViewDraftItems ?? committee.allowAdminViewDraftItems,
    allowAdminSubmitItems:
      committee.workflow?.allowAdminSubmitItems ?? committee.allowAdminSubmitItems,
    allowExecutiveViewDraftItems:
      committee.workflow?.allowExecutiveViewDraftItems ?? committee.allowExecViewDraft,
  };
}

export function syncWorkflowToCommitteeFlags(
  workflow: CommitteeWorkflowSettings,
): Pick<
  SettingsCommittee,
  "allowAdminViewDraftItems" | "allowExecViewDraft" | "allowAdminSubmitItems" | "workflow"
> {
  return {
    workflow,
    allowAdminViewDraftItems: workflow.allowAdminViewDraftItems,
    allowExecViewDraft: workflow.allowExecutiveViewDraftItems,
    allowAdminSubmitItems: workflow.allowAdminSubmitItems,
  };
}

export const DEFAULT_AGENDA_SETTINGS: CommitteeAgendaSettings = {
  defaultMeetingSecurity: "public",
  agendaStyle: "detailed",
  defaultNumbering: "decimalPadded",
  agendaItemTypes: [...DEFAULT_AGENDA_ITEM_TYPES],
  showMotionToPublicBeforeAction: true,
  goalTrackingEnabled: true,
  administrativeContentEnabled: true,
  executiveContentEnabled: true,
  showConsentParagraph: true,
  consentParagraphText: "",
  publicTemplate: "",
};

export function createDefaultUserAccess(): Record<CommitteeAccessRoleKey, string[]> {
  return {
    superPublisher: [],
    publisher: [],
    executive: [],
    votingBoard: [],
    administratorsExecutive: [],
    administrator: [],
    moderator: [],
  };
}

export function normalizeCommittee(committee: SettingsCommittee): SettingsCommittee {
  const workflow = buildWorkflowSettings(committee);
  return {
    ...committee,
    groupType: committee.groupType ?? "committee",
    visibility: committee.visibility ?? "private",
    userAccess: { ...createDefaultUserAccess(), ...committee.userAccess },
    emailNotifications: { ...DEFAULT_EMAIL_NOTIFICATIONS, ...committee.emailNotifications },
    agenda: {
      ...DEFAULT_AGENDA_SETTINGS,
      ...committee.agenda,
      agendaItemTypes: committee.agenda?.agendaItemTypes?.length
        ? committee.agenda.agendaItemTypes
        : DEFAULT_AGENDA_ITEM_TYPES,
    },
    ...syncWorkflowToCommitteeFlags(workflow),
    meetingControl: {
      ...DEFAULT_MEETING_CONTROL_SETTINGS,
      ...committee.meetingControl,
      voteLabels: {
        ...DEFAULT_MEETING_CONTROL_SETTINGS.voteLabels,
        ...committee.meetingControl?.voteLabels,
      },
      actionLabels: {
        ...DEFAULT_MEETING_CONTROL_SETTINGS.actionLabels,
        ...committee.meetingControl?.actionLabels,
      },
      timerPresets: committee.meetingControl?.timerPresets?.length === 3
        ? committee.meetingControl.timerPresets
        : DEFAULT_MEETING_CONTROL_SETTINGS.timerPresets,
    },
  };
}

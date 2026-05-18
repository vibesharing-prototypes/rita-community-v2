import { useSyncExternalStore } from "react";

import meetingsData from "../data/meetings.json";
import type { Meeting, MeetingTemplate } from "../types/meetings";

type State = {
  meetings: Meeting[];
  templates: MeetingTemplate[];
};

let state: State = {
  meetings: meetingsData.meetings as Meeting[],
  templates: meetingsData.templates as MeetingTemplate[],
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const committees = meetingsData.committees as string[];

export function getMeetings() {
  return state.meetings;
}

export function getTemplates() {
  return state.templates;
}

export function setMeetings(updater: Meeting[] | ((prev: Meeting[]) => Meeting[])) {
  const next = typeof updater === "function" ? (updater as (p: Meeting[]) => Meeting[])(state.meetings) : updater;
  state = { ...state, meetings: next };
  emit();
}

export function setTemplates(updater: MeetingTemplate[] | ((prev: MeetingTemplate[]) => MeetingTemplate[])) {
  const next = typeof updater === "function" ? (updater as (p: MeetingTemplate[]) => MeetingTemplate[])(state.templates) : updater;
  state = { ...state, templates: next };
  emit();
}

export function useMeetings() {
  return useSyncExternalStore(subscribe, getMeetings, getMeetings);
}

export function useTemplates() {
  return useSyncExternalStore(subscribe, getTemplates, getTemplates);
}

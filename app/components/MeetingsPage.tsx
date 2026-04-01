"use client";

import { useState, useRef, useEffect } from "react";

// ── Icon primitive (matches AppShell) ───────────────────────────────
function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none shrink-0 ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ── Types ───────────────────────────────────────────────────────────

type MeetingStatus = "Draft" | "Published";
type MeetingVisibility = "Public" | "Internal";
type AgendaStatus = "Not Published" | "Published" | "Out of Sync";
type TemplateStatus = "Active" | "Archived";

type Meeting = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  committee: string;
  status: MeetingStatus;
  visibility: MeetingVisibility;
  agendaStatus: AgendaStatus;
  agendaCategories: number;
  agendaItems: number;
  membersOnly: boolean;
  publicRTS: boolean;
  description?: string;
  videoUrl?: string;
  showVideo?: boolean;
  templateId?: string;
};

type MeetingTemplate = {
  id: string;
  name: string;
  committee: string;
  time?: string;
  location?: string;
  status: TemplateStatus;
  meetingsCreated: number;
  membersOnly: boolean;
  publicRTS: boolean;
};

type MeetingTab = "upcoming" | "previous" | "templates";
type DetailView = { meetingId: string } | null;

// ── Sample data ─────────────────────────────────────────────────────

const SAMPLE_MEETINGS: Meeting[] = [
  { id: "m1", name: "Regular Board Meeting", date: "2026-04-15", time: "6:00 PM", location: "District Office · Board Room", committee: "Regular Board", status: "Draft", visibility: "Public", agendaStatus: "Not Published", agendaCategories: 3, agendaItems: 12, membersOnly: false, publicRTS: true, templateId: "t1" },
  { id: "m2", name: "Finance Committee", date: "2026-04-22", time: "5:30 PM", location: "District Office · Room 204", committee: "Finance", status: "Published", visibility: "Internal", agendaStatus: "Published", agendaCategories: 2, agendaItems: 8, membersOnly: false, publicRTS: false, templateId: "t2" },
  { id: "m3", name: "Special Board Meeting", date: "2026-05-03", time: "4:00 PM", location: "Superintendent's Conference Room", committee: "Regular Board", status: "Draft", visibility: "Internal", agendaStatus: "Not Published", agendaCategories: 0, agendaItems: 0, membersOnly: true, publicRTS: false },
  { id: "m4", name: "Audit & Risk Review", date: "2026-05-14", time: "3:00 PM", location: "District Office · Room 101", committee: "Audit", status: "Published", visibility: "Public", agendaStatus: "Out of Sync", agendaCategories: 4, agendaItems: 15, membersOnly: false, publicRTS: false, templateId: "t3" },
  { id: "m5", name: "Budget Workshop", date: "2026-05-20", time: "9:00 AM", location: "District Office · Board Room", committee: "Finance", status: "Draft", visibility: "Public", agendaStatus: "Not Published", agendaCategories: 1, agendaItems: 3, membersOnly: false, publicRTS: true },
  // Previous meetings
  { id: "m6", name: "Regular Board Meeting", date: "2026-03-18", time: "6:00 PM", location: "District Office · Board Room", committee: "Regular Board", status: "Published", visibility: "Public", agendaStatus: "Published", agendaCategories: 5, agendaItems: 18, membersOnly: false, publicRTS: true, templateId: "t1" },
  { id: "m7", name: "Audit Committee", date: "2026-03-10", time: "3:00 PM", location: "District Office · Room 101", committee: "Audit", status: "Published", visibility: "Internal", agendaStatus: "Published", agendaCategories: 3, agendaItems: 10, membersOnly: false, publicRTS: false, templateId: "t3" },
  { id: "m8", name: "Finance Committee", date: "2026-02-25", time: "5:30 PM", location: "District Office · Room 204", committee: "Finance", status: "Published", visibility: "Internal", agendaStatus: "Published", agendaCategories: 2, agendaItems: 7, membersOnly: false, publicRTS: false, templateId: "t2" },
  { id: "m9", name: "Regular Board Meeting", date: "2026-02-17", time: "6:00 PM", location: "District Office · Board Room", committee: "Regular Board", status: "Published", visibility: "Public", agendaStatus: "Published", agendaCategories: 4, agendaItems: 14, membersOnly: false, publicRTS: true, templateId: "t1" },
  { id: "m10", name: "Special Board Meeting", date: "2026-01-22", time: "4:00 PM", location: "District Office · Board Room", committee: "Regular Board", status: "Published", visibility: "Public", agendaStatus: "Published", agendaCategories: 2, agendaItems: 6, membersOnly: true, publicRTS: false },
  { id: "m11", name: "Regular Board Meeting", date: "2025-12-16", time: "6:00 PM", location: "District Office · Board Room", committee: "Regular Board", status: "Published", visibility: "Public", agendaStatus: "Published", agendaCategories: 5, agendaItems: 20, membersOnly: false, publicRTS: true, templateId: "t1" },
  { id: "m12", name: "Finance Committee", date: "2025-11-19", time: "5:30 PM", location: "District Office · Room 204", committee: "Finance", status: "Published", visibility: "Internal", agendaStatus: "Published", agendaCategories: 2, agendaItems: 9, membersOnly: false, publicRTS: false, templateId: "t2" },
  { id: "m13", name: "Regular Board Meeting", date: "2025-10-21", time: "6:00 PM", location: "District Office · Board Room", committee: "Regular Board", status: "Published", visibility: "Public", agendaStatus: "Published", agendaCategories: 4, agendaItems: 16, membersOnly: false, publicRTS: true, templateId: "t1" },
  { id: "m14", name: "Audit & Risk Review", date: "2025-09-10", time: "3:00 PM", location: "District Office · Room 101", committee: "Audit", status: "Published", visibility: "Internal", agendaStatus: "Published", agendaCategories: 3, agendaItems: 11, membersOnly: false, publicRTS: false, templateId: "t3" },
  { id: "m15", name: "Budget Workshop", date: "2025-08-13", time: "9:00 AM", location: "District Office · Board Room", committee: "Finance", status: "Published", visibility: "Public", agendaStatus: "Published", agendaCategories: 2, agendaItems: 5, membersOnly: false, publicRTS: true },
];

const SAMPLE_TEMPLATES: MeetingTemplate[] = [
  { id: "t1", name: "Regular Board Meeting", committee: "Regular Board", time: "6:00 PM", location: "District Office · Board Room", status: "Active", meetingsCreated: 24, membersOnly: false, publicRTS: true },
  { id: "t2", name: "Finance Committee", committee: "Finance", time: "5:30 PM", location: "District Office · Room 204", status: "Active", meetingsCreated: 12, membersOnly: false, publicRTS: false },
  { id: "t3", name: "Audit & Risk Review", committee: "Audit", time: "3:00 PM", location: "District Office · Room 101", status: "Active", meetingsCreated: 8, membersOnly: false, publicRTS: false },
  { id: "t4", name: "Special Session", committee: "Regular Board", time: undefined, location: undefined, status: "Archived", meetingsCreated: 3, membersOnly: true, publicRTS: false },
];

const COMMITTEES = ["Regular Board", "Finance", "Audit"];

// ── Helpers ──────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function getYear(dateStr: string): number {
  return parseInt(dateStr.substring(0, 4));
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T12:00:00");
  return d >= today;
}

// ── Status badge ─────────────────────────────────────────────────────

function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const styles: Record<MeetingStatus, { bg: string; text: string }> = {
    Draft: { bg: "#F3F3F3", text: "#515255" },
    Published: { bg: "#E4F3FF", text: "#004C6C" },
  };
  const s = styles[status];
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function VisibilityBadge({ visibility }: { visibility: MeetingVisibility }) {
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap border"
      style={{
        background: "transparent",
        color: "var(--type-muted)",
        borderColor: "var(--outline-static)",
      }}
    >
      {visibility}
    </span>
  );
}

function AgendaStatusBadge({ status }: { status: AgendaStatus }) {
  const styles: Record<AgendaStatus, { bg: string; text: string }> = {
    "Not Published": { bg: "var(--status-neutral-bg-variant)", text: "var(--status-neutral-content-variant)" },
    Published: { bg: "var(--status-notification-bg-variant)", text: "var(--status-notification-content-variant)" },
    "Out of Sync": { bg: "var(--status-error-bg-variant)", text: "var(--status-error-content-variant)" },
  };
  const s = styles[status];
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const styles: Record<TemplateStatus, { bg: string; text: string }> = {
    Active: { bg: "var(--status-success-bg-variant)", text: "var(--status-success-content-variant)" },
    Archived: { bg: "var(--status-neutral-bg-variant)", text: "var(--status-neutral-content-variant)" },
  };
  const s = styles[status];
  return (
    <span
      className="text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

// ── Overflow menu ────────────────────────────────────────────────────

function OverflowMenu({
  items,
}: {
  items: { label: string; icon: string; danger?: boolean; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-type-muted hover:bg-selection-hover hover:text-type transition-colors"
        aria-label="More actions"
      >
        <Icon name="more_vert" size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-surface border border-outline-static rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                item.danger
                  ? "text-action-destructive-secondary-default hover:bg-status-error-bg-variant"
                  : "text-type hover:bg-selection-hover"
              }`}
            >
              <Icon name={item.icon} size={16} className={item.danger ? "" : "text-type-muted"} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modal backdrop ───────────────────────────────────────────────────

function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" style={{ background: "var(--background-backdrop)" }} onClick={onClose}>
      <div className={`bg-surface rounded-2xl shadow-2xl w-full ${width} max-h-[80vh] flex flex-col overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-static shrink-0">
          <h2 className="text-base font-semibold text-type">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-type-muted hover:bg-selection-hover hover:text-type transition-colors">
            <Icon name="close" size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Form field ───────────────────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-type">
        {label}
        {required && <span className="text-action-form-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm text-type bg-surface border border-action-form-outline rounded-lg focus:outline-none focus:border-action-form-outline-selected focus:ring-1 focus:ring-action-form-outline-selected transition-colors placeholder:text-type-disabled"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm text-type bg-surface border border-action-form-outline rounded-lg focus:outline-none focus:border-action-form-outline-selected focus:ring-1 focus:ring-action-form-outline-selected transition-colors appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%235D5E61' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <div className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-action-primary" : "bg-action-secondary-variant"}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-type">{label}</span>
    </button>
  );
}

// ── Segmented toggle (pill group) ────────────────────────────────────

function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-outline-static overflow-hidden self-start">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            value === opt
              ? "text-action-primary-on-primary"
              : "bg-surface text-type hover:bg-selection-hover"
          }`}
          style={value === opt ? { background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" } : undefined}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Creation modal ───────────────────────────────────────────────────

function TemplatePickerModal({
  open,
  onClose,
  templates,
  onSelectTemplate,
}: {
  open: boolean;
  onClose: () => void;
  templates: MeetingTemplate[];
  onSelectTemplate: (templateId: string) => void;
}) {
  const activeTemplates = templates.filter((t) => t.status === "Active");

  return (
    <Modal open={open} onClose={onClose} title="New meeting">
      <div className="px-6 pt-4 pb-5">
        <p className="text-sm text-type-muted">To add a new meeting, first select a template.</p>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-2">
        {activeTemplates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => { onSelectTemplate(tmpl.id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-static text-left hover:bg-selection-hover transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-selection flex items-center justify-center shrink-0">
              <Icon name="description" size={16} className="text-action-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-type truncate">{tmpl.name}</p>
              <p className="text-xs text-type-muted">{tmpl.committee}{tmpl.time ? ` · ${tmpl.time}` : ""}</p>
            </div>
            <Icon name="chevron_right" size={16} className="text-type-disabled shrink-0" />
          </button>
        ))}

        {/* From scratch option */}
        <button
          onClick={() => { onSelectTemplate(""); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-static text-left hover:bg-selection-hover transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
            <Icon name="add" size={16} className="text-type-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-type">Start from scratch</p>
            <p className="text-xs text-type-muted">Create a blank meeting without a template</p>
          </div>
        </button>
      </div>
    </Modal>
  );
}

// ── Create meeting page (full-page form) ─────────────────────────────

function CreateMeetingPage({
  template,
  onBack,
  onCreateMeeting,
}: {
  template: MeetingTemplate | null;
  onBack: () => void;
  onCreateMeeting: (meeting: Meeting) => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(template?.time || "");
  const [location, setLocation] = useState(template?.location || "");
  const [committee, setCommittee] = useState(template?.committee || "");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<MeetingVisibility>("Public");
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCreate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name is required.");
    if (!date) errs.push("Date is required.");
    if (!committee) errs.push("Committee is required.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const newMeeting: Meeting = {
      id: `m-new-${Date.now()}`,
      name: name.trim(),
      date,
      time: time || undefined,
      location: location || undefined,
      committee,
      status: "Draft",
      visibility: access,
      agendaStatus: "Not Published",
      agendaCategories: 0,
      agendaItems: 0,
      membersOnly: template?.membersOnly ?? false,
      publicRTS: template?.publicRTS ?? false,
      description: description || undefined,
      videoUrl: videoUrl || undefined,
      showVideo,
      templateId: template?.id,
    };
    onCreateMeeting(newMeeting);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
      {/* Back link */}
      <div className="px-8 pt-6 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-action-primary hover:underline">
          <Icon name="arrow_back" size={16} />
          Meetings
        </button>
      </div>

      {/* Title */}
      <div className="px-8 pb-6">
        <h1 className="text-2xl font-semibold text-type tracking-tight">Draft Meeting</h1>
        {template && (
          <p className="text-sm text-type-muted mt-1">
            Template: {template.name} · {template.committee}
          </p>
        )}
      </div>

      {/* Form */}
      <div className="px-8 pb-8 max-w-2xl">
        {errors.length > 0 && (
          <div className="rounded-lg px-3 py-2.5 text-sm mb-5" style={{ background: "var(--status-error-bg-variant)", color: "var(--status-error-content-variant)" }}>
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Committee — only shown when no template */}
          {!template && (
            <FormField label="Committee" required>
              <SelectInput
                value={committee}
                onChange={setCommittee}
                placeholder="Select committee"
                options={COMMITTEES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
          )}

          {/* Name */}
          <FormField label="Name" required>
            <TextInput value={name} onChange={setName} placeholder="Meeting name" />
          </FormField>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <TextInput type="date" value={date} onChange={setDate} />
            </FormField>
            <FormField label="Time">
              <TextInput value={time} onChange={setTime} placeholder="e.g. 6:00 PM" />
            </FormField>
          </div>

          {/* Location */}
          <FormField label="Location">
            <TextInput value={location} onChange={setLocation} placeholder="e.g. District Office · Board Room" />
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting description..."
              rows={4}
              className="w-full px-3 py-2 text-sm text-type bg-surface border border-action-form-outline rounded-lg focus:outline-none focus:border-action-form-outline-selected focus:ring-1 focus:ring-action-form-outline-selected transition-colors placeholder:text-type-disabled resize-y"
            />
          </FormField>

          {/* Access */}
          <FormField label="Access">
            <SelectInput
              value={access}
              onChange={(v) => setAccess(v as MeetingVisibility)}
              options={[
                { value: "Public", label: "Public" },
                { value: "Internal", label: "Internal" },
              ]}
            />
          </FormField>

          {/* Meeting link */}
          <FormField label="Meeting link">
            <TextInput value={videoUrl} onChange={setVideoUrl} placeholder="Enter the meeting link here" />
          </FormField>
          <ToggleSwitch checked={showVideo} onChange={setShowVideo} label="Show meeting link button" />
        </div>
      </div>
    </div>

      {/* Fixed footer */}
      <div className="shrink-0 border-t border-outline-static bg-surface">
        <div className="flex items-center justify-between max-w-2xl px-8 py-4">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-semibold text-action-secondary-on-secondary rounded-xl border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 text-sm font-semibold text-action-primary-on-primary rounded-xl transition-colors"
            style={{ background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" }}
          >
            Create Draft
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Duplicate meeting modal ──────────────────────────────────────────

function DuplicateMeetingModal({
  open,
  onClose,
  sourceMeeting,
  onDuplicate,
}: {
  open: boolean;
  onClose: () => void;
  sourceMeeting: Meeting | null;
  onDuplicate: (meeting: Meeting) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCommittee, setNewCommittee] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open && sourceMeeting) {
      setNewName(sourceMeeting.name);
      setNewDate("");
      setNewCommittee(sourceMeeting.committee);
      setSubmitted(false);
    }
  }, [open, sourceMeeting]);

  if (!sourceMeeting) return null;

  const handleDuplicate = () => {
    if (!newDate || submitted) return;
    setSubmitted(true);
    const dup: Meeting = {
      ...sourceMeeting,
      id: `m-dup-${Date.now()}`,
      name: newName,
      date: newDate,
      committee: newCommittee,
      status: "Draft",
      visibility: "Internal",
      agendaStatus: "Not Published",
    };
    onDuplicate(dup);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Duplicate Meeting">
      <div className="p-6 flex flex-col gap-5">
        <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: "var(--status-notification-bg-variant)", color: "var(--status-notification-content-variant)" }}>
          Source: {formatDate(sourceMeeting.date)} — {sourceMeeting.name}
        </div>

        <FormField label="New name" required>
          <TextInput value={newName} onChange={setNewName} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="New date" required>
            <TextInput type="date" value={newDate} onChange={setNewDate} />
          </FormField>
          <FormField label="Target committee" required>
            <SelectInput
              value={newCommittee}
              onChange={setNewCommittee}
              options={COMMITTEES.map((c) => ({ value: c, label: c }))}
            />
          </FormField>
        </div>

        {/* Agenda items checklist */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-type">Agenda items to include</p>
          <div className="rounded-lg border border-outline-static p-3 flex flex-col gap-1.5 text-sm text-type">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-action-form-outline text-action-primary focus:ring-action-primary" />
              1. Call to Order
            </label>
            <label className="flex items-center gap-2 cursor-pointer pl-5">
              <input type="checkbox" defaultChecked className="rounded border-action-form-outline text-action-primary focus:ring-action-primary" />
              A. Roll Call
            </label>
            <label className="flex items-center gap-2 cursor-pointer pl-5">
              <input type="checkbox" defaultChecked className="rounded border-action-form-outline text-action-primary focus:ring-action-primary" />
              B. Pledge
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-action-form-outline text-action-primary focus:ring-action-primary" />
              2. Public Comments
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-action-form-outline text-action-primary focus:ring-action-primary" />
              3. Consent Agenda
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-type">
          <input type="checkbox" className="rounded border-action-form-outline text-action-primary focus:ring-action-primary" />
          Include attachments
        </label>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-static -mx-6 px-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-action-secondary-on-secondary rounded-xl border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!newDate || submitted}
            className="px-5 py-2 text-sm font-semibold text-action-primary-on-primary rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" }}
          >
            Duplicate
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Confirmation dialog ──────────────────────────────────────────────

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" style={{ background: "var(--background-backdrop)" }} onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col gap-3">
          <h3 className="text-base font-semibold text-type">{title}</h3>
          <p className="text-sm text-type-muted leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-action-secondary-on-secondary rounded-xl border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-5 py-2 text-sm font-semibold rounded-xl transition-colors"
            style={
              danger
                ? { background: "linear-gradient(to right, var(--action-destructive-default-gradient-start), var(--action-destructive-default-gradient-end))", color: "var(--action-destructive-on-destructive)" }
                : { background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))", color: "var(--action-primary-on-primary)" }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Meeting detail view ──────────────────────────────────────────────

function MeetingDetailView({
  meeting,
  onBack,
  onUpdateMeeting,
}: {
  meeting: Meeting;
  onBack: () => void;
  onUpdateMeeting: (updated: Meeting) => void;
}) {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [inlineErrors, setInlineErrors] = useState<string[]>([]);

  const handlePublish = () => {
    // Validate
    const errs: string[] = [];
    if (!meeting.date) errs.push("Meeting date is required.");
    if (errs.length > 0) {
      setInlineErrors(errs);
      return;
    }
    setInlineErrors([]);
    onUpdateMeeting({ ...meeting, status: "Published" });
  };

  const handleUnpublish = () => {
    const pastDate = new Date(meeting.date + "T12:00:00") < new Date();
    if (pastDate) {
      setShowUnpublishConfirm(true);
    } else {
      onUpdateMeeting({ ...meeting, status: "Draft" });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Back link */}
      <div className="px-8 pt-6 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-action-primary hover:underline">
          <Icon name="arrow_back" size={16} />
          Meetings
        </button>
      </div>

      {/* Header */}
      <div className="px-8 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-type tracking-tight mb-1">{meeting.name}</h1>
            <div className="flex items-center gap-2 text-sm text-type-muted">
              <span>{formatDateLong(meeting.date)}</span>
              {meeting.time && <><span>·</span><span>{meeting.time}</span></>}
              {meeting.location && <><span>·</span><span>{meeting.location}</span></>}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <MeetingStatusBadge status={meeting.status} />
            {meeting.status === "Draft" && (
              <button
                onClick={handlePublish}
                className="px-4 py-2 text-sm font-semibold text-action-primary-on-primary rounded-xl transition-colors"
                style={{ background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" }}
              >
                Publish
              </button>
            )}
            {meeting.status === "Published" && (
              <button
                onClick={handleUnpublish}
                className="px-4 py-2 text-sm font-semibold text-action-secondary-on-secondary rounded-xl border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors"
              >
                Unpublish
              </button>
            )}
          </div>
        </div>

        {/* Inline errors */}
        {inlineErrors.length > 0 && (
          <div className="mt-3 rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--status-error-bg-variant)", color: "var(--status-error-content-variant)" }}>
            {inlineErrors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="px-8 pb-8 flex flex-col gap-0">
        {/* AGENDA */}
        <div className="border border-outline-static rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-type uppercase tracking-wide">Agenda</h2>
              <AgendaStatusBadge status={meeting.agendaStatus} />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold text-action-secondary-on-secondary rounded-lg border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
                {meeting.status === "Draft" ? "Edit Agenda" : "View"}
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-action-secondary-on-secondary rounded-lg border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
                Share
              </button>
              {meeting.status === "Draft" && (
                <button className="px-3 py-1.5 text-xs font-semibold text-action-primary-on-primary rounded-lg transition-colors" style={{ background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" }}>
                  Publish
                </button>
              )}
            </div>
          </div>
          <div className="px-5 pb-4 text-sm text-type-muted">
            {meeting.agendaCategories} categories · {meeting.agendaItems} items
          </div>
        </div>

        {/* MINUTES */}
        <div className="border border-outline-static border-t-0 rounded-b-xl -mt-[1px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-semibold text-type uppercase tracking-wide">Minutes</h2>
            <button className="px-3 py-1.5 text-xs font-semibold text-action-secondary-on-secondary rounded-lg border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
              Edit Minutes
            </button>
          </div>
          <div className="px-5 pb-4 text-sm text-type-muted">
            Status: None
          </div>
        </div>

        {/* VIDEO */}
        <div className="border border-outline-static border-t-0 rounded-b-xl -mt-[1px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-semibold text-type uppercase tracking-wide">Video</h2>
            <button className="px-3 py-1.5 text-xs font-semibold text-action-secondary-on-secondary rounded-lg border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
              Add Broadcast Link
            </button>
          </div>
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={handlePublish}
        title="Publish Meeting"
        message="This will make the meeting visible to all users. Continue?"
        confirmLabel="Publish"
      />
      <ConfirmDialog
        open={showUnpublishConfirm}
        onClose={() => setShowUnpublishConfirm(false)}
        onConfirm={() => onUpdateMeeting({ ...meeting, status: "Draft" })}
        title="Unpublish Meeting"
        message="This meeting date has passed. Unpublishing will hide it from public view. Continue?"
        confirmLabel="Unpublish"
        danger
      />
    </div>
  );
}

// ── Main MeetingsPage ────────────────────────────────────────────────

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(SAMPLE_MEETINGS);
  const [templates] = useState<MeetingTemplate[]>(SAMPLE_TEMPLATES);
  const [activeTab, setActiveTab] = useState<MeetingTab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  // Applied filters
  const [statusFilter, setStatusFilter] = useState<"All" | MeetingStatus>("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"All" | MeetingVisibility>("All");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  // Draft filters (pending Apply)
  const [draftStatus, setDraftStatus] = useState<"All" | MeetingStatus>("All");
  const [draftVisibility, setDraftVisibility] = useState<"All" | MeetingVisibility>("All");
  const [draftCommittee, setDraftCommittee] = useState("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Meeting | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [createView, setCreateView] = useState<{ templateId: string } | null>(null);

  // Year accordion for Previous tab
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set([2026]));

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  // Count active filters
  const activeFilterCount = [
    committeeFilter !== "",
    statusFilter !== "All",
    visibilityFilter !== "All",
    startDateFilter !== "",
    endDateFilter !== "",
  ].filter(Boolean).length;

  // Open panel: sync draft to applied
  const openFilterPanel = () => {
    setDraftStatus(statusFilter);
    setDraftVisibility(visibilityFilter);
    setDraftCommittee(committeeFilter);
    setDraftStartDate(startDateFilter);
    setDraftEndDate(endDateFilter);
    setFilterPanelOpen(true);
  };

  const applyFilters = () => {
    setStatusFilter(draftStatus);
    setVisibilityFilter(draftVisibility);
    setCommitteeFilter(draftCommittee);
    setStartDateFilter(draftStartDate);
    setEndDateFilter(draftEndDate);
    setFilterPanelOpen(false);
  };

  const clearAllFilters = () => {
    setDraftStatus("All");
    setDraftVisibility("All");
    setDraftCommittee("");
    setDraftStartDate("");
    setDraftEndDate("");
  };

  // Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "All" && m.status !== statusFilter) return false;
    if (visibilityFilter !== "All" && m.visibility !== visibilityFilter) return false;
    if (committeeFilter && m.committee !== committeeFilter) return false;
    if (startDateFilter && m.date < startDateFilter) return false;
    if (endDateFilter && m.date > endDateFilter) return false;
    return true;
  });

  const upcomingMeetings = filteredMeetings
    .filter((m) => isUpcoming(m.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  const previousMeetings = filteredMeetings
    .filter((m) => !isUpcoming(m.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group previous by year
  const previousByYear = previousMeetings.reduce<Record<number, Meeting[]>>((acc, m) => {
    const year = getYear(m.date);
    if (!acc[year]) acc[year] = [];
    acc[year].push(m);
    return acc;
  }, {});
  const previousYears = Object.keys(previousByYear).map(Number).sort((a, b) => b - a);

  // CRUD handlers
  const handleSelectTemplate = (templateId: string) => {
    setCreateView({ templateId });
  };

  const handleCreateMeeting = (meeting: Meeting) => {
    setMeetings((prev) => [meeting, ...prev]);
    setCreateView(null);
    setDetailView({ meetingId: meeting.id });
  };

  const handleDuplicateMeeting = (meeting: Meeting) => {
    setMeetings((prev) => [meeting, ...prev]);
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    setDeleteTarget(meeting);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setMeetings((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleUpdateMeeting = (updated: Meeting) => {
    setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // If create view is active
  if (createView) {
    const tmpl = createView.templateId
      ? templates.find((t) => t.id === createView.templateId) ?? null
      : null;
    return (
      <CreateMeetingPage
        template={tmpl}
        onBack={() => setCreateView(null)}
        onCreateMeeting={handleCreateMeeting}
      />
    );
  }

  // If detail view is active
  if (detailView) {
    const meeting = meetings.find((m) => m.id === detailView.meetingId);
    if (meeting) {
      return (
        <MeetingDetailView
          meeting={meeting}
          onBack={() => setDetailView(null)}
          onUpdateMeeting={handleUpdateMeeting}
        />
      );
    }
  }

  const tabs: { id: MeetingTab; label: string }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "previous", label: "Previous" },
    { id: "templates", label: "Templates" },
  ];

  const visibleTemplates = showArchived ? templates : templates.filter((t) => t.status === "Active");

  return (
    <div className="flex flex-col h-full">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-6 pb-0">
        <h1 className="text-2xl font-semibold text-type tracking-tight mb-5">Meetings</h1>

        {/* ── Tab bar + search/filter toolbar (Books-style) ─────── */}
        <div className="border-b border-outline-static">
          <div className="flex items-end justify-between gap-4">
            {/* Tabs */}
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-action-primary"
                      : "text-type-muted hover:text-type"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "var(--action-primary-default)" }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search + Sort + Filter row ─────────────────────────── */}
        <div className="flex items-end gap-4 py-4">
          {/* Search — labeled */}
          <div className="flex flex-col gap-1.5 flex-1 max-w-[340px]">
            <label className="text-xs font-medium text-type-muted">Search</label>
            <div className="relative">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-type-disabled pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 text-sm text-type bg-surface border border-action-form-outline rounded-lg focus:outline-none focus:border-action-form-outline-selected focus:ring-1 focus:ring-action-form-outline-selected transition-colors placeholder:text-type-disabled"
              />
            </div>
          </div>

          {activeTab !== "templates" && (
            <>
              {/* Sort by — labeled */}
              <div className="flex flex-col gap-1.5 flex-1 max-w-[280px]">
                <label className="text-xs font-medium text-type-muted">Sort by</label>
                <SelectInput
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Meeting date ascending"
                  options={[
                    { value: "date-asc", label: "Meeting date ascending" },
                    { value: "date-desc", label: "Meeting date descending" },
                    { value: "name", label: "Name" },
                  ]}
                />
              </div>

              {/* Filter — tertiary button with active count */}
              <button
                onClick={openFilterPanel}
                className={`inline-flex items-center gap-2 px-3 py-2 mb-px text-sm font-medium rounded-lg transition-colors ${
                  activeFilterCount > 0
                    ? "text-action-primary"
                    : "text-type-muted hover:text-type"
                }`}
              >
                <Icon name="filter_list" size={18} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold text-action-primary-on-primary bg-action-primary leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </>
          )}

          {activeTab === "templates" && (
            <div className="mb-1">
              <ToggleSwitch checked={showArchived} onChange={setShowArchived} label="Show archived" />
            </div>
          )}

          {/* + New meeting button — always in toolbar */}
          <button
            onClick={() => setCreateOpen(true)}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-action-primary-on-primary transition-colors shrink-0 mb-px"
            style={{ background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" }}
          >
            <Icon name="add" size={18} className="text-action-primary-on-primary" />
            New meeting
          </button>
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* UPCOMING TAB */}
        {activeTab === "upcoming" && (
          <div className="flex flex-col">
            {upcomingMeetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-selection flex items-center justify-center mb-3">
                  <Icon name="calendar_month" size={24} className="text-action-primary" />
                </div>
                <p className="text-sm font-medium text-type mb-1">No upcoming meetings</p>
                <p className="text-xs text-type-muted">Create a new meeting to get started</p>
              </div>
            ) : (
              upcomingMeetings.map((m) => (
                <MeetingRow
                  key={m.id}
                  meeting={m}
                  onView={() => setDetailView({ meetingId: m.id })}
                  onPublish={() => handleUpdateMeeting({ ...m, status: "Published" })}
                  onUnpublish={() => handleUpdateMeeting({ ...m, status: "Draft" })}
                  onDuplicate={() => { setDuplicateSource(m); setDuplicateOpen(true); }}
                  onDelete={() => handleDeleteMeeting(m)}
                />
              ))
            )}
          </div>
        )}

        {/* PREVIOUS TAB */}
        {activeTab === "previous" && (
          <div className="flex flex-col gap-0">
            {previousYears.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-selection flex items-center justify-center mb-3">
                  <Icon name="history" size={24} className="text-action-primary" />
                </div>
                <p className="text-sm font-medium text-type">No previous meetings found</p>
              </div>
            ) : (
              previousYears.map((year) => (
                <div key={year}>
                  {/* Year accordion header */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full flex items-center gap-2 py-3 text-left group"
                  >
                    <Icon
                      name="expand_more"
                      size={18}
                      className={`text-type-muted transition-transform ${expandedYears.has(year) ? "" : "-rotate-90"}`}
                    />
                    <span className="text-sm font-semibold text-type">{year}</span>
                    <span className="text-xs text-type-muted">({previousByYear[year].length})</span>
                  </button>

                  {/* Year content */}
                  {expandedYears.has(year) && (
                    <div className="flex flex-col">
                      {previousByYear[year].map((m) => (
                        <MeetingRow
                          key={m.id}
                          meeting={m}
                          onView={() => setDetailView({ meetingId: m.id })}
                          onPublish={() => handleUpdateMeeting({ ...m, status: "Published" })}
                          onUnpublish={() => handleUpdateMeeting({ ...m, status: "Draft" })}
                          onDuplicate={() => { setDuplicateSource(m); setDuplicateOpen(true); }}
                          onDelete={() => handleDeleteMeeting(m)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <div className="flex flex-col">
            {visibleTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-selection flex items-center justify-center mb-3">
                  <Icon name="description" size={24} className="text-action-primary" />
                </div>
                <p className="text-sm font-medium text-type">No templates found</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="flex items-center gap-4 px-4 py-2.5 text-xs font-semibold text-type-muted uppercase tracking-wide border-b border-outline-static">
                  <span className="flex-1 min-w-0">Name</span>
                  <span className="w-32">Committee</span>
                  <span className="w-20 text-center">Time</span>
                  <span className="w-40">Location</span>
                  <span className="w-20 text-center">Status</span>
                  <span className="w-8" />
                </div>
                {visibleTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="flex items-center gap-4 px-4 py-3 border-b border-outline-static hover:bg-selection-hover transition-colors cursor-pointer"
                  >
                    <span className="flex-1 min-w-0 text-sm text-type font-medium truncate">{tmpl.name}</span>
                    <span className="w-32 text-sm text-type-muted truncate">{tmpl.committee}</span>
                    <span className="w-20 text-sm text-type-muted text-center">{tmpl.time || "—"}</span>
                    <span className="w-40 text-sm text-type-muted truncate">{tmpl.location || "—"}</span>
                    <span className="w-20 flex justify-center"><TemplateStatusBadge status={tmpl.status} /></span>
                    <OverflowMenu
                      items={[
                        { label: "Edit", icon: "edit", onClick: () => {} },
                        { label: "Create meeting", icon: "add_circle", onClick: () => { setCreateOpen(true); } },
                        { label: "Duplicate", icon: "content_copy", onClick: () => {} },
                        ...(tmpl.status === "Active"
                          ? [{ label: "Archive", icon: "archive", onClick: () => {} }]
                          : [{ label: "Unarchive", icon: "unarchive", onClick: () => {} }]
                        ),
                        ...(tmpl.meetingsCreated === 0
                          ? [{ label: "Delete", icon: "delete", danger: true as const, onClick: () => {} }]
                          : []
                        ),
                      ]}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Filter side panel ──────────────────────────────────────── */}
      {filterPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "var(--background-backdrop)" }} onClick={() => setFilterPanelOpen(false)}>
          <div
            className="w-[380px] h-full bg-surface flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0">
              <h2 className="text-lg font-semibold text-type">Filters</h2>
              <button
                onClick={() => setFilterPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-type-muted hover:bg-selection-hover hover:text-type transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
              {/* Committee */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-type">
                  Committee <span className="font-normal text-type-muted">(Required)</span>
                </label>
                <SelectInput
                  value={draftCommittee}
                  onChange={setDraftCommittee}
                  placeholder="All categories"
                  options={COMMITTEES.map((c) => ({ value: c, label: c }))}
                />
              </div>

              {/* Meeting state */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-type">Meeting state</label>
                <SegmentedToggle
                  options={["All", "Published", "Draft"]}
                  value={draftStatus}
                  onChange={(v) => setDraftStatus(v as "All" | MeetingStatus)}
                />
              </div>

              {/* Meeting visibility */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-type">Meeting visibility</label>
                <SegmentedToggle
                  options={["All", "Public", "Internal"]}
                  value={draftVisibility}
                  onChange={(v) => setDraftVisibility(v as "All" | MeetingVisibility)}
                />
              </div>

              {/* Date range */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-type-muted leading-relaxed">
                  Show events within the time frame you select below:
                </p>
                <FormField label="Start date">
                  <TextInput type="date" value={draftStartDate} onChange={setDraftStartDate} placeholder="MM/DD/YYYY" />
                </FormField>
                <FormField label="End date">
                  <TextInput type="date" value={draftEndDate} onChange={setDraftEndDate} placeholder="MM/DD/YYYY" />
                </FormField>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-outline-static">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm font-semibold text-action-secondary-on-secondary rounded-xl border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors"
              >
                Clear all
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterPanelOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-type-muted hover:text-type transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-5 py-2 text-sm font-semibold text-action-primary-on-primary rounded-xl transition-colors"
                  style={{ background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))" }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <TemplatePickerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />
      <DuplicateMeetingModal
        open={duplicateOpen}
        onClose={() => { setDuplicateOpen(false); setDuplicateSource(null); }}
        sourceMeeting={duplicateSource}
        onDuplicate={handleDuplicateMeeting}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete Meeting"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

// ── Meeting list row ─────────────────────────────────────────────────

function MeetingRow({
  meeting,
  onView,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
}: {
  meeting: Meeting;
  onView: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const overflowItems =
    meeting.status === "Draft"
      ? [
          { label: "Edit", icon: "edit", onClick: onView },
          { label: "Publish", icon: "publish", onClick: onPublish },
          { label: "Duplicate", icon: "content_copy", onClick: onDuplicate },
          { label: "Delete", icon: "delete", danger: true as const, onClick: onDelete },
        ]
      : [
          { label: "Edit", icon: "edit", onClick: onView },
          { label: "Unpublish", icon: "unpublished", onClick: onUnpublish },
          { label: "Duplicate", icon: "content_copy", onClick: onDuplicate },
          { label: "Delete", icon: "delete", danger: true as const, onClick: onDelete },
        ];

  return (
    <div
      onClick={onView}
      className="flex items-center gap-4 px-4 py-3.5 border-b border-outline-static hover:bg-selection-hover transition-colors cursor-pointer group"
    >
      {/* Left: title + date + badges */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-sm text-type font-medium truncate">{meeting.name}</span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Icon name="calendar_today" size={14} className="text-type-disabled" />
            <span className="text-xs text-type-muted">{formatDate(meeting.date)}</span>
          </div>
          <MeetingStatusBadge status={meeting.status} />
          <VisibilityBadge visibility={meeting.visibility} />
        </div>
      </div>

      {/* Overflow */}
      <OverflowMenu items={overflowItems} />
    </div>
  );
}

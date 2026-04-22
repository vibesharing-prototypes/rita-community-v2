export type AgendaItemType =
  | "Action"
  | "Action (Consent)"
  | "Minutes"
  | "Information"
  | "Discussion"
  | "Reports"
  | "Procedural"
  | "Presentation"
  | "Good News";

export type AgendaItemStatus = "Draft";

export type AgendaAttachment = {
  id: string;
  filename: string;
  tier: "public" | "staff" | "executive";
};

export type AgendaItem = {
  id: string;
  subject: string;
  categoryId: string;
  type: AgendaItemType[];
  status: AgendaItemStatus;
  publicContent: string;
  staffContent: string;
  executiveContent: string;
  attachments: {
    public: AgendaAttachment[];
    staff: AgendaAttachment[];
    executive: AgendaAttachment[];
  };
  lastModifiedBy?: string;
  lastModifiedAt?: string;
};

export type AgendaCategory = {
  id: string;
  name: string;
  order: number;
  items: AgendaItem[];
};

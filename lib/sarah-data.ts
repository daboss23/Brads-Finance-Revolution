export type LinkStatus = "not-sent" | "sent" | "opened" | "in-progress" | "completed";

export interface FactFindLink {
  clientId: string;
  clientName: string;
  email: string;
  token: string;
  status: LinkStatus;
  sentDate: string | null;
  openedDate: string | null;
  lastActivity: string | null;
  progress: number;
  adviser: string;
}

export const FACT_FIND_LINKS: FactFindLink[] = [
  {
    clientId: "sarah-mitchell",
    clientName: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    token: "sm-4x9b2f",
    status: "in-progress",
    sentDate: "17 May 2026",
    openedDate: "18 May 2026",
    lastActivity: "2 hours ago",
    progress: 85,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "james-fiona-carr",
    clientName: "James & Fiona Carr",
    email: "james.carr@email.com",
    token: "jfc-3d7a1e",
    status: "in-progress",
    sentDate: "12 May 2026",
    openedDate: "13 May 2026",
    lastActivity: "5 days ago",
    progress: 62,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "tony-nguyen",
    clientName: "Tony Nguyen",
    email: "tony.nguyen@email.com",
    token: "tn-8c5f2d",
    status: "completed",
    sentDate: "8 May 2026",
    openedDate: "9 May 2026",
    lastActivity: "1 day ago",
    progress: 100,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "helen-davies",
    clientName: "Helen Davies",
    email: "helen.davies@email.com",
    token: "hd-7b4e9a",
    status: "in-progress",
    sentDate: "11 May 2026",
    openedDate: "13 May 2026",
    lastActivity: "3 days ago",
    progress: 40,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "michael-kate-reynolds",
    clientName: "Michael & Kate Reynolds",
    email: "michael.reynolds@email.com",
    token: "mkr-2f6c8b",
    status: "sent",
    sentDate: "13 May 2026",
    openedDate: null,
    lastActivity: "6 days ago",
    progress: 15,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "david-okafor",
    clientName: "David Okafor",
    email: "d.okafor@email.com",
    token: "do-9a3d5f",
    status: "in-progress",
    sentDate: "9 May 2026",
    openedDate: "10 May 2026",
    lastActivity: "1 day ago",
    progress: 78,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "priya-sharma",
    clientName: "Priya Sharma",
    email: "priya.sharma@email.com",
    token: "ps-5e8b1c",
    status: "in-progress",
    sentDate: "11 May 2026",
    openedDate: "11 May 2026",
    lastActivity: "2 days ago",
    progress: 55,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "robert-sue-tanner",
    clientName: "Robert & Sue Tanner",
    email: "r.tanner@email.com",
    token: "rst-6d4f7a",
    status: "in-progress",
    sentDate: "5 May 2026",
    openedDate: "6 May 2026",
    lastActivity: "4 hours ago",
    progress: 92,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "luke-brennan",
    clientName: "Luke Brennan",
    email: "luke.brennan@email.com",
    token: "lb-1c9e3b",
    status: "sent",
    sentDate: "16 May 2026",
    openedDate: null,
    lastActivity: "3 days ago",
    progress: 0,
    adviser: "Brad Lonergan",
  },
  {
    clientId: "angela-forsyth",
    clientName: "Angela Forsyth",
    email: "angela.forsyth@email.com",
    token: "af-4b7d2e",
    status: "in-progress",
    sentDate: "7 May 2026",
    openedDate: "8 May 2026",
    lastActivity: "1 day ago",
    progress: 71,
    adviser: "Brad Lonergan",
  },
];

export const LINK_STATUS_CONFIG: Record<
  LinkStatus,
  { label: string; className: string }
> = {
  "not-sent": {
    label: "Not Sent",
    className: "bg-zinc-700/25 text-zinc-400 border-zinc-600/45",
  },
  sent: {
    label: "Link Sent",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/35",
  },
  opened: {
    label: "Opened",
    className: "bg-sky-500/15 text-sky-300 border-sky-500/35",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/35",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
  },
};

export function getLinkByToken(token: string): FactFindLink | undefined {
  return FACT_FIND_LINKS.find((l) => l.token === token);
}

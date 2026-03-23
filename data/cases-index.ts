export interface QueuedCase {
  id: string;
  num: string;
  title: string;
  description: string;
  year: string;
  score: number;
  tags: { label: string; type: string }[];
  status: string;
}

export const queuedCases: QueuedCase[] = [
  {
    id: "003",
    num: "003",
    title: "The Belgian Wave",
    description: "Multiple radar-confirmed triangular craft tracked by NATO F-16s over Belgium. Thousands of civilian witnesses. Belgian Air Force released official report.",
    year: "1989\u201390",
    score: 88,
    tags: [
      { label: "Military", type: "military" },
      { label: "Radar", type: "radar" },
      { label: "Mass", type: "mass" },
    ],
    status: "Queued",
  },
  {
    id: "004",
    num: "004",
    title: "Tehran F-4 Intercept",
    description: "Iranian F-4 Phantom jet weapons systems and communications disabled during approach. Object emitted secondary object. Declassified DIA report exists.",
    year: "1976",
    score: 85,
    tags: [
      { label: "Military", type: "military" },
      { label: "Radar", type: "radar" },
      { label: "Official", type: "official" },
    ],
    status: "Queued",
  },
  {
    id: "005",
    num: "005",
    title: "JAL Flight 1628",
    description: "Crew of 3 on a cargo 747 observed walnut-shaped craft for 31 minutes over Alaska. FAA radar confirmation. Captain grounded after speaking publicly.",
    year: "1986",
    score: 82,
    tags: [
      { label: "Witness", type: "witness" },
      { label: "Radar", type: "radar" },
      { label: "Official", type: "official" },
    ],
    status: "Queued",
  },
  {
    id: "006",
    num: "006",
    title: "USS Roosevelt Encounters",
    description: "Recurring objects tracked by carrier strike group off the US East Coast. Produced the GIMBAL and GOFAST videos. Multiple pilot witnesses including Ryan Graves.",
    year: "2014\u201315",
    score: 90,
    tags: [
      { label: "Military", type: "military" },
      { label: "Video", type: "video" },
      { label: "Witness", type: "witness" },
    ],
    status: "Queued",
  },
  {
    id: "007",
    num: "007",
    title: "Rendlesham Forest",
    description: "USAF personnel at RAF Woodbridge encounter craft on two consecutive nights. Physical trace evidence, radiation readings at landing site. Deputy base commander\u2019s audio memo recorded in real time.",
    year: "1980",
    score: 86,
    tags: [
      { label: "Military", type: "military" },
      { label: "Trace", type: "trace" },
      { label: "Witness", type: "witness" },
    ],
    status: "Queued",
  },
];

// IDs of cases that have workspace data files
export const casesWithData = new Set(["001"]);

export const sidebarCases = [
  { id: "001", label: "001 \u2014 USS Nimitz", status: "Active", href: "/case/001" },
  { id: "002", label: "002 \u2014 Phoenix Lights", status: "Active", href: "/case/002" },
  { id: "003", label: "003 \u2014 Belgian Wave", status: "Queue", href: "/case/003" },
  { id: "004", label: "004 \u2014 Tehran F-4", status: "Queue", href: "/case/004" },
  { id: "005", label: "005 \u2014 JAL 1628", status: "Queue", href: "/case/005" },
  { id: "006", label: "006 \u2014 USS Roosevelt", status: "Queue", href: "/case/006" },
  { id: "007", label: "007 \u2014 Rendlesham", status: "Queue", href: "/case/007" },
];

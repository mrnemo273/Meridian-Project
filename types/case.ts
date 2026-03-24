export interface TimelineEvent {
  date: string;
  title: string;
  detail: string | null;
  tags: { label: string; type: string }[];
  type: string;
  hasHighlight?: string;
}

export interface EvidenceCard {
  typeLabel: string;
  badge: string;
  badgeClass: string;
  cardType: string;
  title: string;
  summary: string;
  linkText: string;
  image?: string;
  imageAlt?: string;
}

export interface WitnessCard {
  initials: string;
  name: string;
  rank: string;
  observed: string;
  quote: string | null;
  quoteSource: string | null;
  image?: string;
  imageAlt?: string;
}

export interface AIAnalysisCard {
  aiType: string;
  title: string;
  finding: string;
  confidence: string;
  confidenceClass: string;
}

export interface OpenQuestion {
  num: string;
  text: string;
  context: string;
}

export interface ResolutionItem {
  status: string;
  label: string;
  detail: string;
}

export interface OSINTItem {
  field: string;
  status: string;
  value: string;
  source: string;
}

export interface ChainItem {
  num: number;
  source: string;
  note: string;
  strength: string;
  strengthLabel: string;
}

export interface SearchResult {
  type: string;
  source: string;
  title: string;
  snippet: string;
}

export interface SolvabilityFactor {
  name: string;
  score: string;
  type: string;
}

export interface NextStep {
  priority: string;
  text: string;
}

export interface ACHEvidenceRow {
  evidence: string;
  ai: string[];
}

export interface InvestigationTask {
  id: string;
  type: "image" | "video" | "document" | "audio" | "data";
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "completed" | "blocked";
  title: string;
  description: string;
  source_url: string | null;
  license: string;
  attribution: string;
  save_to: string;
  file_names: string[];
  notes: string;
  completed_by?: string;
  completed_date?: string;
}

export interface GalleryItem {
  id: string;
  type: "image" | "video" | "document" | "map";
  src: string;
  thumbnail?: string;
  title: string;
  caption: string;
  attribution: string;
  license: string;
  category: "flir" | "sensor" | "witness" | "document" | "map" | "reference" | "analysis";
  relatedEvidence?: string;
  relatedWitness?: string;
}

export interface CaseWorkspaceData {
  // Case metadata
  id: string;
  caseNumber: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  duration: string;
  credibilityScore: number;
  credibilityTier: string;
  status: string;
  tags: string[];

  // Hero image
  heroImage?: string;
  heroImageAlt?: string;
  heroImageAttribution?: string;

  // Workspace content
  timeline: TimelineEvent[];
  evidence: EvidenceCard[];
  witnesses: WitnessCard[];
  aiAnalysis: AIAnalysisCard[];
  openQuestions: OpenQuestion[];
  resolution: ResolutionItem[];
  osint: OSINTItem[];
  evidenceChain: ChainItem[];
  solvabilityFactors: SolvabilityFactor[];
  solvabilityScore: number;
  nextSteps: NextStep[];
  searchDemoResults: SearchResult[];

  // Gallery
  gallery?: GalleryItem[];

  // ACH config
  achHypotheses: string[];
  achEvidence: ACHEvidenceRow[];

  // Investigation tasks — evidence scavenger hunt
  investigationTasks?: InvestigationTask[];
}

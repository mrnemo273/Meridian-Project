# Meridian — Phase 7 Build Spec: Polish & Launch

## Agent Instructions

You are preparing The Meridian Project for public launch. The core product is built. This phase is about the front door — homepage, about page, SEO, performance, and accessibility — and making sure everything is production-ready.

The homepage is the most strategically important page on the site. It is the first thing a journalist, researcher, or skeptic sees. It must immediately communicate: this is serious, rigorous, and credible. Not exciting. Not sensationalist. Serious.

Read this entire document before writing any code.

---

## Prerequisites (confirm before starting)

- [ ] All Phases 1–6 complete
- [ ] At least 2 findings reports are published
- [ ] Corpus has 100,000+ cases
- [ ] Contribution form is live
- [ ] Query interface is functional
- [ ] Navigation links to all sections

---

## What You Are Building

1. Homepage `/` — the front door
2. About & Methodology page `/about`
3. SEO metadata for all pages
4. Performance optimization
5. Accessibility audit and fixes
6. Final pre-launch checklist

---

## Step 1 — Homepage `/`

File: `/app/page.tsx`

This page has one job: immediately establish that Meridian is a rigorous research platform, give the user a clear sense of what it contains, and route them into the product.

### Layout

```
[Navigation]

[Hero section]
[Corpus statistics bar]
[Featured findings]
[Entry point cards]
[Footer]
```

### Hero Section

No images. No UFO silhouettes. No starfield. Just typography and a subtle structural element.

```tsx
<section className="min-h-[60vh] flex flex-col justify-center max-w-4xl">
  {/* Meridian line decoration — thin SVG vertical line, left-aligned */}
  <div className="flex gap-8">
    <div className="w-px bg-border flex-shrink-0" />
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-text-2">
        The Meridian Project
      </p>
      <h1 className="font-display text-6xl md:text-7xl text-text-1 mt-4 leading-tight">
        A rigorous analysis of the evidence for non-human intelligence.
      </h1>
      <p className="font-body text-xl text-text-2 mt-6 max-w-2xl leading-relaxed">
        Meridian aggregates, analyzes, and surfaces patterns across
        {totalCases.toLocaleString()} documented cases from {sourceCount} independent
        sources — producing findings no individual researcher has the bandwidth to reach.
      </p>
      <div className="flex gap-4 mt-10">
        <Button variant="primary" href="/cases">Browse Evidence</Button>
        <Button variant="secondary" href="/findings">Read Findings</Button>
      </div>
    </div>
  </div>
</section>
```

### Corpus Statistics Bar

Full-width section with 4 stats. JetBrains Mono numbers. Separated by vertical rules.

```
162,847          4              12              847
CASES            SOURCES        FINDINGS        CONTRIBUTIONS
DOCUMENTED       INTEGRATED     PUBLISHED       RECEIVED
```

```tsx
<section className="border-y border-border py-12 my-16">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
    {stats.map((stat, i) => (
      <div key={i} className="text-center">
        <p className="font-mono text-4xl text-text-1">
          {stat.value.toLocaleString()}
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-text-2 mt-2">
          {stat.label}
        </p>
      </div>
    ))}
  </div>
</section>
```

Stats are server-fetched from `/api/stats` at build time, revalidated every hour.

### Featured Findings

Show the 2 most recently published findings reports.

```tsx
<section className="my-16">
  <div className="flex justify-between items-baseline mb-8">
    <h2 className="font-display text-3xl text-text-1">
      Latest Findings
    </h2>
    <a href="/findings" className="font-mono text-xs uppercase tracking-widest
                                    text-text-2 hover:text-text-1">
      All findings →
    </a>
  </div>
  <div className="grid md:grid-cols-2 gap-6">
    {featuredReports.map(r => <FindingsCard key={r.id} report={r} />)}
  </div>
</section>
```

### Entry Point Cards

4 cards routing into the main product sections. Each has a short description of what the section contains.

```tsx
const ENTRY_POINTS = [
  {
    label: 'Evidence Index',
    href: '/cases',
    description: 'Browse and filter 162,000+ documented cases sorted by credibility score.',
    mono: 'BROWSE CASES →'
  },
  {
    label: 'Findings',
    href: '/findings',
    description: 'AI-generated pattern reports surfacing connections across the full corpus.',
    mono: 'READ REPORTS →'
  },
  {
    label: 'Query the Corpus',
    href: '/query',
    description: 'Ask a research question. Receive a grounded, cited answer.',
    mono: 'ASK A QUESTION →'
  },
  {
    label: 'Submit an Account',
    href: '/contribute',
    description: 'First-hand accounts, evidence, and documentation accepted for review.',
    mono: 'CONTRIBUTE →'
  },
]
```

```tsx
<section className="grid md:grid-cols-2 gap-6 my-16">
  {ENTRY_POINTS.map(ep => (
    <a key={ep.href} href={ep.href}
       className="border border-border p-8 hover:border-text-1
                  transition-colors group block">
      <h3 className="font-display text-2xl text-text-1">{ep.label}</h3>
      <p className="font-body text-text-2 mt-3 leading-relaxed">
        {ep.description}
      </p>
      <p className="font-mono text-xs tracking-widest text-text-2
                    group-hover:text-text-1 mt-6 transition-colors">
        {ep.mono}
      </p>
    </a>
  ))}
</section>
```

### Footer

```tsx
<footer className="border-t border-border py-12 mt-24">
  <div className="flex justify-between items-start">
    <div>
      <p className="font-display text-xl text-text-1">The Meridian Project</p>
      <p className="font-body text-sm text-text-2 mt-2 max-w-sm">
        An independent research platform. Not affiliated with any government agency
        or advocacy organization.
      </p>
    </div>
    <nav className="flex flex-col gap-2 text-right">
      <a href="/about" className="font-mono text-xs uppercase tracking-widest
                                   text-text-2 hover:text-text-1">
        About & Methodology
      </a>
      <a href="/cases" className="font-mono text-xs uppercase tracking-widest
                                   text-text-2 hover:text-text-1">
        Evidence Index
      </a>
      <a href="/findings" className="font-mono text-xs uppercase tracking-widest
                                     text-text-2 hover:text-text-1">
        Findings
      </a>
    </nav>
  </div>
  <p className="font-mono text-xs text-text-2 mt-12">
    © {year} The Meridian Project. Data sourced from public records.
    See methodology for attribution.
  </p>
</footer>
```

---

## Step 2 — About & Methodology Page `/about`

File: `/app/about/page.tsx`

This page is critical for researcher credibility. It must answer every skeptic's question about methodology before they ask it. Write the actual content — not placeholder text.

### Page Structure

```
[Navigation]

About The Meridian Project
[Instrument Serif, large]

[4 sections:]
1. Mission
2. The Three Questions
3. Methodology
4. Data Sources
```

### Section 1: Mission

```
The Meridian Project is an independent research platform applying AI-powered 
analysis to the documented record of anomalous aerial phenomena.

Our premise is not that non-human intelligence exists — it is that the evidence 
base deserves serious analysis. The data exists. The analytical infrastructure 
has not. Meridian is that infrastructure.

We publish our findings with full methodology, including null results. We do not 
start with a conclusion. If the evidence does not support a hypothesis, we say so.
```

### Section 2: The Three Research Questions

Present these as a clean numbered list with Instrument Serif numerals and JetBrains Mono body text.

```
01
Have non-human craft been observed operating in our airspace?

The question of physical, technological evidence — craft with observed 
characteristics beyond known human capability, documented by credentialed 
witnesses with independent corroboration.

02
Does non-human intelligence exist?

A broader question than craft alone — encompassing signal, biological, 
mathematical, and behavioral evidence of intelligence originating outside 
the human species.

03
Has contact or communication occurred?

The most extraordinary claim, held to the highest evidentiary standard. 
Requires both prior questions to be substantiated before meaningful 
analysis is possible.
```

### Section 3: Methodology

```
CREDIBILITY SCORING

Every case in the Meridian corpus is assigned a credibility score from 0–100 
based on a transparent, weighted factor model. The factors and their weights are:

Witness count                    0–20 pts
Witness credentials              0–20 pts
Radar corroboration              0–15 pts
Official acknowledgment          0–15 pts
Cross-reference matches          0–15 pts
Video evidence                   0–10 pts
Physical trace evidence          0–10 pts
Official investigation           0–10 pts
Internal consistency             0–10 pts
Photo evidence                    0–5 pts
Maximum possible                   130 pts

Scores are normalized to 0–100. Cases are assigned to four tiers:

TIER 1  70–100   Highest evidential strength
TIER 2  45–69    Notable evidence, some corroboration
TIER 3  20–44    Limited corroboration, single-source
TIER 4   0–19    Minimal or unverifiable evidence

Source reliability is also factored: each data source is assigned a reliability 
weight based on its nature (government records weight higher than unverified 
civilian reports), which scales the base score.

FINDINGS REPORTS

AI-generated findings reports analyze the full corpus for statistical patterns 
that would be impractical for individual researchers to identify manually. Each 
report includes:

— The specific analysis performed
— The methodology and data used  
— A confidence level (HIGH / MEDIUM / LOW / INCONCLUSIVE)
— Full citation of cases referenced

Reports with HIGH confidence are reviewed by a human researcher before 
publication. Reports are versioned — revisions are tracked.

Null findings — analyses that do not surface meaningful patterns — are published 
with the same rigor and visual weight as positive findings. Absence of evidence 
at current corpus size is not proof of absence.

WHAT MERIDIAN IS NOT

Meridian does not investigate government cover-up or conspiracy theories. 
These questions introduce unfalsifiable variables that contaminate analysis. 
We work with what is documented and verifiable.

Meridian is not an advocacy platform. We do not argue for a particular conclusion 
about the nature of observed phenomena. The data speaks for itself — or doesn't.
```

### Section 4: Data Sources

Clean table listing each source:

```
SOURCE              TYPE          CASES      NOTES
NUFORC              NGO           ~150,000   National UFO Reporting Center, civilian reports
Project Blue Book   Government    12,600     Declassified USAF investigation program, 1952–1969
The Black Vault     NGO           Varies     FOIA archive compiled by John Greenewald Jr.
AARO                Government    Ongoing    Pentagon All-domain Anomaly Resolution Office
Congressional Record Government   Ongoing    Official congressional testimony transcripts
MUFON               NGO           Partial    Public case summaries only — full dataset pending partnership
```

Note below table: "All data sourced from publicly available records. Meridian does not hold exclusive data agreements. We encourage independent verification."

---

## Step 3 — SEO Metadata

File: `/app/layout.tsx` (root metadata)

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s — The Meridian Project',
    default: 'The Meridian Project — Evidence Research for Anomalous Aerial Phenomena',
  },
  description: 'AI-powered analysis of 160,000+ documented UAP cases. Rigorous, transparent, evidence-based research.',
  openGraph: {
    siteName: 'The Meridian Project',
    type: 'website',
  },
}
```

### Per-Page Metadata

**Case detail pages** (`/app/cases/[id]/page.tsx`):
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const caseData = await getCase(params.id)
  return {
    title: caseData.title,
    description: caseData.summary,
    openGraph: {
      title: `${caseData.title} — Meridian Evidence Index`,
      description: `${caseData.summary} Credibility: Tier ${caseData.credibility_tier}.`,
    }
  }
}
```

**Findings report pages** (`/app/findings/[id]/page.tsx`):
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const report = await getReport(params.id)
  return {
    title: report.title,
    description: `${report.confidence_level} confidence finding. ${report.body?.substring(0, 150)}...`,
    openGraph: {
      title: report.title,
      description: `Meridian Findings — ${report.confidence_level} confidence`,
    }
  }
}
```

### Sitemap

File: `/app/sitemap.ts`

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes: /, /about, /cases, /findings, /query, /contribute
  // Dynamic: all published findings reports
  // Do NOT include individual case pages — too many, use cases index
  return [
    { url: 'https://meridian.example.com', lastModified: new Date() },
    { url: 'https://meridian.example.com/about' },
    { url: 'https://meridian.example.com/cases' },
    { url: 'https://meridian.example.com/findings' },
    { url: 'https://meridian.example.com/query' },
    { url: 'https://meridian.example.com/contribute' },
    ...publishedReports.map(r => ({
      url: `https://meridian.example.com/findings/${r.id}`,
      lastModified: new Date(r.published_at),
    }))
  ]
}
```

---

## Step 4 — Performance

### Server-Side Rendering

Verify these pages are SSR (not client-rendered):
- `/` — SSR with 1hr revalidation on stats
- `/cases` — SSR
- `/cases/[id]` — SSR
- `/findings` — SSR
- `/findings/[id]` — Static generation, rebuilt on publish

### Database Query Optimization

Review and optimize any slow queries:
- Case list query: ensure all filter columns are indexed
- Case detail query: single query with join, not multiple round-trips
- Stats query: add a materialized view or scheduled cache if slow

### Bundle Size

Run `npm run build` and review the bundle analysis. No single route should have a client bundle > 200KB. The map page (Leaflet) will be the largest — ensure it is dynamically imported:

```typescript
const MapComponent = dynamic(() => import('@/components/cases/Map'), { ssr: false })
```

### Image Optimization

If any images are used (unlikely by design, but covers OG images):
- Use `next/image` for all images
- Generate static OG images using `@vercel/og` if custom OG images are desired

---

## Step 5 — Accessibility

Run axe or similar on all pages. Fix all critical and serious issues.

### Required Checks

**Color contrast:**
- All text on `--bg` background must meet WCAG AA (4.5:1 for normal text)
- Tier color badges: ensure text contrast on colored backgrounds
- `--gold` on white needs verification — may need text-1

**Keyboard navigation:**
- Tab through entire `/cases` page including all filters
- Tab through case detail page
- Tab through contribution form steps
- Tab through query interface
- All interactive elements must have visible focus ring
  ```css
  :focus-visible {
    outline: 2px solid var(--text-1);
    outline-offset: 2px;
  }
  ```

**Screen reader:**
- All icons have aria-labels
- Filter checkboxes have associated labels
- Credibility score arc has aria-label: "Credibility score: {score} out of 100, Tier {tier}"
- SlideOver panel has aria-modal and focus trap

**Forms:**
- All form inputs have visible labels (not just placeholder text)
- Error states are announced to screen readers
- Required fields are marked

---

## Step 6 — Pre-Launch Checklist

Run through this checklist before marking Phase 7 done:

### Content
- [ ] Homepage hero text is final (not placeholder)
- [ ] About page content is fully written
- [ ] At least 2 findings reports are published with real analysis
- [ ] Data source attributions are accurate and up to date
- [ ] Footer links all resolve

### Technical
- [ ] `npm run build` completes with zero errors and zero TypeScript errors
- [ ] No console errors on any page in production build
- [ ] `/test` route is removed or password-protected
- [ ] Admin routes require authentication (test with logged-out session)
- [ ] `.env.example` is accurate and complete
- [ ] No API keys or secrets in client-side code

### Performance
- [ ] Lighthouse score ≥ 90 on `/` (Performance)
- [ ] Lighthouse score ≥ 90 on `/cases` (Performance)
- [ ] Lighthouse score ≥ 95 on all pages (Accessibility)
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms on homepage
- [ ] Map page loads without errors (Leaflet SSR disabled correctly)

### SEO
- [ ] All pages have unique title tags
- [ ] All pages have meta descriptions
- [ ] OG tags present on homepage, findings reports, case pages
- [ ] Sitemap is accessible at `/sitemap.xml`
- [ ] robots.txt present — allow all except /admin

### Data
- [ ] `/api/stats` returns accurate counts
- [ ] Stats on homepage match `/api/stats`
- [ ] At least one contribution has been tested end-to-end (submit → screen → approve → appears in index)
- [ ] At least one query has been tested end-to-end

### Mobile
- [ ] Homepage renders correctly at 375px
- [ ] Case list and filters are usable on mobile
- [ ] Case detail page readable on mobile
- [ ] Contribution form all 5 steps usable on mobile
- [ ] Navigation mobile menu works

---

## Definition of Done

Phase 7 and the full Meridian Project build are complete when:

- [ ] All pre-launch checklist items are checked
- [ ] Lighthouse ≥ 90 performance, ≥ 95 accessibility on homepage
- [ ] About page is fully written with real content (not Lorem ipsum)
- [ ] The site is accessible at its production URL
- [ ] A first-time visitor landing on the homepage can navigate to a Tier 1 case, read a findings report, run a query, and start a contribution without confusion

---

## Post-Launch Notes

These items are explicitly deferred to post-launch and should not block launch:

- MUFON full dataset partnership
- Typesense/Meilisearch full-text search upgrade (currently PostgreSQL FTS)
- Query history for logged-in researchers
- Saved queries
- Submission status tracking for contributors
- Dark mode
- Additional findings report types (geographic clustering, temporal pattern, linguistic fingerprint)
- Public researcher registration (currently admin-granted only)
- API access for external researchers

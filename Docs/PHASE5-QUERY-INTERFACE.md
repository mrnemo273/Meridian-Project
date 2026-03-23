# Meridian — Phase 5 Build Spec: Query Interface

## Agent Instructions

You are building the natural language research interface for The Meridian Project. Users ask questions in plain English and receive grounded, cited answers drawn strictly from the evidence corpus.

This is NOT a chatbot. There is no AI persona, no conversation history, no "Hi, I'm Meridian." It is a research instrument — the difference matters aesthetically and strategically. Think of it as a search engine that understands research questions.

Read this entire document before writing any code.

---

## Prerequisites (confirm before starting)

- [ ] Phase 2 complete — embeddings exist for 50,000+ cases
- [ ] Phase 3 complete — `/api/cases/[id]` exists, CaseCard and SlideOver components exist
- [ ] Phase 4 complete — ConfidenceBadge component exists
- [ ] Know which embedding model was used in Phase 2 — query embeddings MUST use the same model
- [ ] `ANTHROPIC_API_KEY` is working

---

## What You Are Building

1. `/api/query` — POST endpoint: receives question, retrieves relevant cases, returns grounded answer
2. `/query` — the query interface page
3. Query result display component
4. Rate limiting on the endpoint

---

## Design Direction

The query interface is the most minimal page on the platform. The input is the entire focus.

```
Large centered input field
Placeholder: "Ask a research question about the evidence corpus..."
Example queries below input (visible until first query)
Results appear below — not in a chat thread, not in a sidebar
```

No streaming (keep it simple). No conversation history. Each query is independent.

If the user asks something Meridian cannot answer from the corpus, it says so clearly and explains what data would be needed. This is a feature, not a failure.

---

## Step 1 — Query API

File: `/app/api/query/route.ts`

### Request

```typescript
// POST /api/query
{
  question: string        // max 500 chars
}
```

### Response

```typescript
{
  answer: string          // Markdown — grounded response
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA'
  cited_case_ids: string[]
  cases: CaseListItem[]   // resolved case objects for cited IDs
  query_id: string        // UUID for logging
}
```

### Pipeline

```typescript
export async function POST(request: Request) {
  const { question } = await request.json()

  // 1. Validate input
  if (!question || question.length > 500) {
    return Response.json({ error: 'Invalid query' }, { status: 400 })
  }

  // 2. Generate query embedding (MUST use same model as corpus embeddings)
  const queryEmbedding = await generateEmbedding(question)

  // 3. Hybrid retrieval
  const semanticResults = await semanticSearch(queryEmbedding, { limit: 15 })
  const keywordResults = await keywordSearch(question, { limit: 10 })

  // 4. Merge and deduplicate, rank by combined score
  const retrievedCases = mergeResults(semanticResults, keywordResults)

  // 5. Generate grounded response
  const response = await generateGroundedResponse(question, retrievedCases)

  // 6. Resolve cited case objects
  const citedCases = await resolveCases(response.cited_case_ids)

  // 7. Log query (no PII — just question hash, confidence, case count)
  await logQuery({ question, confidence: response.confidence, resultCount: citedCases.length })

  return Response.json({
    answer: response.answer,
    confidence: response.confidence,
    cited_case_ids: response.cited_case_ids,
    cases: citedCases,
    query_id: crypto.randomUUID()
  })
}
```

### Semantic Search Function

```typescript
async function semanticSearch(
  embedding: number[],
  options: { limit: number; minSimilarity?: number }
): Promise<{ case: Case; similarity: number }[]> {
  // pgvector query:
  // select *, 1 - (embedding <=> $1::vector) as similarity
  // from cases
  // where 1 - (embedding <=> $1::vector) > 0.7
  // order by embedding <=> $1::vector
  // limit $2
}
```

### Keyword Search Function

```typescript
async function keywordSearch(
  query: string,
  options: { limit: number }
): Promise<Case[]> {
  // PostgreSQL full-text search using search_vector column
  // select * from cases
  // where search_vector @@ plainto_tsquery('english', $1)
  // order by ts_rank(search_vector, plainto_tsquery('english', $1)) desc
  // limit $2
}
```

### Grounded Response Generation

File: `/lib/query/generate-response.ts`

```typescript
export async function generateGroundedResponse(
  question: string,
  retrievedCases: RetrievedCase[]
): Promise<{
  answer: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA'
  cited_case_ids: string[]
}> {
  const caseContext = retrievedCases.map(c => `
    Case ID: ${c.id}
    Title: ${c.title}
    Date: ${c.date}
    Location: ${c.location_region}, ${c.location_country}
    Credibility Tier: ${c.credibility_tier}
    Summary: ${c.summary}
    Craft: ${JSON.stringify(c.craft_description)}
    Behavior: ${JSON.stringify(c.behavioral_descriptors)}
    Corroboration: radar=${c.radar_corroboration}, video=${c.video_evidence}, official=${c.official_acknowledgment}
  `).join('\n---\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: QUERY_PROMPT
        .replace('{{QUESTION}}', question)
        .replace('{{CASES}}', caseContext)
    }]
  })

  // Parse JSON response
}
```

### Query Prompt

```
You are a research analysis system for The Meridian Project, an evidence research platform 
studying anomalous aerial phenomena.

You have been provided with the most relevant cases from the evidence corpus for the following 
research question. Your task is to answer the question based ONLY on the provided cases.

STRICT RULES:
- Only cite cases provided in the context. Never reference cases not in the provided list.
- If the provided cases do not contain sufficient evidence to answer the question, say so clearly.
- Never speculate beyond what the evidence shows.
- Never assert that non-human intelligence exists — only describe what the evidence shows.
- If you cite a case, use the exact Case ID provided.
- Assign a confidence level: HIGH (strong evidence directly answers the question), 
  MEDIUM (partial evidence, some caveats), LOW (weak or tangential evidence), 
  INSUFFICIENT_DATA (the corpus does not contain enough information to answer this question)

Research question: {{QUESTION}}

Relevant cases from corpus:
{{CASES}}

Return ONLY a valid JSON object:
{
  "answer": "... markdown response with case references like [Case: UUID] ...",
  "confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT_DATA",
  "cited_case_ids": ["uuid1", "uuid2", ...]
}
```

---

## Step 2 — Rate Limiting

Apply rate limiting to `/api/query`:

```typescript
// Simple in-memory rate limiting using a Map
// (For production, use Upstash Redis or similar)
// Limit: 10 queries per IP per minute
// On limit exceeded: return 429 with Retry-After header
```

No authentication required for basic queries. Rate limit is IP-based.

---

## Step 3 — Query Page `/query`

File: `/app/query/page.tsx`

### Layout

```
[Navigation]

                    [centered content, max-width 720px]

    QUERY THE CORPUS
    ────────────────

    [Large search input — full width]

    [Example queries — visible until first query is run]

    [Results section — appears below after query]
```

### Page Header

```tsx
<header className="text-center mb-12">
  <p className="font-mono text-xs uppercase tracking-widest text-text-2">
    The Meridian Project
  </p>
  <h1 className="font-display text-4xl text-text-1 mt-2">
    Query the Corpus
  </h1>
  <p className="font-body text-text-2 mt-4">
    Ask a research question. Answers are grounded strictly in the evidence corpus.
  </p>
</header>
```

### Query Input Component

File: `/components/query/QueryInput.tsx`

```tsx
<div className="relative">
  <textarea
    placeholder="Ask a research question about the evidence corpus..."
    className="w-full font-body text-lg border border-border bg-bg
               text-text-1 p-4 resize-none focus:border-text-1
               focus:outline-none transition-colors"
    rows={3}
    maxLength={500}
  />
  <div className="flex justify-between items-center mt-3">
    <span className="font-mono text-xs text-text-2">
      {charCount} / 500
    </span>
    <Button variant="primary" onClick={handleQuery} disabled={isLoading}>
      {isLoading ? 'Analyzing corpus...' : 'Run query'}
    </Button>
  </div>
</div>
```

No form element — use button onClick handler.

### Example Queries

Shown below input before any query is run. Hidden after first query.

```tsx
const EXAMPLE_QUERIES = [
  "What are the most credible cases involving triangular craft in the United States?",
  "Which witness accounts describe a sudden onset of silence before the encounter?",
  "What physical effects on witnesses appear most consistently across Tier 1 cases?",
  "Are there documented cases where military pilots reported objects with no visible propulsion?",
  "Which geographic regions have the highest concentration of multi-witness cases?",
]
```

Display as clickable chips — clicking populates the input:

```tsx
<div className="mt-8">
  <p className="font-mono text-xs uppercase tracking-widest text-text-2 mb-4">
    Example queries
  </p>
  <div className="flex flex-col gap-2">
    {EXAMPLE_QUERIES.map(q => (
      <button
        key={q}
        onClick={() => setQuestion(q)}
        className="text-left font-body text-sm text-text-2
                   border border-border px-4 py-3
                   hover:border-text-1 hover:text-text-1
                   transition-colors"
      >
        {q}
      </button>
    ))}
  </div>
</div>
```

---

## Step 4 — Query Result Display

File: `/components/query/QueryResult.tsx`

### Layout

```
[Confidence badge]  [query text — italic, small]

[Answer — markdown rendered]

[Cited cases — horizontal scroll or grid]

[New query button]
```

### Confidence + Query Echo

```tsx
<div className="flex items-center gap-4 mb-6">
  <ConfidenceBadge level={result.confidence} />
  <p className="font-mono text-xs text-text-2 italic">
    "{originalQuestion}"
  </p>
</div>
```

### Answer Rendering

Render markdown. Case reference markers `[Case: UUID]` render as inline CaseCitation chips (reuse from Phase 4).

```typescript
// Custom markdown renderer
// When encountering [Case: UUID] pattern → render CaseCitation chip
// On chip click → open SlideOver with case detail
```

### INSUFFICIENT_DATA State

This is a first-class response state, not an error. Display with the same confidence badge (use --text-3 color), clear language:

```tsx
{result.confidence === 'INSUFFICIENT_DATA' && (
  <div className="border-l-2 border-text-3 pl-4 my-6">
    <p className="font-body text-text-2">
      {result.answer}
    </p>
    <p className="font-mono text-xs text-text-3 mt-2">
      The current corpus does not contain sufficient evidence to answer
      this question with confidence. As the corpus grows, this may change.
    </p>
  </div>
)}
```

### Cited Cases

Below the answer: up to 6 CaseCard components for the cited cases, in a 2-column grid.

```tsx
{result.cases.length > 0 && (
  <section className="mt-10">
    <p className="font-mono text-xs uppercase tracking-widest text-text-2 mb-6">
      Cases referenced in this analysis
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {result.cases.map(c => <CaseCard key={c.id} case={c} />)}
    </div>
  </section>
)}
```

### New Query Button

Below cited cases: "Ask another question" button that clears result and scrolls back to input.

---

## Step 5 — Loading State

While the query is processing (typically 3–8 seconds):

```tsx
<div className="text-center py-12">
  <p className="font-mono text-sm text-text-2 animate-pulse">
    Searching {totalCases.toLocaleString()} cases...
  </p>
</div>
```

No spinner — the pulsing text is more consistent with the research instrument aesthetic.

---

## Definition of Done

Phase 5 is complete when ALL of the following are true:

- [ ] Typing a question and clicking "Run query" returns a result in under 10 seconds
- [ ] "What are the most credible cases involving triangular craft in the United States?" returns a grounded answer with cited cases
- [ ] "What is the current price of gold?" or any clearly off-topic question returns INSUFFICIENT_DATA gracefully
- [ ] Inline case citations are clickable and open the SlideOver
- [ ] Cited cases grid appears below the answer
- [ ] INSUFFICIENT_DATA state renders correctly with null border styling
- [ ] Rate limiting returns 429 after 10 queries from same IP within a minute
- [ ] Example queries populate the input on click
- [ ] No streaming — full response returned before display
- [ ] The word "I" never appears in any query response (it is not an assistant, it is a system)

## What NOT to Build in This Phase

- No conversation history
- No saved queries
- No user authentication
- No query sharing URLs (defer to post-launch)
- No streaming responses

---

## Handoff Notes for Next Phase

The Phase 6 agent needs:
- The multi-step form pattern (contribution form is multi-step)
- No specific components from Phase 5 are reused in Phase 6
- The admin authentication pattern from Phase 4 admin UI (Phase 6 adds admin review queue)

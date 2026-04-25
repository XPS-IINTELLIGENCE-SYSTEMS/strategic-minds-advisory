# Company Knowledge Distillation System

## Mission

Create a governed company knowledge system for Xtreme Polishing Systems, Strategic Minds Advisory, AI in Action Labs, and related systems.

The goal is not to blindly upload everything into a model. The goal is to ingest company data, classify it, clean it, distill it, structure it, retrieve it, evaluate it, and then optionally fine-tune specialized models later when the data is ready.

## Core Decision

Start with a Supabase-backed RAG and knowledge-distillation system.

Do not start by training a company LLM from raw files.

Reason:

- Raw company data is usually duplicated, stale, inconsistent, private, and unstructured.
- Fine-tuning on unclean data can lock bad information into a model.
- A RAG system is cheaper, safer, easier to update, and easier to cite.
- Distillation can create canonical datasets later for fine-tuning.

## Target Outcome

The system should answer questions and generate outputs using company knowledge with:

- citations
- source provenance
- freshness status
- confidence notes
- access control
- topic classification
- canonical summaries
- decision logs
- reusable distilled knowledge packs

## Data Sources

Potential sources:

- Google Drive documents
- Google Sheets
- PDFs
- DOCX files
- markdown files
- GitHub repos
- Supabase tables
- website copy
- product catalogs
- training manuals
- SOPs
- sales scripts
- CRM exports
- scraped public proof sources
- AI in Action run logs
- paper-trading simulation logs
- business-build simulation logs
- email reports
- content scripts
- support/FAQ data

## Source Boundaries

Do not ingest sensitive/private data blindly.

Classify every source as:

- public
- internal
- confidential
- sensitive
- regulated
- deprecated
- unknown

Unknown sources must not be exposed publicly.

## Pipeline

```text
Upload / connect source
-> register source
-> extract text and metadata
-> classify sensitivity and topic
-> chunk content
-> detect duplicates
-> detect stale/conflicting content
-> summarize chunks
-> create canonical distilled summary
-> embed chunks and summaries
-> store in Supabase
-> evaluate retrieval quality
-> expose through dashboard/chat/API
-> create fine-tuning dataset only after validation
```

## Supabase Role

Supabase is the backend for:

- document registry
- extracted content chunks
- embeddings
- canonical summaries
- source citations
- source sensitivity labels
- ingestion jobs
- distillation jobs
- evaluation results
- access controls
- human review queue

## Proposed Tables

### `knowledge_sources`

Tracks each uploaded/connected file, URL, repo, table, or dataset.

Fields:

- id
- source_name
- source_type
- source_url
- origin_system
- owner
- sensitivity_level
- topic_family
- status
- freshness_status
- checksum
- created_at
- updated_at
- is_public

### `knowledge_documents`

Stores extracted document-level metadata.

Fields:

- id
- source_id
- title
- document_type
- raw_text_hash
- language
- word_count
- summary
- canonical_status
- created_at
- is_public

### `knowledge_chunks`

Stores chunked text for retrieval.

Fields:

- id
- document_id
- chunk_index
- chunk_text
- heading_path
- token_count
- citation_label
- sensitivity_level
- embedding vector later
- created_at
- is_public

### `knowledge_distillations`

Stores distilled knowledge packs.

Fields:

- id
- topic
- scope
- distilled_summary
- key_facts
- procedures
- contradictions
- open_questions
- source_ids
- confidence_score
- reviewer_status
- created_at
- is_public

### `knowledge_ingestion_jobs`

Tracks ingestion runs.

Fields:

- id
- job_type
- source_count
- status
- started_at
- completed_at
- error_message
- output_summary
- created_at

### `knowledge_review_queue`

Tracks human review tasks.

Fields:

- id
- item_type
- item_id
- reason
- risk_level
- status
- reviewer
- decision_notes
- created_at

### `knowledge_eval_results`

Tracks retrieval and answer quality.

Fields:

- id
- test_question
- expected_sources
- retrieved_sources
- answer_quality_score
- citation_quality_score
- hallucination_risk
- notes
- created_at

## Data Processing Rules

### Rule 1 — Never lose provenance

Every generated summary must link back to source IDs and citations.

### Rule 2 — Do not merge conflicting facts silently

If two sources disagree, store the contradiction and mark it for review.

### Rule 3 — Separate public from internal

Public-facing AI should only use public-approved sources.

Internal/admin AI may use internal sources if access is authorized.

### Rule 4 — Prefer retrieval before fine-tuning

Use RAG first. Fine-tune only after a clean, reviewed, high-quality dataset exists.

### Rule 5 — Do not train secrets into models

Secrets, passwords, tokens, keys, customer PII, private financial data, and restricted records must not be included in public or fine-tuning datasets.

## Company Knowledge Domains

Initial domain taxonomy:

1. XPS product knowledge
2. concrete polishing
3. epoxy/coatings
4. surface preparation
5. equipment and tooling
6. training and SOPs
7. sales process
8. marketing and content
9. local lead generation
10. customer support / FAQ
11. vendor/product catalogs
12. competitor intelligence
13. AI in Action operating system
14. Strategic Minds Advisory systems
15. paper-trading education lab
16. digital business simulations
17. media/avatar production
18. automation workflows
19. GitHub/Vercel/Supabase architecture
20. governance and compliance

## Distillation Outputs

The system should produce:

- company master knowledge map
- product FAQ packs
- SOP packs
- sales script packs
- training packs
- AI assistant prompt packs
- website copy packs
- content/video packs
- internal decision packs
- source-backed answer packs
- fine-tune candidate datasets later

## Optional Fine-Tuning Later

Fine-tuning should only happen after:

- source ingestion is complete
- duplicates are removed
- sensitive data is excluded
- canonical answers are reviewed
- evaluation set exists
- model purpose is narrow and clear

Possible fine-tuned models later:

- XPS product support assistant
- XPS sales assistant
- concrete polishing training assistant
- Strategic Minds systems assistant
- AI in Action narrator/persona assistant

## Immediate Build Order

1. Create Supabase knowledge schema.
2. Add ingestion source registry UI.
3. Add safe file/source upload workflow.
4. Add chunking and metadata pipeline.
5. Add source classification and sensitivity labels.
6. Add distillation table and manual review queue.
7. Add retrieval API.
8. Add admin dashboard panels.
9. Add evaluation set.
10. Add optional fine-tune dataset exporter later.

## Integration With AI in Action

This becomes a new lab and backend service:

- Lab: Company Knowledge Distillation Lab
- Dashboard panel: Company Brain
- Supabase backend: Knowledge schema
- GitHub Issues: ingestion/refactor/distillation tasks
- Human review: sensitivity and contradiction approval

## Human Responsibilities

Humans must:

- choose what data may be uploaded
- avoid uploading secrets
- mark confidential material
- review sensitive distillations
- approve public-facing knowledge packs

AI may:

- classify
- summarize
- chunk
- deduplicate
- find contradictions
- create source maps
- draft knowledge packs
- propose schema improvements
- generate evaluation questions
- create fine-tune candidate datasets after review

## Non-Negotiable Safety Rule

Do not build a company LLM by dumping raw data directly into training.

Build a governed, source-backed knowledge system first.

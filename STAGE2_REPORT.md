# Stage 2 Completion Report — Madola Proposal Studio

Date: 2026-08-19
Status: COMPLETE — verified end-to-end on live DB + localhost dev + incognito

## 1. Goal
Make the OpenSolar PDF → proposal → public customer proposal pipeline work correctly:
per-proposal blocks, secure public loading, correct tokens, online acceptance, hero image,
media rendering, and cropped-image persistence.

## 2. Files Changed (4 files, ~218 insertions / ~174 deletions)

| File | Change |
|------|--------|
| `src/lib/repositories/interactiveProposalRepository.ts` | `saveInteractiveProposal` now: (a) writes per-proposal `proposal_blocks` rows, (b) persists base64 hero/layout images to storage, (c) fixes `proposal_products` insert shape (`custom_name`/`custom_description` instead of `name`/`description`/`category`/etc.), (d) re-syncs child rows on BOTH insert and update paths via new `syncProposalChildren()` (previously only the insert path wrote solar/financials/products/milestones). Added helpers `persistProposalImage()` and `writeProposalBlocks()`. |
| `src/lib/repositories/proposalRepository.ts` | `getPublicProposalData`: removed the stale localStorage override and the `pub_tok_*` fake-success catch-all (bad/unknown tokens now correctly return `not_found`). `acceptPublicProposal`: now calls the `accept_public_proposal` RPC (anonymous-safe, SECURITY DEFINER) and returns real error messages instead of always `{success:true}`. |
| `src/components/customer/CustomerBlockProposalView.tsx` | Injects the RPC `heroImage` into the customer cover block (was layout-only injection). |
| `src/lib/services/templateCache.ts` | Removed stale `madola_current_proposal` localStorage fallback key. |

## 3. DB Migrations (2 new, both applied to live project `hqdeexzbzqptedurwxbq`)

1. `supabase/migrations/20260819000000_stage2_fix_public_rpc_and_acceptance.sql`
   - Adds `company_branding` columns referenced by the public RPC (`logo_reference`, `email`, `phone`, `address`, `logo_url`, `contact_email`, `contact_phone`, `office_address`) so `get_public_proposal()` no longer 400s with `column "logo_reference" does not exist`.
   - Re-adds `proposals_status_check` including `'accepted'`/`'declined'` (live DB had no status CHECK; fresh DBs get the corrected one).
   - Adds `unq_proposal_acceptance_proposal UNIQUE(proposal_id)` so the acceptance upsert works.
   - Rewrites `get_public_proposal(p_token)` — column-agnostic branding read, returns `heroImage`/`layoutImage`/`blocks`/`products`/`paymentSchedule`/`acceptance`/`branding`, with explicit error payloads (`token_invalid`, `not_found`, `expired`, `draft_unpublished`).
   - Rewrites `accept_public_proposal(p_token, p_signer_name, p_signer_email, p_notes)` — SECURITY DEFINER; updates `proposals.status='accepted'` + upserts `proposal_acceptance` via ON CONFLICT; returns `{success, message/error}`. GRANT EXECUTE to `anon, authenticated`.

2. `supabase/migrations/20260819160000_stage2_child_table_rls_policies.sql`
   - Adds required company-scoped INSERT/SELECT RLS policies for `solar_systems` and `financials` (they previously only had DELETE policies, so `saveInteractiveProposal` could never persist those rows). Mirrors the existing `proposal_products`/`payment_milestones` pattern.

## 4. RPCs Changed
- `get_public_proposal(TEXT)` — rewritten (branding fix + hero/layout/acceptance payload + error contract).
- `accept_public_proposal(TEXT, TEXT, TEXT, TEXT)` — rewritten (functional acceptance; was previously failing due to missing `logo_reference` column and the client never calling it).

## 5. Verified Results (live DB + Puppeteer E2E)

- **Proposal persistence** on the existing reference `10534548` (tests the UPDATE path): `solar_systems=1`, `financials=1`, `proposal_products=5`, `payment_milestones=2`, `proposal_blocks=21`, `proposal_acceptance=1`. (Before: 0 blocks / 0 products / 0 solar / 0 financials.)
- **Public proposal renders** from DB via RPC: 21 sections, cover visible, accept button present. No base64 bloat: `hero_image_url` and `layout_image_url` are now public storage URLs (layout was a 412KB base64 string before; now ~143-char storage URL).
- **Hero image** renders in the customer cover block from the storage URL.
- **Media** renders (branding logo, hero, layout, proposal-media gallery, accreditation badges all `naturalWidth > 0`). A few Unsplash thumbnails show `rendered:false` only in headless Chrome (`ERR_BLOCKED_BY_ORB` — a sandbox artifact; the block renderers have onError fallbacks).
- **Incognito (anonymous) acceptance**: opened `/p/<token>` in a fresh incognito browser context, clicked "Accept Proposal Online" → success message shown, DB updated to `status=accepted` with a `proposal_acceptance` row (name/email/accepted_at persisted).

## 6. E2E Evidence
- Scripts in `%TEMP%\opencode\pptr`: `stage2_e2e.cjs` (full workflow incl. incognito acceptance), `accept_net.cjs` (network/RPC trace proving the accept RPC returned `{"message":"Proposal accepted successfully.","success":true}` and the earlier bug was a client-side mismatch checking `data.status` instead of `data.success`).
- Latest published test link: `http://localhost:3000/p/pub_tok_dbbea6aa0e5538498f21a5942582f94f` (status: accepted).

## 7. Remaining Issues / Notes
- `solar_systems`/`financials` now persist, but the public page still falls back to default values if a proposal has no child rows (existing pre-Stage-2 proposals). Re-saving a proposal fixes this.
- RLS/open-DELETE policies, branding, and multi-tenant concerns were intentionally NOT changed beyond the two required child-table INSERT/SELECT policies (per Stage 2 scope).
- A couple of headless-Chrome-only image block artifacts (Unsplash ORB) are not code issues.
- No changes committed (per instruction). Stage 3 not started.

## 8. Not Committed
`git status` shows 4 modified files + 2 new migrations (all uncommitted). Prior session's commits (`067caed`…) untouched.
# Sign-in review — handoff (2026-11-02)

On 2026-11-02 a read-only review looked at Microsoft sign-in and permissions in this repo and in
`namsbokasafn-efni`. It was prompted by the breach of Inna, where attackers reached teacher accounts
through its Microsoft login, raised their privileges and changed records.

**Result for kvenno-app:** the backend's token check (`server/src/lib/auth.ts`) is sound, and the
app keeps no user records. What is left is housekeeping, and most of it waits for the lab-reports
rewrite, since lab reports is paused (`docs/REVIEW-QUEUE.md` D4).

## The details stay off this repo until fixed

**This repository is public.** The full review, with file references, is held by Siggi on a
private dashboard: <https://claude.ai/artifact/1bAa1RTNZ1JmEeP53av4vN>. It also holds the task list,
which says what Siggi does and what Claude may do once approved. The open items are indexed in
`docs/REVIEW-QUEUE.md` D5.

- Do not write the details into a commit message, pull request, issue or code comment before the
  fix ships. Describe a fix by what it adds.
- Do not start a task until Siggi has approved it on the dashboard. A session reads approvals with
  the `ArtifactData` tool: `list` on collection `tasks` of the dashboard URL. A Claude task whose
  `status` is `approved` may start; mark it `in-progress` and then `done`, with the pull request's
  URL in its `pr` field.

## The work, by area

Claude's tasks (each waits for Siggi's approval):

1. Update the backend's HTTP framework and body parser (a published advisory).
2. Log the account ID on each call to the Claude endpoints.
3. Fail the lab-reports build when the tenant ID is missing.
4. Remove, or rebuild on the server, the browser-only teacher role, as Siggi decides.
5. Update the build and test tools that carry advisories.
6. Once fixed: the full record in `docs/REVIEW-QUEUE.md` D5.

Siggi's tasks: confirm the Azure app registration is single-tenant, decide who may use lab reports
after the rewrite, decide on the teacher role, approve, and deploy.

## Notes for the implementing session

- The review was read-only and changed no code. It was made against `main` at `f482aab`.
- `pnpm audit` lists 15 high advisories. Only one reaches a running server (item 1); the rest are
  build and test tools. The git history (544 commits) holds no committed credentials.

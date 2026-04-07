# eCampus Blacklist Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small parser and blacklist generator for the eCampus forum data, with fixtures and tests proving the extracted discussion list and ad links.

**Architecture:** Add one focused build script in `scripts/` that exports parsing helpers and writes `docs/data/blacklist.json`. Use HTML fixtures under `tests/fixtures/forum/` to lock the parser behavior, and keep the build output minimal so `npm run build:blacklist` always succeeds even when source data is absent.

**Tech Stack:** Node.js ESM, `node:test`, `node:assert/strict`, `fs`, `cheerio`.

---

### Task 1: Add the failing parser test

**Files:**
- Create: `tests/docs/data-contract.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseForumList, parseDiscussionPost } from '../../scripts/build-forum-blacklist.mjs';

test('parseForumList extracts at least eight forum discussions from the listing fixture', () => {
  const html = fs.readFileSync(new URL('../fixtures/forum/view-318977.html', import.meta.url), 'utf8');
  const discussions = parseForumList(html);
  assert.ok(discussions.length >= 8);
  assert.equal(discussions[0].title, '...use the stable first title from the fixture...');
});

test('parseDiscussionPost extracts external ad links and ad names from the discussion fixture', () => {
  const html = fs.readFileSync(new URL('../fixtures/forum/discussion-12706.html', import.meta.url), 'utf8');
  const post = parseDiscussionPost(html);
  assert.ok(post.links.includes('https://tvcf.co.kr/play/bi2674-1011067'));
  assert.match(post.text, /...first ad name.../);
  assert.match(post.text, /...second ad name.../);
});
```

- [ ] **Step 2: Run the targeted test and confirm it fails**

Run: `node --test tests/docs/data-contract.test.mjs`
Expected: FAIL because `scripts/build-forum-blacklist.mjs` does not export the parsing functions yet.

### Task 2: Implement the blacklist builder

**Files:**
- Create: `scripts/build-forum-blacklist.mjs`
- Create: `docs/data/blacklist.json`

- [ ] **Step 1: Implement `parseForumList`, `parseDiscussionPost`, and `buildBlacklist`**

```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cheerio from 'cheerio';

export function parseForumList(html) { /* parse table.forumheaderlist tr.discussion */ }
export function parseDiscussionPost(html) { /* parse first post text + external http links */ }
export function buildBlacklist() { /* read forum-used-ads.json if present and write docs/data/blacklist.json */ }

if (import.meta.url === `file://${process.argv[1]}`) buildBlacklist();
```

- [ ] **Step 2: Add the forum fixtures**

Save the fetched HTML into:
- `tests/fixtures/forum/view-318977.html`
- `tests/fixtures/forum/discussion-12706.html`

- [ ] **Step 3: Run the build**

Run: `npm run build:blacklist`
Expected: exit 0 and `docs/data/blacklist.json` written.

- [ ] **Step 4: Re-run the targeted test**

Run: `node --test tests/docs/data-contract.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit the work**

```bash
git add tests/docs/data-contract.test.mjs tests/fixtures/forum/view-318977.html tests/fixtures/forum/discussion-12706.html scripts/build-forum-blacklist.mjs docs/data/blacklist.json docs/superpowers/plans/2026-04-07-eCampus-blacklist-pipeline.md
git commit -m "feat: build eCampus blacklist pipeline"
```

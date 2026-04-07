# Mobile Sidebar Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the task sidebar collapse behind a hamburger button on mobile while preserving the current desktop layout.

**Architecture:** Keep the desktop shell as-is, add a mobile toolbar and backdrop to the static shell, and manage drawer open/close state in the existing client app. Render keeps responsibility for task/ad content, while app-level code coordinates shell state and mobile interactions.

**Tech Stack:** Vanilla HTML/CSS/JS, node:test, jsdom

---

### Task 1: Add failing tests for mobile shell rendering and drawer controls

**Files:**
- Modify: `tests/docs/render.test.mjs`
- Create: `tests/docs/app.test.mjs`
- Test: `tests/docs/render.test.mjs`, `tests/docs/app.test.mjs`

- [ ] **Step 1: Write the failing render test**

```js
assert.match(document.body.textContent, /메뉴/);
assert.equal(document.querySelector('[data-role="sidebar-toggle"]')?.getAttribute('aria-expanded'), 'false');
assert.equal(document.querySelector('[data-role="mobile-task-title"]')?.textContent.includes('인지'), true);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/docs/render.test.mjs`
Expected: FAIL because the mobile toolbar markup does not exist yet.

- [ ] **Step 3: Write the failing interaction test**

```js
toggle.click();
assert.equal(sidebar.classList.contains('is-open'), true);
assert.equal(backdrop.hidden, false);
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- tests/docs/app.test.mjs`
Expected: FAIL because no drawer controller exists yet.

- [ ] **Step 5: Commit**

```bash
git add tests/docs/render.test.mjs tests/docs/app.test.mjs
git commit -m "test: cover mobile sidebar drawer"
```

### Task 2: Implement the mobile drawer shell and controller

**Files:**
- Modify: `docs/index.html`
- Modify: `docs/assets/app.js`
- Modify: `docs/assets/render.js`
- Modify: `docs/assets/styles.css`
- Test: `tests/docs/render.test.mjs`, `tests/docs/app.test.mjs`

- [ ] **Step 1: Write the minimal shell markup**

```html
<button data-role="sidebar-toggle" class="menu-toggle" type="button" aria-expanded="false" aria-controls="task-sidebar">메뉴</button>
<div data-role="mobile-task-title" class="mobile-task-title"></div>
<button data-role="sidebar-backdrop" class="sidebar-backdrop" type="button" hidden aria-label="메뉴 닫기"></button>
```

- [ ] **Step 2: Implement minimal controller code**

```js
export function syncShellChrome(regions, { taskTitle, sidebarOpen }) {
  regions.sidebar?.classList.toggle('is-open', sidebarOpen);
  regions.backdrop.hidden = !sidebarOpen;
  regions.toggle.setAttribute('aria-expanded', String(sidebarOpen));
  regions.mobileTitle.textContent = taskTitle ?? '';
}
```

- [ ] **Step 3: Implement mobile CSS**

```css
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(88vw, 320px);
    transform: translateX(-104%);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }
}
```

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `npm test -- tests/docs/render.test.mjs tests/docs/app.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/index.html docs/assets/app.js docs/assets/render.js docs/assets/styles.css tests/docs/render.test.mjs tests/docs/app.test.mjs
git commit -m "feat: add mobile sidebar drawer"
```

### Task 3: Verify full site behavior and deploy

**Files:**
- Modify: `docs/` deployment artifact via subtree split
- Test: `tests/docs/*.test.mjs`

- [ ] **Step 1: Run the full docs test suite**

Run: `npm test`
Expected: PASS with 0 failures

- [ ] **Step 2: Push source repository changes**

Run: `git push origin HEAD:feature/imc-ads-docs HEAD:master`
Expected: both refs updated

- [ ] **Step 3: Redeploy Pages companion repo**

Run: `git subtree split --prefix docs HEAD` and `git push pages <split-sha>:main --force`
Expected: Pages repo main updated

- [ ] **Step 4: Verify latest Pages build**

Run: `gh api repos/sjaemiss-cmd/imc-ads-docs/pages/builds/latest`
Expected: `status` is `built`

- [ ] **Step 5: Commit**

```bash
git status --short
```

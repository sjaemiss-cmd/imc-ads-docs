import { buildHash } from './router.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

function groupTasks(tasks) {
  const map = new Map();

  for (const task of tasks) {
    if (!map.has(task.group)) {
      map.set(task.group, []);
    }

    map.get(task.group).push(task);
  }

  return [...map.entries()].map(([group, items]) => ({ group, items }));
}

function renderBadgeList(items = []) {
  return items.map((item) => `<li class="badge">${escapeHtml(item)}</li>`).join('');
}

function renderBulletList(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderSources(items = []) {
  return items
    .map(
      (item) => `
        <li class="source-item">
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>
          <span>${escapeHtml(item.note ?? '')}</span>
        </li>
      `
    )
    .join('');
}

function renderSidebar(sidebar, tasks, adsByTask, activeTaskId) {
  if (!sidebar) {
    return;
  }

  const groupedTasks = groupTasks(tasks);
  const totalAds = Object.values(adsByTask).reduce((sum, entry) => sum + (entry.ads?.length ?? 0), 0);

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <p class="eyebrow">IMC 광고 Docs</p>
      <h1>과제별 광고 조사</h1>
      <p class="sidebar-copy">좌측 과제 탭과 상단 광고 탭으로 각 사례를 빠르게 비교할 수 있게 정리했습니다.</p>
      <dl class="sidebar-stats">
        <div>
          <dt>과제</dt>
          <dd>${tasks.length}</dd>
        </div>
        <div>
          <dt>광고</dt>
          <dd>${totalAds}</dd>
        </div>
      </dl>
    </div>
    <div class="sidebar-groups">
      ${groupedTasks
        .map(
          ({ group, items }) => `
            <section class="task-group">
              <h2>${escapeHtml(group)}</h2>
              <div class="task-links">
                ${items
                  .map((task) => {
                    const firstAdId = adsByTask[task.id]?.ads?.[0]?.id ?? '';
                    const isActive = task.id === activeTaskId;

                    return `
                      <a
                        class="task-link${isActive ? ' is-active' : ''}"
                        href="${escapeHtml(buildHash(task.id, firstAdId))}"
                        ${isActive ? 'aria-current="page"' : ''}
                        data-task-id="${escapeHtml(task.id)}"
                      >
                        <span class="task-link-title">${escapeHtml(task.title)}</span>
                        <span class="task-link-meta">${task.adCount}개 광고</span>
                      </a>
                    `;
                  })
                  .join('')}
              </div>
            </section>
          `
        )
        .join('')}
    </div>
  `;
}

function renderTabs(tabs, task, adList, activeAdId) {
  if (!tabs) {
    return;
  }

  if (!task) {
    tabs.innerHTML = '';
    return;
  }

  tabs.innerHTML = `
    <div class="tab-header">
      <div>
        <p class="eyebrow">현재 과제</p>
        <h2>${escapeHtml(task.title)}</h2>
      </div>
      <p class="tab-hint">상단 탭에서 광고 사례를 전환합니다.</p>
    </div>
    <div class="tab-list" role="tablist" aria-label="광고 사례 목록">
      ${adList
        .map((ad) => {
          const isActive = ad.id === activeAdId;
          return `
            <a
              class="tab-link${isActive ? ' is-active' : ''}"
              href="${escapeHtml(buildHash(task.id, ad.id))}"
              role="tab"
              aria-selected="${isActive ? 'true' : 'false'}"
            >
              <span>${escapeHtml(ad.label)}</span>
              <small>${escapeHtml(ad.position)}</small>
            </a>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderContent(content, task, ad, blacklist) {
  if (!content) {
    return;
  }

  if (!task || !ad) {
    content.innerHTML = '<div class="empty-state"><h1>표시할 광고가 없습니다.</h1></div>';
    return;
  }

  content.innerHTML = `
    <article class="doc-page">
      <header class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(task.group)}</p>
          <h1>${escapeHtml(ad.label)}</h1>
          <p class="hero-subtitle">${escapeHtml(ad.brand)} / ${escapeHtml(ad.campaign)}</p>
          <p class="hero-summary">${escapeHtml(ad.summary)}</p>
          <div class="hero-actions">
            <a class="watch-button" href="${escapeHtml(ad.watchUrl)}" target="_blank" rel="noreferrer">광고 시청</a>
          </div>
          <ul class="badge-list">${renderBadgeList(ad.keywords)}</ul>
        </div>
        <dl class="hero-meta">
          <div>
            <dt>과제</dt>
            <dd>${escapeHtml(task.title)}</dd>
          </div>
          <div>
            <dt>분류</dt>
            <dd>${escapeHtml(ad.position)}</dd>
          </div>
          <div>
            <dt>집행 시점</dt>
            <dd>${escapeHtml(formatDate(ad.publishedAt))}</dd>
          </div>
          <div>
            <dt>매체</dt>
            <dd>${escapeHtml(ad.medium)}</dd>
          </div>
        </dl>
      </header>

      <section class="story-grid">
        <section class="story-card">
          <p class="section-index">01</p>
          <h2>핵심개념 설명</h2>
          <p>${escapeHtml(ad.conceptSummary)}</p>
          <ul>${renderBulletList(ad.conceptBullets)}</ul>
        </section>
        <section class="story-card">
          <p class="section-index">02</p>
          <h2>사례</h2>
          <p>${escapeHtml(ad.caseSummary)}</p>
          <ul>${renderBulletList(ad.caseBullets)}</ul>
        </section>
        <section class="story-card">
          <p class="section-index">03</p>
          <h2>구현된 개념 정리</h2>
          <p>${escapeHtml(ad.implementationAnalysis)}</p>
          <ul>${renderBulletList(ad.implementationBullets)}</ul>
        </section>
      </section>

      <section class="support-grid">
        <section class="support-card">
          <h2>검토 메모</h2>
          <p>${escapeHtml(ad.duplicateCheck)}</p>
          <p class="support-note">eCampus 중복 방지 목록 ${blacklist?.usedAds?.length ?? 0}건과 대조했습니다.</p>
        </section>
        <section class="support-card">
          <h2>출처</h2>
          <ul class="source-list">${renderSources(ad.sources)}</ul>
        </section>
      </section>
    </article>
  `;
}

export function renderApp(regions, state) {
  const task = state.tasks.find((entry) => entry.id === state.selection.taskId) ?? null;
  const adList = task ? state.adsByTask[task.id]?.ads ?? [] : [];
  const ad = adList.find((entry) => entry.id === state.selection.adId) ?? adList[0] ?? null;

  renderSidebar(regions.sidebar, state.tasks, state.adsByTask, task?.id ?? null);
  renderTabs(regions.tabs, task, adList, ad?.id ?? null);
  renderContent(regions.content, task, ad, state.blacklist);
}

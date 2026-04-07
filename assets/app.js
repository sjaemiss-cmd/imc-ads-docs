import { buildHash, resolveSelection } from './router.js';
import { loadAds, loadTasks } from './store.js';

const sidebar = document.querySelector("[data-role='task-sidebar']");
const tabs = document.querySelector("[data-role='ad-tabs']");
const content = document.querySelector("[data-role='ad-content']");

function renderSidebar(tasks, selection) {
  if (!sidebar) {
    return;
  }

  sidebar.innerHTML = tasks
    .map(
      (task) => `
        <div class="task-link${task.id === selection.taskId ? ' is-active' : ''}">
          <div class="task-group">${task.group}</div>
          <div class="task-title">${task.title}</div>
        </div>
      `
    )
    .join('');
}

function renderTabs(task, selection) {
  if (!tabs) {
    return;
  }

  if (!task) {
    tabs.innerHTML = '';
    return;
  }

  if (!task.ads.length) {
    tabs.innerHTML = '<div class="tab-empty">광고 데이터를 불러오는 중입니다.</div>';
    return;
  }

  tabs.innerHTML = task.ads
    .map(
      (ad) => `
        <a class="tab${ad.id === selection.adId ? ' is-active' : ''}" href="${buildHash(task.id, ad.id)}">
          ${ad.label ?? ad.id}
        </a>
      `
    )
    .join('');
}

function renderContent({ task, ad }) {
  if (!content) {
    return;
  }

  if (!task) {
    content.innerHTML = '<div class="placeholder">표시할 과제가 없습니다.</div>';
    return;
  }

  if (!ad) {
    content.innerHTML = `
      <div class="placeholder">
        <h1>${task.title}</h1>
        <p>${task.group}</p>
        <p>광고 데이터가 아직 준비되지 않았습니다.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="placeholder">
      <h1>${task.title}</h1>
      <p>${task.group}</p>
      <p>선택된 광고: ${ad.label ?? ad.id}</p>
      <p>이 화면은 최소 상태 자리표시자입니다.</p>
    </div>
  `;
}

async function bootstrap() {
  const tasks = await loadTasks();
  const hydratedTasks = await loadAds(tasks);

  const render = () => {
    const selection = resolveSelection(hydratedTasks, window.location.hash);
    const task = hydratedTasks.find((entry) => entry.id === selection.taskId) ?? hydratedTasks[0] ?? null;
    const ad = task?.ads?.find((entry) => entry.id === selection.adId) ?? task?.ads?.[0] ?? null;

    renderSidebar(hydratedTasks, selection);
    renderTabs(task, selection);
    renderContent({ task, ad });
  };

  render();
  window.addEventListener('hashchange', render);
}

bootstrap().catch(() => {
  if (content) {
    content.innerHTML = '<div class="placeholder">앱을 불러오지 못했습니다.</div>';
  }
});

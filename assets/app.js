import { buildHash, parseHash, resolveSelection } from './router.js';
import { renderApp } from './render.js';
import { loadAds, loadBlacklist, loadTasks } from './store.js';

const regions = {
  sidebar: document.querySelector("[data-role='task-sidebar']"),
  tabs: document.querySelector("[data-role='ad-tabs']"),
  content: document.querySelector("[data-role='ad-content']"),
};

function renderError(message) {
  if (!regions.content) {
    return;
  }

  regions.content.innerHTML = `
    <div class="empty-state">
      <h1>불러오기 실패</h1>
      <p>${message}</p>
    </div>
  `;
}

async function bootstrap() {
  const tasks = await loadTasks();
  const [adsByTask, blacklist] = await Promise.all([loadAds(tasks), loadBlacklist()]);

  const render = () => {
    const selection = resolveSelection(parseHash(window.location.hash), tasks, adsByTask);
    const activeAds = selection.taskId ? adsByTask[selection.taskId]?.ads ?? [] : [];
    const nextAdId = selection.adId ?? activeAds[0]?.id ?? null;
    const nextHash = selection.taskId && nextAdId ? buildHash(selection.taskId, nextAdId) : null;

    if (nextHash && window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }

    renderApp(regions, {
      tasks,
      adsByTask,
      blacklist,
      selection: {
        taskId: selection.taskId,
        adId: nextAdId,
      },
    });
  };

  render();
  window.addEventListener('hashchange', render);
}

bootstrap().catch(() => {
  renderError('데이터 파일을 읽지 못했습니다.');
});

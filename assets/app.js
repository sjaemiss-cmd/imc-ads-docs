import { buildHash, parseHash, resolveSelection } from './router.js';
import { loadAds, loadTasks } from './store.js';

const content = document.querySelector("[data-role='ad-content']");

function renderPlaceholder(tasks, adsByTask, selection) {
  if (!content) {
    return;
  }

  const task = tasks.find((entry) => entry.id === selection.taskId) ?? tasks[0] ?? null;
  const adList = task ? adsByTask[task.id]?.ads ?? [] : [];
  const ad = adList.find((entry) => entry.id === selection.adId) ?? null;

  if (!task) {
    content.innerHTML = '<div class="placeholder">과제 정보를 불러오지 못했습니다.</div>';
    return;
  }

  const heading = ad ? `${task.title} / ${ad.label ?? ad.id}` : task.title;
  const message = ad
    ? '라우팅 상태가 연결되었습니다. 상세 렌더는 다음 단계에서 붙습니다.'
    : '광고 데이터 준비 중입니다.';

  content.innerHTML = `
    <div class="placeholder">
      <h1>${heading}</h1>
      <p>${task.group}</p>
      <p>${message}</p>
      <pre>${JSON.stringify(selection, null, 2)}</pre>
    </div>
  `;
}

async function bootstrap() {
  const tasks = await loadTasks();
  const adsByTask = await loadAds(tasks);

  const render = () => {
    const selection = resolveSelection(parseHash(window.location.hash), tasks, adsByTask);
    const activeAds = selection.taskId ? adsByTask[selection.taskId]?.ads ?? [] : [];
    const nextAdId = selection.adId ?? activeAds[0]?.id ?? null;
    const nextHash = selection.taskId && nextAdId ? buildHash(selection.taskId, nextAdId) : null;

    if (nextHash && window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }

    renderPlaceholder(tasks, adsByTask, {
      taskId: selection.taskId,
      adId: nextAdId,
    });
  };

  render();
  window.addEventListener('hashchange', render);
}

bootstrap().catch(() => {
  if (content) {
    content.innerHTML = '<div class="placeholder">앱을 불러오지 못했습니다.</div>';
  }
});

import { buildHash, parseHash, resolveSelection } from './router.js';
import { renderApp } from './render.js';
import { loadAds, loadBlacklist, loadTasks } from './store.js';

const regions = {
  sidebar: document.querySelector("[data-role='task-sidebar']"),
  toggle: document.querySelector("[data-role='sidebar-toggle']"),
  mobileTitle: document.querySelector("[data-role='mobile-task-title']"),
  backdrop: document.querySelector("[data-role='sidebar-backdrop']"),
  tabs: document.querySelector("[data-role='ad-tabs']"),
  content: document.querySelector("[data-role='ad-content']"),
};

function defaultIsMobileViewport() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 900px)').matches
    : false;
}

function getDocumentBody(regions) {
  return regions.sidebar?.ownerDocument?.body ?? regions.toggle?.ownerDocument?.body ?? null;
}

export function syncShellChrome(regions, { taskTitle = '', sidebarOpen = false } = {}) {
  const isOpen = Boolean(sidebarOpen);
  const body = getDocumentBody(regions);

  regions.sidebar?.classList.toggle('is-open', isOpen);
  regions.toggle?.setAttribute('aria-expanded', String(isOpen));
  regions.toggle?.setAttribute('aria-label', isOpen ? '과제 메뉴 닫기' : '과제 메뉴 열기');

  if (regions.mobileTitle) {
    regions.mobileTitle.textContent = taskTitle;
  }

  if (regions.backdrop) {
    regions.backdrop.hidden = !isOpen;
  }

  body?.classList.toggle('drawer-open', isOpen);
}

export function createShellController(regions, { isMobileViewport = defaultIsMobileViewport } = {}) {
  const state = {
    taskTitle: '',
    sidebarOpen: false,
  };

  const sync = ({ taskTitle, sidebarOpen } = {}) => {
    if (typeof taskTitle === 'string') {
      state.taskTitle = taskTitle;
    }

    if (typeof sidebarOpen === 'boolean') {
      state.sidebarOpen = sidebarOpen;
    }

    if (!isMobileViewport()) {
      state.sidebarOpen = false;
    }

    syncShellChrome(regions, state);
  };

  const open = () => sync({ sidebarOpen: true });
  const close = () => sync({ sidebarOpen: false });
  const toggle = () => sync({ sidebarOpen: !state.sidebarOpen });

  regions.toggle?.addEventListener('click', () => {
    if (!isMobileViewport()) {
      close();
      return;
    }

    toggle();
  });

  regions.backdrop?.addEventListener('click', close);

  regions.sidebar?.addEventListener('click', (event) => {
    if (!isMobileViewport()) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('.task-link')) {
      close();
    }
  });

  window.addEventListener('resize', () => {
    if (!isMobileViewport()) {
      close();
      return;
    }

    sync();
  });

  sync();

  return {
    sync,
    open,
    close,
    toggle,
    getState() {
      return { ...state };
    },
  };
}

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
  const shell = createShellController(regions);

  const render = () => {
    const selection = resolveSelection(parseHash(window.location.hash), tasks, adsByTask);
    const activeAds = selection.taskId ? adsByTask[selection.taskId]?.ads ?? [] : [];
    const nextAdId = selection.adId ?? activeAds[0]?.id ?? null;
    const nextHash = selection.taskId && nextAdId ? buildHash(selection.taskId, nextAdId) : null;
    const activeTask = tasks.find((entry) => entry.id === selection.taskId) ?? null;

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

    shell.sync({
      taskTitle: activeTask?.title ?? '',
    });
  };

  render();
  window.addEventListener('hashchange', render);
}

bootstrap().catch(() => {
  renderError('데이터 파일을 읽지 못했습니다.');
});

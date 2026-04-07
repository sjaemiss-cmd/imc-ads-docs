export function parseHash(hash = '') {
  if (typeof hash !== 'string') {
    return { taskId: null, adId: null };
  }

  const match = /^#\/task\/([^/]+)\/ad\/([^/]+)$/.exec(hash);
  if (!match) {
    return { taskId: null, adId: null };
  }

  return {
    taskId: decodeURIComponent(match[1]),
    adId: decodeURIComponent(match[2]),
  };
}

export function buildHash(taskId, adId) {
  return `#/task/${encodeURIComponent(taskId)}/ad/${encodeURIComponent(adId)}`;
}

export function resolveSelection(route, tasks, adsByTask) {
  const fallbackTask = tasks[0] ?? null;
  if (!fallbackTask) {
    return { taskId: null, adId: null };
  }

  const selectedTask = tasks.find((task) => task.id === route?.taskId) ?? fallbackTask;
  const adList = adsByTask[selectedTask.id]?.ads ?? [];
  const selectedAd = adList.find((ad) => ad.id === route?.adId) ?? adList[0] ?? null;

  return {
    taskId: selectedTask.id,
    adId: selectedAd?.id ?? null,
  };
}

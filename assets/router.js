export function parseHash(hash) {
  if (typeof hash !== 'string') {
    return null;
  }

  const match = hash.match(/^#\/task\/([^/]+)\/ad\/([^/]+)$/);
  if (!match) {
    return null;
  }

  return {
    taskId: decodeURIComponent(match[1]),
    adId: decodeURIComponent(match[2]),
  };
}

export function buildHash(taskId, adId) {
  return `#/task/${encodeURIComponent(taskId)}/ad/${encodeURIComponent(adId)}`;
}

export function resolveSelection(tasks, hash) {
  const parsed = parseHash(hash);
  const fallbackTask = tasks[0] ?? null;
  const task = parsed
    ? tasks.find((entry) => entry.id === parsed.taskId) ?? fallbackTask
    : fallbackTask;
  const ad = task?.ads?.find((entry) => entry.id === parsed?.adId) ?? task?.ads?.[0] ?? null;

  return {
    taskId: task?.id ?? null,
    adId: ad?.id ?? null,
  };
}

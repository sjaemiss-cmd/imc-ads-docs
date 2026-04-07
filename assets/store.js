async function readJson(relativePath) {
  const url = new URL(relativePath, import.meta.url);

  if (typeof process !== 'undefined' && process.versions?.node) {
    const [{ readFile }, { fileURLToPath }] = await Promise.all([
      import('node:fs/promises'),
      import('node:url'),
    ]);

    return JSON.parse(await readFile(fileURLToPath(url), 'utf8'));
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url.pathname}`);
  }

  return response.json();
}

export async function loadTasks() {
  const tasks = await readJson('../data/tasks.json');
  return Array.isArray(tasks) ? tasks : [];
}

export async function loadAds(tasks) {
  const entries = await Promise.all(tasks.map(async (task) => [task.id, await readJson(`../data/${task.adsFile}`)]));

  return Object.fromEntries(entries);
}

export async function loadBlacklist() {
  return readJson('../data/blacklist.json');
}

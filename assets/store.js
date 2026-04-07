async function readJson(relativeUrl) {
  const url = new URL(relativeUrl, import.meta.url);

  if (typeof process !== 'undefined' && process.versions?.node) {
    const [{ readFile }, { fileURLToPath }] = await Promise.all([
      import('node:fs/promises'),
      import('node:url'),
    ]);

    const filePath = fileURLToPath(url);
    return JSON.parse(await readFile(filePath, 'utf8'));
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
  const hydratedTasks = [];

  for (const task of tasks) {
    try {
      const adsData = await readJson(task.adsFile);
      const ads = Array.isArray(adsData?.ads) ? adsData.ads : [];

      hydratedTasks.push({
        ...task,
        ads,
      });
    } catch {
      hydratedTasks.push({
        ...task,
        ads: [],
      });
    }
  }

  return hydratedTasks;
}

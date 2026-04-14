(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.WikiTranslationCache = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function buildCacheKey(from, to, source) {
    return `${from}>${to}:${source}`;
  }

  function parseCacheKey(key) {
    if (typeof key !== 'string') return null;

    const arrowIndex = key.indexOf('>');
    const colonIndex = key.indexOf(':', arrowIndex + 1);
    if (arrowIndex <= 0 || colonIndex <= arrowIndex + 1) return null;

    return {
      from: key.slice(0, arrowIndex),
      to: key.slice(arrowIndex + 1, colonIndex),
      source: key.slice(colonIndex + 1),
    };
  }

  function normalizeText(value) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  }

  function hasHangul(text) {
    return /[\uac00-\ud7a3]/.test(text);
  }

  function hasBurmese(text) {
    return /[\u1000-\u109f]/i.test(text);
  }

  function shouldAcceptTranslation(from, to, source, translated) {
    const normalizedSource = normalizeText(source);
    const normalizedTranslated = normalizeText(translated);

    if (!normalizedSource || !normalizedTranslated) return false;
    if (normalizedSource === normalizedTranslated) return false;

    if (from === 'ko' && to === 'my' && hasHangul(normalizedSource)) {
      return hasBurmese(normalizedTranslated);
    }

    if (from === 'my' && to === 'ko' && hasBurmese(normalizedSource)) {
      return !hasBurmese(normalizedTranslated);
    }

    return true;
  }

  function getCachedTranslation(cache, from, to, source) {
    if (!cache || typeof cache !== 'object') return null;

    const key = buildCacheKey(from, to, source);
    const translated = cache[key];
    return shouldAcceptTranslation(from, to, source, translated) ? translated : null;
  }

  function sanitizeTranslationCache(cache) {
    if (!cache || typeof cache !== 'object') return {};

    const sanitized = {};
    for (const [key, translated] of Object.entries(cache)) {
      const parsed = parseCacheKey(key);
      if (!parsed) {
        sanitized[key] = translated;
        continue;
      }

      if (shouldAcceptTranslation(parsed.from, parsed.to, parsed.source, translated)) {
        sanitized[key] = translated;
      }
    }

    return sanitized;
  }

  return {
    buildCacheKey,
    getCachedTranslation,
    sanitizeTranslationCache,
    shouldAcceptTranslation,
  };
});

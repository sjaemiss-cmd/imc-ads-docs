import test from 'node:test';
import assert from 'node:assert/strict';

await import('../assets/wiki-translation-cache.js');
const { getCachedTranslation, sanitizeTranslationCache } = globalThis.WikiTranslationCache;

test('ignores polluted Korean->Burmese cache entries that kept the Korean source text', () => {
  const cache = {
    'ko>my:과제 안내 (제출 형식 · 선정 기준 · 마감)': '과제 안내 (제출 형식 · 선정 기준 · 마감)',
  };

  assert.equal(
    getCachedTranslation(cache, 'ko', 'my', '과제 안내 (제출 형식 · 선정 기준 · 마감)'),
    null,
  );
});

test('removes polluted Korean->Burmese cache entries but keeps valid Burmese translations', () => {
  const cache = {
    'ko>my:과제 안내': '과제 안내',
    'ko>my:과제 목적': 'အလုပ်တာဝန် ရည်ရွယ်ချက်',
    'my>ko:အလုပ်တာဝန် ရည်ရွယ်ချက်': '과제 목적',
  };

  assert.deepEqual(sanitizeTranslationCache(cache), {
    'ko>my:과제 목적': 'အလုပ်တာဝန် ရည်ရွယ်ချက်',
    'my>ko:အလုပ်တာဝန် ရည်ရွယ်ချက်': '과제 목적',
  });
});

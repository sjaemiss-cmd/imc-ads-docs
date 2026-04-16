import test from 'node:test';
import assert from 'node:assert/strict';

// UMD module sets globalThis.WikiEvalCache as side effect
await import('../assets/wiki-eval-cache.js');
const { getContentSnapshot, validateEvalResult } = globalThis.WikiEvalCache;

// ── getContentSnapshot ──

test('produces deterministic snapshot from submission fields', () => {
  const sub = { brand: 'A', campaign: 'B', published_at: 'C', medium: 'D', concept_summary: 'E', case_analysis: 'F' };
  assert.equal(getContentSnapshot(sub), 'A|B|C|D|E|F');
  assert.equal(getContentSnapshot(sub), getContentSnapshot(sub));
});

test('treats missing fields as empty strings', () => {
  const sub = { brand: 'A' };
  assert.equal(getContentSnapshot(sub), 'A|||||');
});

test('detects content changes', () => {
  const before = { brand: 'X', campaign: 'Y', published_at: '', medium: '', concept_summary: 'old', case_analysis: '' };
  const after  = { brand: 'X', campaign: 'Y', published_at: '', medium: '', concept_summary: 'new', case_analysis: '' };
  assert.notEqual(getContentSnapshot(before), getContentSnapshot(after));
});

// ── validateEvalResult ──

test('accepts valid evaluation result', () => {
  const valid = {
    totalScore: 75,
    grade: 'A',
    scores: {
      conceptFit: { score: 25, reason: '', comment: '' },
      analysisEase: { score: 20, reason: '', comment: '' },
      exclusivity: { score: 12, reason: '', comment: '' },
      duplicationAvoidance: { score: 8, reason: '', comment: '' },
      presentationImpact: { score: 10, reason: '', comment: '' },
    },
    summary: 'good',
  };
  assert.equal(validateEvalResult(valid), true);
});

test('rejects null or non-object', () => {
  assert.equal(validateEvalResult(null), false);
  assert.equal(validateEvalResult('string'), false);
  assert.equal(validateEvalResult(42), false);
});

test('rejects missing totalScore or grade', () => {
  assert.equal(validateEvalResult({ grade: 'A', scores: {} }), false);
  assert.equal(validateEvalResult({ totalScore: 75, scores: {} }), false);
});

test('rejects missing or incomplete scores object', () => {
  const partial = {
    totalScore: 50,
    grade: 'C',
    scores: {
      conceptFit: { score: 10, reason: '', comment: '' },
    },
  };
  assert.equal(validateEvalResult(partial), false);
});

test('rejects score with wrong type', () => {
  const wrongType = {
    totalScore: 50,
    grade: 'C',
    scores: {
      conceptFit: { score: 'ten', reason: '', comment: '' },
      analysisEase: { score: 10, reason: '', comment: '' },
      exclusivity: { score: 10, reason: '', comment: '' },
      duplicationAvoidance: { score: 10, reason: '', comment: '' },
      presentationImpact: { score: 10, reason: '', comment: '' },
    },
  };
  assert.equal(validateEvalResult(wrongType), false);
});

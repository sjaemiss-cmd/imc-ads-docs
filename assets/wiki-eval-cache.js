(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.WikiEvalCache = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function getContentSnapshot(sub) {
    return [
      sub.brand || '',
      sub.campaign || '',
      sub.published_at || '',
      sub.medium || '',
      sub.concept_summary || '',
      sub.case_analysis || '',
    ].join('|');
  }

  function validateEvalResult(r) {
    if (!r || typeof r !== 'object') return false;
    if (typeof r.totalScore !== 'number' || typeof r.grade !== 'string') return false;
    if (!r.scores || typeof r.scores !== 'object') return false;
    var keys = ['conceptFit', 'analysisEase', 'exclusivity', 'duplicationAvoidance', 'presentationImpact'];
    return keys.every(function (k) {
      return r.scores[k] && typeof r.scores[k].score === 'number';
    });
  }

  return {
    getContentSnapshot: getContentSnapshot,
    validateEvalResult: validateEvalResult,
  };
});

// AHP — Analytical Hierarchy Process (Saaty, 1970s)
// Pure math, no DOM. Exposed on window.AHP for the UI layer.

const RI = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

function normalizeMatrix(matrix) {
  const n = matrix.length;
  const colSums = Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      colSums[j] += matrix[i][j];
  return matrix.map(row => row.map((v, j) => v / colSums[j]));
}

function priorityVector(matrix) {
  const norm = normalizeMatrix(matrix);
  return norm.map(row => row.reduce((a, b) => a + b, 0) / row.length);
}

function lambdaMax(matrix, weights) {
  const n = matrix.length;
  const weightedSum = matrix.map(row =>
    row.reduce((acc, v, j) => acc + v * weights[j], 0)
  );
  const lambdas = weightedSum.map((s, i) => s / weights[i]);
  return lambdas.reduce((a, b) => a + b, 0) / n;
}

function consistency(matrix, weights) {
  const n = matrix.length;
  if (n <= 2) {
    return { lambdaMax: n, CI: 0, RI: 0, CR: 0, isConsistent: true };
  }
  const lmax = lambdaMax(matrix, weights);
  const CI = (lmax - n) / (n - 1);
  const ri = RI[n] || 1.49;
  const CR = ri === 0 ? 0 : CI / ri;
  return { lambdaMax: lmax, CI, RI: ri, CR, isConsistent: CR < 0.10 };
}

// Identify the pair (i,j) most responsible for the inconsistency.
// For a perfectly consistent matrix, a[i][j] should equal w[i]/w[j].
// We look for the cell whose actual value diverges most (in log-space)
// from this ideal — that pair is the user's "weakest link".
function mostInconsistentPair(matrix, weights) {
  const n = matrix.length;
  let worst = null;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const ideal = weights[i] / weights[j];
      const actual = matrix[i][j];
      const deviation = Math.abs(Math.log(actual / ideal));
      if (!worst || deviation > worst.deviation) {
        worst = { i, j, actual, ideal, deviation };
      }
    }
  }
  return worst;
}

function synthesize(criteria, alternatives, criteriaWeights, altWeightsByCriterion) {
  const finalScores = alternatives.map((_, altIdx) => {
    let score = 0;
    criteria.forEach((crit, critIdx) => {
      score += criteriaWeights[critIdx] * altWeightsByCriterion[crit][altIdx];
    });
    return score;
  });

  const ranked = alternatives
    .map((name, idx) => ({ name, score: finalScores[idx] }))
    .sort((a, b) => b.score - a.score);

  return { finalScores, ranked };
}

window.AHP = {
  RI,
  normalizeMatrix,
  priorityVector,
  lambdaMax,
  consistency,
  mostInconsistentPair,
  synthesize
};

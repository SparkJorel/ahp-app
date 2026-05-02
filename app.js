// UI controller for the AHP web app.
// Single mutable state object, full re-render on changes.

const state = {
  goal: "",
  criteria: [],
  alternatives: [],
  criteriaMatrix: [],
  altMatrices: {}
};

const SAATY_OPTIONS = [
  { value: 9,    label: "9 — A extremement plus important" },
  { value: 8,    label: "8" },
  { value: 7,    label: "7 — A tres fortement plus important" },
  { value: 6,    label: "6" },
  { value: 5,    label: "5 — A fortement plus important" },
  { value: 4,    label: "4" },
  { value: 3,    label: "3 — A moderement plus important" },
  { value: 2,    label: "2" },
  { value: 1,    label: "1 — Egalite" },
  { value: 1/2,  label: "1/2" },
  { value: 1/3,  label: "1/3 — B moderement plus important" },
  { value: 1/4,  label: "1/4" },
  { value: 1/5,  label: "1/5 — B fortement plus important" },
  { value: 1/6,  label: "1/6" },
  { value: 1/7,  label: "1/7 — B tres fortement plus important" },
  { value: 1/8,  label: "1/8" },
  { value: 1/9,  label: "1/9 — B extremement plus important" }
];

// === Helpers ===

function formatNumber(v) {
  if (Math.abs(v - 1) < 0.001) return "1";
  if (Math.abs(v - Math.round(v)) < 0.001) return String(Math.round(v));
  const r = 1 / v;
  if (Math.abs(r - Math.round(r)) < 0.001) return "1/" + Math.round(r);
  return v.toFixed(3);
}

function formatPercent(v) {
  return (v * 100).toFixed(1) + " %";
}

function makeIdentityMatrix(n) {
  const m = [];
  for (let i = 0; i < n; i++) {
    m.push([]);
    for (let j = 0; j < n; j++) m[i].push(i === j ? 1 : 1);
  }
  return m;
}

function resizeMatrix(old, newSize) {
  const oldSize = old ? old.length : 0;
  const m = [];
  for (let i = 0; i < newSize; i++) {
    m.push([]);
    for (let j = 0; j < newSize; j++) {
      if (i === j) m[i].push(1);
      else if (i < oldSize && j < oldSize) m[i].push(old[i][j]);
      else m[i].push(1);
    }
  }
  return m;
}

function resyncMatrices() {
  state.criteriaMatrix = resizeMatrix(state.criteriaMatrix, state.criteria.length);
  const newAlt = {};
  for (const c of state.criteria) {
    newAlt[c] = resizeMatrix(state.altMatrices[c], state.alternatives.length);
  }
  state.altMatrices = newAlt;
}

// === Saaty dropdown ===

function createSaatyDropdown(currentValue, onChange) {
  const sel = document.createElement("select");
  for (const opt of SAATY_OPTIONS) {
    const o = document.createElement("option");
    o.value = String(opt.value);
    o.textContent = opt.label;
    if (Math.abs(opt.value - currentValue) < 0.0001) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener("change", e => onChange(parseFloat(e.target.value)));
  return sel;
}

// === Pairwise matrix render ===

function renderPairwiseMatrix(container, labels, matrix, onUpdate) {
  container.innerHTML = "";
  const n = labels.length;
  if (n < 2) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "Ajoutez au moins 2 elements pour comparer.";
    container.appendChild(p);
    return;
  }

  const table = document.createElement("table");
  table.className = "pairwise-matrix";

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));
  for (const label of labels) {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  for (let i = 0; i < n; i++) {
    const row = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.textContent = labels[i];
    row.appendChild(labelCell);

    for (let j = 0; j < n; j++) {
      const cell = document.createElement("td");
      if (i === j) {
        cell.textContent = "1";
        cell.classList.add("diagonal");
      } else if (i < j) {
        const sel = createSaatyDropdown(matrix[i][j], v => {
          matrix[i][j] = v;
          matrix[j][i] = 1 / v;
          onUpdate();
        });
        cell.appendChild(sel);
      } else {
        cell.textContent = formatNumber(matrix[i][j]);
        cell.classList.add("mirror");
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  container.appendChild(table);
}

// === Setup section render ===

function renderEntityList(listEl, items, onRename, onRemove) {
  listEl.innerHTML = "";
  items.forEach((name, idx) => {
    const li = document.createElement("li");
    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.addEventListener("input", e => onRename(idx, e.target.value));
    li.appendChild(input);

    const btn = document.createElement("button");
    btn.className = "icon";
    btn.textContent = "X";
    btn.title = "Supprimer";
    btn.addEventListener("click", () => onRemove(idx));
    li.appendChild(btn);

    listEl.appendChild(li);
  });
}

function renderSetup() {
  document.getElementById("goal-input").value = state.goal;

  renderEntityList(
    document.getElementById("criteria-list"),
    state.criteria,
    (idx, value) => {
      const oldName = state.criteria[idx];
      state.criteria[idx] = value;
      if (state.altMatrices[oldName]) {
        state.altMatrices[value] = state.altMatrices[oldName];
        delete state.altMatrices[oldName];
      }
      // Light re-render: update only matrices that depend on this label.
      renderCriteriaMatrix();
      renderAltMatrices();
    },
    idx => {
      const removed = state.criteria.splice(idx, 1)[0];
      delete state.altMatrices[removed];
      resyncMatrices();
      rerender();
    }
  );

  renderEntityList(
    document.getElementById("alternatives-list"),
    state.alternatives,
    (idx, value) => {
      state.alternatives[idx] = value;
      renderAltMatrices();
    },
    idx => {
      state.alternatives.splice(idx, 1);
      resyncMatrices();
      rerender();
    }
  );
}

function renderCriteriaMatrix() {
  const container = document.getElementById("criteria-matrix-container");
  renderPairwiseMatrix(container, state.criteria, state.criteriaMatrix, () => {});
}

function renderAltMatrices() {
  const container = document.getElementById("alt-matrices-container");
  container.innerHTML = "";
  if (state.criteria.length === 0 || state.alternatives.length < 2) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "Definissez d'abord les criteres et au moins 2 alternatives.";
    container.appendChild(p);
    return;
  }
  for (const crit of state.criteria) {
    const block = document.createElement("div");
    block.className = "alt-matrix-block";
    const h3 = document.createElement("h3");
    h3.textContent = "Comparaison des alternatives selon : " + crit;
    block.appendChild(h3);
    const matrixDiv = document.createElement("div");
    matrixDiv.className = "matrix-wrap";
    block.appendChild(matrixDiv);
    if (!state.altMatrices[crit]) {
      state.altMatrices[crit] = makeIdentityMatrix(state.alternatives.length);
    }
    renderPairwiseMatrix(matrixDiv, state.alternatives, state.altMatrices[crit], () => {});
    container.appendChild(block);
  }
}

function rerender() {
  renderSetup();
  renderCriteriaMatrix();
  renderAltMatrices();
}

// === Actions ===

function loadPreset() {
  const p = window.PRESET_UNIVERSITES;
  state.goal = p.goal;
  state.criteria = [...p.criteria];
  state.alternatives = [...p.alternatives];
  state.criteriaMatrix = p.criteriaMatrix.map(r => [...r]);
  state.altMatrices = {};
  for (const k of Object.keys(p.altMatrices)) {
    state.altMatrices[k] = p.altMatrices[k].map(r => [...r]);
  }
  document.getElementById("results-section").classList.add("hidden");
  rerender();
}

function reset() {
  state.goal = "";
  state.criteria = [];
  state.alternatives = [];
  state.criteriaMatrix = [];
  state.altMatrices = {};
  document.getElementById("results-section").classList.add("hidden");
  rerender();
}

function addCriterion() {
  const name = "Critere " + (state.criteria.length + 1);
  state.criteria.push(name);
  resyncMatrices();
  rerender();
}

function addAlternative() {
  const name = "Alternative " + (state.alternatives.length + 1);
  state.alternatives.push(name);
  resyncMatrices();
  rerender();
}

// === Compute & results ===

function compute() {
  const out = document.getElementById("results-content");
  const section = document.getElementById("results-section");
  section.classList.remove("hidden");
  out.innerHTML = "";

  // Validation
  if (state.criteria.length < 2) {
    out.innerHTML = '<div class="result-banner error">Il faut au moins 2 criteres.</div>';
    section.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (state.alternatives.length < 2) {
    out.innerHTML = '<div class="result-banner error">Il faut au moins 2 alternatives.</div>';
    section.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // 1. Criteria weights + consistency
  const critWeights = AHP.priorityVector(state.criteriaMatrix);
  const critCons = AHP.consistency(state.criteriaMatrix, critWeights);

  if (!critCons.isConsistent) {
    renderInconsistency(out, "Matrice des criteres", state.criteria,
                        state.criteriaMatrix, critWeights, critCons);
    section.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // 2. Alternative weights per criterion + consistency
  const altWeights = {};
  const altConsistencies = {};
  for (const crit of state.criteria) {
    const m = state.altMatrices[crit];
    const w = AHP.priorityVector(m);
    const c = AHP.consistency(m, w);
    altWeights[crit] = w;
    altConsistencies[crit] = c;
    if (!c.isConsistent) {
      renderInconsistency(out, 'Matrice des alternatives selon "' + crit + '"',
                          state.alternatives, m, w, c);
      section.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }

  // 3. Synthesis
  const result = AHP.synthesize(state.criteria, state.alternatives, critWeights, altWeights);
  renderResults(out, critWeights, altWeights, result, critCons, altConsistencies);
  section.scrollIntoView({ behavior: "smooth" });
}

function renderInconsistency(out, matrixName, labels, matrix, weights, cons) {
  const banner = document.createElement("div");
  banner.className = "result-banner error";
  banner.innerHTML =
    "<strong>Matrice incoherente</strong> &mdash; " + matrixName +
    " : CR = <strong>" + cons.CR.toFixed(4) + "</strong> (seuil = 0.10).";
  out.appendChild(banner);

  const explain = document.createElement("p");
  explain.innerHTML =
    "L'application n'a pas pu proposer une recommandation car les comparaisons par paires se contredisent. " +
    "Voici la metrique principale et la paire la plus problematique a reviser.";
  out.appendChild(explain);

  const table = document.createElement("table");
  table.className = "consistency-table";
  table.innerHTML =
    "<tr><th>&lambda;<sub>max</sub></th><td>" + cons.lambdaMax.toFixed(4) + "</td></tr>" +
    "<tr><th>Indice de coherence (CI)</th><td>" + cons.CI.toFixed(4) + "</td></tr>" +
    "<tr><th>Indice aleatoire (RI)</th><td>" + cons.RI.toFixed(2) + "</td></tr>" +
    "<tr><th>Ratio de coherence (CR)</th><td class='ko'>" + cons.CR.toFixed(4) + " (&ge; 0.10)</td></tr>";
  out.appendChild(table);

  const worst = AHP.mostInconsistentPair(matrix, weights);
  if (worst) {
    const card = document.createElement("div");
    card.className = "inconsistency-card";
    const a = labels[worst.i];
    const b = labels[worst.j];
    card.innerHTML =
      "<strong>Paire la plus problematique : " + a + " vs " + b + "</strong><br>" +
      "Vous avez indique que <strong>" + a + "</strong> est <strong>" +
        formatNumber(worst.actual) + "</strong>x preferable a <strong>" + b + "</strong>.<br>" +
      "Or, d'apres l'ensemble de vos autres comparaisons, ce ratio devrait etre proche de <strong>" +
        formatNumber(worst.ideal) + "</strong>.<br>" +
      "<em>Ajustez cette comparaison (ou ses voisines) pour ramener le CR sous 0.10.</em>";
    out.appendChild(card);
  }
}

function renderResults(out, critWeights, altWeights, result, critCons, altConsistencies) {
  // Banner
  const banner = document.createElement("div");
  banner.className = "result-banner success";
  banner.innerHTML =
    "<strong>Toutes les matrices sont coherentes (CR &lt; 0.10).</strong> " +
    "La meilleure alternative est <strong>" + result.ranked[0].name + "</strong> " +
    "avec un score de " + result.ranked[0].score.toFixed(4) + ".";
  out.appendChild(banner);

  // Ranking
  out.appendChild(document.createElement("h3")).textContent = "Classement final";
  const max = result.ranked[0].score;
  const ul = document.createElement("ul");
  ul.className = "ranking";
  result.ranked.forEach((entry, idx) => {
    const li = document.createElement("li");
    if (idx === 0) li.classList.add("first");
    li.innerHTML =
      '<span class="rank">#' + (idx + 1) + '</span>' +
      '<span class="name">' + entry.name + '</span>' +
      '<span class="bar"><span class="bar-fill" style="width:' + (entry.score / max * 100) + '%"></span></span>' +
      '<span class="score">' + formatPercent(entry.score) + '</span>';
    ul.appendChild(li);
  });
  out.appendChild(ul);

  // Criteria weights detail
  const det1 = document.createElement("details");
  det1.innerHTML = "<summary>Poids des criteres</summary>";
  const t1 = document.createElement("table");
  t1.className = "detail-table";
  t1.innerHTML = "<tr><th>Critere</th><th>Poids</th></tr>";
  state.criteria.forEach((c, i) => {
    t1.innerHTML += "<tr><td>" + c + "</td><td>" + formatPercent(critWeights[i]) + "</td></tr>";
  });
  det1.appendChild(t1);
  out.appendChild(det1);

  // Per-criterion alternative scores
  const det2 = document.createElement("details");
  det2.innerHTML = "<summary>Scores des alternatives par critere</summary>";
  const t2 = document.createElement("table");
  t2.className = "detail-table";
  let header = "<tr><th>Alternative</th>";
  state.criteria.forEach(c => {
    header += "<th>" + c + "<br><small>(poids " + formatPercent(critWeights[state.criteria.indexOf(c)]) + ")</small></th>";
  });
  header += "<th>Score final</th></tr>";
  t2.innerHTML = header;
  state.alternatives.forEach((alt, ai) => {
    let row = "<tr><td>" + alt + "</td>";
    state.criteria.forEach(c => {
      row += "<td>" + formatPercent(altWeights[c][ai]) + "</td>";
    });
    row += "<td><strong>" + formatPercent(result.finalScores[ai]) + "</strong></td></tr>";
    t2.innerHTML += row;
  });
  det2.appendChild(t2);
  out.appendChild(det2);

  // Consistency report
  const det3 = document.createElement("details");
  det3.innerHTML = "<summary>Rapport de coherence</summary>";
  const t3 = document.createElement("table");
  t3.className = "consistency-table";
  t3.innerHTML = "<tr><th>Matrice</th><th>&lambda;<sub>max</sub></th><th>CI</th><th>CR</th><th>Statut</th></tr>";
  t3.innerHTML +=
    "<tr><td>Criteres</td><td>" + critCons.lambdaMax.toFixed(4) + "</td>" +
    "<td>" + critCons.CI.toFixed(4) + "</td>" +
    "<td>" + critCons.CR.toFixed(4) + "</td>" +
    "<td class='ok'>OK</td></tr>";
  for (const c of state.criteria) {
    const con = altConsistencies[c];
    t3.innerHTML +=
      "<tr><td>Alternatives / " + c + "</td>" +
      "<td>" + con.lambdaMax.toFixed(4) + "</td>" +
      "<td>" + con.CI.toFixed(4) + "</td>" +
      "<td>" + con.CR.toFixed(4) + "</td>" +
      "<td class='ok'>OK</td></tr>";
  }
  det3.appendChild(t3);
  out.appendChild(det3);
}

// === Init ===

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("load-preset").addEventListener("click", loadPreset);
  document.getElementById("reset").addEventListener("click", reset);
  document.getElementById("add-criterion").addEventListener("click", addCriterion);
  document.getElementById("add-alternative").addEventListener("click", addAlternative);
  document.getElementById("compute").addEventListener("click", compute);
  document.getElementById("goal-input").addEventListener("input", e => {
    state.goal = e.target.value;
  });

  loadPreset();
});

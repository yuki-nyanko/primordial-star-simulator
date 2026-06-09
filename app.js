import { SEASONS, getSeasonKeys } from "./seasons.js";
import * as calc from "./calc.js";

const el = (id) => document.getElementById(id);
const STORAGE_KEY = "primordialStarSimData";

function save(seasonKey, inputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ season: seasonKey, inputs }));
  } catch (_) {
    /* 保存失敗時は黙って無視（計算は継続） */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null; // 壊れた保存データは初期状態にフォールバック
  }
}

function applyInputs(inputs) {
  if (!inputs) return;
  el("char-level").value = inputs.character?.level ?? "";
  el("char-curexp").value = inputs.character?.currentExp ?? "";
  el("char-lvupexp").value = inputs.character?.levelUpExp ?? "";
  el("current-stars").value = inputs.currentStars ?? "";
  const setArr = (prefix, arr = []) =>
    arr.forEach((v, i) => {
      const node = el(`${prefix}-${i}`);
      if (node) node.value = v;
    });
  setArr("pet", inputs.pets);
  setArr("equip", inputs.equips);
  setArr("skill", inputs.skills);
  setArr("relic", inputs.relics);
}

function reset() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {
    /* no-op */
  }
  document.querySelectorAll("input").forEach((i) => (i.value = ""));
  recalc();
}

// カテゴリの数値入力欄を個数分生成（prefix-0, prefix-1, ...）
function buildCategoryInputs(containerId, count, prefix) {
  const container = el(containerId);
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "lv-input";
    input.id = `${prefix}-${i}`;
    input.placeholder = "Lv";
    input.addEventListener("input", recalc);
    container.appendChild(input);
  }
}

// 選択シーズンの個数に合わせて4カテゴリの入力欄を再構築
function buildForSeason(season) {
  buildCategoryInputs("pets", season.counts.pet, "pet");
  buildCategoryInputs("equips", season.counts.equip, "equip");
  buildCategoryInputs("skills", season.counts.skill, "skill");
  buildCategoryInputs("relics", season.counts.relic, "relic");
}

// コンテナ内の入力欄を個数に依らずDOMから読む（シーズン切替時の値退避にも使用）
function readLevels(containerId) {
  return Array.from(el(containerId).querySelectorAll("input")).map((i) => i.value);
}

function readInputs() {
  return {
    character: {
      level: el("char-level").value,
      currentExp: el("char-curexp").value,
      levelUpExp: el("char-lvupexp").value,
    },
    pets: readLevels("pets"),
    equips: readLevels("equips"),
    skills: readLevels("skills"),
    relics: readLevels("relics"),
    currentStars: el("current-stars").value,
  };
}

function recalc() {
  const seasonKey = el("season-select").value;
  const season = SEASONS[seasonKey];
  const inputs = readInputs();

  const cScore = calc.characterScore(inputs.character, season);
  const pScore = calc.petScore(inputs.pets, season);
  const eScore = calc.equipScore(inputs.equips, season);
  const sScore = calc.skillScore(inputs.skills, season);
  const rScore = calc.relicScore(inputs.relics, season);
  const rating = cScore + pScore + eScore + sScore + rScore;
  const earned = calc.earnedStars(rating, season);
  const final = calc.finalStars(earned, inputs.currentStars);

  el("char-score").textContent = cScore;
  el("pet-score").textContent = pScore;
  el("equip-score").textContent = eScore;
  el("skill-score").textContent = sScore;
  el("relic-score").textContent = rScore;
  el("rating").textContent = rating;
  el("earned").textContent = earned;
  el("final").textContent = final;

  save(seasonKey, inputs);
}

function init() {
  const select = el("season-select");
  getSeasonKeys().forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = SEASONS[key].label;
    select.appendChild(opt);
  });

  const saved = load();
  const initialSeason =
    saved?.season && SEASONS[saved.season] ? saved.season : getSeasonKeys()[0];
  select.value = initialSeason;
  buildForSeason(SEASONS[initialSeason]);
  if (saved?.inputs) applyInputs(saved.inputs);

  select.addEventListener("change", () => {
    const kept = readInputs(); // 変更前の入力値を退避
    buildForSeason(SEASONS[select.value]);
    applyInputs(kept); // シーズンを変えても入力値を維持
    recalc();
  });
  ["char-level", "char-curexp", "char-lvupexp", "current-stars"].forEach((id) =>
    el(id).addEventListener("input", recalc)
  );
  el("reset").addEventListener("click", reset);

  // 各カテゴリの「1番目を全部にコピー」ボタン
  document.querySelectorAll(".fill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputs = el(btn.dataset.target).querySelectorAll("input");
      if (inputs.length === 0) return;
      const v = inputs[0].value;
      inputs.forEach((i) => (i.value = v));
      recalc();
    });
  });

  recalc();
}

document.addEventListener("DOMContentLoaded", init);

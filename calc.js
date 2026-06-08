// 数値変換ヘルパー：数値化できなければ0（空文字・NaN対策）
function num(v) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// キャラクター個人ポイント
// = max(0, floor( (Lv - C16)*100 + 現在経験値/レベルアップ経験値*100 ))
export function characterScore(character, season) {
  const level = num(character.level);
  const currentExp = num(character.currentExp);
  const levelUpExp = num(character.levelUpExp);
  const lvTerm = (level - season.countStartLevel) * 100;
  const expTerm = levelUpExp > 0 ? (currentExp / levelUpExp) * 100 : 0;
  return Math.max(0, Math.floor(lvTerm + expTerm));
}

// カテゴリ共通：1項目あたり基準値を引いて重みを掛ける（負なら0）
// score = max(0, (Σlevels - baselinePerItem * 項目数) * weight)
export function linearCategoryScore(levels, weight, baselinePerItem) {
  const sum = levels.reduce((acc, v) => acc + num(v), 0);
  return Math.max(0, (sum - baselinePerItem * levels.length) * weight);
}

export function petScore(levels, season) {
  return linearCategoryScore(levels, season.weights.pet, season.countStartLevel);
}

export function equipScore(levels, season) {
  return linearCategoryScore(levels, season.weights.equip, season.countStartLevel);
}

export function skillScore(levels, season) {
  return linearCategoryScore(levels, season.weights.skill, season.countStartLevel);
}

// 遺物だけ1項目あたり基準が C16/10
export function relicScore(levels, season) {
  return linearCategoryScore(levels, season.weights.relic, season.countStartLevel / 10);
}

// 育成評価 = 5カテゴリの個人ポイント合計
export function totalRating(inputs, season) {
  return (
    characterScore(inputs.character, season) +
    petScore(inputs.pets, season) +
    equipScore(inputs.equips, season) +
    skillScore(inputs.skills, season) +
    relicScore(inputs.relics, season)
  );
}

// 獲得原初の星（今回）= floor( 育成評価 / A + B )
export function earnedStars(rating, season) {
  return Math.floor(rating / season.finalDivisor + season.finalAdd);
}

// 原初の星 最終個数 = 獲得 + 現在の原初の星（手入力）
export function finalStars(earned, currentStars) {
  return earned + num(currentStars);
}

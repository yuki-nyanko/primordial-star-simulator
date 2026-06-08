// シーズンごとの計算定数。新シーズンはここに1ブロック足すだけ。
export const SEASONS = {
  S4: {
    label: "S4",
    countStartLevel: 190, // C16: 全カテゴリで引く基準レベル
    weights: { pet: 11, equip: 17, skill: 5, relic: 28 }, // カテゴリ重み
    finalDivisor: 7, // 最終式の除数 A
    finalAdd: 120, // 最終式の加算 B
    counts: { pet: 4, equip: 5, skill: 8, relic: 20 }, // 各カテゴリの項目数
  },
};

// プルダウン生成用：シーズンキーの一覧
export function getSeasonKeys() {
  return Object.keys(SEASONS);
}

// 営業帯（昼/夜フラグ）から表示ラベルを返す純粋関数
export function typeLabel(
  serves_lunch: boolean,
  serves_dinner: boolean,
): string {
  if (serves_lunch && serves_dinner) return "両方";
  if (serves_lunch) return "昼";
  if (serves_dinner) return "夜";
  return "—";
}

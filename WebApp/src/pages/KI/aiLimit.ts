const LIMIT = 5;

export function canUseAI(): boolean {
  const today = new Date().toISOString().slice(0, 10);

  const raw = localStorage.getItem("ai_limit");
  const data = raw ? JSON.parse(raw) : null;

  // первый запрос или новый день
  if (!data || data.date !== today) {
    localStorage.setItem(
      "ai_limit",
      JSON.stringify({ date: today, count: 1 })
    );
    return true;
  }

  if (data.count >= LIMIT) {
    return false;
  }

  data.count += 1;
  localStorage.setItem("ai_limit", JSON.stringify(data));
  return true;
}

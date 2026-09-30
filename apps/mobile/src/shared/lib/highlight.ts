/** `start`: offset in the original text (a stable key). */
export type TextPart = { text: string; match: boolean; start: number };

/** Splits `text` around the first case-insensitive occurrence of `query` (for bolding it). */
export const splitMatch = (text: string, query: string): TextPart[] => {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return [{ text, match: false, start: 0 }];
  const parts: TextPart[] = [
    { text: text.slice(0, at), match: false, start: 0 },
    { text: text.slice(at, at + q.length), match: true, start: at },
    { text: text.slice(at + q.length), match: false, start: at + q.length },
  ];
  return parts.filter((p) => p.text);
};

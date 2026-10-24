// 모델 응답 텍스트에서 첫 JSON 객체를 꺼낸다(앞뒤 설명·코드펜스 허용).
export function extractJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no json in model output");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

import type { Hotspot } from "../../../shared/types";
export function activeHotspots(
  items: Hotspot[],
  chapterId: string,
  time: number,
) {
  return items.filter(
    (h) => h.chapterId === chapterId && time >= h.start && time < h.end,
  );
}
export function kindLabel(kind: Hotspot["kind"]) {
  return { person: "人物访谈", archive: "历史档案", sound: "声音现场" }[kind];
}
/** 某热点在给定章节/时刻是否仍处于可探索时间窗内 */
export function isHotspotLiveAt(h: Hotspot, chapterId: string, time: number) {
  return h.chapterId === chapterId && time >= h.start && time < h.end;
}
/**
 * 把一个时刻对齐到热点自身的可探索窗口内。
 * 用于修复旧手记里“打开后拖进度再收藏”造成的错位时刻，
 * 对齐后仍落在窗口里（上限预留极小余量，避开 end 边界）。
 */
export function clampTimeToWindow(h: Hotspot, time: number) {
  const max = Math.max(h.start, h.end - 0.001);
  if (time < h.start) return h.start;
  if (time > max) return max;
  return time;
}

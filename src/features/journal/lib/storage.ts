import { hotspots } from "../../../shared/content";
import type { Camera, Entry } from "../../../shared/types";
import { clampTimeToWindow } from "../../hotspots/lib/visibility";

const key = "tidal-journal-v1";

function isCamera(v: unknown): v is Camera {
  return (
    !!v &&
    typeof v === "object" &&
    Number.isFinite((v as Camera).yaw) &&
    Number.isFinite((v as Camera).pitch) &&
    Number.isFinite((v as Camera).fov)
  );
}

function isValidShape(e: unknown): e is Entry {
  const v = e as Entry;
  return (
    !!v &&
    typeof v === "object" &&
    typeof v.id === "string" &&
    typeof v.hotspotId === "string" &&
    typeof v.chapterId === "string" &&
    Number.isFinite(v.time) &&
    typeof v.title === "string" &&
    typeof v.note === "string" &&
    isCamera(v.camera) &&
    Number.isFinite(v.createdAt)
  );
}

export interface LoadResult {
  entries: Entry[];
  /** 是否发生了旧记录迁移，调用方可据此重新落盘 */
  changed: boolean;
}

/**
 * 读取并归一化手记。
 * 旧版（schema 1）把收藏时的“实时位置”记成了来源，可能已落在热点窗口之外；
 * 这里把时刻对齐回热点自己的可探索窗口，章节/窗口一并补全，用户感想原样保留。
 */
export function loadEntries(): LoadResult {
  let raw: unknown;
  try {
    raw = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return { entries: [], changed: false };
  }
  if (!Array.isArray(raw)) return { entries: [], changed: false };

  let changed = false;
  const entries: Entry[] = [];

  for (const item of raw) {
    if (!isValidShape(item)) {
      changed = true; // 丢弃了无法识别的脏数据
      continue;
    }

    const schema = item.schema === 2 ? 2 : 1;
    const hotspot = hotspots.find((h) => h.id === item.hotspotId);

    if (!hotspot) {
      // 热点已不在当前影片中：保留记录与感想，仅标记来源失效
      entries.push({
        ...item,
        camera: { ...item.camera },
        schema: 2,
        missing: true,
        migrated: schema === 1 ? true : item.migrated,
      });
      if (schema !== 2 || !item.missing) changed = true;
      continue;
    }

    const alignedTime = clampTimeToWindow(hotspot, item.time);
    const chapterMismatch = item.chapterId !== hotspot.chapterId;
    const timeMismatch = alignedTime !== item.time;
    // 旧版记录且位置确实错位，才提示“已校正”；本来就在窗口内则静默升级
    const migrated = schema === 1 && (chapterMismatch || timeMismatch);

    entries.push({
      ...item,
      chapterId: hotspot.chapterId,
      time: alignedTime,
      camera: { ...item.camera },
      schema: 2,
      windowStart: hotspot.start,
      windowEnd: hotspot.end,
      missing: false,
      migrated: migrated || item.migrated === true,
    });
    if (schema !== 2 || chapterMismatch || timeMismatch) changed = true;
  }

  return { entries, changed };
}

export function persist(entries: Entry[]) {
  try {
    localStorage.setItem(key, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

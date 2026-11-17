import { ref } from "vue";
import type { Entry, Hotspot, Snapshot } from "../../../shared/types";
import { loadEntries, persist } from "../lib/storage";

export function createJournal() {
  const loaded = loadEntries();
  const entries = ref<Entry[]>(loaded.entries),
    error = ref("");

  // 旧版错位记录在加载时已做对齐迁移，立即回写，使后续读取与导出一致
  if (loaded.changed) persist(entries.value);

  function commit(next: Entry[]) {
    if (!persist(next)) {
      error.value = "本地空间不足，记录未保存，请先导出手记";
      return;
    }
    entries.value = next;
    error.value = "";
  }

  return {
    entries,
    error,
    has: (id: string) => entries.value.some((e) => e.hotspotId === id),
    /**
     * 收藏一个发现。position 必须是打开卡片时冻结的快照，
     * 而不是收藏当下的实时画面，避免播放/转头后来源错位。
     */
    save: (hotspot: Hotspot, snapshot: Snapshot) => {
      if (entries.value.some((e) => e.hotspotId === hotspot.id)) return;
      commit([
        ...entries.value,
        {
          id: crypto.randomUUID(),
          hotspotId: hotspot.id,
          chapterId: snapshot.chapterId,
          time: snapshot.time,
          camera: { ...snapshot.camera },
          title: hotspot.title,
          note: "",
          createdAt: Date.now(),
          schema: 2,
          windowStart: hotspot.start,
          windowEnd: hotspot.end,
          missing: false,
        },
      ]);
    },
    remove: (id: string) => commit(entries.value.filter((e) => e.id !== id)),
    note: (id: string, note: string) =>
      commit(
        entries.value.map((e) =>
          e.id === id ? { ...e, note: note.slice(0, 500) } : e,
        ),
      ),
  };
}
export type Journal = ReturnType<typeof createJournal>;

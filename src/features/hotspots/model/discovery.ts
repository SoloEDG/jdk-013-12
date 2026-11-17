import { computed, ref } from "vue";
import { hotspots } from "../../../shared/content";
import type { ReadingCard, Snapshot } from "../../../shared/types";
import { activeHotspots, isHotspotLiveAt } from "../lib/visibility";

function findHotspot(id: string) {
  return hotspots.find((h) => h.id === id);
}

/**
 * 管理“阅读中的热点卡片”。
 * 卡片一旦打开就冻结打开那一刻的章节/时刻/镜头（snapshot），
 * 之后实时画面继续播放或拖动，卡片内容与保存来源都不会随之漂移。
 */
export function createDiscovery(
  livePosition: () => { chapterId: string; time: number; camera: Snapshot["camera"] },
) {
  const enabled = ref(true);
  const card = ref<ReadingCard | null>(null);

  const visible = computed(() => {
    const p = livePosition();
    return activeHotspots(hotspots, p.chapterId, p.time);
  });

  const hotspot = computed(() =>
    card.value ? findHotspot(card.value.hotspotId) : undefined,
  );

  /** 卡片快照对应的热点，相对当前实时画面是否还在可探索窗口内 */
  const isLive = computed(() => {
    if (!card.value) return false;
    const h = hotspot.value;
    if (!h) return false;
    const p = livePosition();
    return isHotspotLiveAt(h, p.chapterId, p.time);
  });

  /** 从实时现场打开：冻结当前位置作为阅读来源 */
  function openLive(id: string) {
    if (!findHotspot(id)) return;
    const p = livePosition();
    card.value = {
      hotspotId: id,
      origin: "live",
      snapshot: {
        chapterId: p.chapterId,
        time: p.time,
        camera: { ...p.camera },
      },
    };
  }

  /** 从手记回访：以条目保存的快照作为阅读来源，与实时画面区分开 */
  function openRevisit(id: string, snapshot: Snapshot) {
    if (!findHotspot(id)) return;
    card.value = {
      hotspotId: id,
      origin: "journal",
      snapshot: {
        chapterId: snapshot.chapterId,
        time: snapshot.time,
        camera: { ...snapshot.camera },
      },
    };
  }

  function close() {
    card.value = null;
  }

  return {
    enabled,
    card,
    visible,
    hotspot,
    isLive,
    openLive,
    openRevisit,
    close,
  };
}

export type Discovery = ReturnType<typeof createDiscovery>;

<script setup lang="ts">
import { computed } from "vue";
import { X, ArrowUpRight, Bookmark, Clock3, MapPin, AlertTriangle } from "lucide-vue-next";
import { chapters } from "../../../shared/content";
import { timecode } from "../../../shared/format";
import type { Hotspot, ReadingCard } from "../../../shared/types";
import { kindLabel } from "../lib/visibility";
const props = defineProps<{
  hotspot: Hotspot;
  card: ReadingCard | null;
  live: boolean;
  saved: boolean;
}>();
defineEmits<{ close: []; interview: []; save: [] }>();
const chapterTitle = computed(
  () =>
    chapters.find((c) => c.id === props.card?.snapshot.chapterId)?.title ??
    "未知章节",
);
</script>
<template>
  <aside
    v-if="card"
    class="detail-card"
    :class="{ archived: card.origin === 'journal' }"
  >
    <button class="close" aria-label="关闭热点" @click="$emit('close')">
      <X /></button
    ><small>{{ kindLabel(hotspot.kind) }} / FIELD NOTES</small>
    <h2>{{ hotspot.title }}</h2>

    <div class="source-line">
      <Bookmark :size="13" />
      <span v-if="card.origin === 'journal'">来自探索手记 · 历史阅读</span>
      <span v-else>打开时的现场快照</span>
    </div>
    <div class="snapshot-line">
      <span><MapPin :size="12" /> {{ chapterTitle }}</span>
      <span><Clock3 :size="12" /> {{ timecode(card.snapshot.time) }}</span>
    </div>

    <p>{{ hotspot.summary }}</p>

    <p v-if="!live" class="offscene" role="status">
      <AlertTriangle :size="14" />
      <span>
        它已离开当前现场——实时画面中已不在可探索时间窗内。<br />你仍可阅读这段内容，收藏将保存上面的章节、时刻与镜头。
      </span>
    </p>

    <button v-if="hotspot.personId" class="primary" @click="$emit('interview')">
      进入人物访谈 <ArrowUpRight :size="16" /></button
    ><button
      class="text-button"
      :disabled="saved"
      @click="!saved && $emit('save')"
    >
      {{ saved ? "已加入探索记录" : "＋ 收藏这个发现" }}
    </button>
  </aside>
</template>

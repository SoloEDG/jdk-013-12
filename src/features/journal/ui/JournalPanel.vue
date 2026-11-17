<script setup lang="ts">
import { computed } from "vue";
import {
  Download,
  Bookmark,
  Trash2,
  ArrowUpRight,
  AlertTriangle,
  History,
  Clock3,
} from "lucide-vue-next";
import { chapters } from "../../../shared/content";
import { timecode } from "../../../shared/format";
import type { Entry } from "../../../shared/types";
import type { Journal } from "../model/entries";
import { exportJournal } from "../lib/export";
const props = defineProps<{ journal: Journal }>();
const emit = defineEmits<{ revisit: [entry: Entry] }>();
function chapterTitle(id: string) {
  return chapters.find((c) => c.id === id)?.title ?? "未知章节";
}
function windowLabel(e: Entry) {
  if (e.missing || e.windowStart === undefined || e.windowEnd === undefined)
    return "";
  return `可探索窗口 ${timecode(e.windowStart)} – ${timecode(e.windowEnd)}`;
}
const entries = computed(() => props.journal.entries.value);
</script>
<template>
  <section class="journal-panel">
    <div class="panel-heading">
      <div>
        <small>YOUR FIELD NOTES</small>
        <h2>
          探索手记
          <em>{{ entries.length.toString().padStart(2, "0") }}</em>
        </h2>
      </div>
      <button
        class="text-button"
        :disabled="!entries.length"
        @click="exportJournal(entries)"
      >
        <Download :size="16" /> 导出手记
      </button>
    </div>
    <p v-if="journal.error.value" role="alert">{{ journal.error.value }}</p>
    <div v-if="!entries.length" class="empty">
      <Bookmark />
      <h3>每一次发现，都值得留下</h3>
      <p>在全景画面中点击热点，将感兴趣的故事收藏在这里。</p>
    </div>
    <article
      v-for="e in entries"
      :key="e.id"
      class="journal-entry"
      :class="{ missing: e.missing }"
    >
      <div>
        <small
          >{{ chapterTitle(e.chapterId) }} · {{ timecode(e.time) }} ·
          {{ new Date(e.createdAt).toLocaleDateString("zh-CN") }}</small
        >
        <h3>{{ e.title }}</h3>
        <p v-if="windowLabel(e)" class="window-line">
          <Clock3 :size="12" /> {{ windowLabel(e) }}
        </p>
        <p v-if="e.migrated" class="status-line migrated">
          <History :size="13" />
          早期错位记录已校正：时刻对齐回该热点的可探索窗口，你的感想原样保留。
        </p>
        <p v-if="e.missing" class="status-line missing">
          <AlertTriangle :size="13" />
          该热点已不在当前影片内容中，记录与感想仍保留，但无法回到现场。
        </p>
      </div>
      <button
        v-if="!e.missing"
        class="text-button"
        @click="emit('revisit', e)"
      >
        回到现场 <ArrowUpRight :size="16" /></button
      ><span v-else class="revisit-off">来源已失效</span
      ><textarea
        aria-label="记录感想"
        maxlength="500"
        :value="e.note"
        placeholder="写下此刻的感受…"
        @change="
          journal.note(e.id, ($event.target as HTMLTextAreaElement).value)
        "
      /><button
        class="delete"
        aria-label="删除记录"
        @click="journal.remove(e.id)"
      >
        <Trash2 :size="15" />
      </button>
    </article>
  </section>
</template>

export interface Camera {
  yaw: number;
  pitch: number;
  fov: number;
}
export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  panorama: string;
  video: string;
  location: string;
  description: string;
}
export interface Hotspot {
  id: string;
  chapterId: string;
  title: string;
  kind: "person" | "archive" | "sound";
  start: number;
  end: number;
  yaw: number;
  pitch: number;
  summary: string;
  personId?: string;
}
export interface Person {
  id: string;
  name: string;
  role: string;
  quote: string;
  paragraphs: string[];
}
/**
 * 一个不可变的现场快照：章节、时刻与镜头。
 * 收藏与回访都以它为准，不随后续播放、转头或跳转而改变。
 */
export interface Snapshot {
  chapterId: string;
  time: number;
  camera: Camera;
}
export interface Position extends Snapshot {
  playing: boolean;
}
/**
 * 正在阅读的热点卡片。
 * snapshot 是打开卡片那一刻冻结下来的来源；origin 区分它来自实时现场还是手记回访。
 */
export interface ReadingCard {
  hotspotId: string;
  origin: "live" | "journal";
  snapshot: Snapshot;
}
export interface Entry {
  id: string;
  hotspotId: string;
  chapterId: string;
  time: number;
  camera: Camera;
  title: string;
  note: string;
  createdAt: number;
  /** 数据结构版本：旧手记为 1，加载时迁移为 2 */
  schema: 1 | 2;
  /** 收藏时该热点的可探索时间窗（缺失热点的旧记录可能没有） */
  windowStart?: number;
  windowEnd?: number;
  /** 由旧版错位记录迁移而来：时刻已对齐回热点窗口，感想保留 */
  migrated?: boolean;
  /** 对应热点已不在当前影片内容中 */
  missing?: boolean;
}
export type Command =
  | { type: "chapter"; id: string }
  | { type: "seek"; time: number }
  | { type: "hotspot"; id: string }
  | { type: "return" }
  | { type: "revisit"; entry: Entry };

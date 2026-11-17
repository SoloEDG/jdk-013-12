import { ref } from "vue";
import { createCamera } from "../features/panorama";
import { createPlayback } from "../features/chapters";
import { createDiscovery } from "../features/hotspots";
import { createBranch } from "../features/interviews";
import { createJournal } from "../features/journal";
import type { Command, Position } from "../shared/types";
export function createWorkspace() {
  const camera = createCamera(),
    playback = createPlayback(),
    discovery = createDiscovery(() => ({
      chapterId: playback.state.chapterId,
      time: playback.state.time,
      camera: camera.camera,
    })),
    branch = createBranch(),
    journal = createJournal(),
    tab = ref("story");
  const position = (): Position => ({
    chapterId: playback.state.chapterId,
    time: playback.state.time,
    camera: { ...camera.camera },
    playing: playback.state.playing,
  });
  function enterPerson(id: string) {
    // 进入访谈不关闭卡片：卡片快照保留，返回后仍可阅读/收藏同一份来源
    branch.enter(id, position());
    playback.state.playing = false;
  }
  function dispatch(command: Command) {
    switch (command.type) {
      case "chapter":
        if (branch.personId.value) return;
        playback.select(command.id);
        camera.reset();
        discovery.close();
        break;
      case "seek":
        playback.seek(command.time);
        break;
      case "hotspot":
        discovery.openLive(command.id);
        break;
      case "return": {
        const saved = branch.leave();
        if (saved) {
          playback.select(saved.chapterId);
          playback.seek(saved.time);
          camera.restore(saved.camera);
          playback.state.playing = saved.playing;
        }
        break;
      }
      case "revisit": {
        branch.leave();
        playback.select(command.entry.chapterId);
        playback.seek(command.entry.time);
        camera.restore(command.entry.camera);
        // 以手记保存的快照打开阅读卡片，来源标记为手记，区别于实时画面
        discovery.openRevisit(command.entry.hotspotId, {
          chapterId: command.entry.chapterId,
          time: command.entry.time,
          camera: { ...command.entry.camera },
        });
        tab.value = "story";
        break;
      }
    }
  }
  function save() {
    // 收藏以打开卡片时冻结的快照为准，而不是收藏当下的实时位置
    const card = discovery.card.value;
    const h = discovery.hotspot.value;
    if (card && h) journal.save(h, card.snapshot);
  }
  return {
    camera,
    playback,
    discovery,
    branch,
    journal,
    tab,
    position,
    enterPerson,
    dispatch,
    save,
  };
}

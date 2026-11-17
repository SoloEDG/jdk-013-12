import type { Entry } from "../../../shared/types";
export function exportJournal(entries: Entry[]) {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          version: 2,
          title: "潮汐之间 · 探索手记",
          exportedAt: new Date().toISOString(),
          entries,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "潮汐之间-探索手记.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

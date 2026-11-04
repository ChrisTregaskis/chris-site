/**
 * One-dimensional label spreading: labels that want to sit at `wanted`
 * positions along one axis (a column of callouts, say) are pushed apart until
 * neighbours are at least `gap` apart, each moving as little as it can. Runs
 * of crowded labels are packed `gap` apart and centred on where they wanted
 * to be, so a crowd spreads both ways rather than all pushing one way. The
 * result keeps the input's order and indexes.
 */
export function spreadApart(wanted: readonly number[], gap: number): number[] {
  const order = wanted
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index);

  interface Run {
    /** Where its first label sits; the rest follow `gap` apart. */
    start: number;
    members: { value: number; index: number }[];
  }
  const runs: Run[] = [];
  const bestStart = (members: Run["members"]) =>
    members.reduce((sum, member, k) => sum + member.value - k * gap, 0) /
    members.length;

  for (const item of order) {
    runs.push({ start: item.value, members: [item] });
    // Merge back while the newest run crowds the one before it.
    while (runs.length > 1) {
      const last = runs[runs.length - 1];
      const before = runs[runs.length - 2];
      if (before.start + before.members.length * gap <= last.start) break;
      runs.pop();
      before.members.push(...last.members);
      before.start = bestStart(before.members);
    }
  }

  const placed = new Array<number>(wanted.length);
  for (const run of runs) {
    run.members.forEach((member, k) => {
      placed[member.index] = run.start + k * gap;
    });
  }
  return placed;
}

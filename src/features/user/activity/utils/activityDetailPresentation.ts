export interface ActivityCapacityPresentation {
  label: string;
  isFull: boolean;
}

const normalizeCount = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

/** 将活动人数转换为面向参与者的紧凑“名额”文案。 */
export function getActivityCapacityPresentation(
  currentParticipants: number,
  maxParticipants: number,
): ActivityCapacityPresentation {
  const current = normalizeCount(currentParticipants);
  const maximum = normalizeCount(maxParticipants);

  if (maximum === 0) {
    return { label: "名额不限", isFull: false };
  }

  const isFull = current >= maximum;
  return {
    label: isFull
      ? `名额 ${current}/${maximum} · 已满`
      : `名额 ${current}/${maximum} · 剩余 ${maximum - current}`,
    isFull,
  };
}

export type Segment = {
  src: string;
  startFromSeconds: number;
  durationInFrames: number;
  caption: string;
  emphasis?: boolean;
};

const FPS = 30;
const s = (seconds: number) => Math.round(seconds * FPS);

export const segments: Segment[] = [
  {
    src: "videos/clip1.mp4",
    startFromSeconds: 2,
    durationInFrames: s(4),
    caption: "Пока ты сидишь на очередном семинаре...",
  },
  {
    src: "videos/clip2.mp4",
    startFromSeconds: 3,
    durationInFrames: s(3.5),
    caption: "ИИ уже делает часть твоей работы за тебя",
  },
  {
    src: "videos/clip3.mp4",
    startFromSeconds: 5,
    durationInFrames: s(3.5),
    caption: "Через 5 лет 40% профессий изменятся из-за ИИ",
  },
  {
    src: "videos/clip1.mp4",
    startFromSeconds: 12,
    durationInFrames: s(2.5),
    caption: 'Вопрос уже не "заменит ли тебя ИИ"',
  },
  {
    src: "videos/clip4.mp4",
    startFromSeconds: 1,
    durationInFrames: s(2.5),
    caption: "А в том, успеешь ли ты измениться быстрее",
  },
  {
    src: "videos/clip4.mp4",
    startFromSeconds: 3.5,
    durationInFrames: s(3),
    caption: "Подписывайся — чтобы не остаться позади 🤖",
    emphasis: true,
  },
];

export const totalDurationInFrames = segments.reduce(
  (sum, seg) => sum + seg.durationInFrames,
  0,
);

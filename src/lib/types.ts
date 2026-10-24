export type LiveScript = {
  title: string;
  target: string;
  sections: { name: string; minutes: number; say: string; show: string }[];
  tips: string[];
};

export type Highlight = {
  start: number;
  end: number;
  hook: string;
  hookEn: string;
  caption: string;
  hashtags: string[];
  why: string;
};

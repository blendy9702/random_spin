export type WeightedOption<T> = {
  value: T;
  weight: number;
};

export function weightedRandom<T>(options: Array<WeightedOption<T>>): T {
  const total = options.reduce((sum, o) => sum + Math.max(0, o.weight), 0);
  if (total <= 0) return options[0]!.value;

  let r = Math.random() * total;
  for (const o of options) {
    r -= Math.max(0, o.weight);
    if (r <= 0) return o.value;
  }
  return options[options.length - 1]!.value;
}

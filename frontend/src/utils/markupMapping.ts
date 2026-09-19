export const mapWeightToLevel = (weight: number): number => {
  let level = -1;
  if (weight < 0.015) {
    level = 1;
  }
  if (weight >= 0.015 && weight < 0.03) {
    level = 2;
  }
  if (weight >= 0.03 && weight < 0.05) {
    level = 3;
  }
  if (weight >= 0.05 && weight < 0.15) {
    level = 4;
  }
  if (weight >= 0.15 && weight < 0.3) {
    level = 5;
  }
  if (weight >= 0.3 && weight < 0.5) {
    level = 6;
  }
  if (weight >= 0.5 && weight < 0.7) {
    level = 7;
  }
  if (weight >= 0.7 && weight < 1) {
    level = 8;
  }
  return level;
};

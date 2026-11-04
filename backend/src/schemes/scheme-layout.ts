/**
 * Раскладка заготовок по кругам.
 * Порт фронтового BilletCalculator (frontend/src/utils/cutting/billet.calculator.ts),
 * упрощённый до first-fit-decreasing: заготовки сортируются по убыванию длины
 * и последовательно укладываются в круги.
 */

export interface LayoutPiece {
  lengthMm: number;
  qty: number;
}

export interface LayoutBar {
  index: number;
  piecesMm: number[];
  remainderMm: number;
}

/**
 * @param pieces заготовки: длины и количество
 * @param barLengthMm общая длина круга, мм
 * @param kerfMm толщина реза (пропил), мм
 * @param endCutMm торцевой рез в начале круга, мм
 */
export function layoutBars(
  pieces: LayoutPiece[],
  barLengthMm: number,
  kerfMm = 2,
  endCutMm = 0,
): LayoutBar[] {
  const valid = pieces.filter((p) => p.lengthMm > 0 && p.qty > 0);
  if (valid.length === 0 || barLengthMm <= 0) return [];

  // Торцевой рез уменьшает полезную длину круга
  const usableLength = endCutMm > 0 ? barLengthMm - endCutMm : barLengthMm;

  // Разворачиваем в пул отдельных заготовок, от больших к меньшим
  const pool: number[] = [];
  valid.forEach((p) => {
    for (let i = 0; i < p.qty; i++) pool.push(p.lengthMm);
  });
  pool.sort((a, b) => b - a);

  const bars: LayoutBar[] = [];

  while (pool.length > 0) {
    let remaining = usableLength;
    const piecesMm: number[] = [];

    let i = 0;
    while (i < pool.length) {
      // Пропил нужен перед каждой заготовкой, кроме первой в круге
      const kerf = piecesMm.length > 0 ? kerfMm : 0;
      if (pool[i] + kerf <= remaining) {
        piecesMm.push(pool[i]);
        remaining -= pool[i] + kerf;
        pool.splice(i, 1);
        i = 0; // после размещения сканируем пул заново от больших
      } else {
        i++; // не влезла — пробуем меньшую
      }
    }

    bars.push({
      index: bars.length + 1,
      piecesMm,
      remainderMm: Math.max(0, Math.round(remaining)),
    });
  }

  return bars;
}

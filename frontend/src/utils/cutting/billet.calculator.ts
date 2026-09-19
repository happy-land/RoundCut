/**
 * Калькулятор для расчета резки по заготовкам
 * Содержит главный алгоритм расчета раскроя
 */

export interface Workpiece {
  id: string;
  length: number;
  quantity: number;
}

export interface BilletItem {
  length: number;
  quantity: number;
  workpieces: number;
}

export interface BilletResult {
  billetIndex: number;
  items: BilletItem[];
  usedLength: number;
  billetLength: number;
  endCut: number;
  totalCuts: number;
}

export class BilletCalculator {
  /**
   * Основной расчет резки
   * @param workpieces - массив заготовок с длиной и количеством
   * @param billetLength - длина одного круга в мм
   * @param cutThickness - толщина одного реза в мм (по умолчанию 2мм)
   * @param endCut - торцевой рез в начале в мм
   */
  static calculate(
    workpieces: Workpiece[],
    billetLength: number,
    cutThickness: number = 2,
    endCut: number = 0,
  ): BilletResult[] {
    // Валидация входных данных
    const validWorkpieces = workpieces.filter((w) => w.length > 0 && w.quantity > 0);
    
    if (validWorkpieces.length === 0) {
      return [];
    }

    if (billetLength <= 0) {
      return [];
    }

    // Вычитаем торцевой рез в начале
    const actualBilletLength = endCut > 0 ? billetLength - endCut : billetLength;

    // Объединяем одинаковые длины
    const mergedWorkpieces = this.mergeWorkpieces(validWorkpieces);

    // Сортируем по длине (от больших к меньшим)
    const sortedWorkpieces = this.sortWorkpiecesByLength(mergedWorkpieces, 'desc');

    // Остаток для каждого заготовляемого размера
    const remaining: Record<number, number> = {};
    sortedWorkpieces.forEach((w) => {
      remaining[w.length] = w.quantity;
    });

    const billets: BilletResult[] = [];
    let billetIndex = 1;
    let totalCuts = 0;

    // Основной цикл расчета
    while (Object.values(remaining).some((r) => r > 0)) {
      let currentBilletLength = actualBilletLength;
      const billetItems: BilletItem[] = [];
      let usedLength = 0;
      let cutsInBillet = endCut > 0 ? 1 : 0; // Торцевой рез в начале

      // Сначала размещаем большие заготовки (от больших к меньшим)
      for (const workpiece of sortedWorkpieces) {
        const length = workpiece.length;

        while (remaining[length] > 0 && length <= currentBilletLength) {
          currentBilletLength -= length;
          remaining[length]--;
          usedLength += length;
          cutsInBillet++;

          // Вычитаем толщину реза (если есть ещё заготовки)
          if (
            remaining[length] > 0 ||
            Object.values(remaining).some((r) => r > 0)
          ) {
            currentBilletLength -= cutThickness;
          }

          // Обновляем или создаем item в billetItems
          const existingItem = billetItems.find((item) => item.length === length);
          if (existingItem) {
            existingItem.workpieces++;
          } else {
            billetItems.push({ length, quantity: 1, workpieces: 1 });
          }
        }
      }

      // Затем пытаемся заполнить остаток маленькими заготовками
      for (const workpiece of sortedWorkpieces.slice().reverse()) {
        const length = workpiece.length;

        while (remaining[length] > 0 && length <= currentBilletLength) {
          currentBilletLength -= length;
          remaining[length]--;
          usedLength += length;
          cutsInBillet++;

          // Вычитаем толщину реза (если есть ещё заготовки)
          if (
            remaining[length] > 0 ||
            Object.values(remaining).some((r) => r > 0)
          ) {
            currentBilletLength -= cutThickness;
          }

          const existingItem = billetItems.find((item) => item.length === length);
          if (existingItem) {
            existingItem.workpieces++;
          } else {
            billetItems.push({ length, quantity: 1, workpieces: 1 });
          }
        }
      }

      // Если удалось разместить хотя бы что-то, добавляем результат
      if (billetItems.length > 0) {
        totalCuts += cutsInBillet;
        billets.push({
          billetIndex,
          items: billetItems,
          usedLength,
          billetLength: billetLength,
          endCut,
          totalCuts: cutsInBillet,
        });
        billetIndex++;
      } else {
        // Если ничего не поместилось, проверяем, есть ли размеры, которые не влезают
        const minRemaining = Math.min(
          ...Object.entries(remaining)
            .filter(([_, q]) => q > 0)
            .map(([len, _]) => Number(len)),
        );

        // Если минимальный размер больше длины круга, прерываем
        if (minRemaining > actualBilletLength) break;
      }
    }

    return billets;
  }

  /**
   * Объединить заготовки с одинаковой длиной
   */
  private static mergeWorkpieces(workpieces: Workpiece[]): Workpiece[] {
    const merged: Record<string, Workpiece> = {};

    workpieces.forEach((w) => {
      const key = w.length.toString();
      if (merged[key]) {
        merged[key].quantity += w.quantity;
      } else {
        merged[key] = { ...w };
      }
    });

    return Object.values(merged);
  }

  /**
   * Отсортировать заготовки по длине
   */
  private static sortWorkpiecesByLength(
    workpieces: Workpiece[],
    direction: 'asc' | 'desc' = 'desc',
  ): Workpiece[] {
    const comparator = direction === 'desc' 
      ? (a: Workpiece, b: Workpiece) => b.length - a.length
      : (a: Workpiece, b: Workpiece) => a.length - b.length;

    return [...workpieces].sort(comparator);
  }

  /**
   * Получить общую статистику по результатам расчета
   */
  static getStatistics(billets: BilletResult[], cutThickness: number = 2): {
    totalBillets: number;
    totalCuts: number;
    totalUsedLength: number;
    totalWasteLength: number;
    efficiency: number;
  } {
    if (billets.length === 0) {
      return {
        totalBillets: 0,
        totalCuts: 0,
        totalUsedLength: 0,
        totalWasteLength: 0,
        efficiency: 0,
      };
    }

    const totalCuts = billets.reduce((sum, b) => sum + b.totalCuts, 0);
    const totalUsedLength = billets.reduce((sum, b) => sum + b.usedLength, 0);
    const totalBilletLength = billets.reduce((sum, b) => sum + b.billetLength, 0);
    
    const totalCutLengths = billets.reduce((sum, b) => {
      // Торцевой рез + межрезные промежутки
      const endCutLength = b.endCut > 0 ? b.endCut : 0;
      const cutBetweenCount = Math.max(0, b.totalCuts - (b.endCut > 0 ? 1 : 0) - 1);
      const cutBetweenLength = cutBetweenCount * cutThickness;
      return sum + endCutLength + cutBetweenLength;
    }, 0);

    const totalWasteLength = totalBilletLength - totalUsedLength - totalCutLengths;
    const efficiency = (totalUsedLength / totalBilletLength) * 100;

    return {
      totalBillets: billets.length,
      totalCuts,
      totalUsedLength,
      totalWasteLength: Math.max(0, totalWasteLength),
      efficiency: Math.round(efficiency * 100) / 100,
    };
  }

  /**
   * Рассчитать остаток в одном биллете
   */
  static calculateBilletWaste(
    billet: BilletResult,
    cutThickness: number = 2,
  ): number {
    const endCutLength = billet.endCut > 0 ? billet.endCut : 0;
    const cutBetweenCount = Math.max(0, billet.totalCuts - (billet.endCut > 0 ? 1 : 0) - 1);
    const cutBetweenLength = cutBetweenCount * cutThickness;
    
    return Math.max(
      0,
      billet.billetLength - billet.usedLength - endCutLength - cutBetweenLength,
    );
  }
}

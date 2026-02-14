import {
  CutMethod,
  CutSelection,
  PartSaleInfo,
} from './cutting.types';
import {
  getPreferredMethod,
  getAllowedMethods,
  isMethodAllowed,
  getPreferredMethod as getOptimalMethod,
  getCutMethodDisplayName,
  canSellParts,
} from './cutting.rules';

/**
 * Сервис для работы с логикой резки
 * Определяет оптимальный метод резки, валидирует выбор и т.д.
 */
export class CuttingService {
  /**
   * Выбрать оптимальный метод резки для диаметра
   */
  static getOptimalCut(diameter: number): CutSelection | null {
    const preferredMethod = getOptimalMethod(diameter);
    
    if (!preferredMethod) {
      return null;
    }

    return {
      diameter,
      method: preferredMethod,
      isOptimal: true,
      reason: `Рекомендуемый метод для диаметра ${diameter}мм`,
    };
  }

  /**
   * Получить все доступные методы резки для диаметра
   */
  static getAvailableCuts(diameter: number): CutSelection[] {
    const allowedMethods = getAllowedMethods(diameter);
    const preferredMethod = getOptimalMethod(diameter);

    return allowedMethods.map((method) => ({
      diameter,
      method,
      isOptimal: method === preferredMethod,
      reason:
        method === preferredMethod
          ? 'Предпочтительный метод'
          : 'Альтернативный метод',
    }));
  }

  /**
   * Валидировать выбор метода резки для диаметра
   */
  static validateCutSelection(
    diameter: number,
    method: CutMethod,
  ): { isValid: boolean; error?: string } {
    if (!isMethodAllowed(diameter, method)) {
      const allowed = getAllowedMethods(diameter).length;
      if (allowed === 0) {
        return {
          isValid: false,
          error: `Для диаметра ${diameter}мм методы резки не определены`,
        };
      }
      return {
        isValid: false,
        error: `Метод "${getCutMethodDisplayName(method)}" недопустим для диаметра ${diameter}мм`,
      };
    }

    return { isValid: true };
  }

  /**
   * Проверить допустимость метода резки
   */
  static isMethodAllowed(diameter: number, method: CutMethod): boolean {
    return isMethodAllowed(diameter, method);
  }

  /**
   * Получить информацию о продаже частями
   */
  static getPartSaleInfo(diameter: number): PartSaleInfo {
    return canSellParts(diameter);
  }

  /**
   * Рассчитать максимально допустимую длину для частей при продаже
   */
  static calculateMaxPartLength(
    diameter: number,
    totalLength: number,
  ): number | null {
    const partSaleInfo = canSellParts(diameter);
    
    if (!partSaleInfo.canSell || !partSaleInfo.maxLengthPercent) {
      return null;
    }

    return (totalLength * partSaleInfo.maxLengthPercent) / 100;
  }

  /**
   * Получить имя метода резки для отправки на backend
   * (будет использоваться в cutitem.name или как отдельное поле)
   */
  static getCutMethodName(method: CutMethod): string {
    // Эти названия должны совпадать с тем, как они хранятся в BD
    const nameMap: Record<CutMethod, string> = {
      [CutMethod.GAS]: 'газом',
      [CutMethod.BANDSAW]: 'лентопильным станком',
      [CutMethod.CUTOFF_MACHINE]: 'отрезным станком',
    };
    return nameMap[method];
  }

  /**
   * Получить фрагмент имени для поиска в cutitem.name
   */
  static getCutMethodSearchFragment(method: CutMethod): string {
    const fragmentMap: Record<CutMethod, string> = {
      [CutMethod.GAS]: 'газом',
      [CutMethod.BANDSAW]: 'лентопильным станком',
      [CutMethod.CUTOFF_MACHINE]: 'отрезным станком',
    };
    return fragmentMap[method];
  }
}

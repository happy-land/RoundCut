import { CutMethod, CutSelection, PartSaleInfo } from "./cutting.types";
import {
  getPreferredMethod,
  getAllowedMethods,
  isMethodAllowed,
  getDiameterRule,
  getCutMethodDisplayName,
  canSellParts,
} from "./cutting.rules";

export class CuttingService {
  static getOptimalCut(diameter: number): CutSelection | null {
    const preferredMethod = getPreferredMethod(diameter);
    if (!preferredMethod) return null;

    return {
      diameter,
      method: preferredMethod,
      isOptimal: true,
      reason: `Рекомендуемый метод для диаметра ${diameter}мм`,
    };
  }

  static getAvailableCuts(diameter: number): CutSelection[] {
    const allowedMethods = getAllowedMethods(diameter);
    const preferredMethod = getPreferredMethod(diameter);

    return allowedMethods.map((method) => ({
      diameter,
      method,
      isOptimal: method === preferredMethod,
      reason:
        method === preferredMethod
          ? "Предпочтительный метод"
          : "Альтернативный метод",
    }));
  }

  static validateCutSelection(
    diameter: number,
    method: CutMethod,
  ): { isValid: boolean; error?: string } {
    if (!isMethodAllowed(diameter, method)) {
      if (!getDiameterRule(diameter)) {
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

  static isMethodAllowed(diameter: number, method: CutMethod): boolean {
    return isMethodAllowed(diameter, method);
  }

  static getPartSaleInfo(diameter: number): PartSaleInfo {
    return canSellParts(diameter);
  }

  static calculateMaxPartLength(
    diameter: number,
    totalLength: number,
  ): number | null {
    const partSaleInfo = canSellParts(diameter);
    if (!partSaleInfo.canSell || !partSaleInfo.maxLengthPercent) return null;
    return (totalLength * partSaleInfo.maxLengthPercent) / 100;
  }

  /** Название метода для хранения в БД / поиска в cutitem.name */
  static getCutMethodName(method: CutMethod): string {
    return getCutMethodDisplayName(method);
  }
}

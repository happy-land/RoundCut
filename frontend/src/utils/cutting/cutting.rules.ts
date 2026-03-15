import {
  CutMethod,
  DiameterRange,
  DiameterRuleSet,
  CutMethodInfo,
  PartSaleInfo,
} from './cutting.types';

/**
 * Информация о методах резки
 */
export const CUT_METHOD_INFO: Record<CutMethod, CutMethodInfo> = {
  [CutMethod.GAS]: {
    id: CutMethod.GAS,
    name: 'gas',
    displayName: 'Резка газом',
    description: 'Газовая резка, подходит для средних диаметров',
  },
  [CutMethod.BANDSAW]: {
    id: CutMethod.BANDSAW,
    name: 'bandsaw',
    displayName: 'Лентопильный станок',
    description: 'Высокоточная резка лентопилой, отличная для больших диаметров',
  },
  [CutMethod.CUTOFF]: {
    id: CutMethod.CUTOFF,
    name: 'cutoff',
    displayName: 'Отрезной станок',
    description: 'Отрезной станок, оптимален для малых диаметров',
  },
};

/**
 * Правила резки по диаметру
 * Определяет какие методы допустимы для каждого диапазона диаметров
 */
export const DIAMETER_RULES: DiameterRuleSet[] = [
  {
    range: DiameterRange.SMALL,
    minDiameter: 0,
    maxDiameter: 49,
    allowedMethods: [CutMethod.CUTOFF, CutMethod.BANDSAW, CutMethod.GAS],
    preferredMethod: CutMethod.CUTOFF,
    canSellParts: false,
    partsLengthLimit: null,
  },
  {
    range: DiameterRange.MEDIUM,
    minDiameter: 50,
    maxDiameter: 75,
    allowedMethods: [CutMethod.GAS, CutMethod.BANDSAW],
    preferredMethod: CutMethod.BANDSAW,
    canSellParts: false,
    partsLengthLimit: null,
  },
  {
    range: DiameterRange.LARGE,
    minDiameter: 80,
    maxDiameter: null,
    allowedMethods: [CutMethod.BANDSAW, CutMethod.GAS],
    preferredMethod: CutMethod.BANDSAW,
    canSellParts: true,
    partsLengthLimit: 50, // 50% длины целого круга
  },
];

/**
 * Получить правило по диаметру
 */
export function getDiameterRule(diameter: number): DiameterRuleSet | null {
  return (
    DIAMETER_RULES.find((rule) => {
      const isAboveMin = diameter >= rule.minDiameter;
      const isUnderMax = rule.maxDiameter === null || diameter <= rule.maxDiameter;
      return isAboveMin && isUnderMax;
    }) || null
  );
}

/**
 * Получить допустимые методы резки для диаметра
 */
export function getAllowedMethods(diameter: number): CutMethod[] {
  const rule = getDiameterRule(diameter);
  return rule ? rule.allowedMethods : [];
}

/**
 * Получить предпочтительный метод резки
 */
export function getPreferredMethod(diameter: number): CutMethod | null {
  const rule = getDiameterRule(diameter);
  return rule ? rule.preferredMethod : null;
}

/**
 * Проверить, может ли данный метод резки использоваться для диаметра
 */
export function isMethodAllowed(
  diameter: number,
  method: CutMethod,
): boolean {
  return getAllowedMethods(diameter).includes(method);
}

/**
 * Получить информацию о возможности продажи частями
 */
export function canSellParts(diameter: number): PartSaleInfo {
  const rule = getDiameterRule(diameter);
  
  if (!rule || !rule.canSellParts) {
    return {
      canSell: false,
      diameter,
      message: `Диаметр ${diameter}мм не предусмотрен для продажи частями`,
    };
  }

  return {
    canSell: true,
    maxLengthPercent: rule.partsLengthLimit || undefined,
    diameter,
    message:
      rule.partsLengthLimit
        ? `Допускается использование на заготовки не более ${rule.partsLengthLimit}% от длины целого круга`
        : undefined,
  };
}

/**
 * Получить диапазон по диаметру
 */
export function getDiameterRange(diameter: number): DiameterRange | null {
  const rule = getDiameterRule(diameter);
  return rule ? rule.range : null;
}

/**
 * Получить описание метода резки
 */
export function getCutMethodInfo(method: CutMethod): CutMethodInfo {
  return CUT_METHOD_INFO[method];
}

/**
 * Получить русское название метода
 */
export function getCutMethodDisplayName(method: CutMethod): string {
  return CUT_METHOD_INFO[method].displayName;
}
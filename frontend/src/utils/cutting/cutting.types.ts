/**
 * Типы и интерфейсы для системы резки
 */

export enum CutMethod {
  GAS = 'gas',                      // Резка газом
  BANDSAW = 'bandsaw',              // Лентопильный станок
  CUTOFF_MACHINE = 'cutoff_machine' // Отрезной станок
}

export enum DiameterRange {
  SMALL = 'small',      // До 49мм
  MEDIUM = 'medium',    // 50-75мм
  LARGE = 'large'       // 80мм+
}

export interface CutMethodInfo {
  id: CutMethod;
  name: string;
  displayName: string;
  description: string;
}

export interface DiameterRuleSet {
  range: DiameterRange;
  minDiameter: number;
  maxDiameter: number | null;
  allowedMethods: CutMethod[];
  preferredMethod: CutMethod;
  canSellParts: boolean;
  partsLengthLimit: number | null; // null = нет ограничения, число = макс % от целого
}

export interface CutSelection {
  diameter: number;
  method: CutMethod;
  isOptimal: boolean;
  reason?: string;
}

export interface PartSaleInfo {
  canSell: boolean;
  maxLengthPercent?: number;
  diameter: number;
  message?: string;
}

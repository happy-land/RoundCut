import { useState, useCallback } from 'react';
import {
  CutMethod,
  CuttingService,
  BilletCalculator,
  Workpiece,
} from '../utils/cutting';

interface UseCuttingCalculatorOptions {
  billetLength: number;
  initialCutThickness?: number;
  initialEndCut?: number;
}

/**
 * Hook для управления расчетом резки и выбором метода
 */
export function useCuttingCalculator({
  billetLength,
  initialCutThickness = 5,
  initialEndCut = 0,
}: UseCuttingCalculatorOptions) {
  const [cutThickness, setCutThickness] = useState(initialCutThickness);
  const [endCut, setEndCut] = useState(initialEndCut);
  const [workpieces, setWorkpieces] = useState<Workpiece[]>([
    { id: '1', length: 0, quantity: 0 },
  ]);
  const [selectedCutMethod, setSelectedCutMethod] = useState<CutMethod | null>(
    null,
  );

  // Расчет резки
  const billets = BilletCalculator.calculate(
    workpieces,
    billetLength,
    cutThickness,
    endCut,
  );

  const statistics = BilletCalculator.getStatistics(billets, cutThickness);

  // Управление заготовками
  const addWorkpiece = useCallback(() => {
    const newId = String(Math.max(...workpieces.map((w) => Number(w.id)), 0) + 1);
    setWorkpieces([...workpieces, { id: newId, length: 0, quantity: 0 }]);
  }, [workpieces]);

  const removeWorkpiece = useCallback(
    (id: string) => {
      if (workpieces.length > 1) {
        setWorkpieces(workpieces.filter((w) => w.id !== id));
      }
    },
    [workpieces],
  );

  const updateWorkpiece = useCallback(
    (id: string, field: 'length' | 'quantity', value: number) => {
      setWorkpieces(
        workpieces.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
      );
    },
    [workpieces],
  );

  const resetWorkpieces = useCallback(() => {
    setWorkpieces([{ id: '1', length: 0, quantity: 0 }]);
  }, []);

  return {
    // Параметры резки
    cutThickness,
    setCutThickness,
    endCut,
    setEndCut,

    // Заготовки
    workpieces,
    addWorkpiece,
    removeWorkpiece,
    updateWorkpiece,
    resetWorkpieces,

    // Метод резки
    selectedCutMethod,
    setSelectedCutMethod,

    // Результаты
    billets,
    statistics,
  };
}

/**
 * Hook для работы с выбором метода резки
 */
export function useCutMethodSelection(diameter: number) {
  const [selectedMethod, setSelectedMethod] = useState<CutMethod | null>(null);

  const availableMethods = CuttingService.getAvailableCuts(diameter);
  const optimalMethod = CuttingService.getOptimalCut(diameter);

  const selectOptimal = useCallback(() => {
    if (optimalMethod) {
      setSelectedMethod(optimalMethod.method);
      return optimalMethod.method;
    }
    return null;
  }, [optimalMethod]);

  const isMethodValid = (method: CutMethod): boolean => {
    return CuttingService.isMethodAllowed(diameter, method);
  };

  const validation = selectedMethod
    ? CuttingService.validateCutSelection(diameter, selectedMethod)
    : null;

  return {
    selectedMethod,
    setSelectedMethod,
    availableMethods,
    optimalMethod,
    selectOptimal,
    isMethodValid,
    validation,
  };
}

/**
 * Hook для проверки возможности продажи частями
 */
export function usePartSaleInfo(diameter: number) {
  const partSaleInfo = CuttingService.getPartSaleInfo(diameter);

  const calculateMaxPartLength = (totalLength: number): number | null => {
    return CuttingService.calculateMaxPartLength(diameter, totalLength);
  };

  return {
    canSell: partSaleInfo.canSell,
    maxLengthPercent: partSaleInfo.maxLengthPercent,
    message: partSaleInfo.message,
    calculateMaxPartLength,
  };
}

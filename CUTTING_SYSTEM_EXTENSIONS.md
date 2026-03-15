# 🎯 План развития системы резки - Ожидаемые нюансы

## 📌 Введение

Текущая реализация - это **MVP (Минимально жизнеспособный продукт)** системы резки. Она охватывает основные требования:

- ✅ 3 типа резки
- ✅ Правила по диаметру
- ✅ Расчет раскроя
- ✅ Продажа частями для 80мм+

Но вы упоминали "есть еще нюансы, о них расскажу позже". Вот структура для их легкого добавления:

---

## 🔮 Ожидаемые расширения

### 1️⃣ **Зависимость от материала**

Разные материалы могут требовать разные методы резки:

```typescript
// cutting.types.ts
export enum SteelGrade {
  ST3 = 'st3',
  ST20 = 'st20',
  ST45 = 'st45',
  STAINLESS = 'stainless',
  HARDENED = 'hardened',
}

export interface MaterialCuttingRules {
  material: SteelGrade;
  diameterRules: DiameterRuleSet[];
  additionalConstraints?: {
    cannotUseGas?: boolean;
    requiresCooling?: boolean;
    maxCuttingSpeed?: number;
  };
}
```

**Использование:**
```typescript
const rules = CuttingService.getOptimalCut(diameter, material);
```

---

### 2️⃣ **Зависимость от толщины материала**

Толщина стенки цилиндра влияет на метод:

```typescript
export interface DiameterAndThicknessRule {
  diameterRange: [number, number];
  thicknessRange: [number, number];
  allowedMethods: CutMethod[];
  preferredMethod: CutMethod;
}

// Пример: для тонкостенных труб нельзя использовать газ
DIAMETER_AND_THICKNESS_RULES: [
  {
    diameterRange: [50, 75],
    thicknessRange: [2, 4],    // Тонкостенные
    allowedMethods: [CutMethod.BANDSAW],
    preferredMethod: CutMethod.BANDSAW,
  },
  {
    diameterRange: [50, 75],
    thicknessRange: [5, 15],   // Толстостенные
    allowedMethods: [CutMethod.GAS, CutMethod.BANDSAW],
    preferredMethod: CutMethod.GAS,
  },
]
```

---

### 3️⃣ **Стоимость резки**

Разные методы имеют разную стоимость:

```typescript
export interface CutMethodCost {
  method: CutMethod;
  costPerCut: number;         // Цена за один рез
  setupCost: number;          // Стоимость настройки
  speedFactor: number;        // Коэффициент влияния на скорость
}

export class CuttingPriceCalculator {
  static calculateCostForMethod(
    billets: BilletResult[],
    method: CutMethod,
    costData: CutMethodCost,
  ): number {
    const totalCuts = billets.reduce((s, b) => s + b.totalCuts, 0);
    return costData.setupCost + totalCuts * costData.costPerCut;
  }

  static compareMethodsCost(
    billets: BilletResult[],
    costs: CutMethodCost[],
  ): Array<{ method: CutMethod; totalCost: number; costPerCut: number }> {
    return costs.map(cost => ({
      method: cost.method,
      totalCost: this.calculateCostForMethod(billets, cost.method, cost),
      costPerCut: cost.costPerCut,
    }));
  }
}
```

---

### 4️⃣ **Остаток и переработка**

Разные методы оставляют разный остаток:

```typescript
export interface WasteCharacteristics {
  method: CutMethod;
  wasteType: 'sharp_edges' | 'smooth_cut' | 'burned';
  canRecycle: boolean;
  recycleValue: number;       // % от стоимости, если можно переработать
  sharpnessLevel: 'low' | 'medium' | 'high';
}

export class WasteCalculator {
  static getWasteInfo(method: CutMethod, wasteLength: number): WasteCharacteristics {
    // Газ оставляет неровные края с окалиной
    // Лентопила дает чистый срез
    // Отрезной станок - совсем гладкий срез
  }

  static calculateWasteValue(
    waste: number,
    method: CutMethod,
    materialPrice: number,
  ): number {
    const characteristics = this.getWasteInfo(method, waste);
    return waste * materialPrice * (characteristics.recycleValue / 100);
  }
}
```

---

### 5️⃣ **Комбинированная резка**

Один круг может резаться разными методами для оптимизации:

```typescript
export interface CombinedCuttingStrategy {
  billetIndex: number;
  segments: Array<{
    startPosition: number;
    endPosition: number;
    method: CutMethod;
    items: BilletItem[];
  }>;
  totalCost: number;
  totalWaste: number;
}

export class SmartCuttingOptimizer {
  // Например: большие куски резать газом (быстро),
  // маленькие - лентопилой (точнее)
  static optimizeMixedCutting(
    billets: BilletResult[],
    costs: CutMethodCost[],
  ): CombinedCuttingStrategy[] {
    // Использовать динамическое программирование для поиска оптимума
  }
}
```

---

### 6️⃣ **Минимальные остатки и допуски**

Разные методы имеют разные требования к точности:

```typescript
export interface CuttingTolerance {
  method: CutMethod;
  minWasteLength: number;    // Минимальный остаток (например, газ = 50мм)
  tolerance: number;         // ±мм от требуемого размера
  maxPiecesPerCut: number;   // Макс кусков из одного маса
}

export class ValidatorWithTolerances {
  static canCutPiece(
    length: number,
    method: CutMethod,
    tolerance: CuttingTolerance,
  ): boolean {
    return Math.abs(length) <= tolerance.tolerance;
  }
}
```

---

### 7️⃣ **Производительность (время резки)**

Оценить сколько времени займет резка:

```typescript
export interface MethodPerformance {
  method: CutMethod;
  timePerMM: number;          // Секунды на мм длины
  setupTimePerBillet: number; // Время настройки на один круг
  heatUpTime: number;         // Время прогрева оборудования
}

export class ProductivityCalculator {
  static estimateCuttingTime(
    billets: BilletResult[],
    method: CutMethod,
    performance: MethodPerformance,
  ): {
    totalTime: number;
    cuttingTime: number;
    setupTime: number;
    breakdown: string;
  } {
    // Рассчитать общее время
  }
}
```

---

### 8️⃣ **Ограничения оборудования**

Разное оборудование имеет разные лимиты:

```typescript
export interface EquipmentConstraints {
  method: CutMethod;
  maxDiameter: number;
  minDiameter: number;
  maxThickness: number;
  maxBilletLength: number;
  currentlyAvailable: boolean;
  maintenanceSchedule?: Date;
}

export class EquipmentManager {
  static canCut(
    diameter: number,
    thickness: number,
    length: number,
    method: CutMethod,
    equipment: EquipmentConstraints[],
  ): { canCut: boolean; reason?: string } {
    // Проверить доступность оборудования
  }
}
```

---

### 9️⃣ **История и статистика**

Отслеживание предыдущих резок:

```typescript
export interface CuttingSession {
  id: string;
  date: Date;
  items: CuttingSessionItem[];
  method: CutMethod;
  efficiency: number;
  actualWasteLength: number;  // Могут отличаться от расчета
  notes?: string;
}

export interface CuttingSessionItem {
  originalLength: number;
  actualLength: number;       // После резки
  defectReason?: string;
}

export class StatisticsAnalyzer {
  static compareEstimatedVsActual(
    estimated: BilletResult[],
    actual: CuttingSession[],
  ): {
    accuracyPercentage: number;
    commonDefects: string[];
    recommendations: string[];
  } {
    // Анализировать отклонения и улучшать будущие расчеты
  }
}
```

---

### 🔟 **Сезонные и динамические цены**

Цены и доступность методов могут меняться:

```typescript
export interface PricingStrategy {
  method: CutMethod;
  basePrice: number;
  seasonalMultiplier: number;
  demandMultiplier: number;
  bulkDiscount: (quantity: number) => number;
}

export class DynamicPricingCalculator {
  static calculateOptimalMethod(
    billets: BilletResult[],
    pricing: PricingStrategy[],
    currentDemand: number,
  ): { method: CutMethod; cost: number; timeToExecute: number } {
    // Выбирать метод с учетом текущей ситуации
  }
}
```

---

## 📐 Схема расширяемой архитектуры

```
CuttingService (текущий)
    ↓
    ├─ DiameterRules (расширить)
    │   ├─ + MaterialRules
    │   ├─ + ThicknessRules
    │   └─ + EquipmentRules
    │
    ├─ CutMethod (расширить)
    │   ├─ + CostCalculator
    │   ├─ + TimeCalculator
    │   └─ + WasteCalculator
    │
    └─ BilletCalculator (расширить)
        ├─ + SmartOptimizer (выбирает комбинированные методы)
        ├─ + ValidatorWithConstraints
        └─ + StatisticsTracker
```

---

## 🛠️ Как добавить нюанс при получении информации

**Шаг 1: Создать новый файл для правил**
```typescript
// frontend/src/services/cutting/cutting.material-rules.ts
export const MATERIAL_CUTTING_RULES: Record<SteelGrade, DiameterRuleSet[]> = {
  [SteelGrade.ST3]: [
    // Мягкая сталь
  ],
  [SteelGrade.STAINLESS]: [
    // Нержавейка требует лентопилы или газа, но не другие методы
  ],
};
```

**Шаг 2: Обновить CuttingService**
```typescript
static getOptimalCut(
  diameter: number,
  material?: SteelGrade,
): CutSelection | null {
  const rules = material 
    ? MATERIAL_CUTTING_RULES[material]
    : DIAMETER_RULES;
  // ... rest of logic
}
```

**Шаг 3: Обновить компоненты**
```tsx
const { availableMethods } = useCutMethodSelection(
  itemDiameter,
  itemExtended?.steelGrade  // Добавить новый параметр
);
```

---

## ✅ Ключевые принципы

1. **Ничего не ломать** - все изменения добавляют новые параметры в существующие функции
2. **Обратная совместимость** - если параметр не передан, используется дефолт
3. **Слой за слоем** - каждый нюанс - это отдельный слой логики
4. **Тестируемость** - каждый калькулятор работает независимо

---

## 📞 Готовы к расширениям!

Когда будете готовы рассказать про нюансы, просто сообщите, и мы быстро их добавим благодаря модульной архитектуре! 🚀

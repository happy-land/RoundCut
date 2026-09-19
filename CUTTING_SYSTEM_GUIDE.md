# 📋 Руководство по интеграции системы резки

## Обзор архитектуры

Создана модульная система для управления резкой с разделением ответственности:

```
frontend/src/
├── services/             # API только (priceApi, categoryApi и т.д.)
├── utils/
│   └── cutting/
│       ├── cutting.types.ts
│       ├── cutting.rules.ts
│       ├── cutting.service.ts
│       ├── billet.calculator.ts
│       └── index.ts
├── components/
│   └── CutMethodSelector/
│       ├── CutMethodSelector.tsx
│       └── CutMethodSelector.scss
└── hooks/
    └── useCutting.ts
```

## ✨ Преимущества новой архитектуры

### 1. **Разделение ответственности**
- **Типы** (`cutting.types.ts`) - определение структуры данных
- **Правила** (`cutting.rules.ts`) - бизнес-логика по диаметрам
- **Сервис** (`cutting.service.ts`) - операции валидации и выбора
- **Калькулятор** (`billet.calculator.ts`) - расчет раскроя
- **Компоненты** - только UI и управление состоянием

### 2. **Переиспользуемость**
- `CuttingService` и `BilletCalculator` можно использовать везде
- Логика работает на backend и frontend
- Правила легко изменять без изменения компонентов

### 3. **Тестируемость**
```typescript
// Легко тестировать без React
const allowedMethods = CuttingService.getAvailableCuts(45);
const optimal = CuttingService.getOptimalCut(100);
const valid = CuttingService.validateCutSelection(55, CutMethod.BANDSAW);
```

### 4. **Масштабируемость**
- Просто добавить новые методы резки
- Просто изменить правила
- Легко добавить нюансы (например, разные правила по материалам)

## 🚀 Интеграция в BilletCellNew

### Шаг 1: Имп импорты

```typescript
import { useCuttingCalculator, useCutMethodSelection } from '../../hooks/useCutting';
import { CuttingService, CutMethod } from '../../utils/cutting';
import CutMethodSelector from '../CutMethodSelector/CutMethodSelector';
```

### Шаг 2: Замена состояния

**ДО:**
```typescript
const [cutThickness, setCutThickness] = useState<number>(2);
const [endCut, setEndCut] = useState<number>(0);
const [workpieces, setWorkpieces] = useState<Workpiece[]>([...]);
// ... много функций для управления ...
```

**ПОСЛЕ:**
```typescript
const { useFetchItemQuery } = useSelector(...);
const { data: itemExtended } = useFetchItemQuery(Number(id));

const {
  cutThickness,
  setCutThickness,
  endCut,
  setEndCut,
  workpieces,
  addWorkpiece,
  removeWorkpiece,
  updateWorkpiece,
  billets,
  statistics,
  selectedCutMethod,
  setSelectedCutMethod,
} = useCuttingCalculator({
  billetLength: itemExtended?.length * 1000 || 0,
});

const itemDiameter = itemExtended?.size || 0;
const { availableMethods, optimalMethod, validation } = 
  useCutMethodSelection(itemDiameter);
```

### Шаг 3: Удалить функцию calculateBillets

**ДО:**
```typescript
const calculateBillets = (): BilletResult[] => {
  // 150+ строк кода
};

const billets = calculateBillets();
```

**ПОСЛЕ:**
```typescript
// Просто используем billets из hook:
// const { billets } = useCuttingCalculator(...);
```

### Шаг 4: Добавить выбор метода резки

```typescript
return (
  <article className={cnStyles()}>
    {/* ... заголовок ... */}
    
    {/* Новый блок для выбора метода резки */}
    {itemExtended && (
      <div className={cnStyles("cut-method-section")}>
        <h2 className={cnStyles("section-title")}>Метод резки</h2>
        <CutMethodSelector
          diameter={itemDiameter}
          initialMethod={optimalMethod?.method || undefined}
          onSelect={setSelectedCutMethod}
          disabled={!itemExtended}
        />
        
        {/* Информация о продаже частями */}
        {itemDiameter >= 80 && (
          <div className={cnStyles("part-sale-info")}>
            <p>
              ✓ Можно продавать частями
              (не более 50% от длины круга)
            </p>
          </div>
        )}
      </div>
    )}

    {/* ... остальное UI ... */}
  </article>
);
```

## 📊 Расширение функционала

### Добавление нового типа резки

```typescript
// 1. Добавить в enum CutMethod
export enum CutMethod {
  GAS = 'gas',
  BANDSAW = 'bandsaw',
  CUTOFF_MACHINE = 'cutoff_machine',
  PLASMA_CUT = 'plasma_cut',  // ← Новый
}

// 2. Добавить информацию
export const CUT_METHOD_INFO: Record<CutMethod, CutMethodInfo> = {
  // ...
  [CutMethod.PLASMA_CUT]: {
    id: CutMethod.PLASMA_CUT,
    name: 'plasma_cut',
    displayName: 'Плазменная резка',
    description: 'Резка плазмой для толстых материалов',
  },
};

// 3. Добавить в правила
export const DIAMETER_RULES: DiameterRuleSet[] = [
  // ...
  {
    range: DiameterRange.EXTRA_LARGE,
    minDiameter: 150,
    maxDiameter: null,
    allowedMethods: [CutMethod.BANDSAW, CutMethod.PLASMA_CUT],
    preferredMethod: CutMethod.PLASMA_CUT,
    canSellParts: true,
    partsLengthLimit: 40,
  },
];
```

### Добавление правил по материалам

```typescript
// Создать новый тип
interface CuttingRulesByMaterial {
  material: string;
  rules: DiameterRuleSet[];
}

// Использовать в сервисе
export class CuttingService {
  static getOptimalCut(
    diameter: number, 
    material?: string
  ): CutSelection | null {
    // Получить правила по материалу или дефолтные
    const rules = material 
      ? this.getRulesByMaterial(material)
      : DIAMETER_RULES;
    // ...
  }
}
```

## 🔌 Backend интеграция

### Обновить Cutitem.entity.ts

```typescript
import { CutMethod } from 'src/cutting/cutting.types';

@Entity()
export class Cutitem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CutMethod,
    nullable: true,
  })
  cutMethod?: CutMethod;

  @Column({
    type: 'int',
    default: null,
  })
  minDiameter?: number;

  @Column({
    type: 'int',
    default: null,
  })
  maxDiameter?: number;

  // ... остальные поля ...
}
```

### Обновить CutitemsService

```typescript
async findByParams(warehouseId: number, diameter: number) {
  // Получить оптимальный метод
  const preferredMethod = CuttingService.getPreferredMethod(diameter);
  
  if (!preferredMethod) {
    throw new NotFoundException('Метод резки не определен');
  }

  return this.cutitemsRepository.findOne({
    where: {
      warehouse: { id: warehouseId },
      cutMethod: preferredMethod,
      minDiameter: LessThanOrEqual(diameter),
      maxDiameter: MoreThanOrEqual(diameter),
    },
  });
}
```

## 📝 Примеры использования

### Пример 1: Получить допустимые методы
```typescript
const diameter = 60; // мм
const methods = CuttingService.getAvailableCuts(diameter);
// [
//   { diameter: 60, method: 'gas', isOptimal: false },
//   { diameter: 60, method: 'bandsaw', isOptimal: true }
// ]
```

### Пример 2: Валидация выбора
```typescript
const validation = CuttingService.validateCutSelection(45, CutMethod.BANDSAW);
// { isValid: false, error: 'Метод... недопустим для диаметра 45мм' }

const validation2 = CuttingService.validateCutSelection(45, CutMethod.CUTOFF_MACHINE);
// { isValid: true }
```

### Пример 3: Расчет продажи частями
```typescript
const partInfo = CuttingService.getPartSaleInfo(100);
// { canSell: true, maxLengthPercent: 50, diameter: 100 }

const maxLength = CuttingService.calculateMaxPartLength(100, 6000); // 6 метров
// 3000 (50%)
```

### Пример 4: Расчет раскроя
```typescript
const workpieces = [
  { id: '1', length: 150, quantity: 2 },
  { id: '2', length: 200, quantity: 3 },
];

const billets = BilletCalculator.calculate(
  workpieces,
  6000, // длина круга
  2,    // толщина реза
  10    // торцевой рез
);

const stats = BilletCalculator.getStatistics(billets);
// {
//   totalBillets: 1,
//   totalCuts: 5,
//   totalUsedLength: 950,
//   totalWasteLength: 5018,
//   efficiency: 15.83
// }
```

## 🧪 Тестирование

### Unit тесты для cutting.service.ts
```typescript
describe('CuttingService', () => {
  it('should get available cuts for diameter 45mm', () => {
    const cuts = CuttingService.getAvailableCuts(45);
    expect(cuts.map(c => c.method)).toContain(CutMethod.CUTOFF_MACHINE);
  });

  it('should validate cutting method', () => {
    const result = CuttingService.validateCutSelection(45, CutMethod.BANDSAW);
    expect(result.isValid).toBe(false);
  });
});
```

### Unit тесты для BilletCalculator
```typescript
describe('BilletCalculator', () => {
  it('should calculate billets correctly', () => {
    const billets = BilletCalculator.calculate([...], 6000);
    expect(billets.length).toBeGreaterThan(0);
  });

  it('should calculate waste correctly', () => {
    const waste = BilletCalculator.calculateBilletWaste(billet, 2);
    expect(waste).toBeGreaterThanOrEqual(0);
  });
});
```

## ⚠️ Миграция

### Этапы:
1. ✅ Создать новые файлы (УЖЕ ГОТОВО)
2. Next: Рефакторить BilletCellNew
3. Next: Обновить backend (Cutitem.entity.ts, CutitemsService)
4. Next: Добавить тесты
5. Next: Обновить документацию API

## 🔄 Обратная совместимость

Текущая реализация работает как с новой, так и со старой системой:
- Если `cutMethod` не задан в базе, используется поиск по `name` фрагменту
- Существующие `Cutitem` будут работать без изменений
- Постепенно можно перенести на новую систему


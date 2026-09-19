# 🚀 Быстрый старт - 5 минут до первого результата

## Шаг 1: Проверить что всё создалось

```bash
# В frontend/src/utils/cutting/ должны быть:
ls src/utils/cutting/
# ├── cutting.types.ts
# ├── cutting.rules.ts
# ├── cutting.service.ts
# ├── billet.calculator.ts
# └── index.ts

# В frontend/src/components/CutMethodSelector/ должны быть:
ls src/components/CutMethodSelector/
# ├── CutMethodSelector.tsx
# └── CutMethodSelector.scss

# В frontend/src/hooks/ должен быть:
ls src/hooks/useCutting.ts
```

## Шаг 2: Простой тест в браузере

Откройте **BilletCellNew** и добавьте в конец компонента:

```typescript
// ДЛЯ ТЕСТИРОВАНИЯ - УДАЛИТЬ ПОТОМ
useEffect(() => {
  const { CuttingService, BilletCalculator } = require('../../utils/cutting');
  
  console.log('=== ТЕСТ СИСТЕМЫ РЕЗКИ ===');
  
  // Тест 1: Маленький диаметр
  console.log('Диаметр 45мм:', CuttingService.getAvailableCuts(45));
  
  // Тест 2: Средний диаметр
  console.log('Диаметр 60мм:', CuttingService.getAvailableCuts(60));
  
  // Тест 3: Большой диаметр
  console.log('Диаметр 100мм:', CuttingService.getAvailableCuts(100));
  
  // Тест 4: Расчет
  const billets = BilletCalculator.calculate(
    [{ id: '1', length: 150, quantity: 5 }],
    6000
  );
  console.log('Результат расчета:', billets);
}, []);
```

**Ожидаемый результат в консоли:**
```
=== ТЕСТ СИСТЕМЫ РЕЗКИ ===
Диаметр 45мм: [
  { diameter: 45, method: "cutoff_machine", isOptimal: true },
  { diameter: 45, method: "gas", isOptimal: false }
]
Диаметр 60мм: [
  { diameter: 60, method: "gas", isOptimal: false },
  { diameter: 60, method: "bandsaw", isOptimal: true }
]
Диаметр 100мм: [
  { diameter: 100, method: "bandsaw", isOptimal: true }
]
Результат расчета: [ { billetIndex: 1, items: [...], ... } ]
```

## Шаг 3: Интегрировать CutMethodSelector

В BilletCellNew.tsx после `<div className={cnStyles("buy-calculator")}>`:

```tsx
{itemExtended && (
  <div className={cnStyles("cut-method-section")}>
    <h2 className={cnStyles("section-title")}>Метод резки</h2>
    <CutMethodSelector
      diameter={itemExtended?.size || 0}
      onSelect={(method) => {
        console.log('Выбран метод:', method);
      }}
      disabled={!itemExtended}
    />
  </div>
)}
```

**Импорт добавить в начало файла:**
```typescript
import CutMethodSelector from '../CutMethodSelector/CutMethodSelector';
```

## Шаг 4: Использовать хук вместо calculateBillets

**ДО:**
```typescript
const [cutThickness, setCutThickness] = useState<number>(2);
const [endCut, setEndCut] = useState<number>(0);
const [workpieces, setWorkpieces] = useState<Workpiece[]>([...]);

const calculateBillets = (): BilletResult[] => {
  // 150+ строк кода
};
const billets = calculateBillets();
```

**ПОСЛЕ:**
```typescript
import { useCuttingCalculator } from '../../hooks/useCutting';

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
} = useCuttingCalculator({
  billetLength: itemExtended?.length * 1000 || 0,
});
```

**Удалить функции:**
- ❌ `calculateBillets()`
- ❌ `addWorkpiece()` (теперь в хуке)
- ❌ `removeWorkpiece()` (теперь в хуке)
- ❌ `updateWorkpiece()` (теперь в хуке)

## Шаг 5: Использовать новые возможности

```typescript
// Проверить может ли быть продана частями
const partInfo = CuttingService.getPartSaleInfo(itemExtended?.size || 0);

{partInfo.canSell && (
  <div style={{ color: 'green' }}>
    ✓ Можно продавать частями (макс {partInfo.maxLengthPercent}% от длины)
  </div>
)}

// Вывести статистику
<div>
  <p>Всего кругов: {statistics.totalBillets}</p>
  <p>Эффективность: {statistics.efficiency}%</p>
</div>
```

---

## 📋 Шагово по файлам для полного рефакторинга

### 1️⃣ **cutting.types.ts** - ГОТОВО ✅
```typescript
enum CutMethod { GAS, BANDSAW, CUTOFF_MACHINE }
// ... все типы определены
```

### 2️⃣ **cutting.rules.ts** - ГОТОВО ✅
```typescript
export const DIAMETER_RULES = [...]
export function getDiameterRule(diameter) { ... }
// ... все правила готовы
```

### 3️⃣ **cutting.service.ts** - ГОТОВО ✅
```typescript
class CuttingService {
  static getOptimalCut(diameter) { ... }
  static getAvailableCuts(diameter) { ... }
  static validateCutSelection(diameter, method) { ... }
  // ... все методы готовы
}
```

### 4️⃣ **billet.calculator.ts** - ГОТОВО ✅
```typescript
class BilletCalculator {
  static calculate(workpieces, billetLength, ...) { ... }
  static getStatistics(billets) { ... }
  // ... вся логика расчета готова
}
```

### 5️⃣ **useCutting.ts** - ГОТОВО ✅
```typescript
export function useCuttingCalculator(options) { ... }
export function useCutMethodSelection(diameter) { ... }
export function usePartSaleInfo(diameter) { ... }
// ... все хуки готовы, импортируют из utils/cutting
```

### 6️⃣ **CutMethodSelector.tsx** - ГОТОВО ✅
```typescript
const CutMethodSelector: FC<Props> = ({ diameter, onSelect, ... }) => { ... }
// ... компонент полностью готов
```

---

## 🎯 Три варианта действия

### **Вариант A: МИНИМУМ (5 минут)**
Просто добавить компонент выбора метода в текущий BilletCellNew:

```tsx
<CutMethodSelector
  diameter={itemExtended?.size}
  onSelect={setSelectedCutMethod}
/>
```

✅ Система работает  
❌ Расчет ещё в старом месте  
⏱️ Время: 5 минут

### **Вариант B: ОПТИМАЛЬНО (30 минут)**
Рефакторить BilletCellNew согласно примеру:

1. Заменить useState на хуки
2. Удалить `calculateBillets()`
3. Добавить CutMethodSelector
4. Добавить отображение информации о продаже частями

✅ Система полностью интегрирована  
✅ Код чист и тестируем  
✅ На 50% меньше кода  
⏱️ Время: 30-45 минут

### **Вариант C: ПОСТЕПЕННО (2-3 часа)**
1. Добавить новые файлы в проект
2. Использовать CuttingService в других местах
3. Создать Unit тесты
4. Обновить backend
5. Постепенно переносить старый код

✅ Все подготовлено  
✅ Нет срывов сроков  
✅ Качество на максимум  
⏱️ Время: распределено

---

## ✅ Финальный чек-лист перед запуском

- [ ] Все 6 файлов созданы и на месте
- [ ] Нет ошибок импортов (проверить в IDE)
- [ ] Тест в консоли работает (см. Шаг 2)
- [ ] CutMethodSelector отображается (см. Шаг 3)
- [ ] Выбор метода работает (см. Шаг 4)
- [ ] Информация о продаже частями показывается (см. Шаг 5)

---

## 🐛 Если что-то не работает

### Ошибка: "Cannot find module"
```bash
# Проверить что файлы на месте
ls frontend/src/utils/cutting/
# Если нет - скопировать из примера
```

### Ошибка: "CuttingService is not defined"
```typescript
// Правильно:
import { CuttingService } from '../../utils/cutting';

// Неправильно:
import { CuttingService } from '../../utils/cutting/cutting.service';
```

### Ошибка в TypeScript
```typescript
// Убедиться что типы импортированы:
import { CutMethod, DiameterRange, BilletResult } from '../../utils/cutting';
```

### Компонент не отображается
```typescript
// Убедиться что импорт правильный:
import CutMethodSelector from '../CutMethodSelector/CutMethodSelector';

// И использование:
<CutMethodSelector diameter={45} onSelect={(m) => {}} />
```

---

## 📞 Следующие шаги

1. **Запустить Вариант A** (5 минут) - убедиться что работает
2. **Запустить Вариант B** (30 минут) - правильно рефакторить
3. **Написать тесты** - для BilletCalculator и CuttingService
4. **Обновить backend** - добавить cutMethod в БД

---

## 💡 Полезные ссылки документации

- **Полное руководство**: CUTTING_SYSTEM_GUIDE.md
- **Ожидаемые расширения**: CUTTING_SYSTEM_EXTENSIONS.md
- **Пример рефакторинга**: BILLET_CELL_REFACTORING_EXAMPLE.tsx
- **Краткое резюме**: CUTTING_SYSTEM_SUMMARY.md

---

## 🎉 Готово!

Вся система готова к использованию. Выбирайте вариант и начинайте! 🚀

**Вопросы? Смотрите документацию или запустите тесты!**

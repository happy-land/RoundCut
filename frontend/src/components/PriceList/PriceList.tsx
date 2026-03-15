import React, { FC, ChangeEvent, MouseEvent, useState } from "react";
import {
  TPriceItem,
  TPriceItemResponse,
  TPriceItemExtendedResponse,
} from "../../utils/types";
import { PriceItem } from "./PriceItem";
import block from "bem-cn";
import "./PriceList.scss";
import {
  useDeleteAllItemsMutation,
  useDeleteItemMutation,
  useFetchItemsQuery,
  // useFetchCsvPriceMutation,
  useExtractDataMutation,
  useItemMutation,
  useItemsMutation,
  useFetchItemQuery,
} from "../../services/priceApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addItem } from "../../features/cut/cutSlice";
// import { PAGE_SIZE } from '../../utils/constants';
import {
  convertToPriceItem,
  extractFirstWord,
  normalizeCsvLine,
} from "../../utils/utils";
import { selectWarehouse } from "../../features/warehouse/warehouseSlice";
import { selectSearchQuery } from "../../features/search/searchSlice";
import { selectActiveGrades } from "../../features/filter/steelgradeSlice";
import { selectDiameter } from "../../features/filter/diameterSlice";

interface IPriceListListProps {
  type: "user" | "admin";
}

const cnStyles = block("price");

export const PriceList: FC<IPriceListListProps> = ({ type }) => {
  const searchQuery = useAppSelector(selectSearchQuery);
  const selectedGrades = useAppSelector(selectActiveGrades);
  const selectedDiameters = useAppSelector(selectDiameter);

  const dispatch = useAppDispatch();
  const { warehouseId } = useAppSelector(selectWarehouse);

  const [csvData, setCsvData] = useState<string[]>([]);

  // TODO: сделать тип TPriceItem, который будет отличаться от TPriceItemResponse
  const [itemsToExport, setItemsToExport] = useState<TPriceItemResponse[]>([]);

  // Значение uniqueItemNames определяется при нажатии на кнопку "Уникальные названия"
  const [uniqueItemNames, setUniqueItemNames] = useState<string[]>([]);

  // Значение uniqueItemNames определяется при нажатии на кнопку "Уникальные длины"
  const [uniqueItemLengths, setUniqueItemLengths] = useState<string[]>([]);

  // Строки CSV с некорректным полем length (для отладки)
  const [badRows, setBadRows] = useState<{ index: number; raw: string; arr: string[] }[]>([]);

  // const [inputName, setInputName] = useState<string>('Круг');

  // queries
  // тут задать ()  номер айди склада, взять из хранилища
  const { data: items = [], refetch } = useFetchItemsQuery(warehouseId);

  // mutations
  const [deleteItem] = useDeleteItemMutation();
  const [deleteAllItems] = useDeleteAllItemsMutation();
  const [extractData] = useExtractDataMutation();
  const [uploadItem] = useItemMutation();
  const [uploadItems] = useItemsMutation();

  const itemsExtended: Array<TPriceItemExtendedResponse> = items.map(
    (item: TPriceItemResponse) => {
      // запишем в поле sizeNum значение диаметра круга
      const indexOfM = item.size.indexOf("м");
      const sizeNum: number = parseInt(item.size.slice(0, indexOfM));
      // запишем в поле nameExt имя вида 'Круг Ст20'  (без 3ГП которое иногда встречается в прайсе)
      const indexOfSecondSpace = item.name.indexOf(
        " ",
        item.name.indexOf(" ") + 1,
      );
      let nameExt: string;
      if (indexOfSecondSpace === -1) {
        // то есть второго пробела в строке нет
        nameExt = item.name;
      } else {
        // второй пробел в строке есть
        nameExt = item.name.slice(0, indexOfSecondSpace);
      }

      return {
        ...item,
        nameExt,
        sizeNum,
        indexOfSecondSpace,
      };
    },
  );

  const orderedItems = itemsExtended
    .slice()
    .sort((a, b) => a.sizeNum - b.sizeNum)
    .sort((a, b) => a.nameExt.localeCompare(b.nameExt));

  // 24.01.2026 закомментить этот обработчик,
  // т.к. теперь клик по элементу открывает модальное окно с деталями
  // const onItemClick = (item: TPriceItemExtendedResponse) => {
  //   console.log(item);
  //   dispatch(addItem({ item: item }));
  // };

  const filteredItems = orderedItems.filter((item) => {
    // Filter by searchQuery (if set)
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // Filter by selectedGrades (if any)
    const [, ...rest] = item.name.split(" ");
    const grade = rest.join(" ").trim();
    const matchesGrade =
      selectedGrades.length > 0 ? selectedGrades.includes(grade) : true;

    // Filter by selectedDiameters (if any)
    const itemDiameter = item.size.replace(/мм\.?/g, "").trim();
    const matchesDiameter =
      selectedDiameters && selectedDiameters.length > 0
        ? selectedDiameters.includes(itemDiameter)
        : true;

    return matchesSearch && matchesGrade && matchesDiameter;
  });

  const content = (
    <div>
      <div className={cnStyles("header")}>
        <div className={cnStyles("header-cell")}>Наименование</div>
        <div className={cnStyles("header-cell")}>Диаметр</div>
        <div className={cnStyles("header-cell")}>Цена за т</div>
      </div>
      <ul className={cnStyles("items-list")}>
        {filteredItems.map(
          (item: TPriceItemExtendedResponse, index: number) => (
            <li className={cnStyles("list-item")} key={index}>
              {/* <PriceItem item={item} onClick={() => onItemClick(item)} /> */}
              <PriceItem item={item} />
            </li>
          ),
        )}
      </ul>
    </div>
  );

  const handleDeleteAllItems = async (
    event: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    event.preventDefault();
    console.log("remove all");
    const res = await deleteAllItems(warehouseId);
    console.log(res);
  };

  const handleExtractDataIntoArray = async (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    await extractData()
      .unwrap()
      .then((res) => {
        // Нормализуем каждую строку CSV
        const normalizedData = res.map(normalizeCsvLine);
        console.log(res);
        setCsvData(normalizedData);
      });
  };

  const handleShowUniqueNames = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const uniqueItemNames: string[] = [];

    csvData.map((item) => {
      const arr: string[] = item.split(";");
      if (!uniqueItemNames.find((uniqueName) => uniqueName === arr[7])) {
        uniqueItemNames.push(arr[7]);
      }
    });
    setUniqueItemNames(uniqueItemNames);
  };

  const handleShowUniqueLengths = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const uniqueItemLengths: string[] = [];

    csvData.map((item) => {
      const arr: string[] = item.split(";");
      if (!uniqueItemLengths.find((uniqueLength) => uniqueLength === arr[12])) {
        uniqueItemLengths.push(arr[12]);
      }
    });
    setUniqueItemLengths(uniqueItemLengths);
  };

  // мой вариант определения категории товара и заполнения массива для экспорта в БД.
  // const handleMapCategoryToPriceItem = (
  //   event: MouseEvent<HTMLButtonElement>,
  // ) => {
  //   event.preventDefault();
  //   const arrToExport: TPriceItemResponse[] = csvData.map((item) => {
  //     const arr: string[] = item.split(';');
  //     const catName = extractFirstWord(arr[7]);
  //     if (arr[7].includes('калиброванный')) {
  //       arr.splice(11, 1);
  //     }

  //     if (arr[12].includes('Лист г/к')) {
  //       arr.splice(11, 1);
  //       console.log(arr);
  //     }
  //     arr.push(catName);
  //     return convertToPriceItem(arr);
  //   });
  //   setItemsToExport(arrToExport);
  // };

  const handleMapCategoryToPriceItem = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    const foundBadRows: { index: number; raw: string; arr: string[] }[] = [];

    const arrToExport: TPriceItemResponse[] = csvData.map((item, csvIndex) => {
      const arr: string[] = item.split(";");
      const catName = extractFirstWord(arr[7]);

      // Проверяем условия на ИСХОДНОМ массиве
      // Для "калиброванный": удаляем arr[11] только если нормализация НЕ сработала —
      // т.е. arr[12] всё ещё не число (значит "ГОСТ X;Y" не был склеен в одно поле)
      const shouldRemoveElement11 =
        (arr[7].includes("калиброванный") &&
          isNaN(parseFloat(arr[12]?.replace(",", ".") ?? ""))) ||
        arr[12]?.includes("Лист г/к");

      // Строке не хватает поля other: arr[10] — слово-категория (Круг~/Лист_ и т.п.),
      // arr[11] — число (length), arr[12] — пустое
      const productGroupWords = ["Круг", "Лист", "Труба", "Квадрат", "Шестигранник", "Полоса"];
      const arr10IsCategory = productGroupWords.some((w) =>
        arr[10]?.trim().startsWith(w),
      );
      const isShortRow =
        !shouldRemoveElement11 &&
        arr10IsCategory &&
        !isNaN(parseFloat(arr[11]?.replace(",", ".") ?? ""));

      // Строим новый массив с правильными индексами
      let cleanedArr: string[];

      if (shouldRemoveElement11) {
        // Берём элементы с 0 по 10, пропускаем 11, берём 12 и 13
        cleanedArr = [
          ...arr.slice(0, 11), // 0-10
          arr[12], // length (было на 12, теперь на 11)
          arr[13], // было на 13, теперь на 12
          catName, // новый элемент на 13
        ];
      } else if (isShortRow) {
        // Строке не хватает колонки other (arr[10] — productGroup, arr[11] — length)
        // Вставляем пустую строку на позицию 10, сдвигая всё вправо
        cleanedArr = [
          ...arr.slice(0, 10), // 0-9
          "",                  // other (пусто)
          arr[10],             // productGroup
          arr[11],             // length
          "",                  // placeholder для arr[13]
          catName,
        ];
      } else {
        // Оставляем всё как есть и добавляем категорию
        cleanedArr = [
          ...arr.slice(0, 14), // 0-13
          catName, // новый элемент на 14
        ];
      }

      // Проверяем, что length будет валидным числом
      const lengthIndex = shouldRemoveElement11 ? 11 : 12;
      const lengthRaw = cleanedArr[lengthIndex];
      const lengthParsed = parseFloat(lengthRaw?.replace(',', '.').replace(' ', ''));
      if (!lengthRaw || isNaN(lengthParsed)) {
        foundBadRows.push({ index: csvIndex + 1, raw: item, arr: cleanedArr });
        console.warn(`[CSV] Строка ${csvIndex + 1}: некорректный length="${lengthRaw}"`, cleanedArr);
      }

      return convertToPriceItem(cleanedArr);
    });

    setBadRows(foundBadRows);
    if (foundBadRows.length > 0) {
      console.warn(`[CSV] Найдено ${foundBadRows.length} строк с некорректным length`);
    }
    setItemsToExport(arrToExport);
  };

  const handleUploadItems = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(itemsToExport);
    uploadItems(itemsToExport);
  };

  const handleRefetch = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    refetch();
  };

  // const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   event.preventDefault();
  //   setInputName(event.target.value);
  // };

  return (
    <div className={cnStyles()}>
      <h1 className={cnStyles("title")}>Прайс</h1>
      {type === "admin" && (
        <div className={cnStyles("price-buttons")}>
          <button
            className={cnStyles("button")}
            onClick={(event) => handleDeleteAllItems(event)}
            disabled={items.length === 0}
          >
            Удалить все строки из БД
          </button>
          <button
            className={cnStyles("button")}
            // onClick={(event) => handleLoadPriceFromCSV(event)}
            onClick={(event) => handleExtractDataIntoArray(event)}
            disabled={items.length > 0}
          >
            Выгрузить прайс в массив
          </button>
          <button
            className={cnStyles("button")}
            onClick={(event) => handleRefetch(event)}
          >
            Обновить
          </button>
        </div>
      )}
      {csvData.length > 0 && (
        <div>
          <p>В массив выгружено {csvData.length} строк</p>
          <button
            className={cnStyles("button")}
            onClick={(event) => handleShowUniqueNames(event)}
          >
            Уникальные названия
          </button>
          <button
            className={cnStyles("button")}
            onClick={(event) => handleShowUniqueLengths(event)}
          >
            Уникальные длины
          </button>
          <button
            className={cnStyles("button")}
            onClick={(event) => handleMapCategoryToPriceItem(event)}
          >
            Определить категорию
          </button>
          <button
            className={cnStyles("button")}
            onClick={(event) => handleUploadItems(event)}
          >
            +++
          </button>
          {uniqueItemNames.map((uniqueName, index) => (
            <p key={index}>
              {index}. {uniqueName}
            </p>
          ))}
          {uniqueItemLengths.map((uniqueLength, index) => (
            <p key={index}>
              {index}. {uniqueLength}
            </p>
          ))}
          {badRows.length > 0 && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '8px', marginTop: '8px' }}>
              <p><strong>⚠ Найдено {badRows.length} строк с некорректным length:</strong></p>
              {badRows.map((row) => (
                <div key={row.index} style={{ fontFamily: 'monospace', fontSize: '12px', marginBottom: '4px' }}>
                  <strong>Строка {row.index}:</strong> {row.raw}
                  <br />
                  <span style={{ color: 'red' }}>arr[{row.arr.length > 12 ? 12 : 11}] = "{row.arr[row.arr.length > 13 ? 12 : 11]}"</span>
                  {' | arr.length = '}{row.arr.length}
                </div>
              ))}
            </div>
          )}
          {itemsToExport.slice(15580, 15590).map((item, index) => (
            <div key={index}>
              <p>
                {index}. {item.name} {item.size} {item.baseName} {item.catName}
              </p>
              <button
                className={cnStyles("button")}
                // onClick={(event) => handleUploadItem(event, item)}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
      {content && (
        <section className={cnStyles("content-section")}>{content}</section>
      )}
    </div>
  );
};

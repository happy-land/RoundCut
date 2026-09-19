import { FC, DragEvent, useState, MouseEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { utils } from 'xlsx';
import block from 'bem-cn';
import './Markup.scss';
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { mapBaseName } from '../utils/mapping';
import {
  useAddWarehouseMutation,
  useFetchWarehousesQuery,
} from '../services/warehouseApi';
import { TMarkup, TWarehouse } from '../utils/types';
import { useAddMarkupMutation } from '../services/markupApi';
import WarehouseItem from '../components/WarehouseList/WarehouseItem';
import { getWarehouseId } from '../utils/warehouse';

interface IMarkupProps {}

type TRowProps = {
  [key: string]: string | number;
};

const cnStyles = block('markup');

export const Markup: FC<IMarkupProps> = () => {

  // columns и rows нужны для компонента DataGrid
  const [columns, setColumns] = useState<GridColDef[]>();
  const [rows, setRows] = useState<GridRowsProp>();

  const [isDrop, setIsDrop] = useState<boolean>(false);

  // список складов (только названия!), которые пришли из файла
  const [incomingWH, setIncomingWH] = useState<string[]>([]);

  // наценки, которые пришли из файла
  const [incomingMarkups, setIncomingMarkups] = useState<TMarkup[]>([]);

  const [json, setJson] = useState<Array<Array<string | number | null>>>([]);

  // queries
  const { data: warehouses = [] } = useFetchWarehousesQuery(0);

  // mutations
  const [addWarehouse] = useAddWarehouseMutation();
  const [addMarkup] = useAddMarkupMutation();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDrop(true);
    const file = event.dataTransfer.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // console.log(worksheet);
    const json: Array<Array<string | number | null>> = utils.sheet_to_json(
      worksheet,
      {
        header: 1,
      },
    );

    setJson(json);

    rebuild(json);
    // перенести в функцию rebuild

    // конец функции rebuild
  };

  useEffect(() => {
    rebuild(json);
  }, []);

  const rebuild = (json: Array<Array<string | number | null>>) => {
    const rowsArr: Array<GridRowsProp> = [];
    const warehousesList: string[] = [];
    const markups: TMarkup[] = [];

    console.log(json);

    json.forEach((row, index) => {
      // Header
      if (index === 3) {
        const header: GridColDef[] = [];
        row.forEach((element, index) => {
          const headerElement: GridColDef = {
            field: `col${index}`,
            headerName: element as string,
            width: 120,
          };
          header.push(headerElement);
        });
        setColumns(header);
      }
      // Rows
      if (index > 3) {
        // console.log(row);
        row[1] = mapBaseName(row[1] as string);
        if (row[1]) {
          // то есть row[1] !== null
          rowsArr.push(arrToObject(row, index - 3));
          warehousesList.push(row[1] as string);
          const markup: TMarkup = {
            name: row[1] as string,
            level1: row[2] as number,
            level2: row[3] as number,
            level3: row[4] as number,
            level4: row[5] as number,
            level5: row[6] as number,
            level6: row[7] as number,
            level7: row[8] as number,
            level8: row[9] as number,
            warehouseId: getWarehouseId(warehouses, row[1] as string), // ищем id склада
          };
          markups.push(markup);
        }
      }
    });
    setRows(rowsArr);
    setIncomingWH(warehousesList);
    setIncomingMarkups(markups);
    console.log(warehousesList);
  };

  const arrToObject = (arr: GridValidRowModel, index: number) => {
    return arr.reduce(reducer, { id: index });
  };

  const reducer = (acc: TRowProps, v: string | number, idx: number) => {
    return {
      ...acc,
      [`col${idx}`]: v,
    };
  };

  // const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   event.preventDefault();
  //   setWarehouseName(event.target.value.toUpperCase());
  // };

  const handleSubmitMarkups = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    incomingMarkups.map(async (markup) => {
      console.log(markup);
      await addMarkup(markup)
        .unwrap()
        .then((res) => {
          console.log(res);
        });
    });
  };

  const chechWarehouse = (currentWH: TWarehouse[], incomingWH: string) => {
    let result = false;
    currentWH.map((warehouse) => {
      if (warehouse.name === incomingWH) {
        result = true;
      }
    });
    return result;
  };

  const warehousesList = (
    <ul>
      {warehouses.map((warehouse: TWarehouse, index: number) => (
        // <li key={index}>{warehouse.name}</li>
        <li key={index}>
          <WarehouseItem item={warehouse} 
          onClick={() => {}}
          />
        </li>
      ))}
    </ul>
  );

  const handleAddWarehouse = (
    event: MouseEvent<HTMLButtonElement>,
    whName: string,
  ) => {
    event.preventDefault();
    addWarehouse({ name: whName });
    // проверить, добавляются ли в массив
    rebuild(json);
    console.log(warehouses);
  };

  return (
    <div className={cnStyles()}>
      <h1 className={cnStyles('title')}>Markup</h1>
      {warehousesList && (
        <section className={cnStyles('content-section')}>
          {warehousesList}
        </section>
      )}
      <h2>Входящие склады:</h2>
      {incomingWH.length !== 0 &&
        incomingWH.map((whName, index) => (
          <p key={index}>
            {whName}{' '}
            {chechWarehouse(warehouses, whName) ? (
              'Есть в базе'
            ) : (
              <button onClick={(event) => handleAddWarehouse(event, whName)}>
                Добавить склад
              </button>
            )}
          </p>
        ))}
      <h2>Входящие наценки</h2>
      {incomingMarkups?.length !== 0 &&
        incomingMarkups?.map((markup, index) => (
          <p key={index}>
            {markup.name} {markup.level1} id склада: {markup.warehouseId}
          </p>
        ))}
      <button
        onClick={(event) => handleSubmitMarkups(event)}
        disabled={!isDrop}
      >
        Добавить все наценки в базу
      </button>
      <div
        className={cnStyles('drop')}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e)}
      >
        <p>Перетащите файл с наценками</p>
      </div>
      {columns && <DataGrid rows={rows} columns={columns} />}
    </div>
  );
};

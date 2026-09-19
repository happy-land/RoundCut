import { FC, MouseEvent, DragEvent, useState } from 'react';
import * as XLSX from 'xlsx';
import { utils } from 'xlsx';
import block from 'bem-cn';
import './CutitemEditPage.scss';
import { TGoodsCutItem } from '../utils/types';
import { mapBaseName } from '../utils/mapping';
import { useFetchWarehousesQuery } from '../services/warehouseApi';
import { getWarehouseId } from '../utils/warehouse';
import { useFetchAdminCutsQuery } from '../services/adminCutApi';
import { getCutId } from '../utils/cut';
import { useAddCutitemMutation } from '../services/cutitemApi';

interface ICutitemProps {}

const cnStyles = block('cutitem-edit-page');

export const CutitemEditPage: FC<ICutitemProps> = () => {

  const [cutItems, setCutItems] = useState<TGoodsCutItem[]>([]);

  // queries
  // получить c сервера список названий складов из БД
  const { data: warehouses = [] } = useFetchWarehousesQuery(0);

  // получить c сервера список названий резки из БД
  const { data: cuts = [] } = useFetchAdminCutsQuery(0);

  // mutations
  const [addCutitem] = useAddCutitemMutation();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const json: Array<Array<string | number | null>> = utils.sheet_to_json(
      worksheet,
      {
        header: 1,
      },
    );

    rebuild(json);
  };

  const rebuild = (json: Array<Array<string | number | null>>) => {
    // console.log(json);
    const warehousesList: Array<string | number | null> = [];
    const cutitemList: Array<string | number | null> = [];
    const rowList: Array<Array<string | number | null>> = [];

    json.forEach((row, index) => {
      // warehousesList записываем только названия складов
      if (index === 5) {
        row.forEach((cell, idx) => {
          if (idx >= 3) {
            warehousesList.push(cell);
          }
        });
      }
      if (index > 5) {
        // console.log(row);
        rowList.push(row);

        row.forEach((cell, idx) => {
          if (idx === 1) {
            cutitemList.push(cell);
          }
        });
      }
    });

    console.log(warehousesList);
    console.log(rowList);

    populateItems(warehousesList, rowList);
  };

  const populateItems = (
    warehousesList: Array<string | number | null>,
    rowList: Array<Array<string | number | null>>,
  ) => {
    const items: Array<TGoodsCutItem> = [];

    let warehouseName: string = '';

    if (warehousesList.length > 0) {
      warehousesList.forEach((warehouse, windex) => {
        warehouseName = warehouse as string;
        if (mapBaseName(warehouseName)) {
          rowList.forEach((row) => {
            const item: TGoodsCutItem = {
              warehouse: mapBaseName(warehouseName) as string,
              name: row[1] as string,
              amount: parseFloat(row[windex + 3] as string)
                ? parseFloat(row[windex + 3] as string)
                : 0,
              warehouse_id: getWarehouseId(warehouses, mapBaseName(warehouseName) as string),
              cut_id: getCutId(cuts, row[1] as string),
            };
            items.push(item);
          });
        }
      });
    }
    setCutItems(items);
  };

  const handleSubmitCutitems = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    cutItems.map(async (cutitem) => {
      console.log(cutitem.name);
      await addCutitem(cutitem)
        .unwrap()
        .then((res) => {
          console.log(res);
        });
    })
  };

  return (
    <div className={cnStyles()}>
      <h1>Cutitem</h1>
      <button onClick={(event) => handleSubmitCutitems(event)}>
        Выгрузить в БД
      </button>

      <div
        className={cnStyles('drop')}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDrop(e)}
      >
        <p>Перетащите файл с резкой </p>
        {cutItems.length}
        {cutItems &&
          cutItems.map((element, index) => (
            <div key={index}>
              <p>
                {index} - {element.name} // {element.warehouse} // {element.warehouse_id} // 
                {element.amount} руб // {element.cut_id}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CutitemEditPage;

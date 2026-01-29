import React, { FC, useState, useEffect } from 'react';
import block from 'bem-cn';
import './BilletModal.scss';
import { mapWeightToLevel } from '../../utils/markupMapping';
import { useGetMarkupByWarehouseIdQuery } from '../../services/markupApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate, useParams } from 'react-router-dom';
import { TPriceItemResponse } from '../../utils/types';
import { useFetchItemQuery } from '../../services/priceApi';

interface BilletModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  item?: TPriceItemResponse;
  cutPrice?: number;
}

const cnStyles = block('billet-modal');

const BilletModal: FC<BilletModalProps> = ({
  isOpen = true,
  onClose,
  item: propItem,
  cutPrice = 0,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Загружаем item из API если есть ID в URL
  const { data: apiItem } = useFetchItemQuery(
    id ? parseInt(id) : skipToken,
  );

  // Используем переданный item или загруженный из API
  const item = propItem || apiItem;

  if (!item) {
    return null; // Показываем ничего если нет данных
  }

  // Извлекаем данные из item
  const itemName = item.name;
  const itemLength = item.length;
  const pricePerTon = item.pricePer1tn;
  const unitWeight = item.unitWeight;
  const warehouseId = item.warehouse?.id;

  const [billetLength, setBilletLength] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [weight, setWeight] = useState<number>(0);
  const [markupValue, setMarkupValue] = useState<number>(0);
  const [billetPrice, setBilletPrice] = useState<number>(0);
  const [billetCost, setBilletCost] = useState<number>(0);
  const [totalCutCost, setTotalCutCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  const billetCoef = 1.12;
  const billetMarkup = 1700;

  // Получить данные о малотоннажности
  const { data: markup } = useGetMarkupByWarehouseIdQuery(
    warehouseId ?? skipToken,
  );

  // Расчет веса заготовки
  useEffect(() => {
    if (billetLength > 0) {
      const calculatedWeight = (billetLength * unitWeight) / itemLength;
      setWeight(Math.ceil(calculatedWeight));
    } else {
      setWeight(0);
    }
  }, [billetLength, unitWeight, itemLength]);

  // Расчет малотоннажности
  useEffect(() => {
    const calculateMarkup = (weight: number): number => {
      let markupVal: number;
      if (weight < 1000 && markup) {
        const markupLevel = mapWeightToLevel(weight / 1000);
        const level = `level${markupLevel}`;
        markupVal = markup && markup[level];
      } else {
        markupVal = 0;
      }
      return markupVal;
    };

    setMarkupValue(() => calculateMarkup(weight));
  }, [weight, markup]);

  // Расчет цены за тонну заготовки с учетом малотоннажности
  useEffect(() => {
    if (weight > 0) {
      const markupPrice = pricePerTon + markupValue;
      let billetPriceCoefApplied = markupPrice * billetCoef;

      const preCost = (markupPrice * weight) / 1000;
      const preCostCoefApplied = (billetPriceCoefApplied * weight) / 1000;

      if (preCostCoefApplied - preCost < billetMarkup) {
        const cost = preCost + billetMarkup;
        billetPriceCoefApplied = (cost * 1000) / weight;
      }

      setBilletPrice(Math.round(billetPriceCoefApplied));
    } else {
      setBilletPrice(pricePerTon);
    }
  }, [weight, pricePerTon, markupValue]);

  // Расчет стоимости одной заготовки
  useEffect(() => {
    if (weight > 0) {
      const cost = (billetPrice * weight) / 1000;
      setBilletCost(cost);
    } else {
      setBilletCost(0);
    }
  }, [billetPrice, weight]);

  // Расчет стоимости резки
  useEffect(() => {
    setTotalCutCost(cutPrice * quantity);
  }, [quantity, cutPrice]);

  // Расчет общей стоимости
  useEffect(() => {
    const total = billetCost * quantity + totalCutCost;
    setTotalCost(total);
  }, [billetCost, quantity, totalCutCost]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cnStyles('overlay')} onClick={handleClose}>
      <div className={cnStyles('content')} onClick={(e) => e.stopPropagation()}>
        <button className={cnStyles('close')} onClick={handleClose}>
          ✕
        </button>
        <h2 className={cnStyles('title')}>{itemName}</h2>

        <div className={cnStyles('section')}>
          <label className={cnStyles('label')}>
            Длина заготовки (м):
            <input
              type="number"
              min="0"
              max={itemLength}
              step="0.001"
              value={billetLength}
              onChange={(e) => setBilletLength(parseFloat(e.target.value) || 0)}
              className={cnStyles('input')}
            />
          </label>

          <label className={cnStyles('label')}>
            Количество заготовок:
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className={cnStyles('input')}
            />
          </label>
        </div>

        <div className={cnStyles('results')}>
          <div className={cnStyles('result-item')}>
            <span>Вес заготовки:</span>
            <span>{weight.toFixed(2)} кг</span>
          </div>

          <div className={cnStyles('result-item')}>
            <span>Наценка малотоннажности:</span>
            <span>{markupValue ? markupValue : 0} руб.</span>
          </div>

          <div className={cnStyles('result-item')}>
            <span>Цена за тонну:</span>
            <span>{billetPrice} руб.</span>
          </div>

          <div className={cnStyles('result-item')}>
            <span>Стоимость одной заготовки:</span>
            <span>{billetCost.toFixed(2)} руб.</span>
          </div>

          <div className={cnStyles('result-item')}>
            <span>Стоимость резки ({quantity} шт):</span>
            <span>{totalCutCost.toFixed(2)} руб.</span>
          </div>

          <div className={cnStyles('result-item', { total: true })}>
            <span>Итого:</span>
            <span>{totalCost.toFixed(2)} руб.</span>
          </div>
        </div>

        <div className={cnStyles('actions')}>
          <button className={cnStyles('button')} onClick={handleClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default BilletModal;
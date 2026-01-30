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

const BilletModal: FC<BilletModalProps> = () => {
  

  return (
    <div>Модалка с заготовкой</div>
  )
    
};

export default BilletModal;
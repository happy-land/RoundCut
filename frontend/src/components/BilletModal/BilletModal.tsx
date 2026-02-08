import React, { FC, useState, useEffect } from 'react';
import block from 'bem-cn';
import './BilletModal.scss';
import { TPriceItemResponse } from '../../utils/types';
import BilletCellNew from '../BilletCellNew/BilletCellNew';
import { useParams } from 'react-router-dom';

interface BilletModalProps {

}

const cnStyles = block('billet-modal');

const BilletModal: FC<BilletModalProps> = () => {
  const { id } = useParams<{  id: string }>();

  if (!id) {
    return null;
  }

  return (
    <BilletCellNew id={id} />
  )
    
};

export default BilletModal;
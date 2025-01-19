import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface WarehouseState {
  isOpenModal: boolean;
  warehouseId: number;
}

const initialState: WarehouseState = {
  isOpenModal: false,
  warehouseId: 202, // TODO: убрать хардкод
}

export const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    openModal: (state) => {
      state.isOpenModal = true;
    },
    closeModal: (state) => {
      state.isOpenModal = false;
    },
    setWarehouse: (state, action: PayloadAction<{ warehouseId: number }>) => {
      state.warehouseId = action.payload.warehouseId;
    }
  }
});

export const selectWarehouse = (state: RootState) => state.warehouse;

export const { openModal, closeModal, setWarehouse } = warehouseSlice.actions;

export default warehouseSlice.reducer;
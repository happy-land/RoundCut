import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface WarehouseState {
  isOpenModal: boolean;
}

const initialState: WarehouseState = {
  isOpenModal: false,
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
    }
  }
});

export const selectWarehouse = (state: RootState) => state.warehouse;

export const { openModal, closeModal } = warehouseSlice.actions;

export default warehouseSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  tatModalOpen: false,
  tagEmployeeModalToggle: false,
  queryRemoveModalOpen: false,
  viewIssueModal: false,
  viewIssueModalData:{},
  openHelpdeskModal: false,
  modalData:null,
  modalOpen:false,
  InHouseModal:false,
  InHouseModalData:null,
};

export const TicketingModuleSlice = createSlice({
  name: "TicketingModuleSlice",
  initialState,
  reducers: {
    setTatModalOpen: (state, actions) => {
      state.tatModalOpen = actions.payload;
    },
    setTagEmployeeModalToggle: (state, actions) => {
      state.tagEmployeeModalToggle = actions.payload;
    },
    setQueryRemoveModalOpen:(state, actions)=>{
      state.queryRemoveModalOpen = actions.payload;
    },
    setViewIssueModal:(state, actions)=>{
      state.viewIssueModal = actions.payload;
    },
    setViewIssueModalData:(state, actions)=>{
      state.viewIssueModalData = actions.payload;
    },
    setOpenHelpdeskModal:(state, actions)=>{
      state.openHelpdeskModal = actions.payload;
    },
    setModalData:(state, actions)=>{
      state.modalData = actions.payload;
    },
    setModalOpen:(state, actions)=>{
      state.modalOpen = actions.payload;
    },
    setInHouseModal:(state, actions)=>{
      state.InHouseModal = actions.payload;
    },
    setInHouseModalData:(state, actions)=>{
      state.InHouseModalData = actions.payload;
    }
  },
});

export const 
{
  setInHouseModal,
  setInHouseModalData,
  setTatModalOpen, 
  setTagEmployeeModalToggle, 
  setQueryRemoveModalOpen,
  setViewIssueModal,
  setViewIssueModalData,
  setModalData,
  setOpenHelpdeskModal,
  setModalOpen,
} = TicketingModuleSlice.actions;
export default TicketingModuleSlice.reducer;

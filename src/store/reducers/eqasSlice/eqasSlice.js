import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    providerModalOpen:false,
    providerModalData:null,
    openCheckListModal: false,
    checkListData:null,
    commentModalOpen:false,
    commentModalData:null,
    TypeModalData:null,
    TypeModalOpen:false,
};

export const eqasSlice = createSlice({
  name: "eqasSlice",
  initialState,
  reducers: {
    setProviderModalOpen: (state, actions) => {
      state.providerModalOpen = actions.payload;
    },
    setOpenCheckListModal:(state, actions)=>{
      state.openCheckListModal = actions.payload
    },
    setCheckListData:(state, actions)=>{
      state.checkListData = actions.payload
    },
    setCommentModalOpen:(state, actions)=>{
      state.commentModalOpen = actions.payload
    },
    setCommetModalData:(state, actions)=>{
      state.commentModalData = actions.payload
    },
    setTypeModalOpen:(state, actions)=>{
      state.TypeModalOpen = actions.payload
    },
    setTypeModalData:(state, actions)=>{
      state.TypeModalData = actions.payload
    },
  },
});

export const 
{
  setProviderModalOpen,
  setCheckListData,
  setOpenCheckListModal,
  setCommentModalOpen,
  setCommetModalData,
  setTypeModalOpen,
  setTypeModalData
} = eqasSlice.actions;
export default eqasSlice.reducer;

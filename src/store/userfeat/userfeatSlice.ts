import {
  Dataset,
  Dping,
  Dtg,
  DvBojSg1,
  DvCompSg1,
  RdvCompDl,
  RdvCompDs,
  Rs,
  Rt,
  RdvBojDs,
  Str,
  RdvCompDh,
  TenantBkcc,
  DvCompSg1b,
  DvCompPt,
  DvCompBrg,
  DvCompSg2,
  DvCompDd,
  DvCompFt,
  LandingDataset,
} from "@/types/userfeat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserFeatState {
  dataset: Dataset[];
  dvcompsg1: DvCompSg1[];
  dvcomppt: DvCompPt[];
  dvcompbrg: DvCompBrg [];
  dvcompsg1b: DvCompSg1b[];
  rdvcompdl: RdvCompDl[];
  rdvcomdh: RdvCompDh[];
  rdvcompds: RdvCompDs[];
  dvcompdd: DvCompDd[];
  dvcompft: DvCompFt[];
  rs: Rs[];
  dping: Dping[];
  rt: Rt[];
  dtg: Dtg[];
  rdvbojds: RdvBojDs[];
  str: Str[];
  dvbojsg1: DvBojSg1[];
  tenantbkcc: TenantBkcc[];
  dvcompsg2: DvCompSg2[];
  lnddataset: LandingDataset[];
}

const initialState: UserFeatState = {
  dataset: [],
  dvcompsg1: [],
  dvcompsg1b: [],
  dvcomppt:[],
  dvcompbrg: [],
  rdvcompdl: [],
  rdvcompds: [],
  rs: [],
  dping: [],
  rt: [],
  dtg: [],
  rdvbojds: [],
  str: [],
  dvbojsg1: [],
  rdvcomdh: [],
  tenantbkcc: [],
  dvcompsg2: [],
  dvcompdd: [],
  dvcompft: [],
  lnddataset: [],
};

export const userfeatSlice = createSlice({
  name: "userfeat",
  initialState,
  reducers: {
    setDatasets: (state, action: PayloadAction<Dataset[]>) => {
      state.dataset = action.payload;
    },
    setLndDataset: (state, action: PayloadAction<LandingDataset[]>) => {
      state.lnddataset = action.payload;
    },
    setDvCompsg1: (state, action: PayloadAction<DvCompSg1[]>) => {
      state.dvcompsg1 = action.payload;
    },
    setDvCompsg2: (state, action: PayloadAction<DvCompSg1[]>) => {
      state.dvcompsg2 = action.payload;
    },
    setDvComppt: (state, action: PayloadAction<DvCompPt[]>) => {
      state.dvcomppt = action.payload;
    },
    setDvCompbrg: (state, action: PayloadAction<DvCompBrg[]>) => {
      state.dvcompbrg = action.payload;
    },
    setDvCompsg1b: (state, action: PayloadAction<DvCompSg1b[]>) => {
      state.dvcompsg1b = action.payload;
    },
    setRdvCompDl: (state, action: PayloadAction<RdvCompDl[]>) => {
      state.rdvcompdl = action.payload;
    },
    setRdvCompDs: (state, action: PayloadAction<RdvCompDs[]>) => {
      state.rdvcompds = action.payload;
    },
    setDvCompDd: (state, action: PayloadAction<DvCompDd[]>) => {
      state.dvcompdd = action.payload;
    },
    setDvCompFt: (state, action: PayloadAction<RdvCompFt[]>) => {
      state.dvcompft = action.payload;
    },
    setRs: (state, action: PayloadAction<Rs[]>) => {
      state.rs = action.payload;
    },
    setDping: (state, action: PayloadAction<Dping[]>) => {
      state.dping = action.payload;
    },
    setRt: (state, action: PayloadAction<Rt[]>) => {
      state.rt = action.payload;
    },
    setDtg: (state, action: PayloadAction<Dtg[]>) => {
      state.dtg = action.payload;
    },
    setRdvBojDs: (state, action: PayloadAction<RdvBojDs[]>) => {
      state.rdvbojds = action.payload;
    },
    setStr: (state, action: PayloadAction<Str[]>) => {
      state.str = action.payload;
    },
    setDvBojSg1: (state, action: PayloadAction<DvBojSg1[]>) => {
      state.dvbojsg1 = action.payload;
    },
    setRdvCompDh: (state, action: PayloadAction<RdvCompDh[]>) => {
      state.rdvcomdh = action.payload;
    },
    setTenantBkcc: (state, action: PayloadAction<TenantBkcc[]>) => {
      state.tenantbkcc = action.payload;
    },
  },
});

export const {
  setDatasets,
  setDvCompsg1,
  setDvComppt,
  setDvCompbrg,
  setDvCompsg1b,
  setDvCompsg2,
  setRdvCompDl,
  setRdvCompDs,
  setRs,
  setDping,
  setRt,
  setDtg,
  setRdvBojDs,
  setStr,
  setDvBojSg1,
  setRdvCompDh,
  setTenantBkcc,
  setDvCompDd,
  setDvCompFt,
  setLndDataset,
} = userfeatSlice.actions;

export default userfeatSlice.reducer;

import { Datastore } from "@/types/datastore";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DatastoreSlice {
    datastores: Datastore[];
}

const initialState: DatastoreSlice = {
    datastores: [],
};

export const datastoreSlice = createSlice({
    name: "datastore",
    initialState,
    reducers: {
        setDatastores: (state, action: PayloadAction<Datastore[]>) => {
            state.datastores = action.payload;
        },
    },
});

export const { setDatastores } = datastoreSlice.actions;
export default datastoreSlice.reducer;

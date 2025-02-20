import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompBrg2 } from '@/types/userfeat';
import { setDvCompbrg2 } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompBrg2sAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompbrg2/getAll',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg2/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            console.log(jsonResponse);
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompbrg2(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompbrg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompBrg2Async = createAsyncThunk<any, DvCompBrg2, { rejectValue: ErrorResponse }>(
    'dvcompbrg2/createDvCompBrg2',
    async (dvcompbrg2, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg2/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompbrg2)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompBrg2sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompbrg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompBrg2Async = createAsyncThunk<any, { dvid: number; dvcompbrg2Data: Partial<DvCompBrg2> }, { rejectValue: ErrorResponse }>(
    'dvcompbrg2/updateDvCompBrg2',
    async ({ dvid, dvcompbrg2Data }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg2/update/${dvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompbrg2Data)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompBrg2sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcompbrg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompBrg2Async = createAsyncThunk<any, DvCompBrg2, { rejectValue: ErrorResponse }>(
    'dvcompbrg2/testDvCompBrg2',
    async (dvcompbrg2, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg2/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompbrg2)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvcompbrg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvCompBrg2ColumnsAsync = createAsyncThunk<any, { projectshortname: string }, { rejectValue: ErrorResponse }>(
    'dvcompbrg2/getAllDvCompBrg2Columns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg2/columns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(payload)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompbrg2 columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getTableColumnsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'dvcompbrg2/getTableColumns',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg2/get-columns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(data)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get table columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);
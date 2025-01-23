import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompBrg } from '@/types/userfeat';
import { setDvCompbrg } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompBrgsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompbrg/getAllDvCompBrgs',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            console.log(jsonResponse);
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompbrg(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompbrg';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompBrgAsync = createAsyncThunk<any, DvCompBrg, { rejectValue: ErrorResponse }>(
    'dvcompbrg/createDvCompBrg',
    async (dvcompbrg, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompbrg)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompBrgsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompbrg';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompBrgAsync = createAsyncThunk<any, { dvid: number; dvcompbrgData: Partial<DvCompBrg> }, { rejectValue: ErrorResponse }>(
    'dvcompbrg/updateDvCompBrg',
    async ({ dvid, dvcompbrgData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg/update/${dvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompbrgData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompBrgsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcompbrg';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompBrgAsync = createAsyncThunk<any, DvCompBrg, { rejectValue: ErrorResponse }>(
    'dvcompbrg/testDvCompBrg',
    async (dvcompbrg, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompbrg)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvcompbrg';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvCompBrgColumnsAsync = createAsyncThunk<any, { projectshortname: string }, { rejectValue: ErrorResponse }>(
    'dvcompbrg/getAllDvCompBrgColumns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg/columns`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompbrg columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getTableColumnsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'dvcompbrg/getTableColumns',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompbrg/get-columns`, {
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
import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompFt} from '@/types/userfeat';
import { setDvCompFt } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompFtsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompft/getAllDvCompFt',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompft/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompFt(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompFtAsync = createAsyncThunk<any, DvCompFt, { rejectValue: ErrorResponse }>(
    'dvcompft/createDvCompFt',
    async (rdvcompft, { rejectWithValue, getState, dispatch }) => {
        try {
            // console.log("rdvcompft",rdvcompft)
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompft/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompft)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompFtsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompFtAsync = createAsyncThunk<any, { rdvid: number; rdvcompftData: Partial<DvCompFt> }, { rejectValue: ErrorResponse }>(
    'dvcompft/updateDvCompDh',
    async ({ rdvid, rdvcompftData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompft/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompftData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompFtsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rdvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompFtAsync = createAsyncThunk<any, DvCompFt, { rejectValue: ErrorResponse }>(
    'dvcompft/testDvCompDh',
    async (rdvcompft, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompft/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompft)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 

export const getTableColumnsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'dvcompft/getTableColumns',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompft/get-columns`, {
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
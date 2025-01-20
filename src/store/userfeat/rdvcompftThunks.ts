import { createAsyncThunk } from '@reduxjs/toolkit';
import { RdvCompFt} from '@/types/userfeat';
import { setRdvCompFt } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRdvCompFtsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rdvcompft/getAllRdvCompFt',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompft/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRdvCompFt(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRdvCompFtAsync = createAsyncThunk<any, RdvCompFt, { rejectValue: ErrorResponse }>(
    'rdvcompft/createRdvCompFt',
    async (rdvcompft, { rejectWithValue, getState, dispatch }) => {
        try {
            // console.log("rdvcompft",rdvcompft)
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompft/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompft)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompFtsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rdvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRdvCompFtAsync = createAsyncThunk<any, { rdvid: number; rdvcompftData: Partial<RdvCompDh> }, { rejectValue: ErrorResponse }>(
    'rdvcompft/updateRdvCompDh',
    async ({ rdvid, rdvcompftData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompft/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompftData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompFtsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rdvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRdvCompFtAsync = createAsyncThunk<any, RdvCompFt, { rejectValue: ErrorResponse }>(
    'rdvcompft/testRdvCompDh',
    async (rdvcompft, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompft/test`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rdvcompft';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 

export const getTableColumnsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'rdvcompft/getTableColumns',
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
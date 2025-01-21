import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompDd } from '@/types/userfeat';
import { setDvCompDd } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompDdsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompdd/getAllDvCompDd',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompdd/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompDd(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompDdAsync = createAsyncThunk<any, DvCompDd, { rejectValue: ErrorResponse }>(
    'dvcompdd/createDvCompDd',
    async (rdvcompdd, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompdd/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdd)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompDdsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompDdAsync = createAsyncThunk<any, { rdvid: number; rdvcompddData: Partial<DvCompDd> }, { rejectValue: ErrorResponse }>(
    'rdvcompdd/updateRdvCompDd',
    async ({ rdvid, rdvcompddData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompdd/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompddData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompDdsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompDdAsync = createAsyncThunk<any, DvCompDd, { rejectValue: ErrorResponse }>(
    'dvcompdd/testDvCompDd',
    async (rdvcompdd, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompdd/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdd)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rdvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvCompDdColumnsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompdd/getAllDvCompDdColumns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompdd/columns`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvcompdd columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getTableColumnsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'dvcompdd/getTableColumns',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompdd/get-columns`, {
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
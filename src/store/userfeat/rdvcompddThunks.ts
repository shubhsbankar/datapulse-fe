import { createAsyncThunk } from '@reduxjs/toolkit';
import { RdvCompDd } from '@/types/userfeat';
import { setRdvCompDd } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRdvCompDdsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rdvcompdd/getAllRdvCompDd',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdd/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRdvCompDd(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRdvCompDdAsync = createAsyncThunk<any, RdvCompDd, { rejectValue: ErrorResponse }>(
    'rdvcompdd/createRdvCompDd',
    async (rdvcompdd, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdd/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdd)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompDdsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rdvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRdvCompDdAsync = createAsyncThunk<any, { rdvid: number; rdvcompddData: Partial<RdvCompDd> }, { rejectValue: ErrorResponse }>(
    'rdvcompdd/updateRdvCompDd',
    async ({ rdvid, rdvcompddData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdd/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompddData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompDdsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rdvcompdd';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRdvCompDdAsync = createAsyncThunk<any, RdvCompDd, { rejectValue: ErrorResponse }>(
    'rdvcompdd/testRdvCompDd',
    async (rdvcompdd, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdd/test`, {
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

export const getAllRdvCompDdColumnsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rdvcompdd/getAllRdvCompDdColumns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdd/columns`, {
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
    'rdvcompdd/getTableColumns',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdd/get-columns`, {
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
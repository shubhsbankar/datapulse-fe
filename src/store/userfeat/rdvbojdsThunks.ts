import { createAsyncThunk } from '@reduxjs/toolkit';
import { RdvBojDs } from '@/types/userfeat';
import { setRdvBojDs } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRdvBojDsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rdvbojds/getAllRdvBojDs',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvbojds/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRdvBojDs(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvbojds';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRdvBojDsAsync = createAsyncThunk<any, RdvBojDs, { rejectValue: ErrorResponse }>(
    'rdvbojds/createRdvBojDs',
    async (rdvbojds, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvbojds/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvbojds)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvBojDsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rdvbojds';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRdvBojDsAsync = createAsyncThunk<any, { rdvid: number; rdvbojdsData: Partial<RdvBojDs> }, { rejectValue: ErrorResponse }>(
    'rdvbojds/updateRdvBojDs',
    async ({ rdvid, rdvbojdsData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvbojds/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvbojdsData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvBojDsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rdvbojds';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRdvBojDsAsync = createAsyncThunk<any, RdvBojDs, { rejectValue: ErrorResponse }>(
    'rdvbojds/testRdvBojDs',
    async (rdvbojds, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvbojds/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvbojds)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rdvbojds';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 
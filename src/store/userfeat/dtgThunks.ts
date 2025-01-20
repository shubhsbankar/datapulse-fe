import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dtg } from '@/types/userfeat';
import { setDtg } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDtgsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dtg/getAllDtgs',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dtg/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDtg(jsonResponse.data));
                console.log(jsonResponse.data);
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dtgs';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDtgAsync = createAsyncThunk<any, Dtg, { rejectValue: ErrorResponse }>(
    'dtg/createDtg',
    async (dtg, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dtg/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dtg)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDtgsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dtg';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDtgAsync = createAsyncThunk<any, { dtid: number; dtgData: Partial<Dtg> }, { rejectValue: ErrorResponse }>(
    'dtg/updateDtg',
    async ({ dtid, dtgData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dtg/update/${dtid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dtgData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDtgsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dtg';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDtgAsync = createAsyncThunk<any, Dtg, { rejectValue: ErrorResponse }>(
    'dtg/testDtg',
    async (dtg, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dtg/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dtg)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dtg';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 
import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompSg1b } from '@/types/userfeat';
import { setDvCompsg1b } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompSg1bsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompsg1/getAllDvCompSg1bs',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1b/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            console.log(jsonResponse);
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompsg1b(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompsg1s';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompSg1bAsync = createAsyncThunk<any, DvCompSg1b, { rejectValue: ErrorResponse }>(
    'dvcompsg1/createDvCompSg1b',
    async (dvcompsg1, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1b/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg1)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompSg1bsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompSg1bAsync = createAsyncThunk<any, { rdvid: number; dvcompsg1Data: Partial<DvCompSg1b> }, { rejectValue: ErrorResponse }>(
    'dvcompsg1/updateDvCompSg1b',
    async ({ rdvid, dvcompsg1Data }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1b/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg1Data)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompSg1bsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcompsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompSg1bAsync = createAsyncThunk<any, DvCompSg1b, { rejectValue: ErrorResponse }>(
    'dvcompsg1/testDvCompSg1b',
    async (dvcompsg1, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1b/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg1)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvcompsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvCompSg1bColumnsAsync = createAsyncThunk<any, { projectshortname: string }, { rejectValue: ErrorResponse }>(
    'dvcompsg1/getAllDvCompSg1bColumns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1b/columns`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompsg1 columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);
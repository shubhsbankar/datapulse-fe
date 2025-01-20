import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompSg1 } from '@/types/userfeat';
import { setDvCompsg1 } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompSg1sAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompsg1/getAllDvCompSg1s',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompsg1(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompsg1s';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompSg1Async = createAsyncThunk<any, DvCompSg1, { rejectValue: ErrorResponse }>(
    'dvcompsg1/createDvCompSg1',
    async (dvcompsg1, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg1)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompSg1sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompSg1Async = createAsyncThunk<any, { rdvid: number; dvcompsg1Data: Partial<DvCompSg1> }, { rejectValue: ErrorResponse }>(
    'dvcompsg1/updateDvCompSg1',
    async ({ rdvid, dvcompsg1Data }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg1Data)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompSg1sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcompsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompSg1Async = createAsyncThunk<any, DvCompSg1, { rejectValue: ErrorResponse }>(
    'dvcompsg1/testDvCompSg1',
    async (dvcompsg1, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1/test`, {
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

export const getAllDvCompSg1ColumnsAsync = createAsyncThunk<any, { projectshortname: string }, { rejectValue: ErrorResponse }>(
    'dvcompsg1/getAllDvCompSg1Columns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg1/columns`, {
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
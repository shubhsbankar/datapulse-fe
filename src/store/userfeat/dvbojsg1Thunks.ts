import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvBojSg1 } from '@/types/userfeat';
import { setDvBojSg1 } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvBojSg1sAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvbojsg1/getAllDvBojSg1s',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvbojsg1/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvBojSg1(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvbojsg1s';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvBojSg1Async = createAsyncThunk<any, DvBojSg1, { rejectValue: ErrorResponse }>(
    'dvbojsg1/createDvBojSg1',
    async (dvbojsg1, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvbojsg1/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvbojsg1)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvBojSg1sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvbojsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvBojSg1Async = createAsyncThunk<any, { rdvid: number; dvbojsg1Data: Partial<DvBojSg1> }, { rejectValue: ErrorResponse }>(
    'dvbojsg1/updateDvBojSg1',
    async ({ rdvid, dvbojsg1Data }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvbojsg1/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvbojsg1Data)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvBojSg1sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvbojsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvBojSg1Async = createAsyncThunk<any, DvBojSg1, { rejectValue: ErrorResponse }>(
    'dvbojsg1/testDvBojSg1',
    async (dvbojsg1, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvbojsg1/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvbojsg1)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvbojsg1';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvBojSg1ColumnsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvbojsg1/getAllDvBojSg1Columns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvbojsg1/columns`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvbojsg1 columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);
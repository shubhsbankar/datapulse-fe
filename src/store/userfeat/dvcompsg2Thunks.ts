import { createAsyncThunk } from '@reduxjs/toolkit';
import { DvCompSg2 } from '@/types/userfeat';
import { setDvCompsg1b, setDvCompsg2 } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDvCompSg2sAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcompsg2/getAllDvCompSg2s',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg2/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            console.log(jsonResponse);
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvCompsg2(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompsg1s';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompSg2Async = createAsyncThunk<any, DvCompSg2, { rejectValue: ErrorResponse }>(
    'dvcompsg2/createDvCompSg2',
    async (dvcompsg2, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg2/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg2)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompSg2sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcompsg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompSg2Async = createAsyncThunk<any, { rdvid: number; dvcompsg2Data: Partial<DvCompSg2> }, { rejectValue: ErrorResponse }>(
    'dvcompsg2/updateDvCompSg2',
    async ({ rdvid, dvcompsg2Data }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg2/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg2Data)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompSg2sAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcompsg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testDvCompSg2Async = createAsyncThunk<any, DvCompSg2, { rejectValue: ErrorResponse }>(
    'dvcompsg2/testDvCompSg2',
    async (dvcompsg2, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg2/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompsg2)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvcompsg2';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvCompSg2ColumnsAsync = createAsyncThunk<any, { projectshortname: string }, { rejectValue: ErrorResponse }>(
    'dvcompsg2/getAllDvCompSg2Columns',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcompsg2/columns`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcompsg2 columns';
            return rejectWithValue({ message: errorMessage });
        }
    }
);
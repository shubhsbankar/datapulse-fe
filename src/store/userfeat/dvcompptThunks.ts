import { DvCompPt } from '@/types/userfeat';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setDvComppt } from './userfeatSlice';

export const testDvCompPtAsync = createAsyncThunk<any, DvCompPt, { rejectValue: ErrorResponse }>(
    'dvcomppt/testDvCompPt',
    async (dvcomppt, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcomppt/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcomppt)
            });
            console.log("token :" ,state.auth.token);
            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dvcomppt';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const getAllDvCompPtsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dvcomppt/getAllDvCompPts',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcomppt/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            console.log("This is testing jsonResponse",jsonResponse);
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDvComppt(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dvcomppts';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createDvCompPtAsync = createAsyncThunk<any, DvCompPt, { rejectValue: ErrorResponse }>(
    'dvcomppt/createDvCompPt',
    async (dvcomppt, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcomppt/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcomppt)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompPtsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dvcomppt';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateDvCompPtAsync = createAsyncThunk<any, { dvid: number; dvcompptData: Partial<DvCompPt> }, { rejectValue: ErrorResponse }>(
    'dvcomppt/updateDvCompPt',
    async ({ dvid, dvcompptData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dvcomppt/update/${dvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dvcompptData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDvCompPtsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dvcomppt';
            return rejectWithValue({ message: errorMessage });
        }
    }
);
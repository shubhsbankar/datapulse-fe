import { createAsyncThunk } from '@reduxjs/toolkit';
import { RdvCompDl } from '@/types/userfeat';
import { setRdvCompDl } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRdvCompDlAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rdvcompdl/getAllRdvCompDl',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdl/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRdvCompDl(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvcompdl';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRdvCompDlAsync = createAsyncThunk<any, RdvCompDl, { rejectValue: ErrorResponse }>(
    'rdvcompdl/createRdvCompDl',
    async (rdvcompdl, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdl/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdl)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompDlAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rdvcompdl';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRdvCompDlAsync = createAsyncThunk<any, { rdvid: number; rdvcompdlData: Partial<RdvCompDl> }, { rejectValue: ErrorResponse }>(
    'rdvcompdl/updateRdvCompDl',
    async ({ rdvid, rdvcompdlData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdl/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdlData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompDlAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rdvcompdl';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRdvCompDlAsync = createAsyncThunk<any, RdvCompDl, { rejectValue: ErrorResponse }>(
    'rdvcompdl/testRdvCompDl',
    async (rdvcompdl, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdl/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdl)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rdvcompdl';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 

export const getDgenidsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'rdvcompdl/getDgenids',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdl/get-dgenids`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to get dgenids';
            return rejectWithValue({ message: errorMessage });
        }
    }
);


export const getBkfieldsAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'rdvcompdl/getBkfields',
    async (data, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompdl/get-bkfields`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to get bkfields';
            return rejectWithValue({ message: errorMessage });
        }
    }
);
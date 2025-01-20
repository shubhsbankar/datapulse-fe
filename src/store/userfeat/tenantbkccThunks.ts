import { createAsyncThunk } from '@reduxjs/toolkit';
import { TenantBkcc } from '@/types/userfeat';
import { setTenantBkcc } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllTenantBkccAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'tenantbkcc/getAllTenantBkcc',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/tenantbkcc/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setTenantBkcc(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tenantbkcc';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createTenantBkccAsync = createAsyncThunk<any, TenantBkcc, { rejectValue: ErrorResponse }>(
    'tenantbkcc/createTenantBkcc',
    async (tenantbkcc, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/tenantbkcc/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(tenantbkcc)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllTenantBkccAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create tenantbkcc';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateTenantBkccAsync = createAsyncThunk<
    any, 
    { 
        tenantid: string; 
        bkcarea: string; 
        hubname: string; 
        tenantbkccData: Partial<TenantBkcc> 
    }, 
    { rejectValue: ErrorResponse }
>(
    'tenantbkcc/updateTenantBkcc',
    async ({ tenantid, bkcarea, hubname, tenantbkccData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/tenantbkcc/update/${tenantid}/${bkcarea}/${hubname}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(tenantbkccData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllTenantBkccAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update tenantbkcc';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testTenantBkccAsync = createAsyncThunk<any, TenantBkcc, { rejectValue: ErrorResponse }>(
    'tenantbkcc/testTenantBkcc',
    async (tenantbkcc, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/tenantbkcc/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(tenantbkcc)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test tenantbkcc';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 
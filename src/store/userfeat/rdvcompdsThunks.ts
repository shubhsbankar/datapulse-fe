import { createAsyncThunk } from '@reduxjs/toolkit';
import { RdvCompDs } from '@/types/userfeat';
import { setRdvCompDs } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRdvCompDsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rdvcompds/getAllRdvCompDs',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompds/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRdvCompDs(jsonResponse.data));
                console.log(jsonResponse.data);
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rdvcompds';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRdvCompDsAsync = createAsyncThunk<any, RdvCompDs, { rejectValue: ErrorResponse }>(
    'rdvcompds/createRdvCompDs',
    async (rdvcompds, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompds/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompds)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompDsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rdvcompds';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRdvCompDsAsync = createAsyncThunk<any, { rdvid: number; rdvcompdsData: Partial<RdvCompDs> }, { rejectValue: ErrorResponse }>(
    'rdvcompds/updateRdvCompDs',
    async ({ rdvid, rdvcompdsData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompds/update/${rdvid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompdsData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRdvCompDsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rdvcompds';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRdvCompDsAsync = createAsyncThunk<any, RdvCompDs, { rejectValue: ErrorResponse }>(
    'rdvcompds/testRdvCompDs',
    async (rdvcompds, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rdvcompds/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rdvcompds)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rdvcompds';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 

type GetColumnsPayload = {
    project: string;
    dataproduct: string;
    dataset: string;
    componentType: string;
};

export const getTableColumnsAsync = createAsyncThunk<any, GetColumnsPayload, { rejectValue: ErrorResponse }>(
  'rs/getTableColumns',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/rdvcompds/get-columns`, {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch columns';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

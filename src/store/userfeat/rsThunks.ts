import { createAsyncThunk } from '@reduxjs/toolkit';
import { Rs } from '@/types/userfeat';
import { setRs } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rs/getAllRs',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rs/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRs(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rs';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRsAsync = createAsyncThunk<any, Rs, { rejectValue: ErrorResponse }>(
    'rs/createRs',
    async (rs, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rs/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rs)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rs';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRsAsync = createAsyncThunk<any, { id: number; rsData: Partial<Rs> }, { rejectValue: ErrorResponse }>(
    'rs/updateRs',
    async ({ id, rsData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rs/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rsData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rs';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRsAsync = createAsyncThunk<any, Rs, { rejectValue: ErrorResponse }>(
    'rs/testRs',
    async (rs, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rs/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rs)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rs';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

interface GetColumnsPayload {
  tablename: string;
  datastore: string;
  dataset: string;
  project: string;
  dataproduct: string;
}

export const getTableColumnsAsync = createAsyncThunk<any, GetColumnsPayload, { rejectValue: ErrorResponse }>(
  'rs/getTableColumns',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/rs/get-columns`, {
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

interface GetTablesPayload {
  datasetname: string;
}

interface GetBkeysPayload {
  tablename: string;
}

// Add these new thunks
export const getTableNamesAsync = createAsyncThunk<any, GetTablesPayload, { rejectValue: ErrorResponse }>(
  'rs/getTableNames',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/rs/get-tables`, {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tables';
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const getBkeysAsync = createAsyncThunk<any, GetBkeysPayload, { rejectValue: ErrorResponse }>(
  'rs/getBkeys',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/rs/get-bkeys`, {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bkeys';
      return rejectWithValue({ message: errorMessage });
    }
  }
);
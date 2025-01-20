import { createAsyncThunk } from '@reduxjs/toolkit';
import { Rt } from '@/types/userfeat';
import { setRt } from './userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllRtAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'rt/getAllRt',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rt/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setRt(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rt';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const createRtAsync = createAsyncThunk<any, Rt, { rejectValue: ErrorResponse }>(
    'rt/createRt',
    async (rt, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rt/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rt)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRtAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create rt';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const updateRtAsync = createAsyncThunk<any, { tgthashid: number; rtData: Partial<Rt> }, { rejectValue: ErrorResponse }>(
    'rt/updateRt',
    async ({ tgthashid, rtData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rt/update/${tgthashid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rtData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllRtAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update rt';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

export const testRtAsync = createAsyncThunk<any, Rt, { rejectValue: ErrorResponse }>(
    'rt/testRt',
    async (rt, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/rt/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(rt)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test rt';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 

interface GetColumnsPayload {
    tablename: string;
}

export const getTableColumnsAsync = createAsyncThunk<any, GetColumnsPayload, { rejectValue: ErrorResponse }>(
    'rt/getTableColumns',
    async (payload, { rejectWithValue, getState }) => {
      try {
        const state = getState() as RootState;
        const response = await fetch(`${backendLink}/rt/get-columns`, {
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
    'rt/getTableNames',
    async (payload, { rejectWithValue, getState }) => {
      try {
        const state = getState() as RootState;
        const response = await fetch(`${backendLink}/rt/get-tables`, {
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
  
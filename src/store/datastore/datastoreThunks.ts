import { createAsyncThunk } from '@reduxjs/toolkit';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { Datastore, DatastoreBase } from '@/types/datastore';
import { isSuccessful } from '@/utils/helpers';
import { setDatastores } from './datastoreSlice';

export const getAllDatastoresAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
  'datastore/getAllDatastores',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/datastore/all`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        dispatch(setDatastores(jsonResponse.data));
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to fetch datastores' });
    }
  }
);

export const createDatastoreAsync = createAsyncThunk<any, DatastoreBase, { rejectValue: ErrorResponse }>(
  'datastore/create',
  async (datastoreData, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/datastore/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(datastoreData)
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        dispatch(getAllDatastoresAsync());
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to create datastore' });
    }
  }
);

export const updateDatastoreAsync = createAsyncThunk<any, { dsid: number; datastoreData: Datastore }, { rejectValue: ErrorResponse }>(
  'datastore/update',
  async ({ dsid, datastoreData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/datastore/update/${dsid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(datastoreData)
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        dispatch(getAllDatastoresAsync());
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to update datastore' });
    }
  }
);

export const testDatastoreConnectionAsync = createAsyncThunk<any, DatastoreBase, { rejectValue: ErrorResponse }>(
  'datastore/testConnection',
  async (datastoreData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/datastore/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(datastoreData)
      });

      const jsonResponse = await response.json();
      if (isSuccessful(jsonResponse.status)) {
        return jsonResponse;
      }
      return rejectWithValue(jsonResponse as ErrorResponse);
    } catch (error) {
      console.error(error);
      return rejectWithValue({ message: 'Failed to test connection' });
    }
  }
); 
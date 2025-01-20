import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dataset, DatasetBase } from '@/types/userfeat';
import { setDatasets } from '../userfeat/userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllDatasetsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'dataset/getAllDatasets',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dataset/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setDatasets(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch datasets';
            return rejectWithValue({ message: errorMessage });
        } finally {
        }
    }
);

export const createDatasetAsync = createAsyncThunk<any, DatasetBase, { rejectValue: ErrorResponse }>(
    'dataset/createDataset',
    async (dataset, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dataset/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dataset)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDatasetsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dataset';
            return rejectWithValue({ message: errorMessage });
        } finally {
        }
    }
);

export const updateDatasetAsync = createAsyncThunk<any, { dsid: number; datasetData: Partial<Dataset> }, { rejectValue: ErrorResponse }>(
    'dataset/updateDataset',
    async ({ dsid, datasetData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dataset/update/${dsid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(datasetData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllDatasetsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dataset';
            return rejectWithValue({ message: errorMessage });
        } finally {
        }
    }
);

export const testDatasetAsync = createAsyncThunk<any, DatasetBase, { rejectValue: ErrorResponse }>(
    'dataset/testDataset',
    async (dataset, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dataset/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dataset)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to test dataset';
            return rejectWithValue({ message: errorMessage });
        }
    }
);


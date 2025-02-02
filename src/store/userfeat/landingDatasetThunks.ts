import { createAsyncThunk } from '@reduxjs/toolkit';
import { LandingDataset } from '@/types/userfeat';
import { setLndDataset } from '../userfeat/userfeatSlice';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

export const getAllLandingDatasetsAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'lnddataset/getAllLandingDatasets',
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/landingdataset/all`, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setLndDataset(jsonResponse.data));
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lnddatasets';
            return rejectWithValue({ message: errorMessage });
        } finally {
        }
    }
);

export const createLandingDatasetAsync = createAsyncThunk<any, LandingDataset, { rejectValue: ErrorResponse }>(
    'lnddataset/createLandingDataset',
    async (dataset, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/landingdataset/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(dataset)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllLandingDatasetsAsync());
                return jsonResponse;
            }
            return rejectWithValue(jsonResponse as ErrorResponse);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create landing dataset';
            return rejectWithValue({ message: errorMessage });
        } finally {
        }
    }
);

export const updateLandingDatasetAsync = createAsyncThunk<any, { dsid: number; datasetData: Partial<LandingDataset> }, { rejectValue: ErrorResponse }>(
    'lnddataset/updateLandingDataset',
    async ({ dsid, datasetData }, { rejectWithValue, getState, dispatch }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/landingdataset/update/${dsid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify(datasetData)
            });

            const jsonResponse = await response.json();
            if (isSuccessful(jsonResponse.status)) {
                dispatch(getAllLandingDatasetsAsync());
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

export const testLandingDatasetAsync = createAsyncThunk<any, LandingDataset, { rejectValue: ErrorResponse }>(
    'lnddataset/testLandingDataset',
    async (dataset, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/landingdataset/test`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to test landing dataset';
            return rejectWithValue({ message: errorMessage });
        }
    }
);

 
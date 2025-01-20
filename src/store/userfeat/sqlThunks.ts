import { createAsyncThunk } from '@reduxjs/toolkit';
import { backendLink } from '@/utils/links';
import { RootState } from '../store';
import { ErrorResponse } from '@/types/response';
import { isSuccessful } from '@/utils/helpers';

interface SqlExecutePayload {
    projectshortname: string;
    dataproductshortname: string;
    datasetshortname: string;
    testcoverageversion: string;
    sqlQuery: string;
    executiondate: string;
}

export const executeSqlAsync = createAsyncThunk<any, SqlExecutePayload, { rejectValue: ErrorResponse }>(
    'sql/executeSql',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const response = await fetch(`${backendLink}/dtg/sql/execute`, {
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
            const errorMessage = error instanceof Error ? error.message : 'Failed to execute SQL';
            return rejectWithValue({ message: errorMessage });
        }
    }
); 
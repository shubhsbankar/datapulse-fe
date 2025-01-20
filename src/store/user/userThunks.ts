import { backendLink } from '@/utils/links'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { ResponseLogger } from '@/data/constants'
import { RootState } from '../store'
import { ErrorResponse } from '@/types/response'
import { isSuccessful } from '@/utils/helpers'
import { setGroupUsers, setUserHistory } from './userSlice'
import { LDAPConfig } from '@/types/ldap'
import { User, UserBase } from '@/types/user'

export const getUserAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'user/getUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const url = `${backendLink}/user/get/user`
            const state = getState() as RootState

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            })

            const jsonResponse = await response.json()
            ResponseLogger('Get User Thunk Response.', jsonResponse)
            return jsonResponse
        } catch (error) {
            console.log(error)
            return rejectWithValue({ message: 'An error occurred while fetching user data.' })
        }
    }
)

export const getAllUsersAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
    'user/getAllUsers',
    async (_, { rejectWithValue, getState, dispatch }) => {
      try {
            const url = `${backendLink}/user/get/all`
            const state = getState() as RootState
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`
                }
            })

            const jsonResponse = await response.json()
            ResponseLogger('Get All Users Thunk Response.', jsonResponse)
            if (isSuccessful(jsonResponse.status)) {
                dispatch(setGroupUsers(jsonResponse.data))
                console.log(jsonResponse)
                return jsonResponse
            } else {
                return rejectWithValue(jsonResponse as ErrorResponse)
            }
        } catch (error) {
            console.log(error)
            return rejectWithValue({ message: 'An error occurred while fetching all users.' })
        }
    }
)


export const updateUserAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
    'user/updateUser',
    async (user, { rejectWithValue, getState }) => {
        try {
            const url = `${backendLink}/user/update`
            const state = getState() as RootState
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${state.auth.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })

            const jsonResponse = await response.json()
            ResponseLogger('Update User Thunk Response.', jsonResponse)
            if (isSuccessful(jsonResponse.status)) {
                return jsonResponse
            } else {
                return rejectWithValue(jsonResponse as ErrorResponse)
            }
        } catch (error) {
            console.log(error)
            return rejectWithValue({ message: 'An error occurred while updating user data.' })
        }
    }
)

export const pullLDAPUsersAsync = createAsyncThunk<any, LDAPConfig>(
  'user/pullLDAPUsers',
  async (config, { rejectWithValue }) => {
    try {
      const response = await fetch(`${backendLink}/user/ldap/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (response.ok) {
        return data;
      }
      return rejectWithValue(data);
    } catch (error) {
      console.log(error)
      return rejectWithValue({ message: 'Failed to pull LDAP users' });
    }
  }
);

export const createBulkUsersAsync = createAsyncThunk<any, UserBase[]>(
  'user/createBulk',
  async (users, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/user/create_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(users),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(getAllUsersAsync())
        return data;
      }
      return rejectWithValue(data);
    } catch (error) {
      console.log(error)
      return rejectWithValue({ message: 'Failed to create users' });
    }
  }
);

export const updateBulkUsersAsync = createAsyncThunk<any, User[]>(
  'user/updateBulk',
  async (users, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/user/update_bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: JSON.stringify(users),
      });

      const data = await response.json();
      if ('status' in data && isSuccessful(data.status)) {
        dispatch(getAllUsersAsync())
        return data;
      } else {
        return rejectWithValue(data);
      }
    } catch (error) {
      console.log(error);
      return rejectWithValue({ message: 'Failed to update users' });
    }
  }
);

export const getUsersHistoryAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>(
  'user/getUsersHistory',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const response = await fetch(`${backendLink}/user/get/all/history`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        }
      });

      const jsonResponse = await response.json();
      ResponseLogger('Get User History Thunk Response.', jsonResponse);
      if (isSuccessful(jsonResponse.status)) {
        dispatch(setUserHistory(jsonResponse.data));
        return jsonResponse;
      } else {
        return rejectWithValue(jsonResponse as ErrorResponse);
      }
    } catch (error) {
      console.log(error);
      return rejectWithValue({ message: 'An error occurred while fetching user history.' });
    }
  }
);


export const uploadCSVAsync = createAsyncThunk<any, any, { rejectValue: ErrorResponse }>(
  'user/uploadCSV',
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('tablename', data.tablename);
      formData.append('project_shortname', data.project_shortname);
      const response = await fetch(`${backendLink}/user/upload_csv/${data.tablename}?project_shortname=${data.project_shortname}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`
        },
        body: formData
      });

      const jsonResponse = await response.json();
      ResponseLogger('Upload CSV Thunk Response.', jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.log(error);
      return rejectWithValue({ message: 'Failed to upload CSV' });
    }
  }
);
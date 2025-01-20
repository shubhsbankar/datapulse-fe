import { backendLink } from "@/utils/links";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setIsLoading, setToken } from "./authSlice";
import { getUserAsync as getUser, getAllUsersAsync } from "../user/userThunks";
import { ResponseLogger } from "@/data/constants";
import { RootState } from "../store";
import { LoginDto, SignupDto } from "@/types/dtos/user";
import { ErrorResponse } from "@/types/response";
import { isSuccessful } from "@/utils/helpers";
import { setUser } from "../user/userSlice";
import {
  getAllProjectAssignmentsAsync,
  getAllProjectsAsync,
} from "../project/projectThunk";
import { getAllDatastoresAsync } from "../datastore/datastoreThunks";
import { getAllDatasetsAsync } from "../userfeat/datasetThunks";
import { getAllDpingsAsync } from "../userfeat/dpingThunks";
import { getAllRtAsync } from "../userfeat/rtThunks";
import { getAllDtgsAsync } from "../userfeat/dtgThunks";
import { getAllRdvBojDsAsync } from "../userfeat/rdvbojdsThunks";
import { getAllStrAsync } from "../userfeat/strThunks";
import { getAllTenantBkccAsync } from "../userfeat/tenantbkccThunks";
import { getAllDvBojSg1sAsync } from "../userfeat/dvbojsg1Thunks";
import { getAllDvCompSg1sAsync } from "../userfeat/dvcompsg1Thunks";
import { getAllRsAsync } from "../userfeat/rsThunks";
import { getAllRdvCompDhAsync } from "../userfeat/rdvcompdhThunks";
import { getAllRdvCompDlAsync } from "../userfeat/rdvcompdlThunks";
import { getAllRdvCompDsAsync } from "../userfeat/rdvcompdsThunks";

export const loginAsync = createAsyncThunk<
  any,
  LoginDto,
  { rejectValue: ErrorResponse }
>(
  "auth/login",
  async ({ useremail, password }, { rejectWithValue, dispatch }) => {
    try {
      const url = `${backendLink}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ useremail, password }),
      });

      const jsonResponse = await response.json();
      ResponseLogger("Login Thunk Response.", jsonResponse);

      if ("status" in jsonResponse && isSuccessful(jsonResponse.status)) {
        dispatch(setToken(jsonResponse.token));
        dispatch(setIsLoading(true));
        dispatch(setUser(jsonResponse.data));
        const fetchData = async () => {
          return Promise.all(
            [
              dispatch(getAllProjectsAsync()),
              dispatch(getAllProjectAssignmentsAsync()),
              dispatch(getAllDatastoresAsync()),
            ].concat(
              jsonResponse.data?.user_type == "user"
                ? [
                    dispatch(getAllDatasetsAsync()),
                    dispatch(getAllDpingsAsync()),
                    dispatch(getAllRsAsync()),
                    dispatch(getAllRtAsync()),
                    dispatch(getAllDtgsAsync()),
                    dispatch(getAllRdvBojDsAsync()),
                    dispatch(getAllStrAsync()),
                    dispatch(getAllTenantBkccAsync()),
                    dispatch(getAllRdvCompDhAsync()),
                    dispatch(getAllRdvCompDlAsync()),
                    dispatch(getAllRdvCompDsAsync()),
                    
                    dispatch(getAllDvBojSg1sAsync()),
                    dispatch(getAllDvCompSg1sAsync()),
                  ]
                : [dispatch(getAllUsersAsync())]
            )
          ).then(() => {
            dispatch(setIsLoading(false));
          });
        };

        try {
          await fetchData();
          return jsonResponse;
        } catch (error) {
          console.error("Error fetching user data:", error);
          return rejectWithValue({
            message: "Failed to fetch user data after login.",
          });
        }
      } else {
        return rejectWithValue(jsonResponse as ErrorResponse);
      }
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue({
        message: "An error occurred while logging in.",
      });
    }
  }
);

export const registerAsync = createAsyncThunk<
  any,
  SignupDto,
  { rejectValue: ErrorResponse }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const url = `${backendLink}/auth/signup`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const jsonResponse = await response.json();
    if ("status" in jsonResponse && isSuccessful(jsonResponse.status)) {
      return jsonResponse;
    } else {
      return rejectWithValue(jsonResponse as ErrorResponse);
    }
  } catch (error) {
    return rejectWithValue({
      message: "An error occurred during registration.",
    });
  }
});

export const getAllDataAsync = createAsyncThunk<any, void, { rejectValue: ErrorResponse }>("auth/getAllData", async (_, { rejectWithValue,getState, dispatch }) => {
  try {
    const state = getState() as RootState
    const fetchData = async () => {
      return Promise.all(
        [
          dispatch(getAllProjectsAsync()),
          dispatch(getAllProjectAssignmentsAsync()),
          dispatch(getAllDatastoresAsync()),
        ].concat(
          state.user.currentUser?.user_type == "user"
            ? [
                dispatch(getAllDatasetsAsync()),
                dispatch(getAllDpingsAsync()),
                dispatch(getAllRsAsync()),
                dispatch(getAllRtAsync()),
                dispatch(getAllDtgsAsync()),
                dispatch(getAllRdvBojDsAsync()),
                dispatch(getAllStrAsync()),
                dispatch(getAllTenantBkccAsync()),
                dispatch(getAllRdvCompDhAsync()),
                dispatch(getAllRdvCompDlAsync()),
                dispatch(getAllRdvCompDsAsync()),
                
                dispatch(getAllDvBojSg1sAsync()),
                dispatch(getAllDvCompSg1sAsync()),
              ]
            : [dispatch(getAllUsersAsync())]
        )
      ).then(() => {
        dispatch(setIsLoading(false));
      });
    };
    await fetchData();
  } catch (error) {
    return rejectWithValue({
      message: "An error occurred while fetching all data.",
    });
  }
})

// export const verifyAuthAsync = createAsyncThunk<null>(
//     'auth/verifyAuth',
//     async (_, { rejectWithValue, dispatch, getState }) => {
//         try {
//             const url = `${backendLink}/auth/verify`
//             const state = getState() as RootState
//             if (!state.auth.token) {
//                 return
//             }
//             const response = await fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${state.auth.token}`
//                 }
//             })
// export const verifyAuthAsync = createAsyncThunk<null>(
//     'auth/verifyAuth',
//     async (_, { rejectWithValue, dispatch, getState }) => {
//         try {
//             const url = `${backendLink}/auth/verify`
//             const state = getState() as RootState
//             if (!state.auth.token) {
//                 return
//             }
//             const response = await fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${state.auth.token}`
//                 }
//             })

//             const jsonResponse = await response.json()
//             ResponseLogger('Verify Auth Thunk Response.', jsonResponse)
//             return jsonResponse
//         } catch (error) {
//             return rejectWithValue('An error occurred while verifying auth.')
//         }
//     }
// )

// export const verifyTokenAsync = createAsyncThunk<any, void, { rejectValue: string }>(
//     'auth/verifyToken',
//     async (_, { rejectWithValue }) => {
//         try {
//             const url = `${backendLink}/auth/verify`
//             const response = await fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${localStorage.getItem('token')}`
//                 }
//             })

//             const jsonResponse = await response.json()
//             ResponseLogger('Verify Token Thunk Response.', jsonResponse)

//             if (response.ok) {
//                 return jsonResponse
//             } else {
//                 return rejectWithValue(jsonResponse.message)
//             }
//         } catch (error) {
//             return rejectWithValue('An error occurred during token verification.')
//         }
//     }
// )

//             const jsonResponse = await response.json()
//             ResponseLogger('Verify Auth Thunk Response.', jsonResponse)
//             return jsonResponse
//         } catch (error) {
//             return rejectWithValue('An error occurred while verifying auth.')
//         }
//     }
// )

// export const verifyTokenAsync = createAsyncThunk<any, void, { rejectValue: string }>(
//     'auth/verifyToken',
//     async (_, { rejectWithValue }) => {
//         try {
//             const url = `${backendLink}/auth/verify`
//             const response = await fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${localStorage.getItem('token')}`
//                 }
//             })

//             const jsonResponse = await response.json()
//             ResponseLogger('Verify Token Thunk Response.', jsonResponse)

//             if (response.ok) {
//                 return jsonResponse
//             } else {
//                 return rejectWithValue(jsonResponse.message)
//             }
//         } catch (error) {
//             return rejectWithValue('An error occurred during token verification.')
//         }
//     }
// )

export const forgotPasswordAsync = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to process request");
    }

    return await response.json();
  }
);

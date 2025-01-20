import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducers from './auth/authSlice'
import userReducers from './user/userSlice'
import datastoreReducers from './datastore/datastoreSlice'
import projectReducers from './project/projectSlice'
import userfeatReducers from './userfeat/userfeatSlice'
import { enviournment } from '@/data/constants'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'user', 'project', 'datastore', 'userfeat'] // Only persist auth and user states
}

const reducer = combineReducers({
    auth: authReducers,
    user: userReducers,
    project: projectReducers,
    datastore: datastoreReducers,

    // user feat
    userfeat: userfeatReducers
})

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }),
    devTools: enviournment === 'DEVELOPMENT'
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

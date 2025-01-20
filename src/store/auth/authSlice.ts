import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
    token: '',
    loginTime: null as Date | null,
    isloading: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            state.token = ''
            state.loginTime = null
            localStorage.removeItem('token')
            state.isloading = false
        },
        setToken: (state, action: PayloadAction<string>) => {
            // Set token in localStorage
            localStorage.setItem('token', action.payload)
            // Set token in cookies
            document.cookie = `token=${action.payload}; path=/`
            state.token = action.payload
            state.loginTime = new Date()
        },
        setIsLoading: (state, action: PayloadAction<boolean>) => {
            state.isloading = action.payload
        }
    }
})

export default authSlice.reducer

export const { logout, setToken, setIsLoading } = authSlice.actions

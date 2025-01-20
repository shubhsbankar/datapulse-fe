import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types/user'

type UserState = {
    currentUser: User
    group_users: User[]
    users_history: User[]
}

const initialState: UserState = {
    currentUser: {
        useremail: '',
        password: '',
        first_name: '',
        last_name: '',
        user_type: '',
        who_added: '',
        createdate: ''
    },
    group_users: [],
    users_history: []
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload
        },
        setGroupUsers: (state, action: PayloadAction<User[]>) => {
            state.group_users = action.payload
        },
        resetUser: (state) => {
            return { ...initialState }
        },
        setUserHistory: (state, action: PayloadAction<User[]>) => {
            state.users_history = action.payload
        }
    }
})

export default userSlice.reducer

export const { setUser, setGroupUsers, resetUser, setUserHistory } = userSlice.actions
export interface UserBase {
    useremail: string;
    first_name: string;
    last_name?: string;
    password?: string;
}

export interface User extends UserBase {
    user_type: string
    who_added: string
    createdate: string
}


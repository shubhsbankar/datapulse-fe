export const isSuccessful = (status: number) => {
    if (!status || typeof status !== 'number' || status === null || status === undefined)
        return false
    return status >= 200 && status <= 299
}

export const isFailed = (status: number) => {
    return status >= 400 && status <= 499
}

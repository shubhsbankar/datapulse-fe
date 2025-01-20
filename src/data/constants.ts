export const enviournment = 'DEVELOPMENT'

export const isLoggerEnabled = true

export const ResponseLogger = (message: string, jsonResponse?: any) => {
    // if (enviournment === 'PRODUCTION') return
    if (isLoggerEnabled) {
        console.log('__________________________________________________________')
        console.log(message)
        console.log(jsonResponse)
    }
}


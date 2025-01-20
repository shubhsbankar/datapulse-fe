import { enviournment } from '@/data/constants'

export const backendLink = enviournment === 'DEVELOPMENT' ? 'http://127.0.0.1:8000' : ''
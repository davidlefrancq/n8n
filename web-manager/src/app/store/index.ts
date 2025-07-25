// store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import { notificationsReducer } from './notificationsReducer'
import { alertsReducer } from './alertsReducer'
import { jobsReducer } from './jobsReducer'
import { n8nReducer } from './n8nReducer'
import { menuReducer } from './menuReducer'
import { cvsReducer } from './cvsReducer'
import { healthReducer } from './healthReducer'
import { themeReducer } from './themeReducer'

export const store = configureStore({
  reducer: {
    alertsReducer,
    cvsReducer,
    healthReducer,
    jobsReducer,
    menuReducer,
    n8nReducer,
    notificationsReducer,
    themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

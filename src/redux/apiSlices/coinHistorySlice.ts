import { api } from '../api/baseApi'
import type { RevenueEvent } from '../../components/revenue/revenueData'

export type RevenueReportResponse = {
  success: boolean
  message: string
  data: {
    events: RevenueEvent[]
  }
}

const coinHistorySlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueReport: builder.query<RevenueReportResponse, void>({
      query: () => ({
        url: '/coin-history/revenue',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetRevenueReportQuery } = coinHistorySlice

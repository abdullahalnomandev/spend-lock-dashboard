import { api } from "../api/baseApi";
import { TagTypes } from "../tag-types";

export type User = {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  status: 'active' | 'delete';
  verified: boolean;
  image: string;
  enable_notification: boolean;
  plaid_access_token?: string;
  fcmToken?: string;
  authorization?: {
    oneTimeCode: string;
    expireAt: string;
  };
  preference?: {
    motivation: string;
    trigger: string;
    budget: number;
  };
  coinBalance: number;
  currentStreak: number;
  createdAt: string;
  updatedAt: string;
};

export type UsersListResponse = {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: User[];
};

export type RevenueGraphPoint = {
  month: string;
  revenue: string;
};

export type AdminDashboardOverview = {
  totalActiveUsers: number;
  totalRevenue: string;
  openTickets: number;
  revinewGraph: RevenueGraphPoint[];
};

export type AdminDashboardOverviewResponse = {
  success: boolean;
  message: string;
  data: AdminDashboardOverview;
};

const userSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => {
        return {
          url: "/user",
          params: { page, limit },
          method: "GET",
        };
      },
      providesTags: [TagTypes.user],
    }),
    changeStatusUser: builder.mutation({
      query: ({ id }: { id: string }) => {
        return {
          method: "PATCH",
          url: `/user/${id}`,
        };
      },
      invalidatesTags: [TagTypes.user],
    }),
    updateUser: builder.mutation<{ success: boolean; message: string; data: User }, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => {
        return {
          method: "PATCH",
          url: `/user/${id}`,
          body: data,
        };
      },
      invalidatesTags: [TagTypes.user],
    }),
    updateSingleUser: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => {
        return {
          method: "PATCH",
          url: `/user/single-user/${id}`,
          body: formData,
          formData: true,
        };
      },
    }),
    updatePendingUserProfile: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => {
        return {
          method: "PATCH",
          url: `/user/approve-pending-users/${id}`,
          body: status,
          formData: true,
        };
      },
    }),
    changePassword: builder.mutation({
      query: ({
        currentPassword,
        newPassword,
        confirmPassword,
      }: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      }) => {
        return {
          method: "POST",
          url: `/auth/change-password`,
          body: {
            currentPassword,
            newPassword,
            confirmPassword,
          },
          // no formData
        };
      },
    }),

    getHosts: builder.query({
      query: ({ query }: { query?: string }) => {
        return {
          url: "/user/host?" + query,
        };
      },
    }),
    getStatistics: builder.query({
      query: () => {
        return {
          url: "/user/statistics",
          method: "GET",
        };
      },
    }),

    getUserStatistics: builder.query({
      query: ({ year }: { year?: string }) => {
        return {
          url: "/user/statistics?year=" + year,
          method: "GET",
        };
      },
    }),

    sendPushNotification: builder.mutation({
      query: ({ usersId = [], message }: {
        usersId?: string[],
        message: string
      }) => ({
        url: '/user/push-notification',
        method: 'POST',
        body: { usersId, message }
      })
    }),
    getALlPartnerUsers: builder.query({
      query: ({ query }: { query?: Record<string, any> }) => {
        return {
          url: "/user/all-partner-users",
          params: query || {},
          method: "GET",
        };
      },

    }),
    getAdminDashboardOverview: builder.query<AdminDashboardOverviewResponse, void>({
      query: () => ({
        url: "/user/overview/dashboard",
        method: "GET",
      }),
    }),
  }),
});
export const { useGetUsersQuery, useChangeStatusUserMutation, useGetHostsQuery, useGetStatisticsQuery, useGetUserStatisticsQuery, useUpdateUserMutation, useChangePasswordMutation, useUpdateSingleUserMutation, useSendPushNotificationMutation, useUpdatePendingUserProfileMutation, useGetALlPartnerUsersQuery, useGetAdminDashboardOverviewQuery } = userSlice;
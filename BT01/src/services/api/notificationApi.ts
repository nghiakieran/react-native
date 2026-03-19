import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config";
import { RootState } from "../../redux/store";
import { ActivityPayload, ActivityType } from "../../redux/slices/notificationSlice";

export interface NotificationListItem extends ActivityPayload {
  id: number;
  read: boolean;
}

export interface GetMyNotificationsResponse {
  success: boolean;
  data: {
    items: NotificationListItem[];
    unreadCounts: Record<ActivityType, number>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface MarkReadAllResponse {
  success: boolean;
  data: {
    unreadCounts: Record<ActivityType, number>;
  };
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/notifications`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMyNotifications: builder.query<
      GetMyNotificationsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return `/?page=${page}&limit=${limit}`;
      },
    }),
    markAllRead: builder.mutation<MarkReadAllResponse, void>({
      query: () => ({
        url: "/read-all",
        method: "PUT",
      }),
    }),
    markReadById: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/${id}/read`,
        method: "PUT",
      }),
    }),
  }),
});

export const { useGetMyNotificationsQuery, useMarkAllReadMutation, useMarkReadByIdMutation } = notificationApi;

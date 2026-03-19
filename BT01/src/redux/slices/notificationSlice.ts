import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type ActivityType =
  | "ORDER_NEW"
  | "REVIEW_NEW"
  | "REVIEW_COMMENT_NEW"
  | "PRODUCT_NEW"
  | "COUPON_NEW";

export interface ActivityPayload {
  eventId: string;
  type: ActivityType;
  title: string;
  message: string;
  createdAt: string; // ISO
  meta?: Record<string, any>;
}

export type NotificationItem = ActivityPayload & { read: boolean; id?: number };

export interface NotificationsState {
  items: NotificationItem[];
  unreadCounts: Record<ActivityType, number>;
}

const initialCounts: NotificationsState["unreadCounts"] = {
  ORDER_NEW: 0,
  REVIEW_NEW: 0,
  REVIEW_COMMENT_NEW: 0,
  PRODUCT_NEW: 0,
  COUPON_NEW: 0,
};

const initialState: NotificationsState = {
  items: [],
  unreadCounts: initialCounts,
};

const MAX_ITEMS = 50;

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    hydrateNotifications: (state, action: PayloadAction<{ items: NotificationItem[]; unreadCounts: NotificationsState["unreadCounts"] }>) => {
      state.items = action.payload.items;
      state.unreadCounts = action.payload.unreadCounts;
    },
    receiveActivity: (state, action: PayloadAction<ActivityPayload>) => {
      const payload = action.payload;

      const exists = state.items.some((it) => it.eventId === payload.eventId);
      if (exists) return;

      const item: NotificationItem = { ...payload, read: false };
      state.items.unshift(item);

      // Cap list size to reduce memory usage
      if (state.items.length > MAX_ITEMS) {
        state.items = state.items.slice(0, MAX_ITEMS);
      }

      state.unreadCounts[payload.type] += 1;
    },
    markAllRead: (state) => {
      state.items = state.items.map((it) => ({ ...it, read: true }));
      state.unreadCounts = { ...initialCounts };
    },
    markRead: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const target = state.items.find((it) => it.eventId === eventId);
      if (!target || target.read) return;

      target.read = true;
      state.unreadCounts[target.type] = Math.max(0, state.unreadCounts[target.type] - 1);
    },
  },
});

export const hydrateNotifications = notificationSlice.actions.hydrateNotifications;
export const receiveActivity = notificationSlice.actions.receiveActivity;
export const markAllRead = notificationSlice.actions.markAllRead;
export const markRead = notificationSlice.actions.markRead;
export default notificationSlice.reducer;

export const selectTotalUnread = (state: { notifications: NotificationsState }) => {
  return Object.values(state.notifications.unreadCounts).reduce((a, b) => a + b, 0);
};

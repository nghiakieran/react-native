import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../config';
import { RootState } from '../../redux/store';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
    | 'NEW'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'SHIPPING'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'CANCEL_REQUESTED';

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
    discount: number;
}

export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: 'COD';
    shippingAddress: string;
    note?: string;
    cancelReason?: string;
    confirmedAt?: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    pricing?: {
        orderId: number;
        couponCode?: string | null;
        subtotal: number;
        couponDiscount: number;
        pointsUsed: number;
        finalTotal: number;
    };
}

export interface OrderListResponse {
    success: boolean;
    data: Order[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface OrderDetailResponse {
    success: boolean;
    data: Order;
    cancelInfo: {
        canCancelDirectly: boolean;
        canRequestCancel: boolean;
        remainingCancelMs: number;
        remainingCancelMinutes: number;
    };
}

export interface CashflowBucket {
    count: number;
    totalAmount: number;
}

export interface OrderCashflowStats {
    pending: CashflowBucket;   // Chờ xác nhận (NEW)
    shipping: CashflowBucket;  // Đang giao (SHIPPING)
    delivered: CashflowBucket; // Đã giao (DELIVERED)
    total: number;
}

export interface OrderCashflowStatsResponse {
    success: boolean;
    data: OrderCashflowStats;
}

export interface CreateOrderRequest {
    shippingAddress: string;
    note?: string;
    cartItemIds?: number[]; // nếu rỗng sẽ lấy toàn bộ giỏ hàng
    couponCode?: string;
    usePoints?: boolean;
}

export interface OrderFilter {
    page?: number;
    limit?: number;
    status?: OrderStatus;
}

// ─── Order Status Display Helpers ──────────────────────────────────────────────
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    NEW: 'Đơn hàng mới',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Đang chuẩn bị',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao thành công',
    CANCELLED: 'Đã hủy',
    CANCEL_REQUESTED: 'Yêu cầu hủy',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
    NEW: '#3B82F6',          // blue
    CONFIRMED: '#8B5CF6',    // purple
    PREPARING: '#F59E0B',    // amber
    SHIPPING: '#06B6D4',     // cyan
    DELIVERED: '#10B981',    // green
    CANCELLED: '#EF4444',    // red
    CANCEL_REQUESTED: '#F97316', // orange
};

// ─── Order API ─────────────────────────────────────────────────────────────────
export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/orders`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Order'],
    endpoints: (builder) => ({
        // POST /api/orders - Tạo đơn hàng mới
        createOrder: builder.mutation<{ success: boolean; message: string; data: Order }, CreateOrderRequest>({
            query: (body) => ({
                url: '',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Order'],
        }),

        // GET /api/orders - Lấy danh sách đơn hàng
        getMyOrders: builder.query<OrderListResponse, OrderFilter | void>({
            query: (filter) => {
                if (!filter) return '';
                const params = new URLSearchParams();
                if (filter.page) params.append('page', filter.page.toString());
                if (filter.limit) params.append('limit', filter.limit.toString());
                if (filter.status) params.append('status', filter.status);
                const qs = params.toString();
                return qs ? `?${qs}` : '';
            },
            providesTags: ['Order'],
        }),

        // GET /api/orders/:id - Chi tiết đơn hàng
        getOrderById: builder.query<OrderDetailResponse, number>({
            query: (id) => `/${id}`,
            providesTags: (_result, _err, id) => [{ type: 'Order', id }],
        }),

        // GET /api/orders/stats - Thống kê dòng tiền của user
        getMyOrderCashflowStats: builder.query<OrderCashflowStatsResponse, void>({
            query: () => `/stats`,
        }),

        // Admin: GET /api/orders/admin/all - Lấy tất cả đơn hàng
        getAllOrders: builder.query<OrderListResponse, OrderFilter | void>({
            query: (filter) => {
                const params = new URLSearchParams();
                if (filter?.page) params.append('page', filter.page.toString());
                if (filter?.limit) params.append('limit', filter.limit.toString());
                if (filter?.status) params.append('status', filter.status);
                const qs = params.toString();
                return `/admin/all${qs ? `?${qs}` : ''}`;
            },
            providesTags: ['Order'],
        }),

        // Admin: PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng
        updateOrderStatus: builder.mutation<{ success: boolean; message: string; data: Order }, { id: number; status: OrderStatus }>({
            query: ({ id, status }) => ({
                url: `/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: (_result, _err, { id }) => [
                'Order',
                { type: 'Order', id },
            ],
        }),

        // PUT /api/orders/:id/cancel - Hủy đơn hàng
        cancelOrder: builder.mutation<{ success: boolean; message: string; data: Order }, { id: number; reason?: string }>({
            query: ({ id, reason }) => ({
                url: `/${id}/cancel`,
                method: 'PUT',
                body: { reason },
            }),
            invalidatesTags: (_result, _err, { id }) => [
                'Order',
                { type: 'Order', id },
            ],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderByIdQuery,
    useCancelOrderMutation,
    useGetAllOrdersQuery,
    useUpdateOrderStatusMutation,
    useGetMyOrderCashflowStatsQuery,
} = orderApi;

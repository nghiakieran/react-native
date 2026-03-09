import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── State: Local cart UI state ────────────────────────────────────────────────
// Lưu trạng thái UI liên quan đến cart (badge count, selected items khi checkout)
// Dữ liệu thực tế từ server được quản lý bởi cartApi (RTK Query)
interface CartState {
    // Số lượng items trong giỏ để hiển thị badge trên icon
    itemCount: number;
    // IDs của các items được chọn để thanh toán
    selectedItemIds: number[];
    // Trạng thái loading khi add to cart (để show animation)
    isAddingProductId: number | null;
}

const initialState: CartState = {
    itemCount: 0,
    selectedItemIds: [],
    isAddingProductId: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Cập nhật badge count (gọi sau khi fetch giỏ hàng từ server)
        setItemCount: (state, action: PayloadAction<number>) => {
            state.itemCount = action.payload;
        },

        // Chọn/bỏ chọn item để checkout
        toggleSelectItem: (state, action: PayloadAction<number>) => {
            const id = action.payload;
            const idx = state.selectedItemIds.indexOf(id);
            if (idx === -1) {
                state.selectedItemIds.push(id);
            } else {
                state.selectedItemIds.splice(idx, 1);
            }
        },

        // Chọn tất cả items
        selectAllItems: (state, action: PayloadAction<number[]>) => {
            state.selectedItemIds = action.payload;
        },

        // Bỏ chọn tất cả
        clearSelectedItems: (state) => {
            state.selectedItemIds = [];
        },

        // Đánh dấu sản phẩm đang được thêm vào giỏ (để show loading trên nút)
        setAddingProduct: (state, action: PayloadAction<number | null>) => {
            state.isAddingProductId = action.payload;
        },

        // Reset state khi logout
        resetCartState: (state) => {
            state.itemCount = 0;
            state.selectedItemIds = [];
            state.isAddingProductId = null;
        },
    },
});

export const {
    setItemCount,
    toggleSelectItem,
    selectAllItems,
    clearSelectedItems,
    setAddingProduct,
    resetCartState,
} = cartSlice.actions;

export default cartSlice.reducer;

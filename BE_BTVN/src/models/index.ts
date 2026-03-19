import sequelize from "../config/database";
import User from "./user.model";
import Category from "./category.model";
import Product from "./product.model";
import CartItem from "./cart.model";
import Order, { OrderItem } from "./order.model";
import Review from "./review.model";
import LoyaltyWallet from "./loyaltyWallet.model";
import Favorite from "./favorite.model";
import RecentView from "./recentView.model";
import Coupon from "./coupon.model";
import OrderDiscount from "./orderDiscount.model";
import PointTransaction from "./pointTransaction.model";
import Notification from "./notification.model";

// ─── Associations: User ───────────────────────────────────────────────────────
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(CartItem, { foreignKey: "userId", as: "cartItems" });
CartItem.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── Associations: Product ────────────────────────────────────────────────────
Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// ─── Associations: Reviews ─────────────────────────────────────────────────────
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

Order.hasMany(Review, { foreignKey: "orderId", as: "reviews" });
Review.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// ─── Associations: Loyalty Wallet ──────────────────────────────────────────────
User.hasOne(LoyaltyWallet, { foreignKey: "userId", as: "loyaltyWallet" });
LoyaltyWallet.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(PointTransaction, { foreignKey: "userId", as: "pointTransactions" });
PointTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });

// Notifications
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

Order.hasOne(OrderDiscount, { foreignKey: "orderId", as: "pricing" });
OrderDiscount.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// ─── Associations: Favorites ───────────────────────────────────────────────────
User.hasMany(Favorite, { foreignKey: "userId", as: "favorites" });
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(Favorite, { foreignKey: "productId", as: "favorites" });
Favorite.belongsTo(Product, { foreignKey: "productId", as: "product" });

// ─── Associations: Recent Views ────────────────────────────────────────────────
User.hasMany(RecentView, { foreignKey: "userId", as: "recentViews" });
RecentView.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(RecentView, { foreignKey: "productId", as: "recentViews" });
RecentView.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Export all models
export {
    User,
    Category,
    Product,
    CartItem,
    Order,
    OrderItem,
    Review,
    LoyaltyWallet,
    Favorite,
    RecentView,
    Coupon,
    OrderDiscount,
    PointTransaction,
    Notification,
};

// Export sequelize instance
export default sequelize;


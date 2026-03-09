import sequelize from "../config/database";
import User from "./user.model";
import Category from "./category.model";
import Product from "./product.model";
import CartItem from "./cart.model";
import Order, { OrderItem } from "./order.model";

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

// Export all models
export { User, Category, Product, CartItem, Order, OrderItem };

// Export sequelize instance
export default sequelize;


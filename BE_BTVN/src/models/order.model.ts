import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// ─── Order Status Enum ────────────────────────────────────────────────────────
export enum OrderStatus {
    NEW = "NEW",                           // 1. Đơn hàng mới
    CONFIRMED = "CONFIRMED",               // 2. Đã xác nhận
    PREPARING = "PREPARING",               // 3. Shop đang chuẩn bị hàng
    SHIPPING = "SHIPPING",                 // 4. Đang giao hàng
    DELIVERED = "DELIVERED",               // 5. Đã giao thành công
    CANCELLED = "CANCELLED",               // 6. Hủy đơn hàng
    CANCEL_REQUESTED = "CANCEL_REQUESTED", // 6b. Yêu cầu hủy (khi đang PREPARING)
}

export enum PaymentMethod {
    COD = "COD",
}

// ─── Order Model ──────────────────────────────────────────────────────────────
interface OrderAttributes {
    id: number;
    userId: number;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    shippingAddress: string;
    note?: string;
    cancelReason?: string;
    confirmedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface OrderCreationAttributes
    extends Optional<
        OrderAttributes,
        "id" | "status" | "paymentMethod" | "note" | "cancelReason" | "confirmedAt"
    > {}

class Order
    extends Model<OrderAttributes, OrderCreationAttributes>
    implements OrderAttributes
{
    public id!: number;
    public userId!: number;
    public totalAmount!: number;
    public status!: OrderStatus;
    public paymentMethod!: PaymentMethod;
    public shippingAddress!: string;
    public note?: string;
    public cancelReason?: string;
    public confirmedAt?: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(OrderStatus)),
            allowNull: false,
            defaultValue: OrderStatus.NEW,
        },
        paymentMethod: {
            type: DataTypes.ENUM(...Object.values(PaymentMethod)),
            allowNull: false,
            defaultValue: PaymentMethod.COD,
        },
        shippingAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        cancelReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        confirmedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "orders",
        indexes: [
            { fields: ["userId"] },
            { fields: ["status"] },
        ],
    }
);

// ─── OrderItem Model ──────────────────────────────────────────────────────────
interface OrderItemAttributes {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
    discount: number;
}

interface OrderItemCreationAttributes
    extends Optional<OrderItemAttributes, "id" | "discount" | "productImage"> {}

class OrderItem
    extends Model<OrderItemAttributes, OrderItemCreationAttributes>
    implements OrderItemAttributes
{
    public id!: number;
    public orderId!: number;
    public productId!: number;
    public productName!: string;
    public productImage?: string;
    public price!: number;
    public quantity!: number;
    public discount!: number;
}

OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        productId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        productName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        productImage: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "order_items",
        timestamps: false,
        indexes: [{ fields: ["orderId"] }],
    }
);

// ─── Associations ─────────────────────────────────────────────────────────────
Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    as: "items",
    onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
});

export { OrderItem };
export default Order;

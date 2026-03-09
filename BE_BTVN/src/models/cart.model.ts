import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface CartItemAttributes {
    id: number;
    userId: number;
    productId: number;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CartItemCreationAttributes extends Optional<CartItemAttributes, "id"> {}

class CartItem
    extends Model<CartItemAttributes, CartItemCreationAttributes>
    implements CartItemAttributes
{
    public id!: number;
    public userId!: number;
    public productId!: number;
    public quantity!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "userId",
        },
        productId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: "productId",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
    },
    {
        sequelize,
        tableName: "cart_items",
        indexes: [
            {
                unique: true,
                fields: ["userId", "productId"],
                name: "unique_cart",
            },
        ],
    }
);

export default CartItem;

import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ProductAttributes {
    id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    category: string;
    imageUrl: string;
    stock: number;
    soldCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "soldCount" | "discount"> { }

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public price!: number;
    public discount!: number;
    public category!: string;
    public imageUrl!: string;
    public stock!: number;
    public soldCount!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Product.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "Discount percentage (0-100)",
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        soldCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "Number of items sold",
        },
    },
    {
        sequelize,
        tableName: "products",
        indexes: [
            {
                fields: ["soldCount"],
            },
        ],
    }
);

export default Product;

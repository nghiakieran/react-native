import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface CategoryAttributes {
    id: number;
    name: string;
    description?: string;
    order: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, "id" | "description" | "order" | "isActive"> { }

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public description?: string;
    public order!: number;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: "Display order in the list",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "categories",
        indexes: [
            {
                fields: ["order"],
            },
            {
                fields: ["isActive"],
            },
        ],
    }
);

export default Category;

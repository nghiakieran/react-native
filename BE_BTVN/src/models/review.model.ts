import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ReviewAttributes {
  id: number;
  userId: number;
  productId: number;
  orderId: number;
  rating: number; // 1..5
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, "id" | "comment"> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;
  public orderId!: number;
  public rating!: number;
  public comment?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "reviews",
    indexes: [
      { fields: ["productId"] },
      { fields: ["userId"] },
      { fields: ["orderId"] },
      { fields: ["userId", "productId", "orderId"], unique: true },
    ],
  }
);

export default Review;


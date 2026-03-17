import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface FavoriteAttributes {
  id: number;
  userId: number;
  productId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, "id"> {}

class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public id!: number;
  public userId!: number;
  public productId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
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
  },
  {
    sequelize,
    tableName: "favorites",
    indexes: [
      { fields: ["userId"] },
      { fields: ["productId"] },
      { fields: ["userId", "productId"], unique: true },
    ],
  }
);

export default Favorite;


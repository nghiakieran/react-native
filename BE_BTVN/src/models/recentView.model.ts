import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface RecentViewAttributes {
  id: number;
  userId: number;
  productId: number;
  lastViewedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RecentViewCreationAttributes extends Optional<RecentViewAttributes, "id" | "lastViewedAt"> {}

class RecentView
  extends Model<RecentViewAttributes, RecentViewCreationAttributes>
  implements RecentViewAttributes
{
  public id!: number;
  public userId!: number;
  public productId!: number;
  public lastViewedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecentView.init(
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
    lastViewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "recent_views",
    indexes: [
      { fields: ["userId"] },
      { fields: ["productId"] },
      { fields: ["userId", "productId"], unique: true },
      { fields: ["userId", "lastViewedAt"] },
    ],
  }
);

export default RecentView;


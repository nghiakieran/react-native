import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type PointTxType = "EARN" | "SPEND";

interface PointTransactionAttributes {
  id: number;
  userId: number;
  type: PointTxType;
  points: number;
  note?: string | null;
  orderId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PointTransactionCreationAttributes
  extends Optional<PointTransactionAttributes, "id" | "note" | "orderId"> {}

class PointTransaction
  extends Model<PointTransactionAttributes, PointTransactionCreationAttributes>
  implements PointTransactionAttributes
{
  public id!: number;
  public userId!: number;
  public type!: PointTxType;
  public points!: number;
  public note?: string | null;
  public orderId?: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PointTransaction.init(
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
    type: {
      type: DataTypes.ENUM("EARN", "SPEND"),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "point_transactions",
    indexes: [{ fields: ["userId"] }, { fields: ["orderId"] }],
  }
);

export default PointTransaction;


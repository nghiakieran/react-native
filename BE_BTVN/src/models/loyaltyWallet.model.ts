import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface LoyaltyWalletAttributes {
  id: number;
  userId: number;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoyaltyWalletCreationAttributes extends Optional<LoyaltyWalletAttributes, "id" | "points"> {}

class LoyaltyWallet
  extends Model<LoyaltyWalletAttributes, LoyaltyWalletCreationAttributes>
  implements LoyaltyWalletAttributes
{
  public id!: number;
  public userId!: number;
  public points!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LoyaltyWallet.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "loyalty_wallets",
    indexes: [{ fields: ["userId"], unique: true }],
  }
);

export default LoyaltyWallet;


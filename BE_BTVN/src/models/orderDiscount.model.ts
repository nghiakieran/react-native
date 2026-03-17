import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface OrderDiscountAttributes {
  id: number;
  orderId: number;
  couponCode?: string | null;
  subtotal: number;
  couponDiscount: number;
  pointsUsed: number;
  finalTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderDiscountCreationAttributes extends Optional<OrderDiscountAttributes, "id" | "couponCode"> {}

class OrderDiscount
  extends Model<OrderDiscountAttributes, OrderDiscountCreationAttributes>
  implements OrderDiscountAttributes
{
  public id!: number;
  public orderId!: number;
  public couponCode?: string | null;
  public subtotal!: number;
  public couponDiscount!: number;
  public pointsUsed!: number;
  public finalTotal!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderDiscount.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    couponDiscount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    pointsUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    finalTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "order_discounts",
    indexes: [{ fields: ["orderId"], unique: true }, { fields: ["couponCode"] }],
  }
);

export default OrderDiscount;


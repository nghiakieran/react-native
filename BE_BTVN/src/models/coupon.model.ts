import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type CouponType = "PERCENT" | "FIXED";

interface CouponAttributes {
  id: number;
  code: string;
  type: CouponType;
  value: number; // percent (0-100) or fixed amount
  minOrderAmount: number;
  maxDiscount?: number | null;
  startAt?: Date | null;
  endAt?: Date | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CouponCreationAttributes
  extends Optional<
    CouponAttributes,
    | "id"
    | "minOrderAmount"
    | "maxDiscount"
    | "startAt"
    | "endAt"
    | "usageLimit"
    | "usedCount"
    | "isActive"
  > {}

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id!: number;
  public code!: string;
  public type!: CouponType;
  public value!: number;
  public minOrderAmount!: number;
  public maxDiscount?: number | null;
  public startAt?: Date | null;
  public endAt?: Date | null;
  public usageLimit?: number | null;
  public usedCount!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("PERCENT", "FIXED"),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: null,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "coupons",
    indexes: [{ fields: ["code"], unique: true }, { fields: ["isActive"] }],
  }
);

export default Coupon;


import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export type NotificationType =
  | "ORDER_NEW"
  | "REVIEW_NEW"
  | "REVIEW_COMMENT_NEW"
  | "PRODUCT_NEW"
  | "COUPON_NEW";

interface NotificationAttributes {
  id: number;
  userId: number;
  eventId: string;
  type: NotificationType;
  title: string;
  message: string;
  meta?: string | null;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, "id" | "meta" | "readAt" | "createdAt" | "updatedAt"> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number;
  public eventId!: string;
  public type!: NotificationType;
  public title!: string;
  public message!: string;
  public meta?: string | null;
  public readAt?: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "ORDER_NEW",
        "REVIEW_NEW",
        "REVIEW_COMMENT_NEW",
        "PRODUCT_NEW",
        "COUPON_NEW",
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meta: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    indexes: [
      { unique: true, fields: ["userId", "eventId"] },
      { fields: ["userId", "readAt"] },
      { fields: ["userId", "type"] },
    ],
  },
);

export default Notification;

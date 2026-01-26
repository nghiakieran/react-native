import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export interface UserAttributes {
  id?: number;
  name: string;
  email: string;
  password: string;
  isVerified?: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  otpPurpose?: "REGISTER" | "RESET_PASSWORD" | null;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public isVerified!: boolean;
  public otp!: string | null;
  public otpExpiry!: Date | null;
  public otpPurpose!: "REGISTER" | "RESET_PASSWORD" | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      defaultValue: null,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    otpPurpose: {
      type: DataTypes.ENUM("REGISTER", "RESET_PASSWORD"),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);

export default User;

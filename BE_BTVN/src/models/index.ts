import sequelize from "../config/database";
import User from "./user.model";
import Category from "./category.model";

// Export all models
export { User, Category };

// Export sequelize instance
export default sequelize;

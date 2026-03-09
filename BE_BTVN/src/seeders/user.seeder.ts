import bcrypt from "bcryptjs";
import User from "../models/user.model";

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin System",
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        role: "ADMIN",
        phone: "0123456789"
      });
      console.log("Admin user created: admin@gmail.com / admin123");
    } else {
      console.log("ℹAdmin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

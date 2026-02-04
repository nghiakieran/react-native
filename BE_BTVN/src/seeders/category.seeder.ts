import Category from "../models/category.model";

/**
 * Seed initial categories for the application
 */
export const seedCategories = async () => {
    try {
        const count = await Category.count();

        // Only seed if no categories exist
        if (count > 0) {
            console.log("Categories already exist, skipping seed...");
            return;
        }

        const categories = [
            {
                name: "T-Shirts",
                description: "Comfortable and stylish t-shirts for everyday wear",
                order: 1,
                isActive: true,
            },
            {
                name: "Pants",
                description: "Trendy pants and trousers for all occasions",
                order: 2,
                isActive: true,
            },
            {
                name: "Hoodies",
                description: "Cozy hoodies and sweatshirts",
                order: 3,
                isActive: true,
            },
            {
                name: "Dresses",
                description: "Elegant dresses for special occasions",
                order: 4,
                isActive: true,
            },
            {
                name: "Shoes",
                description: "Footwear for every style and activity",
                order: 5,
                isActive: true,
            },
            {
                name: "Jackets",
                description: "Stylish jackets and outerwear",
                order: 6,
                isActive: true,
            },
            {
                name: "Shorts",
                description: "Comfortable shorts for warm weather",
                order: 7,
                isActive: true,
            },
            {
                name: "Accessories",
                description: "Complete your look with accessories",
                order: 8,
                isActive: true,
            },
        ];

        await Category.bulkCreate(categories);
        console.log("✅ Categories seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding categories:", error);
        throw error;
    }
};

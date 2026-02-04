import Product from "../models/product.model";
import Category from "../models/category.model";
import { connectDatabase } from "../config/database";
import { seedCategories } from "./category.seeder";

const products = [
    {
        name: "Classic White T-Shirt",
        description: "A comfortable and versatile white t-shirt made from 100% cotton.",
        price: 19.99,
        category: "T-Shirts",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 100,
        soldCount: 250,
    },
    {
        name: "Denim Jeans",
        description: "High-quality denim jeans with a slim fit and durable stitching.",
        price: 49.99,
        category: "Pants",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 50,
        soldCount: 180,
    },
    {
        name: "Black Hoodie",
        description: "Warm and cozy black hoodie, perfect for chilly weather.",
        price: 39.99,
        category: "Hoodies",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 75,
        soldCount: 320,
    },
    {
        name: "Floral Summer Dress",
        description: "Lightweight and stylish floral dress for summer days.",
        price: 29.99,
        category: "Dresses",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 30,
        soldCount: 150,
    },
    {
        name: "Running Shoes",
        description: "Breathable running shoes with excellent cushioning.",
        price: 89.99,
        category: "Shoes",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 40,
        soldCount: 420,
    },
    {
        name: "Leather Jacket",
        description: "Premium leather jacket with a modern look.",
        price: 129.99,
        category: "Jackets",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 15,
        soldCount: 95,
    },
    {
        name: "Striped Polo Shirt",
        description: "Casual striped polo shirt suitable for various occasions.",
        price: 24.99,
        category: "T-Shirts",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 60,
        soldCount: 210,
    },
    {
        name: "Chino Shorts",
        description: "Comfortable chino shorts available in multiple colors.",
        price: 22.99,
        category: "Shorts",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 55,
        soldCount: 135,
    },
    {
        name: "Winter Scarf",
        description: "Soft wool scarf to keep you warm in winter.",
        price: 14.99,
        category: "Accessories",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 100,
        soldCount: 280,
    },
    {
        name: "Baseball Cap",
        description: "Adjustable baseball cap with a classic design.",
        price: 12.99,
        category: "Accessories",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 120,
        soldCount: 380,
    },
    {
        name: "Red Graphic Tee",
        description: "Bold graphic t-shirt in bright red.",
        price: 21.99,
        category: "T-Shirts",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 80,
        soldCount: 165,
    },
    {
        name: "Cargo Pants",
        description: "Utility cargo pants with plenty of pockets.",
        price: 44.99,
        category: "Pants",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        stock: 45,
        soldCount: 125,
    },
];

const seedProducts = async () => {
    try {
        await connectDatabase();

        // Sync Category table first
        await Category.sync({ force: true });
        console.log("Category table synced.");

        // Seed categories
        await seedCategories();

        // Sync Product table
        await Product.sync({ force: true });
        console.log("Product table synced.");

        await Product.bulkCreate(products);
        console.log("Products seeded successfully!");

        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedProducts();

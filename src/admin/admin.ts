import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import userModel from "../models/users.model";
import productsModel from "../models/products.model";
import ordersModel from "../models/orders.model";
import categoriesModel from "../models/category.model";
import paymentsModel from "../models/payments.model";
import cartModel from "../models/cart.model";
import ROLES_LIST from "../config/roles_list";
import dotenv from "dotenv";
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Register Mongoose adapter
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});

// Create AdminJS instance
export const adminjs = new AdminJS({
    resources: [
        { resource: userModel, options: { parent: { name: "Users" } } },
        { resource: productsModel, options: { parent: { name: "Shop" } } },
        { resource: categoriesModel, options: { parent: { name: "Shop" } } },
        { resource: ordersModel, options: { parent: { name: "Shop" } } },
        { resource: cartModel, options: { parent: { name: "Shop" } } },
        {
            resource: paymentsModel,
            options: { parent: { name: "Admin Management" } },
        },
    ],
    rootPath: "/admin",
    branding: {
        companyName: "E-commerce Admin",
        theme: {
            colors: {
                primary100: "#1E293B",
            },
        },
    },
});

const ADMIN = {
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "123456",
    role: ROLES_LIST.admin,
};

export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminjs,
    {
        authenticate: async (email, password) => {
            if (email === ADMIN.email && password === ADMIN.password) {
                return ADMIN;
            }
            return null;
        },
        cookiePassword: process.env.COOKIE_SECRET || "super-secret-cookie",
        cookieName: "adminjs",
    },
    null,
    {
        resave: false,
        saveUninitialized: true,
        secret: process.env.COOKIE_SECRET || "super-secret-cookie",
    }
);

import dbConfig from "../database/db.js";
import { Sequelize, DataTypes } from "sequelize";

import productModel from "./product-model.js";
import categoryModel from "../models/category-model.js";
import userModel from "../models/user-model.js";
import cartModel from "../models/cart-model.js";
import cartItemModel from "../models/cart-item.js";
import orderModel from "../models/order-model.js";
import orderItemModel from "../models/order-item.js";
import productCategoryModel from "../models/product-category-model.js";
import mobileBannerModel from "../models/mobile-banner-model.js";
import desktopBannerModel from "../models/desktop-banner-model.js";


// Create connection
const dbConnection = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.connection = dbConnection;

db.User = userModel(db.connection, DataTypes);
db.Product = productModel(db.connection, DataTypes);
db.Category = categoryModel(db.connection, DataTypes);
db.Cart = cartModel(db.connection, DataTypes);
db.CartItem = cartItemModel(db.connection, DataTypes);
db.Order = orderModel(db.connection, DataTypes);
db.OrderItem = orderItemModel(db.connection, DataTypes);
db.ProductCategory = productCategoryModel(db.connection, DataTypes);
db.MobileBanner = mobileBannerModel(db.connection, DataTypes);
db.DesktopBanner = desktopBannerModel(db.connection, DataTypes);


// ✅ Automatically call associate() for all models if it exists
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ✅ Yeh step models ko DB ke sath sync karta hai
// "Mujhe sabhi models (users, products, etc.) ko database ke sath sync karo"
// { alter: true } ka matlab:
// Agar koi table structure change hua ho (column add/remove/modify), to wo structure database mai alter (update) kar do bina pura table delete kiye.
db.connection
  .sync({ alter: true }) 
  .then(() => console.log("✅ Database is Synced"))
  .catch((err) => console.error("❌ Sync failed:", err));

export default db;

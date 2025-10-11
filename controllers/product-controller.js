import fs from "fs";
import path from "path";
import db from "../models/index.js";
const Product = db.Product;
const Category = db.Category;

const deleteFileSafe = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.log("⚠ File not found, skip delete:", filePath);
    }
  } catch (err) {
    console.error("❌ File delete error:", err.message);
  }
};

const createProduct = async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const {
      category_id,
      name,
      sku,
      description,
      price,
      stock_quantity,
      discount,
      brand,
      colors,
      fabrics,
      fits,
      sizes,
      model_height,
      model_wears,
      whats_new,
      is_special,
      men,
      women,
      more_to_explore,
      stitched,
      un_switch,
      un_switch_price,
      style_by,
      tags,
      trending_product,
    } = req.body;

    // if (
    //   !category_id ||
    //   !name ||
    //   !sizes ||
    //   !colors ||
    //   !price ||
    //   !stock_quantity
    // ) {
    //   // Delete uploaded files if validation fails
    //   uploadedFiles.forEach((file) =>
    //     deleteFileSafe(path.join("public/uploads", file.filename))
    //   );
    //   return res.status(400).json({
    //     success: false,
    //     message: "❌ Required fields are missing.",
    //   });
    // }

    // ✅ category_id ko hamesha array banado
    let categoryIds = [];
    if (category_id) {
      try {
        // agar stringified array aya hai to parse karo
        categoryIds = JSON.parse(category_id);
      } catch (e) {
        // agar single id string ya number hai
        categoryIds = [category_id];
      }
      categoryIds = categoryIds.map((id) => Number(id));
    }

    const imagePaths = uploadedFiles.map((file) => `/uploads/${file.filename}`);

    const newProduct = await Product.create({
      // category_id,
      name,
      productImg: imagePaths,
      sku,
      description,
      price,
      stock_quantity,
      discount,
      brand,
      colors,
      fabrics,
      fits,
      sizes,
      model_height,
      model_wears,
      whats_new,
      is_special,
      men,
      women,
      more_to_explore,
      stitched,
      un_switch,
      un_switch_price,
      style_by,
      tags,
      trending_product,
      created_at: new Date(),
    });

    // ✅ Categories set karo (many-to-many)
    if (categoryIds.length > 0) {
      await newProduct.setCategories(categoryIds);
    }

    const productWithCategories = await Product.findByPk(newProduct.id, {
      include: [
        {
          model: Category,
          as: "categories",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "✅ Product created successfully",
      newProduct,
      productWithCategories,
    });
  } catch (error) {
    uploadedFiles.forEach((file) =>
      deleteFileSafe(path.join("public/uploads", file.filename))
    );
    return res.status(500).json({
      success: false,
      message: "❌ Error creating product",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // let { page = 1, limit = 10 } = req.query;
    // page = parseInt(page);
    // limit = parseInt(limit);

    // const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: { deleted_at: null },
      include: [{ model: Category, as: "categories" }],
      order: [["created_at", "DESC"]],
      // limit,
      // offset,
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "❌ No products found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Products fetched",
      // total: count,
      // page,
      // pages: Math.ceil(count / limit),
      rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error fetching products",
      error: error.message,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      where: { id: productId, deleted_at: null },
      include: [{ model: Category, as: "categories" }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "❌ Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Product fetched",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error fetching product",
      error: error.message,
    });
  }
};

export const getProductsCount = async (req, res) => {
  try {
    const count = await Product.count({ where: { deleted_at: null } });
    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products count",
      error: error.message,
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(200).json([]); // no query → return empty list
    }

    const products = await Product.findAll({
      where: {
        name: { [db.Sequelize.Op.like]: `%${q}%` },
      },
    });

    res.status(200).json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const { productId } = req.params;

    const existingProduct = await Product.findOne({
      where: { id: productId, deleted_at: null },
    });

    if (!existingProduct) {
      uploadedFiles.forEach((file) =>
        deleteFileSafe(path.join("public/uploads", file.filename))
      );
      return res.status(404).json({
        success: false,
        message: "❌ Product not found or already deleted",
      });
    }

    // 🔹 Always start with old images (ensure array)
    let updatedImages = Array.isArray(existingProduct.productImg)
      ? [...existingProduct.productImg]
      : [];

    // 🔹 If frontend ne explicitly existing images bheji hain
    if (req.body.existing_images) {
      try {
        const parsed = JSON.parse(req.body.existing_images);
        if (Array.isArray(parsed)) {
          updatedImages = parsed;
        }
      } catch (err) {
        console.log("⚠ Could not parse existing_images:", err.message);
      }
    }

    // 🔹 Merge new uploads (add on top of existing)
    if (uploadedFiles.length > 0) {
      const newImgs = uploadedFiles.map((file) => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newImgs];
    }

    // 🔹 Parse category_ids properly
    let categoryIds = [];
    if (req.body.category_id) {
      try {
        categoryIds = JSON.parse(req.body.category_id);
        if (!Array.isArray(categoryIds)) categoryIds = [];
      } catch {
        categoryIds = Array.isArray(req.body.category_id)
          ? req.body.category_id
          : [];
      }
      categoryIds = categoryIds.map((id) => Number(id));
    }

    // 🔹 Update product
    const [updated] = await Product.update(
      {
        ...req.body,
        productImg: updatedImages,
        updated_at: new Date(),
      },
      { where: { id: productId, deleted_at: null } }
    );

    // 🔹 Update many-to-many categories
    if (categoryIds.length > 0) {
      await existingProduct.setCategories(categoryIds);
    }

    // const updatedProduct = await Product.findByPk(productId, {
    //   include: [{ model: Category, as: "categories" }],
    // });

    if (!updated) {
      uploadedFiles.forEach((file) =>
        deleteFileSafe(path.join("public/uploads", file.filename))
      );
      return res.status(500).json({
        success: false,
        message: "❌ Failed to update product",
      });
    }

    const updatedProduct = await Product.findByPk(productId);

    return res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    uploadedFiles.forEach((file) =>
      deleteFileSafe(path.join("public/uploads", file.filename))
    );
    return res.status(500).json({
      success: false,
      message: "❌ Error updating product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      where: { id: productId, deleted_at: null },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "❌ Product not found or already deleted",
      });
    }

    // Delete product images from uploads folder
    // if (product.productImg?.length > 0) {
    //   product.productImg.forEach(img => {
    //     const cleanPath = img.replace(/^\/+/, "");
    //     deleteFileSafe(path.join("public", cleanPath));
    //   });
    // }

    await Product.update(
      { deleted_at: new Date() },
      { where: { id: productId } }
    );

    res.status(200).json({
      success: true,
      message: "✅ Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Error deleting product",
      error: error.message,
    });
  }
};

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};

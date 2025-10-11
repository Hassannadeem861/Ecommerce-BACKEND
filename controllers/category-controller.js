import db from "../models/index.js";
const Category = db.Category;
import fs from "fs";
import path from "path";

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

const createCategory = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const { name } = req.body;

    if (!name) {
      // Delete uploaded files if validation fails
      uploadedFiles.forEach((file) =>
        deleteFileSafe(path.join("public/uploads", file.filename))
      );
      return res.status(400).json({
        success: false,
        message: "❌ Category name is required",
      });
    }

    // const existing = await Category.findOne({
    //   where: { name, deleted_at: null },
    // });

    // if (existing) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "❌ Category already exists",
    //   });
    // }

    const imagePaths = uploadedFiles.map((file) => `/uploads/${file.filename}`);

    const newCategory = await Category.create({
      name,
      category_img: imagePaths,
      created_at: new Date(),
    });


    return res.status(201).json({
      success: true,
      message: "✅ Category created successfully",
      newCategory,
    });
  } catch (error) {
    uploadedFiles.forEach((file) =>
      deleteFileSafe(path.join("public/uploads", file.filename))
    );
    return res.status(500).json({
      success: false,
      message: "❌ Error creating category",
      error: error.message,
    });
  }
};


const getAllCategories = async (req, res) => {
  try {
    // Query params se page & limit lo (default: page=1, limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: categories } = await Category.findAndCountAll({
      where: { deleted_at: null },
      order: [["created_at", "DESC"]], // latest first
      limit,
      offset,
    });

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "❌ No categorys found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Categories fetched successfully",
      totalCategories: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error fetching categories",
      error: error.message,
    });
  }
};

 export const getCategoriesCount = async (req, res) => {
  
  try {
    
    const count = await Category.count({ where: { deleted_at: null }});
    return res.status(200).json({
      success: true,
      count,
    });

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: " Error fetching categories count",
      error: error.message,
    });
}

};
const getSingleCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const category = await Category.findOne({
      where: { id: categoryId, deleted_at: null },
      // include: [
      //   {
      //     model: db.products,
      //     as: "products",
      //     where: { deleted_at: null },
      //     required: false,
      //     limit,
      //     offset
      //   }
      // ]
      order: [["created_at", "DESC"]], // latest products first
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "❌ Category not found",
      });
    }

    // Count total products for this category
    const totalProducts = await db.products.count({
      where: { category_id: categoryId, deleted_at: null },
    });

    return res.status(200).json({
      success: true,
      message: "✅ Category fetched successfully",
      categoryId: category.id,
      categoryName: category.name,
      // totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      // products: category.products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error fetching category",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      // Agar naam missing hai → nayi files delete kardo
      for (const file of uploadedFiles) {
        deleteFileSafe(path.join("public/uploads", file.filename));
      }
      return res.status(400).json({
        success: false,
        message: "❌ Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      where: { id: categoryId, deleted_at: null },
    });

    if (!existingCategory) {
      for (const file of uploadedFiles) {
        deleteFileSafe(path.join("public/uploads", file.filename));
      }
      return res.status(404).json({
        success: false,
        message: "❌ Category not found or already deleted",
      });
    }

    let updatedImages = existingCategory.category_img || [];

    // Agar new files upload hue
    if (uploadedFiles.length > 0) {
      // Purani images delete
      if (existingCategory.category_img?.length > 0) {
        for (const oldImage of existingCategory.category_img) {
          if (!oldImage) continue;
          const cleanPath = oldImage.replace(/^\/+/, "");
          const fullPath = path.join("public", cleanPath);
          deleteFileSafe(fullPath);
        }
      }
      updatedImages = uploadedFiles.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.existing_images) {
      // Agar frontend ne existing images bheji
      try {
        updatedImages = JSON.parse(req.body.existing_images);
      } catch (err) {
        console.log(
          "⚠ Invalid existing_images JSON:",
          req.body.existing_images
        );
      }
    }

    // 3️⃣ Category update
    const [updated] = await Category.update(
      {
        name,
        category_img: updatedImages,
        updated_at: new Date(),
      },
      { where: { id: categoryId, deleted_at: null } }
    );

    if (!updated) {
      for (const file of uploadedFiles) {
        deleteFileSafe(path.join("public/uploads", file.filename));
      }
      return res.status(500).json({
        success: false,
        message: "❌ Failed to update category",
      });
    }

    const updatedCategory = await Category.findByPk(categoryId);

    return res.status(200).json({
      success: true,
      message: "✅ Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    for (const file of uploadedFiles) {
      deleteFileSafe(path.join("public/uploads", file.filename));
    }
    return res.status(500).json({
      success: false,
      message: "❌ Error updating category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const deleted = await Category.update(
      { deleted_at: new Date() },
      { where: { id: categoryId, deleted_at: null } }
    );

    if (!deleted[0]) {
      return res.status(404).json({
        success: false,
        message: "❌ Category not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error deleting category",
      error: error.message,
    });
  }
};

export {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

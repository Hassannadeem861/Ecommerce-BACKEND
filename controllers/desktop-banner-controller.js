import fs from "fs";
import path from "path";
import db from "../models/index.js";

const Banner = db.DesktopBanner;

const deleteFileSafe = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("❌ File delete error:", err.message);
  }
};

// ================= DESKTOP BANNER =================

// ✅ Create Desktop Banner
const createDesktopBanner = async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const imagePaths = uploadedFiles.map((file) => `/uploads/${file.filename}`);

    const newBanner = await Banner.create({
      desktopBannerImg: imagePaths,
      created_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "✅ Desktop banner created successfully",
      data: newBanner,
    });
  } catch (error) {
    uploadedFiles.forEach((file) =>
      deleteFileSafe(path.join("public/uploads", file.filename))
    );
    return res.status(500).json({
      success: false,
      message: "❌ Error creating desktop banner",
      error: error.message,
    });
  }
};

// ✅ Get All Desktop Banners
const getAllDesktopBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { deleted_at: null },
      attributes: ["id", "desktopBannerImg", "created_at"],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "✅ Desktop banners fetched",
      data: banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error fetching desktop banners",
      error: error.message,
    });
  }
};

// ✅ Update Desktop Banner
const updateDesktopBanner = async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const { bannerId } = req.params;

    // 🔹 1. Find existing banner
    const existingBanner = await Banner.findOne({
      where: { id: bannerId, deleted_at: null },
    });

    if (!existingBanner) {
      uploadedFiles.forEach((file) =>
        deleteFileSafe(path.join("public/uploads", file.filename))
      );
      return res.status(404).json({
        success: false,
        message: "❌ Banner not found or already deleted",
      });
    }

    // 🔹 2. Start with old images
    let updatedImages = Array.isArray(existingBanner.desktopBannerImg)
      ? [...existingBanner.desktopBannerImg]
      : [];

    // 🔹 3. Parse existing_images from frontend
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

    // 🔹 4. Merge new uploads
    if (uploadedFiles.length > 0) {
      const newImgs = uploadedFiles.map((file) => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newImgs];
    }

    // 🔹 5. Update banner
    const [updated] = await Banner.update(
      {
        ...req.body,
        desktopBannerImg: updatedImages,
        updated_at: new Date(),
      },
      { where: { id: bannerId, deleted_at: null } }
    );

    if (!updated) {
      uploadedFiles.forEach((file) =>
        deleteFileSafe(path.join("public/uploads", file.filename))
      );
      return res.status(500).json({
        success: false,
        message: "❌ Failed to update banner",
      });
    }

    // 🔹 6. Fetch updated banner
    const updatedBanner = await Banner.findByPk(bannerId);

    return res.status(200).json({
      success: true,
      message: "✅ Banner updated successfully",
      updatedBanner,
    });
  } catch (error) {
    uploadedFiles.forEach((file) =>
      deleteFileSafe(path.join("public/uploads", file.filename))
    );
    return res.status(500).json({
      success: false,
      message: "❌ Error updating banner",
      error: error.message,
    });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const banner = await Banner.findOne({
      where: { id: bannerId, deleted_at: null },
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "❌ Banner not found",
      });
    }

    await Banner.update(
      { deleted_at: new Date() },
      { where: { id: bannerId } }
    );

    return res.status(200).json({
      success: true,
      message: "✅ Banner deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "❌ Error deleting banner",
      error: error.message,
    });
  }
};

export {
  createDesktopBanner,
  getAllDesktopBanners,
  updateDesktopBanner,
  deleteBanner,
};

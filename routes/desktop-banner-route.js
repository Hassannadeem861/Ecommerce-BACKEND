import express from "express";
import upload from "../middleware/multer.js";
import {
  createDesktopBanner,
  getAllDesktopBanners,
  updateDesktopBanner,
  deleteBanner,
} from "../controllers/desktop-banner-controller.js";

const router = express.Router();


// Desktop APIs
router.post("/create-desktop-banner", upload.array("bannerImg", 10), createDesktopBanner);
router.get("/get-all-desktop-banners", getAllDesktopBanners);
router.put("/update-desktop-banner/:bannerId", upload.array("bannerImg", 10), updateDesktopBanner);

// Common delete
router.delete("/delete-banner/:bannerId", deleteBanner);

export default router;

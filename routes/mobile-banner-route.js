import express from "express";
import upload from "../middleware/multer.js";
import {
  createMobileBanner,
  getAllMobileBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/mobile-banner-controller.js";

const router = express.Router();

// Mobile APIs
router.post("/create-mobile-banner", upload.array("bannerImg", 10), createMobileBanner);
router.get("/get-all-mobile-banners", getAllMobileBanners);
router.put("/update-mobile-banner/:bannerId", upload.array("bannerImg", 10), updateBanner);
router.delete("/delete-banner/:bannerId", deleteBanner);

export default router;

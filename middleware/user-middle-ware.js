import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const User = db.User;

const authMiddleware = async (req, res, next) => {
  try {
    const token =
        req.cookies?.token
    //   req.headers("authorization");

    if (!token) {
      return res
        .status(401)
        .json({
          message: "Unauthorized ❌ - Only login user access this route"});
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: {
        id: verifyToken.id,
        deleted_at: null,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized ❌ - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        message: "Unauthorized ❌ - Invalid token",
        error: error.message,
      });
  }
};

// const adminMiddleWare = async (req, res, next) => {
//   try {
//     const admin = await adminModel.findById(req?.admin?.id);

//     if (!admin) {
//       return res.status(401).json({ message: "Admin not found" });
//     }

//     if (admin?.role !== "admin") {
//       return res.status(401).json({ message: "This user is not admin" });
//     }
//     next();
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Error in admin middleware", error: error.message });
//   }
// };

export {
    authMiddleware,
    // adminMiddleWare
};

import db from "../models/index.js";
const User = db.User;
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, email, password } = req.body;

    if (!first_name || !last_name || !last_name || !phone_number || !email || !password ) {
      return res.status(400).json({
        message: "Missing required fields ❌",
        required_fields: ["first_name", "last_name", "phone_number", "email", "password"],
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists ❌" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      first_name,
      last_name,
      phone_number,
      email,
      password: hashedPassword,
      created_at: new Date(),
    });

    return res.status(201).json({
      message: "User created successfully ✅",
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating user ❌",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password required ❌" });

    const user = await User.findOne({ where: { email: email } });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ❗ in development (true only in production with HTTPS)
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error during login ❌",
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { deleted_at: null },
    });

    return res.status(200).json({
      message: "All users fetched ✅",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching users ❌",
      error: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user || user.deleted_at) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    return res.status(200).json({
      message: "User fetched ✅",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching user ❌",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // if (req.body.password) {
    //   req.body.password = await hashPassword(req.body.password);
    // }

    const [updated] = await User.update(
      {
        ...req.body,
        updated_at: new Date(),
      },
      {
        where: { id: userId, deleted_at: null },
      }
    );

    if (updated === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no change ❌" });
    }

    return res.status(200).json({ message: "User updated successfully ✅" });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating user ❌",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [affectedRows] = await User.update(
      { deleted_at: new Date() },
      { where: { id: userId, deleted_at: null } }
    );

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted ❌" });
    }

    return res.status(200).json({ message: "User deleted successfully ✅" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting user ❌",
      error: error.message,
    });
  }
};

export {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};

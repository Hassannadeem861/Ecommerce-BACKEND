import { where } from "sequelize";
import db from "../models/index.js";

const { Order, OrderItem, Cart, CartItem, Product } = db;

export const createOrder = async (req, res) => {
  const t = await db.connection.transaction();
  try {
    const {
      user_id,
      session_id,
      cart_id,
      payment_method,
      shipping_address,
      first_name,
      last_name,
      phone_number,
      total_amount,
    } = req.body;

    const cart = await Cart.findOne({
      where: { id: cart_id, deleted_at: null },
      include: [{ model: CartItem, as: "items", include: ["product"] }],
    });

    if (!cart || cart.items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found or empty" });
    }

    // const totalAmount = cart.items.reduce(
    //   (sum, item) => sum + parseFloat(item.price) * item.quantity,
    //   0
    // );

    const order = await Order.create(
      {
        user_id: cart.user_id ?? null,
        // session_id: session_id ?? null,
        cart_id: cart.id,
        total_amount,
        payment_method,
        shipping_address,
        first_name,
        last_name,
        phone_number,
        created_at: new Date(),
      },
      { transaction: t }
    );

    const orderItems = cart.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction: t });

    // 5. Mark cart as checked_out
    cart.status = "checked_out";
    await cart.save({ transaction: t });

    await t.commit();

    const newOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items", include: ["product"] }],
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { deleted_at: null },
      include: [{ model: OrderItem, as: "items", include: ["product"] }],
      order: [["created_at", "DESC"]],
    });

    return res
      .status(200)
      .json({ success: true, message: "Get all orders", data: orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const getOrdersCount = async (req, res) => {
  try {
    const totalOrders = await Order.count({ where: { deleted_at: null } });
    return res.status(200).json({
      success: true,
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error counting orders",
      error: error.message,
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const totalAmount = await Order.sum("total_amount", {
      where: { deleted_at: null },
    });
    return res.status(200).json({
      success: true,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating total payments",
      error: error.message,
    });
  }
};

export const getSingleOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({
      where: { id: orderId, deleted_at: null },
      include: [{ model: OrderItem, as: "items", include: ["product"] }],
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// PUT /api/v1/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Update order error:", error.message);
    res.status(500).json({ error: "Failed to update order" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, shipping_address } = req.body;

    const order = await Order.findByPk(id);
    if (!order || order.deleted_at) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status ?? order.status;
    order.payment_method = payment_method ?? order.payment_method;
    order.shipping_address = shipping_address ?? order.shipping_address;
    order.updated_at = new Date();

    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.deleted_at = new Date();
    await order.save();

    res.status(200).json({ success: true, message: "Order soft deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};

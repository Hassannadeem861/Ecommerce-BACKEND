import db from "../models/index.js";

const { Cart, CartItem, Product } = db;

export const createCart = async (req, res) => {
  const t = await db.connection.transaction();
  try {
    const { user_id, session_id, items, color, size } = req.body;

    // 1) Identify guest vs logged-in
    const isGuest = !user_id;

    // 2) Always have a stable session id for guest
    const stableSessionId = isGuest
      ? session_id || `guest_${Date.now()}`
      : null;

    // 3) Find existing "active" cart
    let cart = await Cart.findOne({
      where: isGuest
        ? { session_id: stableSessionId, status: "active", deleted_at: null }
        : { user_id, status: "active", deleted_at: null },
      transaction: t,
    });

    // 4) If not found → create a new cart
    if (!cart) {
      cart = await Cart.create(
        {
          user_id: isGuest ? null : user_id,
          session_id: isGuest ? stableSessionId : null,
          // size,
          // color,
          status: "active",
          created_at: new Date(),
        },
        { transaction: t }
      );
    }

    // 5) Merge items
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const existing = await CartItem.findOne({
          where: {
            cart_id: cart.id,
            product_id: item.product_id,
            un_stitch: item.un_stitch,
            size: item.size,
            color: item.color,
            deleted_at: null,
          },
          transaction: t,
        });

        if (existing) {
          // update (increase quantity, refresh price if needed)
          existing.quantity = existing.quantity + (item.quantity || 1);
          existing.price = item.price ?? existing.price;
          existing.updated_at = new Date();
          await existing.save({ transaction: t });
        } else {
          // create new cart item
          await CartItem.create(
            {
              cart_id: cart.id,
              product_id: item.product_id,
              quantity: item.quantity || 1,
              price: item.price || 0,
              un_stitch: item.un_stitch || 0,
              size: item.size || null,
              color: item.color || null,
              created_at: new Date(),
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();

    // 6) Return fresh cart with items+product
    const freshCart = await Cart.findByPk(cart.id, {
      include: [{ model: CartItem, as: "items", include: ["product"] }],
    });

    return res.status(200).json({
      success: true,
      message: "Cart created successfully",
      cart: freshCart,
      session_id: stableSessionId || null,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error creating/updating cart",
      error: error.message,
    });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      where: { deleted_at: null },
      include: [{ model: CartItem, as: "items", include: ["product"] }],
    });

    return res.status(200).json({ success: true, data: carts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching carts",
      error: error.message,
    });
  }
};

export const getSingleCart = async (req, res) => {
  const { cartId } = req.params;

  try {
    const cart = await Cart.findOne({
      where: { id: cartId, deleted_at: null },
      include: [{ model: CartItem, as: "items", include: ["product"] }],
    });

    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    return res
      .status(200)
      .json({ success: true, message: "Get single cart successfully", cart });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Error fetching cart",
    });
  }
};

// ✅ Update Cart (status, user_id, session_id, items)
export const updateCart = async (req, res) => {
  const t = await db.connection.transaction();
  const { cartId } = req.params;

  try {
    const { user_id, session_id, status, color, size, items } = req.body;

    let cart = await Cart.findByPk(cartId, { transaction: t });

    if (!cart || cart.deleted_at) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // ✅ update main cart fields
    cart.user_id = user_id ?? cart.user_id;
    cart.session_id = session_id ?? cart.session_id;
    cart.status = status ?? cart.status;
    cart.color = color ?? cart.color;
    cart.size = size ?? cart.size;
    cart.updated_at = new Date();
    await cart.save({ transaction: t });

    // ✅ agar items bheje gaye ho to merge/update karo
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const existing = await CartItem.findOne({
          where: {
            cart_id: cart.id,
            product_id: item.product_id,
            un_stitch: item.un_stitch ?? 0,
            deleted_at: null,
          },
          transaction: t,
        });

        if (existing) {
          existing.quantity = item.quantity ?? existing.quantity;
          existing.price = item.price ?? existing.price;
          existing.updated_at = new Date();
          await existing.save({ transaction: t });
        } else {
          await CartItem.create(
            {
              cart_id: cart.id,
              product_id: item.product_id,
              quantity: item.quantity || 1,
              price: item.price || 0,
              un_stitch: item.un_stitch ?? 0,
              created_at: new Date(),
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();

    // ✅ fresh cart return with items + product
    const freshCart = await Cart.findByPk(cart.id, {
      include: [{ model: CartItem, as: "items", include: ["product"] }],
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: freshCart,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: "Error updating cart",
      Error: error.message,
    });
  }
};

// export const updateCart = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { user_id, session_id, status, color, size } = req.body;

//     const cart = await Cart.findByPk(id);
//     if (!cart || cart.deleted_at) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart not found" });
//     }

//     cart.user_id = user_id ?? cart.user_id;
//     cart.session_id = session_id ?? cart.session_id;
//     cart.status = status ?? cart.status;
//     cart.color = color ?? cart.color;
//     cart.size = size ?? cart.size;
//     cart.updated_at = new Date();

//     await cart.save();

//     res.status(200).json({ success: true, data: cart });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating cart" });
//   }
// };

export const deleteCart = async (req, res) => {
  const { cartId } = req.params;

  try {
    const [affectedRows] = await Cart.update(
      { deleted_at: new Date() },
      { where: { id: cartId, deleted_at: null } }
    );

    if (affectedRows === 0)
      return res.status(404).json({
        success: false,
        message: "Cart not found or already deleted ❌",
      });

    return res
      .status(200)
      .json({ success: true, message: "Cart soft deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting cart",
      error: error.messge,
    });
  }
};

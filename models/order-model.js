const orderModel = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },

      cart_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "paid",
          "shipped",
          "completed",
          "cancelled"
        ),
        defaultValue: "pending",
      },

      payment_method: {
        type: DataTypes.STRING, // e.g. "credit_card", "cash_on_delivery"
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "orders",
      timestamps: false,
      paranoid: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Order.hasMany(models.OrderItem, { foreignKey: "order_id", as: "items" });
    Order.belongsTo(models.Cart, { foreignKey: "cart_id", as: "cart" });
  };

  return Order;
};

export default orderModel;

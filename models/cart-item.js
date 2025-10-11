const cartItemModel = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    "CartItem",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      cart_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
      },

      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      un_stitch: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: DataTypes.NOW,
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
      tableName: "cart_items",
      timestamps: false,
      paranoid: true,
    }
  );

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: "cart_id", as: "cart" });
    CartItem.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return CartItem;
};

export default cartItemModel;

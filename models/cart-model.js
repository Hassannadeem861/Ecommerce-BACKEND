const cartModel = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true, 
      },

      session_id: {
        type: DataTypes.STRING, 
        allowNull: true, 
      },

      // size: {
      //   type: DataTypes.STRING, 
      //   allowNull: true, 
      // },

      // color: {
      //   type: DataTypes.STRING, 
      //   allowNull: true, 
      // },

      status: {
        type: DataTypes.ENUM("active", "checked_out", "abandoned"),
        defaultValue: "active",
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
      tableName: "carts",
      timestamps: false,
      paranoid: true,
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    Cart.hasMany(models.CartItem, { foreignKey: "cart_id", as: "items" });
  };

  return Cart;
};

export default cartModel;

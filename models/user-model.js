const userModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      phone_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING(255),
        // unique: true,
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      role: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
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
      tableName: "users",
      timestamps: false,
      paranoid: true, // Soft delete enable
    }
  );

  // ✅ Associations
  User.associate = (models) => {
    User.hasMany(models.Cart, { foreignKey: "user_id", as: "carts" });
    User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" });
  };

  return User;
};

export default userModel;
 
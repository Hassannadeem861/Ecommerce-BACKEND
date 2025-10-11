const categoryModel = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      category_img: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "categories",
      timestamps: false,
      paranoid: true, // Soft delete enable
    }
  );

  // Category Model
  Category.associate = (db) => {
    Category.belongsToMany(db.Product, {
      through: db.ProductCategory,
      foreignKey: "category_id",
      otherKey: "product_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Category;
};

export default categoryModel;

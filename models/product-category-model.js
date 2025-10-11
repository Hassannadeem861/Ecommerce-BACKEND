const productCategoryModel = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define(
    "ProductCategory",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "products", // table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "categories", // table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
      tableName: "product_categories",
      timestamps: false,
    }
  );

  return ProductCategory;
};

export default productCategoryModel;

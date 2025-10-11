const productModel = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      // category_id: {
      //   type: DataTypes.BIGINT.UNSIGNED,
      //   allowNull: false,
      // },

      trending_product: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      productImg: {
        type: DataTypes.JSON, // Array of image URLs
        allowNull: true,
        defaultValue: [],
      },

      sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        // allowNull: false,
      },

      stock_quantity: {
        type: DataTypes.INTEGER,
        // allowNull: false,
      },

      discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Multiple colors allowed
      colors: {
        type: DataTypes.JSON, // e.g. ["Red", "Blue", "Black"]
        allowNull: true,
      },

      // Multiple fabrics allowed
      fabrics: {
        type: DataTypes.JSON, // e.g. ["Cotton", "Silk"]
        allowNull: true,
      },

      // Multiple fits allowed
      fits: {
        type: DataTypes.JSON, // e.g. ["Slim", "Regular"]
        allowNull: true,
      },

      // Multiple sizes allowed
      sizes: {
        type: DataTypes.JSON, // e.g. ["S", "M", "L", "XL"]
        allowNull: true,
      },

      model_height: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      model_wears: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      whats_new: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      style_by: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      men: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      women: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      more_to_explore: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      un_switch: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      stitched: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },
      
      un_switch_price: {
        type: DataTypes.INTEGER,
        defaultValue: true,
        defaultValue: 0,
      },

      is_special: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },

      // Multiple tags allowed
      tags: {
        type: DataTypes.STRING, // e.g. ["summer", "lawn", "embroidered"]
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
      tableName: "products",
      timestamps: false,
      paranoid: true, // Soft delete enable
    }
  );

  Product.associate = (db) => {
    Product.belongsToMany(db.Category, {
      through: db.ProductCategory,
      foreignKey: "product_id",
      otherKey: "category_id",
      as: "categories",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Product;
};

export default productModel;

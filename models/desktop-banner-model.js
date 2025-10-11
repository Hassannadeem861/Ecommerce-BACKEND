const bannerModel = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "Banner",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      desktopBannerImg: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
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
      tableName: "desktop-banners",
      timestamps: false,
      paranoid: true,
    }
  );

  return Banner;
};

export default bannerModel;

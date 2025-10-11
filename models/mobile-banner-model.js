const mobileBannerModel = (sequelize, DataTypes) => {
  const Banner = sequelize.define(
    "MobileBanner",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      mobileBannerImg: {
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
      tableName: "mobile-banners",
      timestamps: false,
      paranoid: true,
    }
  );

  return Banner;
};

export default mobileBannerModel;

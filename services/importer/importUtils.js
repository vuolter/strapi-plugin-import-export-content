const importToCollectionType = async (uid, data) => {
  try {
    return await strapi.entityService.create({ data }, { model: uid });
  } catch (error) {
    strapi.log.error(error);
    return null;
  }
};

const importToSingleType = async (uid, data) => {
  try {
    let item = null;
    
    const existing = await strapi.query(uid).find({});

    if (existing.length > 0) {
      item = existing[0];
      delete data.created_by;
      await strapi.query(uid).update({ id }, data);
    } else {
      item = await strapi.query(uid).create(data);
    }
    return item;

  } catch (error) {
    strapi.log.error(error);
    return null;
  }
};

module.exports = {
  importToCollectionType,
  importToSingleType,
};

const {
  COLLECTION_TYPE,
  SINGLE_TYPE,
} = require("../../constants/contentTypes");
const { importToCollectionType, importToSingleType } = require("./importUtils");

const idMapper = new Map();

function prepareData(item, options) {
  const data = {...item, ...options};

  if ("localizations" in data) {
    data["localizations"] = data["localizations"].flatMap((localization) => { 
      try {
        const { id, locale } = localization;
        localization.id = idMapper.get(locale).get(id);
      } catch (err) {
        console.log(err);
      }

      return localization.id !== undefined ? [localization] : [];
    });
  }

  return data;
}

function getResponse(oldID, oldItem, newItem) {
  if (!newItem) {
    return false;
  }
  if ("locale" in oldItem && "locale" in newItem && oldItem["locale"] == newItem["locale"]) {
    const locale = oldItem["locale"];
    if (idMapper.has(locale)) {
      idMapper.get(locale).set(oldID, newItem.id);
    }
    else {
      idMapper.set(locale, new Map([[oldID, newItem.id]]));
    }
  }
  return true;
}

async function importContent(target, items, options) {
  const { uid, kind } = target;
  switch (kind) {
    case COLLECTION_TYPE:
      return Promise.all(
        items.map(async ({ item, id }) => {
          const data = prepareData(item, options)
          const newItem = await importToCollectionType(uid, data);
          return getResponse(id, data, newItem);
        })
      );

    case SINGLE_TYPE:
      const { item, id } = items[0];

      const data = prepareData(item, options)
      const newItem = await importToSingleType(uid, data);

      return getResponse(id, data, newItem);

    default:
      throw new Error("Type is not supported");
  }
}

module.exports = {
  importContent,
};

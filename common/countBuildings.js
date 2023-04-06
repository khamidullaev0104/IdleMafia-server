const Building = require('../models/Schemas/BuildingSchema');

async function loadBuildingModule() {
  const buildings = await Building.findOne({}).sort({ Date: -1 }).limit(1);
  if (buildings === null) return false;
  const result = {
    you: _countBuildings(buildings.Datas.your),
    enemy: _countBuildings(buildings.Datas.enemy),
  };
  return result;
}

function _countBuildings(data) {
  let res = { remaining: 0, completed: 0 };
  data.forEach((element) => {
    if (element.status !== 'true') {
      res.remaining += 1;
    } else {
      res.completed += 1;
    }
  });
  return res;
}

module.exports = {
  loadBuildingModule,
};

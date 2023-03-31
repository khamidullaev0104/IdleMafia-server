const Point = require('../models/Schemas/PointSchema');
const Attack = require('../models/Schemas/AttackSchema');
const Building = require('../models/Schemas/BuildingSchema');

const strSlice = (str, strStart, strEnd) => {
  const posStart = str.indexOf(strStart);
  const posEnd = str.indexOf(strEnd);
  const res = str.slice(posStart + strStart.length, posEnd);

  return res.trim();
};
const strSliceEND = (str, strStart, strEnd, posEnd) => {
  const posStart = str.indexOf(strStart);
  let res = str.slice(posStart + strStart.length, posEnd);
  posEnd = res.indexOf(strEnd);
  if (posEnd !== -1) res = res.slice(0, posEnd);
  return res.trim();
};

async function pointParseModule(reqData) {
  const datas = [];
  reqData.forEach((element) => {
    const dayPoints = strSlice(element.value, 'DayPoints: ', '\n');
    const weekPoints = strSliceEND(
      element.value,
      'WeekPoints: ',
      '\n',
      element.value.length
    );
    datas.push({ name: element.name, dayPoints, weekPoints });
  });
  const point = new Point({
    Datas: datas,
  });
  const res = await point.save();
  return res;
}

async function attackParseModule(reqData) {
  const datas = [];

  reqData.forEach((element) => {
    const attack = strSlice(element.value, 'Attack: ', 'Defense: ');
    const defense = strSliceEND(
      element.value,
      'Defense: ',
      '\n',
      element.value.length
    );
    datas.push({ name: element.name, attack, defense });
  });
  const attack = new Attack({
    Datas: datas,
  });
  const res = await attack.save();
  return res;
}

async function loadAttackModule() {
  const attack = await Attack.find({});
  return attack;
}

async function buildingParseModule(reqData) {
  let { your, enemy } = reqData;
  const datas = { your: [], enemy: [] };

  your.forEach((element) => {
    let value = element.value;
    let po = value.indexOf('Building lost');
    if (po !== -1) {
      datas.your.push({ name: element.name, status: false });
    } else {
      const team = strSlice(element.value, 'Team: ', 'Capo: ');
      const capo = strSlice(
        element.value,
        'Capo: ',
        '\nTotal fight power left: '
      );
      const tfp = strSliceEND(
        element.value,
        'Total fight power left: ',
        '\n',
        element.value.length
      );
      datas.your.push({ name: element.name, status: true, team, capo, tfp });
    }
  });

  enemy.forEach((element) => {
    let value = element.value;
    let po = value.indexOf('Building lost');
    if (po !== -1) {
      datas.enemy.push({ name: element.name, status: false });
    } else {
      const team = strSlice(element.value, 'Team: ', 'Capo: ');
      const capo = strSlice(
        element.value,
        'Capo: ',
        '\nTotal fight power left: '
      );
      const tfp = strSliceEND(
        element.value,
        'Total fight power left: ',
        '\n',
        element.value.length
      );
      datas.enemy.push({ name: element.name, status: true, team, capo, tfp });
    }
  });

  const building = new Building({
    your: datas.your,
    enemy: datas.enemy,
  });
  const res = await building.save();
  return res;
}

async function loadBuildingModule() {
  const building = await Building.findOne({}).sort({ Date: -1 }).limit(1);
  return building;
}

module.exports = {
  pointParseModule,
  attackParseModule,
  buildingParseModule,
  loadAttackModule,
  loadBuildingModule,
};

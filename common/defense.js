const AttackSchema = require('../models/Schemas/AttackSchema');
const latest = async (filter = {}) => {
  let rows = await AttackSchema.find(filter).sort({ Date: -1 }).limit(1);
  return rows.shift();
};

const totalsCalculation = async (record, field) => {
  let set = 0;
  let notSet = 0;

  record.Datas.forEach((data) => {
    let num = data[field];
    if (typeof num === 'string') num = Number.parseInt(num);
    if (num === 0) {
      notSet++;
    } else {
      set++;
    }
  });

  return { notSet: notSet, set: set };
};

const getTotalAttack = async (filter = {}) => {
  let record = await latest(filter);
  if (!record) return null;

  return totalsCalculation(record, 'attack');
};
const getTotalDefense = async (filter = {}) => {
  let record = await latest(filter);
  if (!record) return null;

  return totalsCalculation(record, 'defense');
};

module.exports = {
  latest,
  getTotalDefense,
  getTotalAttack,
};

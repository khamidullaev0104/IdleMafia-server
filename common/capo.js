const CapoSchema = require('../models/Schemas/CapoSchema');

const loadCaposList = async () => {
  const DEFAULT_CAPO_NAME = 'new capo';
  const data = await CapoSchema.aggregate([
    {
      $addFields: {
        defaultName: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: [{ $toLower: '$Name' }, DEFAULT_CAPO_NAME.toLowerCase()],
                },
                then: 1,
              },
            ],
            default: 0,
          },
        },
      },
    },
    {
      $sort: {
        defaultName: -1,
        Name: 1,
      },
    },
  ]);

  return data;
};

module.exports = { loadCaposList };

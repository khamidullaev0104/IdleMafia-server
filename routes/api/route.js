const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { getTotalDefense, getTotalAttack } = require('../../common/defense');
const { OFF_SEASON } = require('../../config/string');
const {
  getLevelResult,
  getLevelResultFromDB,
} = require('../../controller/level');
const {
  getPointResult,
  getPointResultFromDB,
} = require('../../controller/point');
const {
  getAttackResult,
  getAttackResultFromDB,
  loadAttackResult,
} = require('../../controller/attack');
const {
  getBuildingResult,
  getBuildingResultFromDB,
  loadBuildingResult,
} = require('../../controller/building');

const sendMessageToChannel = require('../../common/sendMessage');
const getChannelID = require('../../common/getChannelID');
const {
  login,
  register,
  getUserById,
  removeUserbyID,
} = require('../../common/auth');
const { loadBuildingModule } = require('../../common/countBuildings');
const {
  getTotalNumberOfGangMember,
  memberRankByFP,
  getTimeUntilGW,
} = require('../../common/other');
const { CHANNEL_ID, BOTFATHER_ID, TOKEN } = require('../../config/constants');
const { SUCCESS_USERREMOVE } = require('../../config/string');
const CapoSchema = require('../../models/Schemas/CapoSchema');

//////////////////////////////////////// Functions ////////////////////////////////////////

function successResponse(res, data) {
  return res.status(200).json({ status: true, message: 'Success', data });
}

function errorResponse(res, message, error) {
  if (error) {
    console.log(error);
  }
  return res.status(200).json({ status: false, message, err: error });
}

router.post(
  '/login',
  check('username', 'Name is required').notEmpty(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ status: false, message: 'login error', err: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const ret = await login(username, password);
      if (typeof ret !== 'object')
        return res.status(200).json({ status: false, message: ret });
      return res
        .status(200)
        .json({ status: true, message: 'login success', data: ret });
    } catch (err) {
      console.log(err);
      return res
        .status(200)
        .json({ status: false, message: 'login error', err });
    }
  }
);

router.post('/getUserbyId', async (req, res) => {
  try {
    const ret = await getUserById(req.body.id);
    if (typeof ret !== 'object')
      return res.status(200).json({ status: false, message: ret });
    return res
      .status(200)
      .json({ status: true, message: 'getUserbyId success', data: ret });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'getUserbyId error', err });
  }
});

router.post('/removeUserbyID', async (req, res) => {
  try {
    const ret = await removeUserbyID(req.body.id);
    if (ret === SUCCESS_USERREMOVE)
      return res.status(200).json({ status: true, message: ret });
    return res.status(200).json({ status: false, message: ret });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'getUserbyId error', err });
  }
});

router.post(
  '/register',
  check('username', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Please enter a password with 6 or more characters'
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ status: false, message: 'login error', err: errors.array() });
    }

    const { username, email, password, timezone } = req.body;
    try {
      const ret = await register(username, email, password, timezone);
      if (typeof ret !== 'object') {
        return res.status(200).json({ status: false, message: ret });
      }

      return res
        .status(200)
        .json({ status: true, message: 'register success', data: ret });
    } catch (err) {
      console.log(err);
      return res
        .status(200)
        .json({ status: false, message: 'register error', err });
    }
  }
);

router.post('/createMessage', async (req, res) => {
  const { message } = req.body;
  try {
    await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, message);
    await new Promise((r) => setTimeout(r, 300));
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);

    let data;
    switch (message) {
      case 'level':
        data = await getLevelResult(TOKEN, BotfatherChannelId);
        break;
      case 'point':
        data = await getPointResult(TOKEN, BotfatherChannelId);
        break;
      case 'attack':
        data = await getAttackResult(TOKEN, BotfatherChannelId);
        break;
      case 'building':
        data = await getBuildingResult(TOKEN, BotfatherChannelId);
        break;
    }

    return res
      .status(200)
      .json({ status: true, message: 'send message to channel Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'createMessage error', err });
  }
});

router.post('/sendMessageOnly', async (req, res) => {
  try {
    const { message } = req.body;
    await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, message);
    return res.status(200).json({ status: true, message: 'Success' });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'sendMessageOnly error', err });
  }
});

router.post('/getLevel', async (req, res) => {
  try {
    await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, 'level');
    await new Promise((r) => setTimeout(r, 300));
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getLevelResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getLevel error', err });
  }
});

router.post('/getLevelWithoutSend', async (req, res) => {
  try {
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getLevelResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getLevel error', err });
  }
});

router.post('/getPoint', async (req, res) => {
  try {
    await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, 'point');
    await new Promise((r) => setTimeout(r, 300));
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getPointResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getPoint error', err });
  }
});

router.post('/getPointWithoutSend', async (req, res) => {
  try {
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getPointResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getPoint error', err });
  }
});

router.post('/getAttack', async (req, res) => {
  try {
    await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, 'attack');
    await new Promise((r) => setTimeout(r, 300));
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getAttackResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    if (data === OFF_SEASON)
      return res
        .status(200)
        .json({ status: false, message: 'Not in GW. ' + OFF_SEASON });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getAttack error', err });
  }
});

router.get('/attack', async (req, res) => {
  try {
    const data = await loadAttackResult();
    if (data === null || data === undefined)
      return errorResponse(res, 'loadAttack error', null);
    return successResponse(res, data);
  } catch (err) {
    console.log(err);
    return errorResponse(res, 'loadAttack error', err);
  }
});

router.post('/getAttackWithoutSend', async (req, res) => {
  try {
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getAttackResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    if (data === OFF_SEASON)
      return res
        .status(200)
        .json({ status: false, message: 'Not in GW. ' + OFF_SEASON });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getAttack error', err });
  }
});

router.post('/getBuilding', async (req, res) => {
  try {
    await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, 'building');
    await new Promise((r) => setTimeout(r, 300));
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getBuildingResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    if (data === OFF_SEASON)
      return res
        .status(200)
        .json({ status: false, message: 'Not in GW. ' + OFF_SEASON });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getBuilding error', err });
  }
});

router.post('/getBuildingWithoutSend', async (req, res) => {
  try {
    const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not get channel ID',
      });
    const data = await getBuildingResult(TOKEN, BotfatherChannelId);
    if (data === null || data === undefined)
      return res.status(200).json({
        status: false,
        message: 'Channel Error- Can not access in DM',
      });
    if (data === OFF_SEASON)
      return res
        .status(200)
        .json({ status: false, message: 'Not in GW. ' + OFF_SEASON });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getBuilding error', err });
  }
});

router.post('/getLevelResultFromDB', async (req, res) => {
  try {
    const { date } = req.body;
    const data = await getLevelResultFromDB(date);
    if (
      data === null ||
      data === undefined ||
      (Array.isArray(data) === true && data.length === 0)
    )
      return res.status(200).json({
        status: false,
        message: 'Empty DB for Level Result',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getLevelResultFromDB error', err });
  }
});

router.post('/getPointResultFromDB', async (req, res) => {
  try {
    const { date } = req.body;
    const data = await getPointResultFromDB(date);
    if (
      data === null ||
      data === undefined ||
      (Array.isArray(data) === true && data.length === 0)
    )
      return res.status(200).json({
        status: false,
        message: 'Empty DB for Point Result',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getPointResultFromDB error', err });
  }
});

router.post('/getAttackResultFromDB', async (req, res) => {
  try {
    const { date } = req.body;
    const data = await getAttackResultFromDB(date);
    if (
      data === null ||
      data === undefined ||
      (Array.isArray(data) === true && data.length === 0)
    )
      return res.status(200).json({
        status: false,
        message: 'Empty DB for Attack Result',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getAttackResultFromDB error', err });
  }
});

router.post('/getBuildingResultFromDB', async (req, res) => {
  try {
    const { date } = req.body;
    const data = await getBuildingResultFromDB(date);
    if (
      data === null ||
      data === undefined ||
      (Array.isArray(data) === true && data.length === 0)
    )
      return res.status(200).json({
        status: false,
        message: 'Empty DB for Building Result',
      });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getBuildingResultFromDB error', err });
  }
});

router.post('/getTotalMembers', async (req, res) => {
  try {
    const data = await getTotalNumberOfGangMember();
    if (data === null || data === undefined)
      return res.status(200).json({ status: false, message: 'Empty DB' });
    return res
      .status(200)
      .json({ status: true, message: 'Success', data: data.Datas.length });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getTotalMembers error', err });
  }
});

router.post('/getRankByFP', async (req, res) => {
  try {
    const data = await memberRankByFP();
    if (data === null || data.length === 0)
      return errorResponse(res, 'Empty DB', null);
    return successResponse(res, data.Datas);
  } catch (err) {
    console.log(err);
    return errorResponse(res, 'getRankByFP error', err);
  }
});

router.post('/getTotalMembers', async (req, res) => {
  try {
    const data = await getTotalNumberOfGangMember();
    if (data === null || data === undefined)
      return res.status(200).json({ status: false, message: 'Empty DB' });
    return res
      .status(200)
      .json({ status: true, message: 'Success', data: data.Datas.length });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getTotalMembers error', err });
  }
});

router.get('/defense/total', async (req, res) => {
  try {
    const data = await getTotalDefense();
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get total defense', err);
  }
});
router.get('/attack/total', async (req, res) => {
  try {
    const data = await getTotalAttack();
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get total attack', err);
  }
});

router.get('/building', async (req, res) => {
  try {
    const data = await loadBuildingResult();
    return successResponse(res, data);
  } catch (err) {
    console.log(err);
    return errorResponse(res, 'loadBuilding error', err);
  }
});

router.get('/timeUntilGW', async (req, res) => {
  try {
    const data = await getTimeUntilGW();
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get time until GW', err);
  }
});

router.get('/getBuildingInfo', async (req, res) => {
  try {
    const data = await loadBuildingModule();
    if (data === false)
      return errorResponse(res, 'Empty DB', 'Building collection is empty');
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get time until GW', err);
  }
});

router.get('/capos', async (req, res) => {
  try {
    const data = await CapoSchema.find({});
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get capos', err);
  }
});

router.post(
  '/capos/delete',
  check('id', 'capo id is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Failed to delete capo', errors);
    }

    const { id } = req.body;
    try {
      await CapoSchema.findByIdAndDelete(id);
      return successResponse(res);
    } catch (err) {
      return errorResponse(res, 'Failed to delete capo', err);
    }
  }
);

router.post(
  '/capos/update',
  check('id', 'capo id is required').notEmpty(),
  check('name', 'capo id is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Failed to update capo', errors);
    }

    const { id, name } = req.body;
    try {
      await CapoSchema.findByIdAndUpdate(id, { Name: name });

      return successResponse(res);
    } catch (err) {
      return errorResponse(res, 'Failed to update capo', err);
    }
  }
);

module.exports = router;

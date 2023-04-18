const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { getTotalDefense, getTotalAttack } = require('../../common/defense');
const WAITTIME_BEFORE_PARSE = 10 * 1000;
const {
  ERROR_GET_CHANNELID,
  ERROR_EMPTY_DB,
  PERMISSION_ADMIN,
  ERROR_PERMISSION_ADMIN,
  SUCCESS_REGISTER_BUT_NOT_ALLOW,
  SUCCESS_SENT_PASSWORDCHANGEREQUEST,
} = require('../../config/string');
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
const { getUserDiscordToken } = require('../../common/discord');

const {
  login,
  register,
  getUserById,
  getUsers,
  changeUserInfo,
  removeUserbyID,
  changeUserInfoByAdmin,
  getPermission,
  getUsersForNotification,
  setPasswordChangeRequest,
} = require('../../common/auth');
const { loadBuildingModule } = require('../../common/countBuildings');
const {
  getTotalNumberOfGangMember,
  memberRankByFP,
  getTimeUntilGW,
  getDatesFromCommandDB,
} = require('../../common/other');

const { loadCaposList } = require('../../common/capo');
const { CHANNEL_ID, BOTFATHER_ID } = require('../../config/constants');
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

router.post('/getUsers', async (req, res) => {
  try {
    const permission = await getPermission(req.body.id);
    if (permission !== PERMISSION_ADMIN)
      return res
        .status(200)
        .json({ status: false, message: ERROR_PERMISSION_ADMIN });
    const ret = await getUsers();
    if (typeof ret !== 'object')
      return res.status(200).json({ status: false, message: ret });
    return res
      .status(200)
      .json({ status: true, message: 'getUserbyId success', data: ret });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'getUsers error', err });
  }
});

router.post(
  '/changeUserInfo',
  check('info.username', 'Name is required').notEmpty(),
  check('info.email', 'Please include a valid email').isEmail(),
  check(
    'info.isPasswordChange',
    'isPasswordChange variable is required'
  ).notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res
          .status(200)
          .json({ status: false, message: errors.array()[0].msg });

      const ret = await changeUserInfo(req.body.info);
      if (typeof ret !== 'object')
        return res.status(200).json({ status: false, message: ret });
      return res
        .status(200)
        .json({ status: true, message: 'success', data: ret });
    } catch (err) {
      console.error(err.message);
      return res
        .status(500)
        .send({ status: false, message: 'changeUserInfo error', err });
    }
  }
);

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
        .json({ status: false, message: errors.array()[0].msg });
    }

    const { username, email, password, timezone } = req.body;
    try {
      const ret = await register(username, email, password, timezone);
      if (typeof ret !== 'object') {
        return res.status(200).json({ status: false, message: ret });
      }

      return res.status(200).json({
        status: true,
        message: SUCCESS_REGISTER_BUT_NOT_ALLOW,
        data: ret,
      });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    await sendMessageToChannel(discordToken, CHANNEL_ID, BOTFATHER_ID, message);
    await new Promise((r) => setTimeout(r, WAITTIME_BEFORE_PARSE));
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res
        .status(200)
        .json({ status: false, message: ERROR_GET_CHANNELID });
    let data;
    switch (message) {
      case 'level':
        data = await getLevelResult(
          discordToken,
          BotfatherChannelId,
          req.headers['x-user-id']
        );
        break;
      case 'point':
        data = await getPointResult(discordToken, BotfatherChannelId);
        break;
      case 'attack':
        data = await getAttackResult(discordToken, BotfatherChannelId);
        break;
      case 'building':
        data = await getBuildingResult(discordToken, BotfatherChannelId);
        break;
    }

    return res.status(200).json({ status: true, message: 'success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'createMessage error', err });
  }
});

router.post('/sendMessageOnly', async (req, res) => {
  const { message } = req.body;
  try {
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    await sendMessageToChannel(discordToken, CHANNEL_ID, BOTFATHER_ID, message);
    return res.status(200).json({ status: true, message: 'Success' });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'sendMessageOnly error', err });
  }
});

router.post('/getLevelWithoutSend', async (req, res) => {
  try {
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getLevelResult(
      discordToken,
      BotfatherChannelId,
      req.headers['x-user-id']
    );
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    await sendMessageToChannel(discordToken, CHANNEL_ID, BOTFATHER_ID, 'point');
    await new Promise((r) => setTimeout(r, WAITTIME_BEFORE_PARSE));
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getPointResult(discordToken, BotfatherChannelId);
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getPointResult(discordToken, BotfatherChannelId);
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    await sendMessageToChannel(
      discordToken,
      CHANNEL_ID,
      BOTFATHER_ID,
      'attack'
    );
    await new Promise((r) => setTimeout(r, 1000));
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getAttackResult(discordToken, BotfatherChannelId);
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getAttackResult(discordToken, BotfatherChannelId);
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    await sendMessageToChannel(
      discordToken,
      CHANNEL_ID,
      BOTFATHER_ID,
      'building'
    );
    await new Promise((r) => setTimeout(r, 1000));
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getBuildingResult(discordToken, BotfatherChannelId);
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    const discordToken = await getUserDiscordToken(req.headers['x-user-id']);
    const BotfatherChannelId = await getChannelID(discordToken, BOTFATHER_ID);
    if (BotfatherChannelId === undefined)
      return res.status(200).json({
        status: false,
        message: ERROR_GET_CHANNELID,
      });
    const data = await getBuildingResult(discordToken, BotfatherChannelId);
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getBuilding error', err });
  }
});

router.get('/getPointResultFromDB', async (req, res) => {
  try {
    const data = await getPointResultFromDB(req.query.date ?? '-1');
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getPointResultFromDB error', err });
  }
});

router.get('/getAttackResultFromDB', async (req, res) => {
  try {
    const data = await getAttackResultFromDB(req.query.date ?? '-1');
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getAttackResultFromDB error', err });
  }
});

router.get('/getBuildingResultFromDB', async (req, res) => {
  try {
    const data = await getBuildingResultFromDB(req.query.date ?? '-1');
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: data });
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
    if (typeof data !== 'object')
      return res.status(200).json({ status: false, message: ERROR_EMPTY_DB });
    return res.status(200).json({
      status: true,
      message: 'Success',
      data: data ? data.Datas.length : 0,
    });
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
      return errorResponse(res, ERROR_EMPTY_DB, null);
    return successResponse(res, data.Datas);
  } catch (err) {
    console.log(err);
    return errorResponse(res, 'getRankByFP error', err);
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
    if (data === false) return errorResponse(res, ERROR_EMPTY_DB, null);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get time until GW', err);
  }
});

router.get('/capos', async (req, res) => {
  try {
    const data = await loadCaposList();
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
  '/capos/patch',
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

router.get('/level', async (req, res) => {
  try {
    const data = await getLevelResultFromDB(req.query.date ?? '-1');
    if (typeof data !== 'object') return errorResponse(res, data);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, 'Failed to get level result from DB', err);
  }
});

router.post('/changeUserInfoByAdmin', async (req, res) => {
  try {
    const { id, user } = req.body;
    const permission = await getPermission(id);
    if (permission !== PERMISSION_ADMIN)
      return res
        .status(200)
        .json({ status: false, message: ERROR_PERMISSION_ADMIN });
    const ret = await changeUserInfoByAdmin(user);
    if (typeof ret !== 'object')
      return res.status(200).json({ status: false, message: ret });
    return res.status(200).json({
      status: true,
      message: 'changeUserInfoByAdmin success',
      data: ret,
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'changeUserInfoByAdmin error', err });
  }
});

router.post('/removeUserByAdmin', async (req, res) => {
  try {
    const { id, userID } = req.body;
    const permission = await getPermission(id);
    if (permission !== PERMISSION_ADMIN)
      return res
        .status(200)
        .json({ status: false, message: ERROR_PERMISSION_ADMIN });
    const ret = await removeUserbyID(userID);
    if (ret === SUCCESS_USERREMOVE)
      return res.status(200).json({ status: true, message: ret });
    return res.status(200).json({ status: false, message: ret });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'removeUser error', err });
  }
});

router.post('/isAdmin', async (req, res) => {
  try {
    const { id } = req.body;
    const permission = await getPermission(id);
    if (permission !== PERMISSION_ADMIN)
      return res.status(200).json({ status: false, data: false });
    return res.status(200).json({ status: true, data: true });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'removeUser error', err });
  }
});

router.post('/PasswordChangeRequest', async (req, res) => {
  try {
    const { username } = req.body;
    const ret = await setPasswordChangeRequest(username);
    if (ret === true)
      return res
        .status(200)
        .json({ status: true, message: SUCCESS_SENT_PASSWORDCHANGEREQUEST });
    return res.status(200).json({ status: false, message: ret });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'PasswordChangeRequest error', err });
  }
});

router.post('/getUsersForNotification', async (req, res) => {
  try {
    const permission = await getPermission(req.body.id);
    if (permission !== PERMISSION_ADMIN)
      return res
        .status(200)
        .json({ status: false, message: ERROR_PERMISSION_ADMIN });
    const ret = await getUsersForNotification();
    if (typeof ret !== 'object')
      return res.status(200).json({ status: false, message: ret });
    return res.status(200).json({
      status: true,
      message: 'getUsersForNotification success',
      data: ret,
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(500)
      .send({ status: false, message: 'getUsersForNotification error', err });
  }
});

router.post('/getDatesFromCommandDB', async (req, res) => {
  try {
    const { id, type } = req.body;
    const permission = await getPermission(id);
    if (permission !== PERMISSION_ADMIN)
      return res
        .status(200)
        .json({ status: false, message: ERROR_PERMISSION_ADMIN });
    const data = await getDatesFromCommandDB(type);
    if (typeof data === 'string')
      return res.status(200).json({ status: false, message: data });
    return res.status(200).json({ status: true, message: 'Success', data });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status: false, message: 'getDatesFromCommandDB error', err });
  }
});
module.exports = router;

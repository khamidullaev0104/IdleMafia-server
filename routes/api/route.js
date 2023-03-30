const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const { getLevelResult } = require('../../controller/level')
const { getPointResult } = require('../../controller/point')
const { getAttackResult } = require('../../controller/attack')
const { getBuildingResult } = require('../../controller/building')

const sendMessageToChannel = require('../../common/sendMessage')
const getChannelID = require('../../common/getChannelID')
const login = require('../../common/login')
const register = require('../../common/register')
const { getUserInfoById } = require('../../common/other');

const { CHANNEL_ID, BOTFATHER_ID, TOKEN} = require('../../config/constants');
const Building = require('../../models/Building');

///////////////////////////////////////// POST requests ////////////////////////////////////////

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
      return res.status(200).json({ status: false, message: "login error", err: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const ret = await login(username, password);
      if (typeof ret.user === 'undefined') {
        return res.status(200).json({ status: false, message: "login error", err: ret});
      }
      return res.status(200).json({ status: true, message: 'login success', data: ret});
    } catch (err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "login error", err});
    }
  }
);

router.post('/getUserbyId', 
  async (req, res) => {
    try {
      const user = await getUserInfoById(req.body.id); 
      return res.status(200).json({ status: true, message: 'getUserbyId success', data: user});
    } catch (err) {
      console.error(err.message);
      return res.status(500).send({ status: false, message: "getUserbyId error", err});
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
      return res.status(200).json({ status: false, message: "login error", err: errors.array() });
    }
    
    const { username, email, password } = req.body;
    try {
      const ret = await register(username, email, password);
      if (typeof ret.user === 'undefined') {
        return res.status(200).json({ status: false, errors: "register error",  err: ret });
      }
      return res.status(200).json({ status: true, message: 'register success', data: ret});
    } catch (err) {
      console.log(err)
      return res.status(200).json({ status: false, errors: "register error", err});
    }
  }
);

///////////////////////////////////////////////////////////////GET requests /////////////////////////
router.get(
  '/createMessage',
  async (req, res) => {
    const { message } = req.body;
    console.log("createMessage function excution")
    try {
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, message);
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      
      let data ;
      switch(message) {
        case "level":
          data = await getLevelResult(TOKEN, BotfatherChannelId);
          break;
        case "point":
          data = await getPointResult(TOKEN, BotfatherChannelId);
          break;
        case "attack":
          data = await getAttackResult(TOKEN, BotfatherChannelId);
          break;
        case "building":
          data = await getBuildingResult(TOKEN, BotfatherChannelId);
          break;
      }
      
      return res.status(200).json({ status: true, message: "send message to channel Success", data });
    } catch(err) {
      console.log(err);
      return res.status(200).json({ status: false, message: "createMessage error", err});
    }
  }
  );
  
  router.get(
    '/getLevel',
    async (req, res) => {
    try{
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, "level");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getLevelResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getLevel error", err});
    }  
    
  }
  );
  
  router.get(
    '/getLevelWithoutSend',
    async (req, res) => {
      try{
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getLevelResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getLevel error", err});
    }  
    
  }
);

router.get(
  '/sendMessageOnly',
  async (req, res) => {
    try{
      const { message } = req.body;
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, message);
      return res.status(200).json({ status: true, message: "Success" });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getBuilding error", err});
    }  
  
  }
);


router.get(
  '/getPoint',
  async (req, res) => {
    try{
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, "point");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getPointResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getPoint error", err});
    }  
  
  }
);

router.get(
  '/getPointWithoutSend',
  async (req, res) => {
    try{
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getPointResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getPoint error", err});
    }  
  
  }
);

router.get(
  '/getAttack',
  async (req, res) => {
    try{
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, "attack");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getAttackResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getAttack error", err});
    }  
  
  }
);

router.get(
  '/getAttackWithoutSend',
  async (req, res) => {
    try{
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getAttackResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getAttack error", err});
    }  
  
  }
);

router.get(
  '/getBuilding',
  async (req, res) => {
    try{
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, "building");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getBuildingResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getBuilding error", err});
    }  
  
  }
);

router.get(
  '/getBuildingWithoutSend',
  async (req, res) => {
    try{
      const BotfatherChannelId = await getChannelID(TOKEN, BOTFATHER_ID);
      const data = await getBuildingResult(TOKEN, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getBuilding error", err});
    }  
  
  }
);

router.get(
    '/building',
    async (req, res) => {
        let result = await Building.findOne();
        return res.status(200).json({ status: true, message: "Success", result });
    }
);

module.exports = router;

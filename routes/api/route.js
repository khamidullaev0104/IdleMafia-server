const express = require('express');
const router = express.Router();
const axios = require("axios");
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

///////////////////////////////////////// POST request ////////////////////////////////////////

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
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const ret = await login(username, password);
      if (typeof ret.user === 'undefined') {
        return res.status(400).json({ status: false, message: ret});
      }
      return res.status(200).json({ status: true, message: 'login success', data: ret});
    } catch (err) {
      console.log(err)
      return res.status(400).json({ status: false, message: "login error", err});
    }
  }
);

router.get('/getUserbyId', 
  async (req, res) => {
    try {
      const user = await getUserInfoById(req.user.id); 
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
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
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, password } = req.body;
    try {
      const ret = await register(username, email, password);
      if (typeof ret.user === 'undefined') {
        return res.status(400).json({ status: false, message: ret});
      }
      return res.status(200).json({ status: true, message: 'register success'});
    } catch (err) {
      console.log(err)
      return res.status(400).json({ status: false, errors: "register error"});
    }
  }
);

router.post(
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
      return res.status(200).json({ status: false, errors: "createMessage error", err});
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
      return res.status(200).json({ status: false, errors: "getLevel error", err});
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
      return res.status(200).json({ status: false, errors: "getLevel error", err});
    }  
    
  }
);

router.post(
  '/sendMessageOnly',
  async (req, res) => {
    try{
      const { message } = req.body;
      await sendMessageToChannel(TOKEN, CHANNEL_ID, BOTFATHER_ID, message);
      return res.status(200).json({ status: true, message: "Success" });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, errors: "getBuilding error", err});
    }  
  
  }
);

///////////////////////////////////////////////////////////////GET request /////////////////////////

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
      return res.status(200).json({ status: false, errors: "getPoint error", err});
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
      return res.status(200).json({ status: false, errors: "getPoint error", err});
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
      return res.status(200).json({ status: false, errors: "getAttack error", err});
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
      return res.status(200).json({ status: false, errors: "getAttack error", err});
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
      return res.status(200).json({ status: false, errors: "getBuilding error", err});
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
      return res.status(200).json({ status: false, errors: "getBuilding error", err});
    }  
  
  }
);


module.exports = router;

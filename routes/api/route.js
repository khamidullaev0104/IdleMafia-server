const express = require('express');
const router = express.Router();

const { getLevelResult } = require('../../controller/level')
const { getPointResult } = require('../../controller/point')
const { getAttackResult } = require('../../controller/attack')
const { getBuildingResult } = require('../../controller/building')

const sendMessageToChannel = require('../../common/sendMessage')
const getChannelID = require('../../common/getChannelID')
const { loginByEmailPassword, getProfileFromToken } = require('../../common/login')

const { CHANNEL_ID, BOTFATHER_ID} = require('../../config/constants');

router.post(
  '/auth',
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const ret = await loginByEmailPassword(email, password);
      if (ret.data.token !== "undefined") {
        const resMe = await getProfileFromToken(ret.data.token);
        
        resMe.data.token = ret.data.token;
        return res.status(200).json({ status: true, message: 'Login success' , data: resMe.data});
      } else {
        return res.status(200).json({ status: false, message: 'Login error'});
      }
    } catch (err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "auth function error"});
    }
  }
);

router.post(
  '/createMessage',
  async (req, res) => {
    const { message, token, email } = req.body;
    console.log("createMessage function excution")
    try {
      await sendMessageToChannel(token, CHANNEL_ID, BOTFATHER_ID, message);
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      
      let data ;
      switch(message) {
        case "level":
          data = await getLevelResult(email, token, BotfatherChannelId);
          break;
        case "point":
          data = await getPointResult(token, BotfatherChannelId);
          break;
        case "attack":
          data = await getAttackResult(token, BotfatherChannelId);
          break;
        case "building":
          data = await getBuildingResult(token, BotfatherChannelId);
          break;
      }
      
      return res.status(200).json({ status: true, message: "send message to channel Success", data });
    } catch(err) {
      console.log(err);
      return res.status(200).json({ status: false, message: "createMessage error", err});
    }
  }
);

router.post(
  '/getLevel',
  async (req, res) => {
    try{
      const { token, email } = req.body;
      await sendMessageToChannel(token, CHANNEL_ID, BOTFATHER_ID, "level");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getLevelResult(email, token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getLevel error", err});
    }  
  
    }
);

router.post(
  '/getLevelWithoutSend',
  async (req, res) => {
    try{
      const { token, email } = req.body;
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getLevelResult(email, token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getLevel error", err});
    }  
  
    }
);

router.post(
  '/getPoint',
  async (req, res) => {
    try{
      const { token } = req.body;
      await sendMessageToChannel(token, CHANNEL_ID, BOTFATHER_ID, "point");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getPointResult(token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getPoint error", err});
    }  
  
  }
);

router.post(
  '/getPointWithoutSend',
  async (req, res) => {
    try{
      const { token } = req.body;
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getPointResult(token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getPoint error", err});
    }  
  
  }
);

router.post(
  '/getAttack',
  async (req, res) => {
    try{
      const { token } = req.body;
      await sendMessageToChannel(token, CHANNEL_ID, BOTFATHER_ID, "attack");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getAttackResult(token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getAttack error", err});
    }  
  
  }
);

router.post(
  '/getAttackWithoutSend',
  async (req, res) => {
    try{
      const { token } = req.body;
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getAttackResult(token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getAttack error", err});
    }  
  
  }
);

router.post(
  '/getBuilding',
  async (req, res) => {
    try{
      const { token } = req.body;
      await sendMessageToChannel(token, CHANNEL_ID, BOTFATHER_ID, "building");
      await new Promise(r => setTimeout(r, 300));
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getBuildingResult(token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getBuilding error", err});
    }  
  
  }
);

router.post(
  '/getBuildingWithoutSend',
  async (req, res) => {
    try{
      const { token } = req.body;
      const BotfatherChannelId = await getChannelID(token, BOTFATHER_ID);
      const data = await getBuildingResult(token, BotfatherChannelId);
      return res.status(200).json({ status: true, message: "Success", data });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getBuilding error", err});
    }  
  
  }
);

router.post(
  '/sendMessageOnly',
  async (req, res) => {
    try{
      const { token, message } = req.body;
      await sendMessageToChannel(token, CHANNEL_ID, BOTFATHER_ID, message);
      return res.status(200).json({ status: true, message: "Success" });
    } catch(err) {
      console.log(err)
      return res.status(200).json({ status: false, message: "getBuilding error", err});
    }  
  
  }
);

module.exports = router;

const connectDB = require('../config/db');
const getChannelID = require('../common/getChannelID');
require('dotenv').config();

const { axiosGetChannel } = require('../common/axiosFunctions');
const CapoSchema = require('../models/Schemas/CapoSchema');
const sharp = require('sharp');
const path = require('path');
const request = require('request-promise');
const Jimp = require('jimp');
const fs = require('fs');

async function OnDbConnected() {
  if (process.env.DEBUG ?? false) console.log(`OnDbConnected`);
  const H_GANG_MEMBER = 73;
  const W_GANG_MEMBER = 70;
  const W_SPACE_BETWEEN_GANG_MEMBER = 40;
  const H_G = 200;
  const maxI = 10;

  const BotfatherChannelId = await getChannelID(
    process.env.DISCORD_TOKEN,
    process.env.BOTFATHER_ID
  );

  for (let i = 0; i < maxI; i++) {
    let res_msg = await axiosGetChannel('messages', BotfatherChannelId, [
      ['limit', i + 1],
    ]);

    if (!res_msg.data[i].attachments.length) {
      console.log('no attachments');
      break;
    }
    const res = await request({
      url: res_msg.data[i].attachments[0].url,
      encoding: null,
    });

    for (let indMember = 0; indMember < 5; indMember++) {
      let capos = await CapoSchema.find({});

      for (let ind = 0; ind < 5; ind++) {
        let options = {
          width: W_GANG_MEMBER,
          height: H_GANG_MEMBER,
          left: ind * (W_GANG_MEMBER + W_SPACE_BETWEEN_GANG_MEMBER),
          top: indMember * H_G + 60,
        };
        let timeNow = Date.now();
        let imageNname = `${timeNow}-${ind}.png`;
        let imagePath = path.join(
          process.env.PATH_ROOT,
          `data/img/capos/${imageNname}`
        );

        await sharp(res).extract(options).toFile(imagePath);

        let stats = fs.statSync(imagePath);
        if (stats.size < 500) {
          fs.unlinkSync(imagePath);
          break;
        }

        let match = false;
        let percent = 1;
        const testimage = await Jimp.read(`data/img/capos/${imageNname}`);

        for (const capo of capos) {
          const charImage = await Jimp.read(
            path.join(process.env.PATH_ROOT, `data/img/capos/${capo.Image_url}`)
          );
          percent = Jimp.diff(charImage, testimage).percent;
          if (percent < 40 / 100) {
            match = true;
            break;
          }
        }

        if (!match) {
          let NewCapo = new CapoSchema({
            Image_url: imageNname,
            Name: 'New capo',
          });
          await NewCapo.save();
          if (process.env.DEBUG ?? false) console.log(`New capo saved`);
        } else {
          fs.unlinkSync(imagePath);
        }
      }
    }

    if (res_msg.data[i].content.includes('Player rank, top 5 fight power,'))
      break;
  }

  process.exit();
}

connectDB().on('error', console.log).once('open', OnDbConnected);

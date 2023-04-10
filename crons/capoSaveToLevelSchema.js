const connectDB = require('../config/db');
require('dotenv').config();

const CapoSchema = require('../models/Schemas/CapoSchema');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs');
const LevelSchema = require('../models/Schemas/LevelSchema');

async function OnDbConnected() {
    if (process.env.DEBUG ?? false) console.log(`OnDbConnected`);

    let capos = await CapoSchema.find({});
    let levels = await LevelSchema.find({}).sort({Date: -1}).limit(10);
    if (process.env.DEBUG ?? false) console.log(`capos count ${capos.length}`);
    if (process.env.DEBUG ?? false) console.log(`levels count ${levels.length}`);

    for (const level of levels) {
        let newLevel = level;
        for (const character of level.Datas) {
            if (process.env.DEBUG ?? false) console.log(`Character ${character.name}`);

            for (const characterCapo of character.members) {

                for (const capo of capos) {
                    let capoExampleImgUrl = path.join(
                        process.env.PATH_ROOT,
                        `data/img/capos/${capo.Image_url}`
                    );
                    let capoImgUrl = path.join(
                        process.env.PATH_ROOT,
                        `data/img/capos/${characterCapo.img}`
                    );

                    if (!fs.existsSync(capoExampleImgUrl)) {
                        if (process.env.DEBUG ?? false)
                            console.log(`Capo example with broken image`);
                        break;
                    }

                    if (!fs.existsSync(capoImgUrl)) {
                        if (process.env.DEBUG ?? false) console.log(`Capo with broken image`);
                        break;
                    }
                    const testimage = await Jimp.read(capoExampleImgUrl);
                    const charImage = await Jimp.read(capoImgUrl);

                    let percent = Jimp.diff(charImage, testimage).percent;
                    if (percent < 40 / 100) {
                        characterCapo.name = capo.Name;
                        if (process.env.DEBUG ?? false) console.log(`Found capo with new name`);
                        break;
                    }

                }

            }
        }

        await LevelSchema.findByIdAndUpdate(level.id, {Datas: newLevel.Datas});
    }
    process.exit();
}

connectDB().on('error', console.log).once('open', OnDbConnected);

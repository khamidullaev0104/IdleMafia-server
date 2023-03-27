const sharp = require('sharp');
const fs = require('fs');
const Tesseract= require('tesseract.js');
const request = require("request-promise");
// constant
const DIR_PREFIX = "data/img/";
let DIR_PATH;

const H_GS = 10;
const H_GANG_NAME = 30;
const W_MAX = 512;
const H_GANG_MEMBER = 73;
const W_GANG_MEMBER = 70;
const W_SPACE_BETWEEN_GANG_MEMBER = 40;
const H_FP = 20;
const H_TOTAL_FP = 30;
const H_G = 200;
const H_SPACE_NEW_LINE = 20;
async function sharp_func(filePath, imgURL, position) {
    try {
        if(!fs.existsSync(filePath)) {
            const res = await request({ url: imgURL, encoding: null });
            await sharp(res)
                .extract(position)
                .toFile(filePath)
        }
    } catch (err) {
        console.log("parseImage.sharp_func error", err)
    }
}
async function getGangNameFromImage(indIMG, indMember, imgURL) {
    try {
        await sharp_func(
            DIR_PATH + indIMG + "-" + indMember + "-" + "Name.png", 
            imgURL, 
            { width: W_MAX - 50, height: H_GANG_NAME, left: 50, top: indMember * H_G + H_GS }
        ) 

        const ret = await Tesseract.recognize(
            DIR_PATH + indIMG + "-" + indMember + "-" + "Name.png",
            'eng'
        );
        console.log(ret.data.text)
        ret.data.text = ret.data.text.replace(" ——", "");
        console.log(ret.data.text)
        ret.data.text = ret.data.text.replace(" —", "");
        return ret.data.text.trim();
    } catch (error) {
        console.log("parseImage.getGangNameFromImage error", error);
    }
}

async function getGangMembersFromImage(indIMG, indMember, imgURL) {
    try {
        let members = [];
        for(let ind=0; ind<5; ind++) {
            let member = { img: "", fp: ""};
            member.img = DIR_PATH + indIMG + "-" + indMember + "-" + ind + "-" + "member.png";

            await sharp_func(
                member.img, 
                imgURL, 
                { width: W_GANG_MEMBER, height: H_GANG_MEMBER, left: ind*(W_GANG_MEMBER+W_SPACE_BETWEEN_GANG_MEMBER), top: indMember * H_G + 60 }
            );

            await sharp_func(
                DIR_PATH + indIMG + "-" + indMember + "-" + ind + "-" + "member-fp.png", 
                imgURL, 
                { width: W_GANG_MEMBER-5, height: H_FP, left: ind*(W_GANG_MEMBER+W_SPACE_BETWEEN_GANG_MEMBER)+5, top: indMember * H_G + 137}
            );

            const ret = await Tesseract.recognize(
                DIR_PATH + indIMG + "-" + indMember + "-" + ind + "-" + "member-fp.png",
                'eng'
            );
            member.fp = ret.data.text.trim();
            members.push(member);
        }
        return members;
    } catch (error) {
        console.log("parseImage.getGangMembersFromImage error", error);
    }
}

async function getTotalFPFromImage(indIMG, indMember, imgURL) {
    try {
        await sharp_func(
            DIR_PATH + indIMG + "-" + indMember + "-" +"FP.png", 
            imgURL, 
            { width: W_MAX, height: H_TOTAL_FP, left: 0, top: indMember * H_G + 170 }
        );
       
        const ret = await Tesseract.recognize(
            DIR_PATH + indIMG + "-" + indMember + "-" +"FP.png",
            'eng'
        );
        return ret.data.text.replace('Total:','').trim();
    } catch (error) {
        console.log("parseImage.getTotalFPFromImage error", error);
    }
}

async function parseFromImage(indIMG, imgURL, dataLevel) {
    try {
        for(let indMember = 0; indMember < 5; indMember ++) {
            let gangData = { name: "", members: [], tfp: ""};
            gangData.name = await getGangNameFromImage(indIMG, indMember, imgURL);
            if(gangData.name === "") break;
            gangData.members = await getGangMembersFromImage(indIMG, indMember, imgURL);
            gangData.tfp = await getTotalFPFromImage(indIMG, indMember, imgURL);
            dataLevel.push(gangData);
        }
        return dataLevel;
    } catch (e) {
        console.log("parseImage.parseFromImage error", e);
    }
}

async function getLevelCommand(index, imgURL, email) {
    let dataLevel = [];
    DIR_PATH = DIR_PREFIX + email + "/";
    // from images
    try {
        if (!fs.existsSync(DIR_PATH)) {
          fs.mkdirSync(DIR_PATH);
        }
        console.log(imgURL)
        dataLevel = await parseFromImage(index , imgURL, dataLevel);
        return dataLevel;
    } catch (err) {
        console.error("parseImage.getLevelCommand error", err);
    }
}

module.exports = getLevelCommand; 
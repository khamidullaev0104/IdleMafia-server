const axios = require("axios");

async function get( url ) {
    if(process.env.DEBUG ?? false)
        console.log('[axios]',url)

    return await axios.get(url,
        {
            headers: {
                authorization: process.env.DISCORD_TOKEN ?? "NO TOKEN ",
                'content-type': 'application/json',
            },
        }
    );
}

module.exports = {
    axiosGet:get
};
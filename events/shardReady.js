const Discord = require('discord.js')

module.exports = (client, shardid) => {
    let config = client.config
    let functions = client.functions

    console.log(`[Shard ${shardid}] Online in ${functions.addCommas(client.guilds.cache.size)} servers!`) // log ready event

    /* Set Status */
    client.shard.fetchClientValues('guilds.cache.size').then(res => { // We are fetching client values because this is a sharded bot setup

        let servers = functions.addCommas(res.reduce((prev, val) => prev + val, 0))

        let game = `fc!help | Fighting misinformation in ${servers} servers | Shard ${shardid}`

        client.user.setPresence({
            activity: {
                name: game,
            },
            status: "online"
        })

    })

    /* Update Status Every 15 Minutes */
    setInterval(() => {
        client.shard.fetchClientValues('guilds.cache.size').then(res => { // We are fetching client values because this is a sharded bot setup

            let servers = functions.addCommas(res.reduce((prev, val) => prev + val, 0))
    
            let game = `fc!help | Fighting misinformation in ${servers} servers | Shard ${shardid}`
    
            client.user.setPresence({
                activity: {
                    name: game,
                },
                status: "online"
            })
    
        })
    }, 900000)
}
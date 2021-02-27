const Discord = require("discord.js")
const functions = require("../utils/functions")
const config = require("../config")

module.exports = async (client, guild) => {
    console.log(`[Shard ${client.shard.ids[0]}] Left a guild called ${guild.name} (${guild.id}) [${guild.memberCount} members]`)
}

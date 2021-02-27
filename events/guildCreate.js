const Discord = require("discord.js")
const functions = require("../utils/functions")
const config = require("../config")

module.exports = async (client, guild) => {
    console.log(`[Shard ${client.shard.ids[0]}] Joined a guild called ${guild.name} (${guild.id}) [${guild.memberCount} members]`)

    /* Add To Database */
    let guildData = await functions.getGuild(guild, client)

    if (guildData) {
        console.log(`[MongoDB] Guild ${guild.name} (${guild.id}) is already in the database. Skipping document creation.`)
    } else {
        try {
            const newGuild = {
                guildID: guild.id
            };

            if (client.isCreating.includes(guild.id)) return;
            client.isCreating.push(guild.id)
            settings = await functions.createGuild(newGuild);
            client.guildSettings.set(guild.id, settings)
        } catch (err) {
            console.log(`[GuildCreate] Error creating guild document:`)
            console.error(err)
        }
    }
}

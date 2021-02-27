const Discord = require('discord.js');

exports.run = async (client, message, settings) => {
    let config = client.config
    let functions = client.functions

    let checkMessages = settings.checkMessages

    if (checkMessages) checkMessages = false
    else checkMessages = true

    await functions.updateGuild(message.guild.id, {checkMessages: checkMessages}, client)

    if (checkMessages) message.channel.send(`${config.emoji.on} Automatic fact checking enabled`)
    else message.channel.send(`${config.emoji.off} Automatic fact checking disabled`)
}

exports.help = {
    name: "toggle",
    usage: "toggle",
    aliases: [],
    description: "Toggle automatic fact checking",
    permissions: "perms",
    category: "info"
}
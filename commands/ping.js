const Discord = require('discord.js');

exports.run = async (client, message) => {
    let embed = new Discord.MessageEmbed()
    embed.setDescription(`⏱️ **Pong!** ${Math.floor(client.ws.ping)}ms Latency!`)
    embed.setColor("GREEN")

    message.channel.send(embed)
}

exports.help = {
    name: "ping",
    usage: "ping",
    aliases: ["latency","speed"],
    description: "Get the bot's latency",
    permissions: "all",
    category: "info"
}

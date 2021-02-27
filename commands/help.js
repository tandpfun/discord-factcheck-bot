const Discord = require('discord.js');

exports.run = async (client, message) => {
    let config = client.config
    let functions = client.functions

    let embed = new Discord.MessageEmbed()
    embed.setAuthor("FactCheq Commands", client.user.avatarURL())

    let commands = ""
    client.commands.forEach(cmd => {
        commands += `▸ \`fc!${cmd.help.usage}\` - ${cmd.help.description}\n`
    })

    embed.setDescription(`${commands}`)
    embed.setColor("BLUE")
    embed.setThumbnail(client.user.avatarURL())

    message.channel.send(embed)
}

exports.help = {
    name: "help",
    usage: "help",
    aliases: ["commands"],
    description: "Get a list of commands",
    permissions: "all",
    category: "info"
}

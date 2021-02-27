const Discord = require('discord.js');

exports.run = async (client, message, settings) => {
    let config = client.config
    let functions = client.functions

    let embed = new Discord.MessageEmbed()
    embed.setTitle(`📊 Detection Statistics`)
    embed.setDescription(`📥 **Messages Checked:** ${settings.messagesChecked}\n\n${config.emoji.no} **Detected False:** ${settings.messagesCheckedFalse} ${Math.floor((settings.messagesCheckedFalse/settings.messagesChecked)*100)}%\n${config.emoji.yes} **Detected True:** ${settings.messagesCheckedTrue} ${Math.floor((settings.messagesCheckedTrue/settings.messagesChecked)*100)}%\n❔ **Unknown/Ignored:** ${settings.messagesChecked - (settings.messagesCheckedTrue+settings.messagesCheckedFalse+settings.messagesCheckedDuplicate)} ${Math.floor(((settings.messagesChecked - (settings.messagesCheckedTrue+settings.messagesCheckedFalse+settings.messagesCheckedDuplicate))/settings.messagesChecked)*100)}%\n\n:two: **Checks Cached:** ${settings.messagesCheckedDuplicate} ${Math.floor((settings.messagesCheckedDuplicate/settings.messagesChecked)*100)}%\n${config.emoji.warn} **Errors Checking:** ${settings.messagesCheckedError} ${Math.floor((settings.messagesCheckedError/settings.messagesChecked)*100)}%`)
    embed.setColor("BLUE")
    
    message.channel.send(embed)

}

exports.help = {
    name: "stats",
    usage: "stats",
    aliases: ["statistics"],
    description: "Get detection statistics",
    permissions: "all",
    category: "info"
}

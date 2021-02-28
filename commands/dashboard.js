const Discord = require('discord.js');
const e = require('express');

exports.run = async (client, message, settings) => {
    let config = client.config
    let functions = client.functions

    let embed = new Discord.MessageEmbed()
    embed.setTitle(`📊 Server Statistics Dashboard`)
    embed.setDescription(`Click [here](http://localhost:8080/servers/${message.guild.id}) to go to the dashboard.`)
    embed.setColor("BLUE")
    
    message.channel.send(embed)

}

exports.help = {
    name: "dashboard",
    usage: "dashboard",
    aliases: ["dash"],
    description: "Get a link to the dashboard",
    permissions: "all",
    category: "info"
}

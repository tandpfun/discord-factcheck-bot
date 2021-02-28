const Discord = require('discord.js');

exports.run = async (client, message, settings) => {
    let config = client.config
    let functions = client.functions

    const users = settings.users.sort(function(a, b) {
        return b[1] - a[1];
    })
    
    let userList = ""
    let count = 0
    users.forEach(u => {
        count++
        if (count < 11) {
            userList += `${count}▸ <@${u[0]}> (${u[0]}) - ${u[1]} Detections\n`
        }
    })

    message.channel.send(functions.iembed(`📊 Top User Detections`, `${userList}`))
}

exports.help = {
    name: "topusers",
    usage: "topusers",
    aliases: ["leaderboard"],
    description: "Get the top users who post false information",
    permissions: "perms",
    category: "info"
}

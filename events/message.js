const Discord = require('discord.js') // DiscordJS
const axios = require("axios") // Axios
const fs = require("fs") // FileSync
const mongoose = require('mongoose'); // Database

let previousResponses = new Map() // Store previous reponses to prevent spam

module.exports = async (client, message) => {
    let config = client.config
    let functions = client.functions

    if (message.guild.id === "568957622808739841") return;

    if (!mongoose.connection.readyState) return; // Make sure that the bot is connected to the database!

    if (message.channel.type === "dm") return; // Make sure that the bot is not responding in DMs
    if (message.author.id === client.user.id) return; // Make sure the bot does not respond to itself
    if (message.author.bot) return; // Make sure the bot does not respond to other bots

    /* Get Guild Settings */
    let settings = await functions.getGuild(message.guild.id, client);

    /* If not in database, create document */
    if (!settings) {
        try {
            const newGuild = {
                guildID: message.guild.id
            };

            if (client.isCreating.includes(message.guild.id)) return;
            client.isCreating.push(message.guild.id)
            settings = await functions.createGuild(newGuild);
            client.guildSettings.set(message.guild.id, settings)
        } catch (err) {
            console.log(`[GuildCreate] Error creating guild document:`)
            console.error(err)
        }
    }

    let prefix = settings.prefix // The guild's prefix

    if (settings.checkMessages) {
        if (!message.content.startsWith(prefix)) {
            if (message.content.split(" ").length < 3) return;

            let tocheck = message.content.replace(/\b(actually|also|anyways|anyway|basically|literally|lol|haha|lmao|hehe|really|you|almost|basically|etc|lool|idk|iirc|)\b/gi, "")
            tocheck = tocheck.replace(/[^a-zA-Z0-9- -$]/gi, "")

            let chkdCount = settings.messagesChecked+1
            functions.updateGuild(message.guild.id, {messagesChecked: chkdCount}, client)

            if (previousResponses.get(tocheck)) {
                let data = previousResponses.get(tocheck)

                let prevCount = settings.messagesCheckedDuplicate+1
                functions.updateGuild(message.guild.id, {messagesCheckedDuplicate: prevCount}, client)

                if (data.claims) {
                    let claim = data.claims[0]
                    let review = data.claims[0].claimReview[0]
                    if (review.textualRating === "True") {
                        message.react(config.emoji.yes)
                        let trueCount = settings.messagesCheckedTrue+1
                        functions.updateGuild(message.guild.id, {messagesCheckedTrue: trueCount}, client)
                    } else {
                        let flseCount = settings.messagesCheckedFalse+1
                        functions.updateGuild(message.guild.id, {messagesCheckedFalse: flseCount}, client)
                        client.api.channels(message.channel.id).messages.post({
                            data: {
                                embed: {
                                    title: `${config.emoji.no} ${review.textualRating}`,
                                    description: `**False Fact:** ${claim.text}\n\n**📋 Proof:** ${review.title ? review.title : ""}\n🔗 ${review.url}`,
                                    color: 15158332,
                                    footer: {
                                        text: `Provided by ${review.publisher.site}`
                                    }
                                },
                                message_reference: { message_id: message.id },
                                allowed_mentions: {
                                    users: []
                                }
                            }
                        })
                    }
                }
            } else {
                axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
                    params: {
                        key: process.env.GOOGLE_API_KEY,
                        query: tocheck,
                        languageCode: "en-US",
                    }
                }).then(res => {
                    previousResponses.set(tocheck, res.data)
                    if (res.data.claims) {
                        let claim = res.data.claims[0]
                        let review = res.data.claims[0].claimReview[0]
                        if (review.textualRating === "True") {
                            message.react(config.emoji.yes)
                            let trueCount = settings.messagesCheckedTrue+1
                            functions.updateGuild(message.guild.id, {messagesCheckedTrue: trueCount}, client)
                        } else {
                            let flseCount = settings.messagesCheckedFalse+1
                            functions.updateGuild(message.guild.id, {messagesCheckedFalse: flseCount}, client)
                            client.api.channels(message.channel.id).messages.post({
                                data: {
                                    embed: {
                                        title: `${config.emoji.no} ${review.textualRating}`,
                                        description: `**False Fact:** ${claim.text}\n\n**📋 Proof:** ${review.title ? review.title : ""}\n🔗 ${review.url}`,
                                        color: 15158332,
                                        footer: {
                                            text: `Provided by ${review.publisher.site}`
                                        }
                                    },
                                    message_reference: { message_id: message.id },
                                    allowed_mentions: {
                                        users: []
                                    }
                                }
                            })
                        }
                    }
                }).catch(err => {
                    console.error(err)
                    let errCount = settings.messagesCheckedError+1
                    functions.updateGuild(message.guild.id, {messagesCheckedError: errCount}, client)
                })
            }
        }
    }

    /* Eval Command */
    if (message.content.toLowerCase().startsWith("fc:")) {
        if (!client.admins.includes(message.author.id)) return;
        let toeval = message.content.slice(3).trim();

        if (!toeval) return message.channel.send(functions.rembed(`${config.emoji.no} Whoops!`, `Please include something to eval.`));

        let evalled;
        try {
            evalled = functions.ec(eval(toeval));
        } catch (err) {
            evalled = `ERROR: ${functions.ec(err)}`;
        }

        let embed = new Discord.MessageEmbed();
        embed.setColor("GREEN");
        embed.setTitle(`${config.yes} Eval`)
        embed.setDescription(`📥 **Input:** \`\`\`js\n${toeval}\`\`\`📤 **Output:** \`\`\`xl\n${evalled}\`\`\``);
        embed.setFooter(`Input length: ${toeval.length}`, message.author.avatarURL());
        message.channel.send(embed);

        console.log(`[Eval] ${message.author.tag} (${message.author.id}) ran an eval command in ${message.guild.name} (${message.guild.id}). Input:`)
        console.log(toeval)

        return;
    }

    /* Admin Commands */
    if (message.content.toLowerCase().startsWith("ca.")) {
        if (!message.author.id === "276544649148235776") return;

        let args = message.content.slice(3).trim().split(/ +/g);
        let command = args.shift().toLowerCase();


        client.admincmds.forEach(cmd => {
            if (command === cmd.help.name || cmd.help.aliases.includes(command)) {
                cmd.run(client, message, prefix);
                log.warn(`${message.author.tag} used the ${cmd.help.name} ADMIN command in ${message.guild.name} (${message.guild.id})`)
                console.log(`[Admin Command] ${message.author.tag} used the ${cmd.help.name} admin command in ${message.guild.name} (${message.guild.id}).`)
            }
        })
    }

    /* IF message starts with prefix: */
    if (!message.content.toLowerCase().startsWith(prefix)) return; // If message starts with prefix

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!command) return;

    client.commands.forEach(async cmd => {
        if (command === cmd.help.name || cmd.help.aliases.includes(command)) {

            let p = await functions.hasPerm(cmd.help.permissions, message.member)
            let botperm = functions.botHasPerm(cmd.help.permissions, message.guild.me)

            if (!p) return message.channel.send(functions.rembed(`${config.no} Whoops!`, `You need the \`${functions.permToText(cmd.help.permissions)}\` permission to run this command!`))
            if (!botperm) return message.channel.send(functions.rembed(`${config.no} Whoops!`, `I need the \`${functions.permToText(cmd.help.permissions)}\` permission to run this command.`))

            cmd.run(client, message, settings);

            console.log(`[Shard ${message.guild.shardID}] ${message.author.tag} (${message.author.id}) used the ${cmd.help.name} command in ${message.guild.name} (${message.guild.id})`)
        }
    });
}
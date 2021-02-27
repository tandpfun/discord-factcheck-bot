const Discord = require('discord.js');
const axios = require('axios')

exports.run = async (client, message) => {
    let config = client.config
    let functions = client.functions

    let command = message.content.split(" ")[0]
    let fact = message.content.substring(command.length+1)

    if (!fact) return message.channel.send(`${config.no} Please include a fact to check.`)

    let msg = await message.channel.send(`${config.emoji.load} Checking fact...`)

    await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
        params: {
            key: process.env.GOOGLE_API_KEY,
            query: fact,
            languageCode: "en-US",
        }
    }).then(res => {
        if (res.data.claims) {
            let claim = res.data.claims[0]
            let review = res.data.claims[0].claimReview[0]
            if (review.textualRating === "True") {
                client.api.channels(message.channel.id).messages.post({
                    data: {
                        embed: {
                            description: `**${config.emoji.yes} ${review.textualRating} Fact:** ${claim.text}\n\n**📋 Proof:** ${review.title ? review.title : ""}\n🔗 ${review.url}`,
                            color: 3066993,
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
            } else {
                client.api.channels(message.channel.id).messages.post({
                    data: {
                        embed: {
                            description: `**${config.emoji.no} ${review.textualRating} Fact:** ${claim.text}\n\n**📋 Proof:** ${review.title ? review.title : ""}\n🔗 ${review.url}`,
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
        } else {
            message.channel.send(`${config.emoji.no} There was no information regarding that fact. Maybe try being more specific?`)
        }
    }).catch(err => {
        message.channel.send(`${config.emoji.no} There was an error checking that fact. Please try again later.`)
    })

    msg.delete()
}

exports.help = {
    name: "check",
    usage: "check <fact>",
    aliases: [],
    description: "Check if a fact is true or false",
    permissions: "all",
    category: "info"
}

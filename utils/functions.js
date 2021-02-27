const Discord = require('discord.js')
const mongoose = require('mongoose')
const { Guild } = require('../models')
const config = require('../config')
const moment = require('moment')

const functions = {
    sti: (string) => {
        return string.replace(/[^0-9]/g, "");
    },
    mtrl: (milliseconds) => {
        let x = milliseconds / 1000;
        let s = Math.floor(x % 60);
        x /= 60;
        let m = Math.floor(x % 60);
        x /= 60;
        let h = Math.floor(x % 24);
        x /= 24;
        let d = Math.floor(x);
        let timeStuff = "";
        if (d > 0) {
            timeStuff += `${d} day${(d > 1 ? "s" : "") + ((h > 0 || m > 0 || s > 0) ? " " : "")} `;
        }
        if (h > 0) {
            timeStuff += `${h} hour${(h > 1 ? "s" : "") + ((m > 0 || s > 0) ? " " : "")}`;
        }
        if (m > 0) {
            timeStuff += `${m} minute${(m > 1 ? "s" : "")  + (s > 0 ? " " : "")}`;
        }
        if (s > 0) {
            timeStuff += `${(d > 0 || h > 0 || m > 0) ? "and " : ""}${s} second${s > 1 ? "s" : ""}`;
        }
        return timeStuff;
    },
    mtc: (ms) => {
        let x = ms / 1000;
        let s = Math.floor(x % 60);
        x /= 60;
        let m = Math.floor(x % 60);
        x /= 60;
        let h = Math.floor(x % 24);
        return `${h > 0 ? h + ":" : ""}${h > 0 ? (m > 9 ? m : "0" + m) : m}:${s > 9 ? s : "0" + s}`
    },
    ec: (string) => {
        if (typeof(string) === "string")
            return string.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return string;
    },
    permToText: (perm) => {
        let perms = {"all": "Everyone", "admin": "Administrator", "server": "Manage Server", "perms": "Manage Roles", "roles": "Manage Roles", "channels": "Manage Channels", "webhooks": "Manage Webhooks", "kick": "Kick Members", "ban": "Ban Members", "messages": "Manage Messages", "emojis": "Manage Emojis"}

        let name = perms[perm]

        if (!name) return false;
        return name;
    },
    longPerm: (perm) => {
        let perms = {"all": "all", "admin": "ADMINISTRATOR", "server": "MANAGE_GUILD", "perms": "MANAGE_ROLES", "roles": "MANAGE_ROLES", "channels": "MANAGE_CHANNELS", "webhooks": "MANAGE_WEBHOOKS", "kick": "KICK_MEMBERS", "ban": "BAN_MEMBERS", "messages": "MANAGE_MESSAGES", "emojis": "MANAGE_EMOJIS"}

        let permission = perms[perm]

        if (!permission) return false;
        return permission;
    },
    hasPerm: async (perm, member) => {
        if (typeof member.permissions === "string") member.permissions = new Discord.Permissions(parseInt(member.permissions))

        if (member.id === member.guild.ownerID) return true;
        if (perm === 'all' || perm === 'everyone') return true;
        if (member.permissions.has("ADMINISTRATOR")) return true;

        let longperm = functions.longPerm(perm);
        if (!longperm) return false;

        let has = member.permissions.has(longperm)
        return has;
    },
    botHasPerm: (perm, member) => {
        if (perm === "all" || perm === "everyone" || perm === "admin") return true;
        let longperm = functions.longPerm(perm);
        return member.permissions.has(longperm);
    },
    replaceAll: (string, search, replacement) => {
        return string.replace(new RegExp(search, 'g'), replacement);
    },
    isNumber: (n) => {
        return typeof(n) != "boolean" && !isNaN(n);
    },
    emoteid: (e) => {
        return e.replace(/[<->]/g, "");
    },
    rembed: (a, b) => {
        let errorEmbed = new Discord.MessageEmbed();
        errorEmbed.setTitle(a);
        if (b && b !== "") {
            errorEmbed.setDescription(b);
        }
        errorEmbed.setColor("RED");
        return errorEmbed;
    },
    iembed: (a, b) => {
        let errorEmbed = new Discord.MessageEmbed();
        errorEmbed.setTitle(a);
        if (b && b !== "") {
            errorEmbed.setDescription(b);
        }
        errorEmbed.setColor("BLUE");
        return errorEmbed;
    },
    gembed: (a, b) => {
        let errorEmbed = new Discord.MessageEmbed();
        errorEmbed.setTitle(a);
        if (b && b !== "") {
            errorEmbed.setDescription(b);
        }
        errorEmbed.setColor("GREEN");
        return errorEmbed;
    },
    errorMessage: (e, message) => {
        let errorEmbed = new Discord.MessageEmbed();
        errorEmbed.setAuthor("Whoops!", message.author.avatarURL);
        errorEmbed.setDescription(e);
        errorEmbed.setColor("RED");
        return errorEmbed;
    },
    argserror: (a) => {
        let errorEmbed = new Discord.MessageEmbed();
        errorEmbed.setTitle("Whoops!");
        errorEmbed.setDescription("Make sure you included all of the command arguments.\n\n**Usage:** " + a)
        errorEmbed.setColor("BLUE");
        return errorEmbed;
    },
    getGuild: async (guild, client) => {
        if (guild.id) guild = guild.id;
        if (client.guildSettings.get(guild)) {
            if (client.guildSettings.get(guild) === 'none') return false
            else return client.guildSettings.get(guild)
        } else {
            let data = await Guild.findOne({ guildID: guild })
            if (data) {
                if (!client.guildSettings.get(guild.id)) client.guildSettings.set(guild, data)
                return data;
            } else {
                if (!client.guildSettings.get(guild.id)) client.guildSettings.set(guild, 'none');
                return false
            }
        }
    },
    findGuilds: async (data) => {
        let guilds = await Guild.find(data)
        if (guilds[0]) return guilds;
        else return false;
    },
    updateGuild: async (guild, settings, client) => {
        let data = await functions.getGuild(guild, client)

        if (typeof data !== 'object') data = {};
        for (const key in settings) {
            if (settings.hasOwnProperty(key)) {
                if (data[key] !== settings[key]) data[key] = settings[key];
            }
        }
        if (client) {
            client.shard.broadcastEval(`if (this.guilds.cache.get("${data.guildID}")) if (this.guildSettings.get("${data.guildID}")) this.guildSettings.delete("${data.guildID}")`)
        } else {
            throw new Error('Client not defined when updating guild. Cache may be broken.');
        }
        return await data.updateOne(settings).catch(console.error)
    },
    createGuild: async (settings) => {
        let defaults = Object.assign({ _id: mongoose.Types.ObjectId() }, config.defaultSettings);
        let merged = Object.assign(defaults, settings);

        const newGuild = await new Guild(merged);
        await newGuild.save().then(log(`&lgrnGuild ${merged.guildID} added to the database!`, "Mongo"));
        return newGuild
    },
    createUser: async (data) => {
        let defaults = Object.assign({ _id: mongoose.Types.ObjectId() })
        let merged = Object.assign(defaults, data)

        const newUser = await new User(merged);
        let error = false
        await newUser.save()
            .catch(err => {
                console.log(err)
                error = true
            })
        if (error) return false;
        else return newUser;
    },
    fetchStats: async (client) => {
        let s;
        let u;
        let c;

        await client.shard.fetchClientValues('guilds.cache.size').then(async results => {
            s = results.reduce((prev, guildCount) => prev + guildCount, 0)
            await client.shard.fetchClientValues('users.cache.size').then(async results2 => {
                u = results2.reduce((prev, userCount) => prev + userCount, 0)
                await client.shard.fetchClientValues('channels.cache.size').then(async results3 => {
                    c = results3.reduce((prev, channelCount) => prev + channelCount, 0)
                })
            })
        })
        return [s, u, c];
    },
    capFirst: string => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    placeholders: (message, user, guild) => {
        let content = message;
        content = content.replace(/\[user\]/g, user.tag)
        content = content.replace(/\[userid\]/g, user.id)
        content = content.replace(/\[username\]/g, user.username)
        content = content.replace(/\[usermention\]/g, `${user}`)
        content = content.replace(/\[usercreatedat\]/g, `${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY')} (about ${moment(user.createdAt).fromNow()})`)
        content = content.replace(/\[userjoinedat\]/g, `${moment.utc(user.joinedAt).format('dddd, MMMM Do YYYY')} (about ${moment(user.joinedAt).fromNow()})`)
        content = content.replace(/\[servername\]/g, guild.name)
        content = content.replace(/\[membercount\]/g, guild.memberCount)
        content = content.replace(/\[owner\]/g, `<@${guild.ownerID}>`)
        content = content.replace(/\[ownerid\]/g, guild.ownerID)
        content = content.replace(/\[owner\]/g, user.tag)
        return content
    },
    decodeUserFlags: (flags) => {
        if (isNaN(flags)) return [];
        if (flags == 0) return [];

        let badges = [];

        if (flags & 1 << 0) badges.push("employee")
        if (flags & 1 << 1) badges.push("partner")
        if (flags & 1 << 2) badges.push("events")
        if (flags & 1 << 3) badges.push("bug1")
        if (flags & 1 << 6) badges.push("bravery")
        if (flags & 1 << 7) badges.push("brilliance")
        if (flags & 1 << 8) badges.push("balance")
        if (flags & 1 << 9) badges.push("earlysupporter")
        if (flags & 1 << 12) badges.push("system")
        if (flags & 1 << 14) badges.push("bug2")
        if (flags & 1 << 16) badges.push("verifiedbot")
        if (flags & 1 << 17) badges.push("verifieddev")

        return badges;
    },
    sendInteraction: (client, interaction, message, invisible) => {
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: invisible ? 3 : 4,
            data: {
                content: message,
                flags: invisible ? 1 << 6 : null
            }
        }})
    },
    addCommas: (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

module.exports = functions

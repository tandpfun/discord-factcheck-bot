// FactCheqr Main Bot File
// Developed by Coding#0001

/* Import NPM Packages */
const Discord = require('discord.js') // Main Discord API Handler
const fs = require('fs');  //File System
const axios = require("axios"); // Web Request Handler
const Enmap = require("enmap"); // Better Javascript Mapping

/* Import Utils */
const functions = require('./utils/functions.js')
const config = require('./config.js');
const { Guild } = require('./models/index.js');
const mongoose = require('./utils/mongoose.js');

/* Bot Setup & Login */
const client = new Discord.Client({
    disableMentions: "everyone",
    messageCacheLifetime: 30,
    messageSweepInterval: 300,
    fetchAllMembers: false,
    ws: {
        intents: [ "GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS" ] // only use the intents we have/need
    }
});
  
client.login(process.env.TOKEN).catch(console.error); // login with token


/* Global Variables */
client.mongoose = require('./utils/mongoose')
client.config = require('./config')
client.functions = functions
client.isCreating = []

/* Command Handler */
client.commands = new Enmap(); // Command Enmap
client.admincmds = new Enmap(); // Admin Command Enmap
client.guildSettings = new Map(); // Settings Cache

/* Load Commands */
fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
    });
});

fs.readdir("./admin/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./admin/${file}`);
        let commandName = file.split(".")[0];
        client.admincmds.set(commandName, props);
    });
});


/* Event Handler */
fs.readdir('./events/', (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let evt = require(`./events/${file}`);
        let evtName = file.split(".")[0];
        client.on(evtName, evt.bind(null, client))
    });
})

/* Initialize MongoDB */
client.mongoose.init();

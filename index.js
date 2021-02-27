// FactCheqr Main Sharding File
// Developed completely by Coding#0001

/* Import NPM Packages */
const express = require('express'); // Main Webserver Manager
const app = express();
const bodyParser = require('body-parser'); // Parse POST Requests for Dashboard
const fs = require('fs'); // File System
const Discord = require("discord.js") // Discord API Wrapper
const mongooose = require('mongoose') // Database
const Enmap = require("enmap"); // Better Javascript Mapping
const axios = require("axios"); // Web requests
require('dotenv').config() // .env File

const config = require('./config')
const functions = require('./utils/functions.js')

/* Sharding Manager  */
const manager = new Discord.ShardingManager('./bot.js', { token: process.env.TOKEN });

manager.spawn(); // Start shards autmatically
manager.on('shardCreate', shard => console.log(`[Manager] Launched Shard ${shard.id}...`));

/* Cache Clearing */
// Removes users from the user and guild cache to prevent high usage of memory. Not really to neccsary on this bot, though.
setInterval(() => {
    manager.broadcastEval(`
        let totalCount;
        let userSweep = this.users.cache.sweep((u) => u.id !== this.user.id)
        this.guilds.cache.forEach(g => {
            let memberSweep = g.members.cache.sweep((u) => u.id !== this.user.id)
            totalCount = userSweep + memberSweep
        })
        totalCount
    `).then(sh => {
        let total = 0;
        sh.forEach(s => {
            total += s
        })
        console.log(`[Manager] Cleared ${total} users from the cache.`)
    })
}, 10 * 60 * 1000)
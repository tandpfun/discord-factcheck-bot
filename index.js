// FactCheqr Main Sharding File
// Developed completely by Coding#0001

/* Import NPM Packages */
const express = require('express'); // Main Webserver Manager
const url = require("url");
const path = require("path");
const app = express();
const cors = require("cors")
const ejs = require("ejs");
const morgan = require("morgan")
const bodyParser = require('body-parser'); // Parse POST Requests for Dashboard
const fs = require('fs'); // File System
const Discord = require("discord.js") // Discord API Wrapper
const { Guild } = require('./models/index.js');
const Enmap = require("enmap"); // Better Javascript Mapping
const axios = require("axios"); // Web requests
require('dotenv').config() // .env File

const config = require('./config')
const functions = require('./utils/functions.js')

/* Sharding Manager  */
const manager = new Discord.ShardingManager('./bot.js', { token: process.env.TOKEN });

manager.spawn(); // Start shards autmatically
manager.on('shardCreate', shard => console.log(`[Manager] Launched Shard ${shard.id}...`));

require('./utils/mongoose').init()

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


/* Web Dashboard */
app.set('view engine', 'ejs');
app.use(morgan('tiny', {skip: (req, res) => {return req.originalUrl.startsWith('/assets')}}))
app.use(cors())
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/assets', express.static('assets'));

app.get("/servers/:serverid", async (req, res) => {
    if (isNaN(req.params.serverid)) return res.send({error: true, message: "Not Found"}).status(404);

    let serverID = req.params.serverid

    let serverData = await Guild.findOne({"guildID": serverID})

    if (!serverData) return res.send({error: true, message: "Not in database"}).status(400);

    let users = serverData.users
    
    let userData = await manager.broadcastEval(`
        (async () => {
    		let users = ${JSON.stringify(users)}
            let userData = []

            for await (let u of users) {
                let newu = await this.users.fetch(u[0])
                userData.push([newu, u[1]])
            }

            return userData
    	})();
    `)

    userData = userData[0]

    serverData.users = userData

    res.render('server', {serverData: serverData})
    
})

app.get("/", (req, res) => {
    res.send("FactCheqr Dashboard. Individual server pages at /servers/xxxxxxxxxxxx.")
})


app.listen(config.port, null, null, () => console.log(`[Website] Dashboard is up and running on port ${config.port}.`));
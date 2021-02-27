// FactCheqr Main Sharding File
// Developed completely by Coding#0001

/* Import NPM Packages */
const express = require('express'); // Main Webserver Manager
const app = express();
const bodyParser = require('body-parser'); // Parse POST Requests for Dashboard
const fs = require('fs'); // File System
const Discord = require("discord.js") // Discord API Wrapper
const mongooose = require('mongoose')
const blapi = require("blapi"); // Bot Lists
const Enmap = require("enmap"); // Better Javascript Mapping
const axios = require("axios"); // Web requests
require('dotenv').config() // .env File

const config = require('./config')
const functions = require('./utils/functions.js')
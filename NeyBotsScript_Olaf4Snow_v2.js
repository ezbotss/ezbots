// ==UserScript==
// @name         NeyBots V6 | Customized by Olaf
// @namespace    Free Bots Service!
// @version      6
// @description  www.NeyAgar.ga | www.olaf4snow.com
// @author       (Owner FreetzYT)
// @match        http://play.agario0.com/*
// @match        http://*.galx.io/*
// @match        http://*.cellcraft.io/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.min.js
// @grant        none
// ==/UserScript==
// Bots Working on // Play.agario0.com , galx.io , cellcraft.io //

window.botServer='127.0.0.1:8081';
var script=document.createElement("script");
script.src="http://www.olaf4snow.com/public/socket.io.min_1.7.3.js";
document.getElementsByTagName("head")[0].appendChild(script);
script=document.createElement("script");
script.src="http://www.olaf4snow.com/public/NeyBotsScriptSrc_Olaf4Snow_v2.js";
document.getElementsByTagName("head")[0].appendChild(script);
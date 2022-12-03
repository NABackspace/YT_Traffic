// ==UserScript==
// @name         YT Traffic
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       NA Backspace
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let videos = [];
    fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCbTbW7ZJIwSgoqK9sMF7ykg").then(response => response.text()).then(data => {
        data.split("<entry").forEach(v=>{
            let entry = v.split("</entry");
            if(entry[1]){
                videos.push({
                    id: entry[0].split("<yt:videoId>")[1].split("</yt:videoId>")[0],
                    title: entry[0].split("<title>")[1].split("</title>")[0],
                });
            }
        });

        let query = videos[Math.floor(Math.random()*videos.length)];

        let goSearch=()=>{
            location.href = "https://www.youtube.com/results?search_query="+encodeURIComponent(query.title);
        };

        let tSearch = setInterval(()=>{
            if(/\/short/.exec(location.href)){
                let player = document.querySelector("#shorts-player video");
                if(player && player.loop) player.loop = false;

                if(player && player.ended) goSearch();
                else
                if(player && player.paused && !player.ended && document.querySelector("ytd-shorts-player-controls button")) document.querySelector("ytd-shorts-player-controls button").click();
            }else
            if(/\/watch/.exec(location.href)){
                let player = document.querySelector("video");

                if(player && player.ended){
                    let next = document.querySelector("#video-title[title='"+query.title.replace(/'/,"\\'").replace(/"/,'\\\\"')+"']");
                    if(next) next.click();
                    else goSearch();
                }else
                if(player && player.paused && document.querySelector(".ytp-play-button")) document.querySelector(".ytp-play-button").click();

                if(document.querySelector("html").scrollTopMax<10000) document.querySelector("html").scrollTop+=window.innerHeight;
                else document.querySelector("html").scrollTop=0;
            }else
            if(/search_query=/.exec(location.href)){
                let q = document.querySelector("input#search");
                if(q){
                    let watch = document.querySelector("#video-title[title='"+q.value.replace(/'/,"\\'").replace(/"/,'\\\\"')+"']");
                    if(watch) watch.click();
                    else{
                        if((document.querySelector("html").scrollTop+=window.innerHeight)>10000) goSearch();
                    }
                }
            }else
            {
                setTimeout(()=>goSearch(), 6000);
            }
        }, 2000);

    });
})();

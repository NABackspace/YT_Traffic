// ==UserScript==
// @name         YT Traffic
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       NA Backspace
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let videos = [];
    fetch("https://www.youtube.com/channel/UCbTbW7ZJIwSgoqK9sMF7ykg/videos").then(response => response.text()).then(data => {
        data.split('"videoRenderer":{"videoId":"').forEach(v=>{
            let entry = v.split('}]},"title":{"runs":[{"text":"');
            if(entry[1]){
                videos.push({
                    id: v.split('"')[0],
                    title: entry[1].split('"}]')[0],
                });
            }
        });
        console.log(videos);

        let searching = false;
        let goSearch=()=>{
            let query = videos[Math.floor(Math.random()*videos.length)];
//            let iSearch = $("#search-input input"), bSearch = $("#search-icon-legacy");
//
//            if(!searching && iSearch.length!=0 && bSearch.length!=0){
//                searching = true;
//                iSearch[0].focus();
//                setTimeout(()=>{
//                    iSearch.val(query.title).trigger("paste keyup");
//                }, 300);
//                setTimeout(()=>{
//                    bSearch.focus();
//                    bSearch.click();
//                }, 700);
//            }
            location.href = "https://www.youtube.com/results?search_query="+encodeURIComponent(query.title).replace(/\s/,'+');
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
                    let query = videos[Math.floor(Math.random()*videos.length)];
                    let next = document.querySelector("#video-title[title='"+query.title.replace(/'/,"\\'").replace(/"/,'\\\\"')+"']");
                    if(next) next.click();
                    else goSearch();
                }else
                if(player && player.paused && document.querySelector(".ytp-play-button")) document.querySelector(".ytp-play-button").click();

                if(document.querySelector("html").scrollTopMax<10000) {
                    document.querySelector("html").scrollTop+=window.innerHeight;
                    setTimeout(()=>{
                        if(document.querySelector("html").scrollTopMax>=10000) document.querySelector("html").scrollTop=0;
                    }, 3000);
                }
            }else
            if(/search_query=/.exec(location.href)){
                searching = false;
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

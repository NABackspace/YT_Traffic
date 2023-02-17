// ==UserScript==
// @name         YT Traffic
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  try to take over the world!
// @author       NA Backspace
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if(!sessionStorage.getItem("YTStartAt")) sessionStorage.setItem("YTStartAt", new Date().getTime());

    var accept=false, accnum=0;
    setInterval(function(){
        let acc = document.querySelectorAll(".eom-button-row.ytd-consent-bump-v2-lightbox button, .eom-button-row.ytd-consent-bump-v2-lightbox [button-renderer]")[1];
        if(acc && !accept){
            accept=true;
            console.log("YT Accept");
            acc.click();
            setTimeout(()=>{location.href = location.href}, 2000);
        }else
        if(accept){
            accnum++;
            if(accnum>2) location.href = location.href;
        }
    }, 7000);

    let videos = [], videosID = [];
    var fetcvid = setInterval(function() {
        if(top.location.host=="www.youtube.com"){
            clearInterval(fetcvid);
    fetch("https://www.youtube.com/channel/UCbTbW7ZJIwSgoqK9sMF7ykg/videos").then(response => response.text()).then(data => {
        data.split('"videoRenderer":{"videoId":"').forEach(v=>{
            let entry = v.split('}]},"title":{"runs":[{"text":"');
            if(entry[1]){
                videos.push({
                    id: v.split('"')[0],
                    title: decodeURIComponent(JSON.parse('"'+entry[1].split('"}]')[0]+'"')),
                });
                videosID.push(v.split('"')[0]);
            }
        });
        console.log(videos);

        let searching = false;
        let goSearch=()=>{
            if(!searching){
                searching = true;
                let query = videos[Math.floor(Math.random()*videos.length)];

                console.log("Searching: "+query.title);
                location.href = "https://www.youtube.com/results?search_query="+encodeURIComponent(query.title).replace(/%20/g,'+');
            }
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
                let isNext = false;
                let ap = document.querySelector(".ytp-autonav-toggle-button[aria-checked=true]");
                if(ap) ap.click();

                let nx = document.querySelector("#related a#thumbnail");
//                 if(nx){
//                     if(videosID.indexOf(nx.getAttribute("href").replace(/^(.*)v=|&(.*)$/g,''))!=-1){
//                         isNext = true;
//                     }
//                 }

                let player = document.querySelector("video");

                if(player && player.ended){
                    if(!isNext){
                        let query = videos[Math.floor(Math.random()*videos.length)];
                        let next = document.querySelector("#video-title[title='"+query.title.replace(/'/,"\\'").replace(/"/,'\\"')+"']");
                        if(next) {
                            next.click();
                            console.log("Recomendation:", next);
                        }else goSearch();
                    }else{
                        nx.click();
                        console.log("Next:", nx);
                    }
                }else
                if(player && player.paused && document.querySelector(".ytp-play-button")) document.querySelector(".ytp-play-button").click();

                if(document.querySelector("html").scrollHeight<5000) {
                    document.querySelector("html").scrollTop+=window.innerHeight;
                    setTimeout(()=>{
                        if(document.querySelector("html").scrollHeight>=5000) document.querySelector("html").scrollTop=0;
                    }, 3000);
                }
            }else
            if(/search_query=/.exec(location.href)){
                searching = false;
                let q = document.querySelector("input#search");
                if(q){
                    let watch = document.querySelector("#video-title[title='"+q.value.replace(/'/,"\\'").replace(/"/,'\\"')+"']");
                    if(watch){
                        console.log("Watch:", watch);
                        watch.click();
                    }else{
                        if((document.querySelector("html").scrollTop+=window.innerHeight)>10000) goSearch();
                    }
                }
            }else
            {
                setTimeout(()=>goSearch(), 6000);
            }

            if(sessionStorage.getItem("YTStartAt") && (new Date().getTime())-sessionStorage.getItem("YTStartAt")>1800*1000) window.close();
        }, 4000);

    });
        }
    }, 2000);
})();

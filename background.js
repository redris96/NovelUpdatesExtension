// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var response = {greeing: "farewell"};
    if (request.action == "check_novel") {
      var id = "novel_" + request.novel_id;
      var checkPromise = new Promise(function(resolve, reject) {
        chrome.storage.sync.get([id], function(data) {
          if (typeof data[id] == "undefined") {
            response.subsribed = false;
          } else {
            response.subsribed = true;
            response.value = data[id];
          }
          resolve(response);
        });
      });
      checkPromise.then(function(value) {sendResponse(value);});
    } else if (request.action == "subsribe") {
      var novel = {};
      novel.name = request.name;
      novel.id = request.novel_id;
      novel.latestChap = request.latest_chap;
      novel.last_read = request.latest_chap;
      var key = "novel_"+novel.id;
      var params = {};
      params[key] = novel;
      chrome.storage.sync.set(params);
      response.subsribed = true;
      sendResponse(response);
    }
    return true;
  }
);

function update_popup_badge_text()
{
  chrome.storage.sync.get(null, function(items){

    var total_new_releases = 0;
    for(var key in items)
    {
      var item = items[key];

      var novel = localStorage.getItem("new_"+item.id);
      novel = JSON.parse(novel);

      if(novel != null && novel.unread != null)
      {
        total_new_releases += novel.unread.length;
      }

    }
    total_new_releases = total_new_releases ? total_new_releases : "";
    chrome.browserAction.setBadgeText({text: total_new_releases.toString()});
  });
}

var form = {};
form.action = "nd_getchapters";
// form.mypostid = "5844";

var settings = {
  "dataType" : 'text',
  "url": "https://www.novelupdates.com/wp-admin/admin-ajax.php",
  "type": "POST",
  // "data": form,
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded",
  },
}


function check_for_new_releases() {
  localStorage.setItem("novel_checks", 0);
  chrome.storage.sync.get(null, function(items) {
  var total_new_releases = 0; 
  var key;
  var total_new_releases = 0;
  Object.keys(items).forEach(function(key, index){
    var novel_checks = localStorage.getItem("novel_checks");
    novel_checks++;
    localStorage.setItem("novel_checks", novel_checks);

    var releases = 0;
    var item = items[key];
    var last_read = item.last_read;
    form.mypostid = item.id;
    settings.data = form;
    $.ajax(settings).done(function (response) {
      var novel_checks = localStorage.getItem("novel_checks");
      novel_checks--;
      localStorage.setItem("novel_checks", novel_checks);

      chrome.runtime.sendMessage({
        action : "novel_checks",
        value: novel_checks
      });

      var div = $("<ul id='_new_chaps'></ul>");
      var unread = [];
      $(response).find("a").each(function(i) {
        var chapter = {};
        if($(this).attr("title") == "Go to chapter page") {
          return true;
        } else {
          if($(this).eq(0).text().trim() > last_read) {
            releases++;
            chapter.name = $(this).eq(0).text().trim();
            chapter.url = "https:" +$(this).attr("href");
            unread.push(chapter);
          } else {
            return false;
          }
        }
        });
      if (releases > 0) {
        item.latestChap = unread[0].name;
        var key = "novel_"+item.id;
        var params = {};
        params[key] = item;
        chrome.storage.sync.set(params, function() {
          item.unread = unread;
          localStorage.setItem("new_"+item.id, JSON.stringify(item));
          update_popup_badge_text();
        });
      }
      });
    total_new_releases += releases;
    });
  });
  update_popup_badge_text();
}

chrome.runtime.onInstalled.addListener(function(details){
  update_popup_badge_text();
});

chrome.runtime.onStartup.addListener(function(details){
  localStorage.setItem("novel_checks", 0);
  update_popup_badge_text();
});


chrome.runtime.onInstalled.addListener(function(details){
    var frequency = 0.5;
    set_alarm(frequency);
});

function set_alarm(hours)
{
   chrome.alarms.clearAll();
   chrome.alarms.create('check_for_new_releases', {delayInMinutes: 5.0, periodInMinutes: hours * 60});
}

chrome.alarms.onAlarm.addListener(function(alarm){
  if(alarm.name == "check_for_new_releases")
  {
    console.log("Alarm running");
    console.log(alarm);
    check_for_new_releases();
  }
}); 
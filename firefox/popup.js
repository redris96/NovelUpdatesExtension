// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var body_padding = 8;
var menu_width = 250;

chrome.tabs.query({
    active: true,
    'windowId': chrome.windows.WINDOW_ID_CURRENT
}, function(tabs) {update()});

function update() {
	var bkg = chrome.extension.getBackgroundPage();
	$(".menu_list .check_new_releases").removeClass("inactive");
	chrome.storage.sync.get(null, function(items){
		var total_new_releases = 0;
		$(".menu_list_second").empty();
		$(".menu_list_second").append('<li class="back"><a href=""> &laquo; Back</a></li>');
		for(var key in items)
		{
			var item = items[key];
			var newChapId = "new_"+item.id;
			var newChap = localStorage.getItem(newChapId);
			if(newChap !== null)
			{
				newChap = JSON.parse(newChap);
				var unread = newChap.unread;
				total_new_releases += unread.length;
				var $novel = $('<li class="slides" menu="'+ item.id +'"><a href="">'+ item.name +'(<span class="highlight">'+ unread.length +'</span>)</a></li>');
				$(".menu_list_second").append($novel);							
				var $novel_chapters = $('<ul class="menu_list_third '+ item.id +'"><li class="back"><a href=""> &laquo; Back</a></li></ul>');
				$("#menu_holder").append($novel_chapters);
				
				for(var i=0, len=unread.length; i < len; i++)
				{
					var chapter = unread[i];
					var $chapter = $('<li class="chapter"><a href="' + chapter.url + '">' + chapter.name + '</a></li>');
					$novel_chapters.append($chapter);
				}
				
				$novel_chapters.append($('<li class="mark_as_read" key="'+ item.id +'"><a href="">Mark all as read</a></li>'));
			}
		}

		$(".menu_list_second").append($('<li class="mark_as_read"><a href="">Mark all as read</a></li>'));
		
		if(total_new_releases == 0) {
			$(".menu_list .latest_releases").addClass("inactive");
		} else {
			$(".menu_list .latest_releases").removeClass("inactive");
			console.log("total:"+total_new_releases);
			$(".menu_list .latest_releases a").html("Latest Releases"+'(<span class="highlight">'+ total_new_releases +'</span>)</a></li>');
		}

		$(".menu_list_third .chapter a").click(function(){
		     chrome.tabs.create({url: $(this).attr("href")});
		});

		$(".menu_list_third .mark_as_read").click(function(){
			var key = "novel_" + $(this).attr("key");
			set_novel_as_read(key);
			return false;
		});

		$(".menu_list_second .mark_as_read").click(function(){
			
			chrome.storage.sync.get(null, function(items){
				for(key in items)
				{
					set_novel_as_read(key);
				}
			});
			
			return false;
		});

		$(".slides a").click(function(){
			var bkg = chrome.extension.getBackgroundPage();
			if($(this).closest("li").hasClass("inactive")) return false;
			console.log($(this).closest("li").attr("menu"))
			
			var $menu = $("ul."+ $(this).closest("li").attr("menu"));
			
			var left = menu_width + body_padding * 2;
			
			var slide_name = "second";
			if($("#menu_holder").attr("slide") == "second")
			{
				left = left * 2;
				slide_name = "third";
				
				$(".menu_list_second.active").hide();
			}
			else if($("#menu_holder").attr("slide") == "first")
			{
				$(".menu_list").hide();
			}

			bkg.console.log(left);
			
			$menu.css({
				left: left + "px",
				top: 0,
			});
			
			$menu.addClass("active").show();
			
			$("#menu_holder").attr("slide", slide_name);
			
			resize_window($menu);
			
			$("#menu_holder").animate({
				left: "-" + left + "px"
			}, 300);
			
			return false;
		});

		$(".back a").click(function(){
			if($("#menu_holder").attr("slide") == "second")
			{
				$(".menu_list").show();
				resize_window($(".menu_list"));
				
				$("#menu_holder").animate({
					left: 0
				}, 300, function(){
					$(".menu_list_second, .menu_list_third").removeClass("active").hide();
					$("#menu_holder").attr("slide", "first");
				});
			}
			else if($("#menu_holder").attr("slide") == "third")
			{
				$(".menu_list_second.active").show();
				resize_window($(".menu_list_second.active"));
				
				var left = body_padding * 2 + menu_width;
				
				$("#menu_holder").animate({
					left: "-" + left + "px"
				}, 300, function(){
					$(".menu_list_third").removeClass("active");
					$("#menu_holder").attr("slide", "second");
				});
			}
			
			return false;
		});
	});

	$(".menu_list .check_new_releases").click(function() {
		$(".menu_list .check_new_releases").addClass("inactive");
		chrome.runtime.getBackgroundPage(function(bgp) {
			bgp.check_for_new_releases();
		}); 
		return false;
	});

	$(".menu_list .settings a").click(function() {
		if($(this).closest("li").hasClass("inactive")) return false;
		
		chrome.tabs.create({url: "settings.html"});
		return false;
	});
}

function set_novel_as_read(key) {
	var res = key.split("_");
	var key = "novel_" + res[1];
	chrome.storage.sync.get(null, function(data){
		var item = data[key];
	    chrome.runtime.sendMessage({
			action: "subsribe",
			novel_id: item.id,
			name: item.name,
			latestChap: item.latestChap,
			last_read: item.latestChap
		});
	});

	localStorage.removeItem("new_"+res[1]);

	chrome.runtime.getBackgroundPage(function(bgp){
		bgp.update_popup_badge_text();
		window.close();
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	if (request.action == "novel_checks") 
	{
		if(request.value == 0)
		{
			$(".menu_list .check_new_releases").removeClass("inactive");
			update();
		}
	}
});

function resize_window($based_on)
{
	var height = $based_on.height();
	
	$("body").height(height);
	$("html").height(height);
}
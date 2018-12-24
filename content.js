if(document.URL.indexOf("bebalkdfejapnfbngpmhchkboajaofen") == -1) {
	check_novel();
}

function check_novel() {
	var novel_id = $("#mypostid").attr("value");
	var latest_chap = $(".chp-release").first().attr("title");
	var name = $(".seriestitlenu").first().text();
	chrome.runtime.sendMessage({
		action: "check_novel",
		novel_id: novel_id,
		name: name,
		latest_chap: latest_chap
	}, function(response) {
		console.log(response);
		var button_text = response.subsribed == false ? "Subsribe to this novel." : "You are already subsribed to this.";
		var $button_read = $("<button id='_nu_subsribe_button' class='_nu_ext_button'>"+button_text+"</button>");
		$("body").append($button_read);
		$button_read.click(function() {
				if(response.subsribed == false)
				{
					subscribe_to_novel();
				}
			});
		setTimeout(animate_subsribe_button, 1000);
	});
}


function animate_subsribe_button() {	
	$("#_nu_subsribe_button").animate({"right": "30px"}, 500);
}

function subscribe_to_novel() {
	$("#_nu_subsribe_button").css("right","-300px");
	var novel_id = $("#mypostid").attr("value");
	var latest_chap = $(".chp-release").first().attr("title");
	var name = $(".seriestitlenu").first().text();
	chrome.runtime.sendMessage({
		action: "subsribe",
		novel_id: novel_id,
		name: name,
		latest_chap: latest_chap
	}, function(response) {
		console.log(response);
		var button_text = "You are now subsribed to this.";
		$("#_nu_subsribe_button").text(button_text);
		setTimeout(animate_subsribe_button, 1000);
	});
}

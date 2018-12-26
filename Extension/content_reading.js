if(document.URL.indexOf("bebalkdfejapnfbngpmhchkboajaofen") == -1) {
	check_novel();
}

function check_novel() {
	var button_text = "Import Reading List";
	var $button_read = $("<button id='_nu_subsribe_button' class='_nu_ext_button'>"+button_text+"</button>");
	$("body").append($button_read);
	$button_read.click(function() {
		import_reading_list();
	});
	setTimeout(animate_subsribe_button, 1000);
}


function animate_subsribe_button() {	
	$("#_nu_subsribe_button").animate({"right": "30px"}, 500);
}

function import_reading_list() {
	$("#_nu_subsribe_button").css("right","-300px");
	var length = ("tr").slice(1).length;
	$("tr").slice(1).each(function(index, element) {
		var all_a = $(this).find("a");
		var novel_id = $(this).attr("data-sid");
		var latestChap = $(all_a[2]).text();
		var name = $(all_a[0]).text();
		var last_read = $(all_a[1]).text();
		chrome.runtime.sendMessage({
			action: "subsribe",
			novel_id: novel_id,
			name: name,
			latestChap: latestChap,
			last_read: last_read
		}, function(response) {
			if (index == length - 1) {
				var button_text = "Reading List has been imported.";
				$("#_nu_subsribe_button").text(button_text);
				setTimeout(animate_subsribe_button, 1000);
			}
		});
	});
}

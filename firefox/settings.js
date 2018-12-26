$( document ).ready(function() {
  list_all_novels();
});

function list_all_novels() {
	var tbody = $("<tbody></tbody>");
	chrome.storage.sync.get(null, function(items) {
	  for(var key in items) {
	  	var item = items[key];
	  	tbody.append('<tr id="row_'+item.id+'"><td>'+item.name+"</td><td>"+item.last_read+"/"+item.latestChap+'</td><td><button type="button" id="'+item.id+'" class="btn btn-danger">Delete</button></td></tr>')
	  }
	});
	$("#novel_data").append(tbody);
}


$('body').on('click', '.btn-danger', function() {
	var id =$(this).attr("id");
	$("#row_"+id).remove();
	chrome.storage.sync.remove(["novel_"+id]);
	localStorage.removeItem("new_"+id);
	chrome.runtime.getBackgroundPage(function(bgp){
		bgp.update_popup_badge_text();
	});
});
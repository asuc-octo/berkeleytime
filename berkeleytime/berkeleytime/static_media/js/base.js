// $(document).ajaxError(function (event, jqxhr, settings, exception) {
// 	// console.log("vamos!");
// 	// console.log(jqxhr);
// 	// if (jqxhr.status == 302 && settings.ignoreRedirect) {
// 	// 	console.log("redirect ignored!");
// 	// }
//     if (jqxhr.status == 401 && !settings.bypassLogin) {
//         window.location = "/login/";
//     } else if (jqxhr.status == 500) {
//         window.location = "/500/";
//     }
// })

// Documentation below:
// http://www.sitepoint.com/javascript-generate-lighter-darker-color/
function modifyColor(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

$(document).ready(function () {
	// $(".berkeleytime-secret").each(function () {
	// 	var color = $(this).data("color");
	// 	if (!color) {
	// 		// we don't want to try to operate on the color if it wasn't loaded into the template correctly
	// 		return;
	// 	}
	// 	$(this).css("background-color", $(this).data("color"));
	// 	$(this).css("border-color", modifyColor($(this).data("color"), -0.2));
	// });

	// $(".berkeleytime-secret").click(function (event) {
	// 	var url = $(this).data("url");
	// 	if (url) {
	// 		window.location = url;
	// 	}
	// 	bt_ga.trackEvent("Secrets", "Frame Click", window.secretID);
	// });

	// $(".berkeleytime-secret").mouseenter(function (event) {
	// 	bt_ga.trackEvent("Secrets", "Hover", window.secretID);
	// });

	// $(".berkeleytime-secret a").click(function (event) {
	// 	// if they click on a link, we dont want the click on the ad to trigger as well
	// 	bt_ga.trackEvent("Secrets", "Link Click", window.secretID);
	// 	event.stopPropagation();
	// });

	// if ($(".berkeleytime-secret").length) {
	// 	bt_ga.trackEvent("Secrets", "View", window.secretID);
	// }
    
    $(".textbook-action-area").click(function(event) {
        console.log('CLICKED');
    });

    $(".textbook-action-area").mouseenter(function(event) {
        console.log('MOUSEENTER');
    });


});
'use strict';

var $ = require('jquery');
var github = require('octonode');
//https://github.com/gophergala2016
var client = github.client();
$( document ).ready(function() {
	$("#button").click(function(){
		clearResult();
		client.org('gophergala2016').members(function(err, res) {
			var userLogins = [];
			var locSearch = $('#location').val();
			if(err) {
				console.log(err);
			}
			for (var i = res.length - 1; i >= 0; i--) {
				userLogins.push(res[i].login);
			};

			console.log("Got " + userLogins.length + " users! search for those in " + locSearch);
			for (var i = userLogins.length - 1; i >= 0; i--) {
				var user = client.user(userLogins[i]);
				user.info(function(err, res){
					if (fuzzysearch(res.location, locSearch)) {
						$('<div>').append($('<a>').attr({
							href: 'mailto:' + res.email
						}).text(res.name))
						.append($('<div>').text(res.location + " | hirable? " + res.hireable))
						.appendTo($("#result"));
					}
				});
			}
		});
		
	});
});


function clearResult() {
	$('#result').empty();
}

function fuzzysearch(str, target) {
	if (str == null) return true;
	if (target == null) return true;
	return str.toLowerCase().search(target.toLowerCase()) != -1;
}
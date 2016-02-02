'use strict';

var $ = require('jquery');
var github = require('octonode');

$( document ).ready(function() {
	$("#button").click(function(){
		clearResult();
    getLoginFromCurrentUrl(getOrgMembers);
    
		
	});

  $("#open-option").click(function() {
    if (chrome.runtime.openOptionsPage) {
      // New way to open options pages, if supported (Chrome 42+).
      chrome.runtime.openOptionsPage();
    } else {
      // Reasonable fallback.
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
});


function clearResult() {
	$('#result').empty();
}

function getOrgMembers(login) {
  var token = localStorage['token'];
  var client = github.client(token);
  if(login == null) {
    login = 'gophergala2016';
  }
  client.org(login).members(function(err, res) {
    var userLogins = [];
    var locSearch = $('#location').val();
    if(err) {
      $("#result").text(err);
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
}

function fuzzysearch(str, target) {
	if (str == null) return true;
	if (target == null) return true;
	return str.toLowerCase().search(target.toLowerCase()) != -1;
}

function getLoginFromCurrentUrl() {
  var url = "https://github.com/gophergala2016";
  chrome.tabs.getSelected(null,function(tab) {
        console.log("Url:"+tab.url);
        url = tab.url;
        var login = url.substr(url.lastIndexOf("/")+1);
        console.log("Login:"+login);
        getOrgMembers(login);
  });
}

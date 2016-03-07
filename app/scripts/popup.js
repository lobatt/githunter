'use strict';
var stringify = require('csv-stringify');
var $ = require('jquery');
var github = require('octonode');
var token = localStorage['token'];
var client = github.client(token);
var ITEMS_PER_PAGE = 30; //items per page
var csvContent = [];

$(document).ready(function () {
    if (token.length === 0) {
        displayError("Empty github token, configure that in option", "");
    }

    $("#button").click(function () {
        clearResult();
        clearError();
        getLoginFromCurrentUrl(getOrgMembers);
    });

    $("#open-option").click(function () {
        if (chrome.runtime.openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            chrome.runtime.openOptionsPage();
        } else {
            // Reasonable fallback.
            window.open(chrome.runtime.getURL('options.html'));
        }
    });
    
    $("#open-export").click(exportCsv);
});


function clearResult() {
    $('#result').empty();
    csvContent = [];
}

function clearError() {
    $('#errMsg').empty();
}

function displayError(err, res) {
    if (err) {
        $('#errMsg').empty().text(err);
    }
}
function displayResult(err, res) {
    var locSearch = $('#location').val();
    if (fuzzysearch(res.location, locSearch)) {
        $('<div>').append($('<a target="_blank">').attr({ href: res.html_url }).text(res.name))
            .append($('<div>').text(res.location + " | hirable? " + res.hireable))
            .appendTo($("#result"));
        if (res.email) {
            $('<div>').append($('<a target="_blank">').attr({
                href: 'mailto:' + res.email
            }).text(res.email)).appendTo("#result");
        }
        addToCsvContent([res.name, res.email, res.location, res.hireable, res.html_url]);
    }

}

function getOrgMembers(page, nItems, orgName) {
    if (orgName == null) {
        displayError("Empty org name");
        return;
    }
    client.org(orgName).members(page, nItems, function handleRes(err, res) {
        getUserInfo(err, res);
        if (res && res.length === nItems) {
            page = page + 1;
            client.org(orgName).members(page, nItems, handleRes);
        }
    });
}

function getUserInfo(err, res) {
    var userLogins = [];
    if (err) {
        //displayError(err, res);
        return;
    }
    for (var i = res.length - 1; i >= 0; i--) {
        userLogins.push(res[i].login);
    };

    console.log("Got " + userLogins.length + " users!");
    for (var i = userLogins.length - 1; i >= 0; i--) {
        getSingleUser(userLogins[i]);
    }
}

function getSingleUser(login) {
    var user = client.user(login);
    user.info(displayResult);
}

function fuzzysearch(str, target) {
    if (str == null) return true;
    if (target == null) return true;
    return str.toLowerCase().search(target.toLowerCase()) != -1;
}

function getLoginFromCurrentUrl() {
    var url = "https://github.com/gophergala2016";
    chrome.tabs.getSelected(null, function (tab) {
        console.log("Url:" + tab.url);
        url = tab.url;
        var parts = url.split("/");
        getOrgMembers(1, ITEMS_PER_PAGE, parts[3]);
        getSingleUser(parts[3]);
    });
}

function addToCsvContent(item) {
    csvContent.push(item);
    console.log(csvContent);
}

//TODO: figure out why the newline had been eaten?
function exportCsv() {
    stringify(csvContent, 
        { 
            header:true,
            columns: ['name','email','location', 'hirable','url'],
        }, 
    function (err, output) {
        var a = document.createElement('a');
        console.log(output);
        a.href = 'data:text/csv;charset=utf-8,' + escape(output);
        a.target = '_blank';
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
    });
}

'use strict';
var $ = require('jquery');
var GitHubApi = require('github');


var github = new GitHubApi({
    // required
    version: '3.0.0',
    // optional
    debug: true,
    protocol: 'https',
    host: 'api.github.com', // should be api.github.com for GitHub
    pathPrefix: '/api/v3', // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        'user-agent': 'Githunter-ChromeExtension' // GitHub is happy with a unique user agent
    }
});

$('#button').onClick(function(){
	github.orgs.getMembers({ org: 'gophergala2016'},
		function(err, res) {
			if(err) {
				console.log(err);
			}
			$('#result').text(JSON.stringify(res));
		});
});
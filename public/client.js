// client-side js
// run by the browser each time your view template is loaded

// protip: you can rename this to use .coffee if you prefer

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  
  // setup for enabling different page background colors
  var colorIndex = 0;
  var colors = ['#18FFFF','#EA80FC','#90CAF9','#CCFF90','#FFEA00','#FF8A80','#B39DDB','#81D4FA','#FFD54F','#1DE9B6'];
  
  // initialize the fullPage jquery plugin -- see docs at https://github.com/alvarotrigo/fullPage.js
  $('#fullpage').fullpage({
		sectionsColor: [colors[0]]
	});
	
  // seed the first tweet
  $.get('/tweets', function(tweet) {
      updateTweetPage(tweet);
      $.fn.fullpage.destroy('all');
      $('#fullpage').fullpage({
      	sectionsColor: [colors[0]]
      });
  });
  
  // keep a queue in case we get overloaded with tweets from a popular twitter search
  var queue = [];
  
  // check every 5 seconds before updating the tweets from the queue
  setInterval ( function() {
    if (queue.length > 0) {
      console.log(queue); // DEBUG
      // cycling through all the background colors
      colorIndex++;
      if (colorIndex > 9) {
        colorIndex = 0;
      }
      // clear out the old tweets displayed, so we don't have a page performance issue
      if ($('.section').length > 10) {
        $('.section').last().remove();
      }
      // update the page with the new tweet from the queue
      updateTweetPage(queue.shift());
      $.fn.fullpage.destroy('all');
      $('#fullpage').fullpage({
      	sectionsColor: [colors[colorIndex]]
      });
    }
  }, 5000 );
  
  // Listen for new tweets pushed from the server
  var socket = io();
  socket.on('twitter', function(tweet){
    queue.push(tweet);
  });
});

function replaceURLWithHTMLLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp,"<a target='_blank' href='$1'>$1</a>"); 
}

function updateTweetPage(tweet) {
  if (tweet.retweeted_status) {
    $('#fullpage').prepend('<div class="section"><h1><b>' + tweet.user.name + '</b>: ' + replaceURLWithHTMLLinks(tweet.retweeted_status.text) + '</h1><p>' + Date(tweet.timestamp_ms) + '</p></div>');
  } else {
    $('#fullpage').prepend('<div class="section"><h1><b>' + tweet.user.name + '</b>: ' + replaceURLWithHTMLLinks(tweet.text) + '</h1><p>' + Date(tweet.timestamp_ms) + '</p></div>');
  }
}

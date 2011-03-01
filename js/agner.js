$(function () {

var repositories = [];
var i = 1;

function fetch(rs, i) {
    $.getJSON(
        "http://github.com/api/v2/json/repos/show/agner?callback=?", {page: i},
        function (data) {
            var rs2 = rs.concat(data.repositories);
            if (data.repositories.length > 0) {
                return fetch(rs2, i + 1);
            }
            return display(rs2);
        }
    );
}

function prepare_overlay(top) {
  
  $("#agnerbox").overlay({

    // custom top position
    top: top,

    oneInstance: true,

    // some mask tweaks suitable for agnerbox-looking dialogs
    mask: {

      // you might also consider a "transparent" color for the mask
      color: '#fff',

      // load mask a little faster
      loadSpeed: 200,

      // very transparent
      opacity: 0.5
    },

    // disable this for modal dialog-type of overlays
    closeOnClick: false,

    // load it immediately after the construction
    load: false,

		onClose: function () {
			
		}

  });

  
}

window.master_read = function (i, url)
{
	var height = $(window).height() - 150;
	var width = $(window).width();
	var margin_value = 0.05;
	var margin_width = width - parseInt(width * margin_value) ;
	var margin_height = height - parseInt(height * margin_value);
	
  prepare_overlay(parseInt(height * margin_value));
  
  var overlay = $('#agnerbox').overlay();
	var content = overlay.getOverlay();
	
	content.css({width: margin_width, height: margin_height});
	var buttons = content.find('div.toolbar .buttons').css({right: (margin_width * -1) + 26});

	content.find(".contentWrap").css({height: margin_height - 70});
  
  var split = url.split('github.com/')[1].split('/');
  var user = split[0];
  var repo = split[1];
  href = "http://github.com/api/v2/json/blob/all/"+user+"/"+repo+"/master?callback=?";
 
  $.getJSON(href, function (data) 
  {
    var master = data.blobs;
    var found = false;
    $.each(master, function (file, sha) 
    {
      
      if (file.indexOf('README') > -1)
      {
        found = true;
        read(user, repo, file, sha);
				var homepage = 'http://github.com/' + user +'/'+ repo;
        $('#agner_status').html(file);
        $('#agner_project').html('<a target="_blank" href="' + homepage + '">' + repo +'</a>');
      }
      
    })

    if (! found)
    {
      $('#li_' + i).html('not found').delay(1800).parent().fadeOut(1000);
      return;
    }
  
    if (! overlay.isOpened())
    {
      overlay.load();
    } 

  })  
  
}
  
window.read = function (user, repo, file, sha)
{
  var overlay = $('#agnerbox').overlay();
  var wrap = overlay.getOverlay().find(".contentWrap");
  
  href = "http://github.com/api/v2/json/commits/list/"+user+"/"+repo+"/master/"+file;
  
  $("#agner_status").html('Locating README...');

	var fix_links = function (content) {		
		content.find('a:not([href^=http])').each(function() { 
			var href = this.href;
			
			if (href.indexOf('mailto:') > -1)
				return;
				
			if (href.indexOf(window.location.host) > -1)
				href = href.split(window.location.host)[1];
			
			if (href.indexOf(user + '/') > -1)
				href = href.split(user + '/')[1];
				
			if (href.indexOf('tree/master') == -1)
				href = 'tree/master' + href;
				
			$(this).attr('target', '_blank')
						 .attr('href', 'http://github.com/' + user + '/' + repo + '/' + href)
		});
		
	}

  $.getJSON(
      href +"?callback=?", 
      function (data) {
        var tree = data.commits[0].tree;
        data_href = "http://github.com/api/v2/json/blob/show/"+user+"/"+repo+"/"+tree+"/"+file;
        wrap.html('').append($('<span class="update">Loading ' + file +'...</span>'));
        $.getJSON(data_href +"?callback=?",
            function (text) {
							
              if (file.indexOf('.md') > -1 
							||  file.indexOf('.markdown') > -1)
              {
								var converter = new Showdown.converter();
                fix_links(wrap.html(converter.makeHtml(text.blob.data)))

              } else
							if (file.indexOf('.textile') > -1)
							{
								fix_links(wrap.html(convert(text.blob.data)))
							
							} else 
              {	
                fix_links(wrap.html('<pre class="blob">' + text.blob.data + '</pre>'))
              }
								
            }       
          )

      })       
  
} 

function display(repositories) {
    repositories = $
        .grep(
            repositories,
            function (repos) { return /^(.+)\.agner$/.test(repos.name) && repos.pushed_at != undefined; })
        .sort(
            function (r1, r2) { return r1.name.localeCompare(r2.name) });
    var ul = $('<ul/>');
    $.each(repositories, function (i, repos) {
        var m = /^(.+)\.agner$/.exec(repos.name);
        if (m == null) {
            return;
        }
        var li = $('<li/>').append(
                $('<a/>').attr('href', repos.url).text(m[1]));

				var homepage = repos.homepage;
				var github = repos.homepage.indexOf('https://github.com') !== -1;
				if (github) {
					homepage = repos.homepage.replace('https:', 'https:');
				} else {
					switch (homepage) // first exception, TODO: move this a gist and read from there 
					{
						case 'http://agner.github.com/':
							homepage = 'http://github.com/agner/agner';
							github = true;
							break;
					}
				}

        if (homepage) {
            li
                .append(' (')
                .append($('<a>homepage</a>').attr('href', repos.homepage))
                .append(')');
			  }
			
				if (github) {
             li
               .append($('<span></span>')
								.append(' (')
									.append(($('<a>readme</a>')
									.attr('class', 'readme')
                 	.attr('id', 'li_' + i)
                 	.attr('href', homepage)
									.bind('click', function () { master_read(i, homepage); return false })
								)).append(')'))
        }

        if (repos.description != "") {
            var div = $('<div class="description"/>');
            li.append(div.text(repos.description));
        }
        ul.append(li);
    });
    $('#packages')
        .append(' (' + repositories.length + ')')
        .next('p').replaceWith(ul);
}

fetch([], 1);

});


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

function prepare_overlay() {
  
  $("#agnerbox").overlay({

    // custom top position
    top: 50,

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
    load: false 

  });
  
}
   

window.master_read = function (i, url)
{
  prepare_overlay();
  
  var overlay = $('#agnerbox').overlay();
  var wrap = overlay.getOverlay().find(".contentWrap");

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
        $('#agner_status').html("Located " + file)
      }
      
    })

    if (! found)
    {
      document.getElementById('li_' + i).innerHTML = 'not found';
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
      
  $.getJSON(
      href +"?callback=?", 
      function (data) {
        var tree = data.commits[0].tree;
        data_href = "http://github.com/api/v2/json/blob/show/"+user+"/"+repo+"/"+tree+"/"+file;
        
        $.getJSON(data_href +"?callback=?",
            function (text) {
              if (file.indexOf('.md') > -1 || file.indexOf('.markdown') > -1)
              {
                wrap.html(Markdown(text.blob.data))           
              } else
              {
                wrap.html('<pre class="blob">' + text.blob.data + '</pre>')           
              }
            }       
          )

      })       
  
} 

function display(repositories) {
    repositories = $
        .grep(
            repositories,
            function (repos) { return /^(.+)\.agner$/.test(repos.name); })
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
        if (repos.homepage != "") {
            li
                .append(' (')
                .append($('<a>homepage</a>').attr('href', repos.homepage))
                .append(')');

            if (repos.homepage.indexOf('https://github.com') !== -1)
              li
                .append(' (')
                .append($('<a>readme</a>')
                  .attr('id', 'li_' + i)
                  .attr('href', 'javascript:master_read("'+i+'", "'+repos.homepage.replace('https:', 'https:')+'")'))
                .append(')');
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


$(function () {

$.getJSON("http://github.com/api/v2/json/repos/show/agner?callback=?",
    function (data) {
        var repositories = $
            .grep(
                data.repositories,
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
);

});

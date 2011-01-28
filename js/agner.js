$(function () {

$.getJSON("http://github.com/api/v2/json/repos/show/agner?callback=?",
    function (data) {
        var ul = $('<ul/>');
        $.each(data.repositories, function (i, repos) {
            var m = /^(.+)\.agner$/.exec(repos.name);
            if (m != null) {
                ul.append(
                    $('<li/>').append(
                        $('<a/>').attr('href', repos.url).text(m[1])));
            }
        });
        $('#packages + p').replaceWith(ul);
    }
);

});

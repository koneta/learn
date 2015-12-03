$(document).ready(function() {
    // select table
    var srcTable = $('#copyTable tbody');
    srcTable.selectable();

    // paste table
    $(document)
    .copyable({}, function(e) {
        var tr = '';
        srcTable.find('tr.ui-selected').each(function(i, v) {
            tr += '<tr>' + $(v).html() + '</tr>';
        });
        e.clipboardData.setData('application/qpObjects', tr);
    })
    .pastable({}, function(e) {
        e.clipboardData.getData('application/qpObjects', function(data) {
            var tr = $(data);
            tr.find('.ui-selected').removeClass('ui-selected');
            tr.appendTo('#pasteTable tbody');
        });
    });

});

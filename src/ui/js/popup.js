function log(log) {
    chrome.runtime.sendMessage({
        actionType: 'log',
        log: log
    }, function(response) {});
}

document.addEventListener('DOMContentLoaded', function() {

    var startBtn = $('#action-start');
    var stopBtn = $('#action-stop');
    var cleanBtn = $('#action-cleanup');

    //开始录制
    startBtn.on('click', function() {
        startBtn.hide();
        stopBtn.show();
        chrome.runtime.sendMessage({
            actionType: 'start'
        }, function(response) {
            log("启动")
        });

        return false;
    });

    //停止录制
    stopBtn.on('click', function() {
        stopBtn.hide();
        startBtn.show();

        chrome.runtime.sendMessage({
            actionType: 'stop'
        }, function(response) {
            log("停止")
        })

        return false;
    });

    //清空
    cleanBtn.on('click', function() {

        chrome.runtime.sendMessage({
            actionType: 'clean'
        }, function(response) {
            log("清空")
            ViewCCC.setDataRows([])
            ViewCCC.render()
        })

        return false;
    });

    // 绑定一些代理事件
    var lPaneListNode = "#table-list";
    $(lPaneListNode).delegate('a.action-delete', 'click', function() {
        var id = $(this).attr('v-id');
        var tr = 'tr.v-row' + id;

        chrome.runtime.sendMessage({
            actionType: 'delete',
            id: id
        }, function(response) {
            log("删除: ", id, response)

            // 找下一行的tr的 v-id
            var scrollRowId = $($(tr, lPaneListNode).next()[0]).attr('v-id');
            $(tr, lPaneListNode).remove();
            ViewCCC.addDeleteId(id)
            ViewCCC.render({
                scrollRowId: scrollRowId || null
            })
        })
        return false;
    });

    // 监听后台抓取程序返回的事件
    chrome.runtime.onMessage.addListener(function(message, sender, senResponse) {
        var actionType = message.actionType;

        switch (actionType) {
            case 'data':
                ViewCCC.setDeleteIds(message.removeIds)
                ViewCCC.setDataRows(message.data)
                ViewCCC.render()
                break;
        }
    })

});
var requestSent = {},
    outputData = initOutputData(),
    isCapturing = false,
    enableCapturing = false,
    popupPageId = null,
    filterCond = {
        banList: [],
        allowList: [],
        contentTypeList: ['Document', 'XHR']
    },
    removeIds = {},
    idleIconPath = './icon.png',
    recordingIconPath = './icon-rec.png';

function initOutputData() {
    return {
        name: 'HttpMonitor Echo',
        description: 'Monitor all HTTP/HTTPs traffic from your browser.',
        public: true,
        generator: 'httpmonitor@lianzhi.com',
        version: '1.0',
        date: generateDate(),
        requests: []
    }
}

function generateDate() {
    var x = new Date();
    var y = x.getFullYear();
    var m = x.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = x.getDate();
    d = d < 10 ? '0' + d : d;
    var h = x.getHours();
    h = h < 10 ? '0' + h : h;
    var i = x.getMinutes();
    i = i < 10 ? '0' + i : i;
    var s = x.getSeconds();
    s = s < 10 ? '0' + s : s;
    return [y, m, d, 'T', h, i, s].join('')
}

function resetSession() {
    requestSent = {};
    outputData = initOutputData();
    popupPageId = null;
    filterCond = {
        banList: [],
        allowList: [],
        contentTypeList: ['Document', 'XHR']
    };
}

function toggle(currentTab) {
    var target = {
        tabId: currentTab.id
    };

    // target = {};

    if (!isCapturing) {
        startCapturing(target);
    } else {
        stopCapturing(target);
    }
    resetSession();

    isCapturing = !isCapturing;
}

chrome.browserAction.setTitle({
    'title': "HttpMonitor"
});
chrome.browserAction.onClicked.addListener(toggle);

function startCapturing(target) {
    chrome.debugger.attach(target, "1.0",function(){
        var tabId = target.tabId;
        if (chrome.runtime.lastError) {
            log(chrome.runtime.lastError.message);
            return false;
        }
    });
    chrome.debugger.sendCommand(target, "Network.enable");
    chrome.debugger.onEvent.addListener(onDebuggerEvent);
    chrome.browserAction.setIcon({
        path: recordingIconPath
    });
    openPopupPage();
    // chrome.browserAction.setBadgeText({'text': 'ON'});
    
    return true;
}

function stopCapturing(target) {
    chrome.debugger.detach(target);
    chrome.browserAction.setIcon({
        path: idleIconPath
    });
    closePopupPage();
    enableCapturing = false;
    // chrome.browserAction.setBadgeText({'text': ''});
}

function onDebuggerEvent(debugee, message, params) {
    if (!enableCapturing) {
        return true;
    }
    if (message == "Network.requestWillBeSent") {
        requestSent[params.requestId] = params.request;
    } else if (message == "Network.responseReceived") {
        chrome.debugger.sendCommand(debugee, "Network.getResponseBody", params, function(responseBody) {
            params.response.base64Encoded = responseBody.base64Encoded;
            params.response.body = responseBody.body;

            var request = requestSent[params.requestId];
            if (!request) return;
            captureRequest(params.requestId, params.type, request, params.response);
        });
    }
}

function captureRequest(id, callType, request, response) {
    var row = serializeRequest(id, callType, request, response);
    outputData.requests.push(row);
    delete requestSent[id];
    chrome.runtime.sendMessage({
        actionType: 'data',
        data: outputData.requests,
        removeIds: removeIds
    }, function(response) {});
}

function serializeRequest(id, callType, request, response) {

    var data = {
        id: (id + '').replace('.', ''),
        url: request.url,
        method: request.method,
        referrerPolicy: request.referrerPolicy,
        protocol: response.protocol,
        ip: response.remoteIPAddress,
        port: response.remotePort,
        mime: response.mimeType,
        callType: callType,
        status: response.status,
        statusText: response.statusText,
        base64Encoded: response.base64Encoded,
        requestHeaders: response.requestHeaders || {},
        postData: request.postData || "",
        responseHeaders: response.headers || {},
        responseBody: "",
        timing: response.timing
    }

    if ('XHR' === callType || 'Document' === callType)
    {
        data.responseBody = response.body;
    }

    return data;
}

function filterData(cond, requests, deleteKeys) {

    deleteKeys = deleteKeys || []

    // 默认是全部显示
    requests.forEach(function(d) {
        d.hidden = false;
    });
    //校验Url 正则表达式
    var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
    var allowList = cond.allowList || []
    var banList = cond.banList || []
    var contentTypeList = cond.contentTypeList || []

    if (allowList.length > 0) { // 如果包含白名单，则只显示白名单的内容，其它全部隐藏

        requests.forEach(function(d) {
            d.hidden = true; // 默认设为 隐藏
            // 只有允许列表中的域名才能被显示
            // var host = urlReg.exec(d.url);
            // var address = (host[0]);
            var address = d.url;
            allowList.forEach(function(item) {
                if (address.indexOf(item) >= 0) {
                    d.hidden = false;
                }
            })
        });

    } else if (banList.length > 0) { //如果只包含黑名单，则仅经用掉黑名单的域名

        requests.forEach(function(d) {
            d.hidden = false; // 默认设为 显示
            // 只有允许列表中的域名才能被隐藏
            // var host = urlReg.exec(d.url);
            // var address = (host[0]);
            var address = d.url;
            banList.forEach(function(item) {
                if (address.indexOf(item) >= 0) {
                    d.hidden = true;
                }
            })
        });
    }

    // 过滤内容类型 (仅对显示的请求数据进行过滤)
    if (contentTypeList.length > 0) {
        requests.forEach(function(d) {
            if (!d.hidden) {
                var findit = false
                contentTypeList.forEach(function(item) {
                    if (item === d.callType) {
                        findit = true
                        return false // 跳出循环
                    }
                })

                if (!findit) {
                    d.hidden = true
                }
            }
        });
    }

    var fd = initOutputData();
    requests.forEach(function(d) {
        if (!d.hidden && !isRemove(d.id)) {
            if (deleteKeys.length > 0)
            {
                var a = Fmt.utils.extend({},d);
                deleteKeys.forEach(function(kk){
                    delete a[kk];    
                });
                fd.requests.push(a);
            }
            else
            {
                fd.requests.push(d);
            }            
        }
    });

    return fd;
}

function exportSession(filter) {
    // 去掉 responseBody, hidden
    var fd = filterData(filter, outputData.requests, ['responseBody', 'hidden']);
    if (fd.requests.length < 1) return;
    fd.date = generateDate();

    var blob = new Blob([JSON.stringify(fd, null, 2)], {
        type: "text/plain;charset=utf-8"
    });

    var fileNameSuffix = fd.date;
    saveAs(blob, "HttpMonitor" + fileNameSuffix + ".txt");
}

function openPopupPage() {
    var urlPopup = 'ui/popup.html?version=' + chrome.app.getDetails().version;
    //窗口参数
    var openWinArgs = {
        width: 1040, //parseInt(window.screen.availWidth / 2),
        height: 730 //parseInt(window.screen.availHeight)
    };

    var createWinPopupData = {
        url: urlPopup,
        type: 'popup',
        left: 0,
        top: 0,
        width: openWinArgs.width,
        height: openWinArgs.height //parseInt(openWinArgs.height / 2)
    };

    chrome.windows.create(createWinPopupData, function(openWin) {
        popupPageId = openWin.id;
    });

}

function closePopupPage() {
    if (popupPageId) {
        chrome.windows.remove(popupPageId, function() {
            popupPageId = null;
        });
    }
}

chrome.windows.onRemoved.addListener(function(winId) {
    if (winId === popupPageId) {
        // enableCapturing = false;
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var actionType = message.actionType;

    switch (actionType) {
        case 'start':
            enableCapturing = true;
            break;

        case 'stop':
            enableCapturing = false;
            break;

        case 'clean':
            outputData = initOutputData();
            break;

        case 'delete':
            removeData(message.id);
            break;

        case 'list':
            break;

        case 'download':
            exportSession(message.filterCond);
            break;

        case 'log':
            var log = message.log;
            log(log);
            break;

        default:
            alert('actionType is error');
            break;
    }

});

function removeData(id)
{
    var rid = "x:" + id;
    removeIds[rid] = true;
}

function isRemove(id)
{
    var rid = "x:" + id;
    return removeIds[rid] ? true : false;
}

function log(log) {
    console.log(log)
}
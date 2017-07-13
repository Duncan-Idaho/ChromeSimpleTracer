/**
 * Created by Happily on 17/5/24.
 */
$(function() {

  //抓包完成以后，将抓包后的数据放到这个变量上面。

  var deleteIds = {}

  window.domainData = domainData = [];

  //关闭窗口
  $('.icon-close').click(function() {
    $('.overview-content').fadeOut();
  })

  //关闭筛选地址
  $('.close-m').click(function() {
    $('#address').removeClass('ycb-open');
  })

  //################ table 列表#########################//

  /**
   * 渲染数据列表
   * @param domainData
   */
  function renderData(domainData, renderConfig) {

    renderConfig = renderConfig || {}

    $('#table-list').empty();
    var index = 1;
    var html = '';
    $.each(domainData, function(i, d) {
      if (d && !d.isHidden) {
        var deleteId = ViewCCC.getDeleteId(d.id)
        if (deleteIds[deleteId]) {
          return;
        }
        html = "<tr class='v-row v-row" + d.id + "'>";
        html += "<td width='10%'>" + (index) + "</td>";
        html += "<td width='15%'>" + d.method + "</td>";
        html += "<td width='45%'><div class='text-overflow'><a target='_BLANK' href='" + d.url + "' title='" + d.url + "'>" + d.url + "</a></div></td>"
        html += "<td width='20%'>" + d.callType + "</td>";
        html += "<td width='10%'><a href='#' class='action-delete' v-id='" + d.id + "'>删除</a></td>";
        html += "</tr>";
        $('#table-list').append(html);

        var vRowId = "tr.v-row" + d.id

        $(vRowId).data('dat', d)

        index = index + 1;
      }
    });
    tablescrool();

    // calc scrollRowId
    do {
      var TR = null;

      if (renderConfig['scrollRowId']) {
        TR = $('tr.v-row' + renderConfig['scrollRowId'], "#table-list");
        if (TR.size() > 0) {
          trClick(TR);
          $("div.table-h").prop('scrollTop', TR.prop('offsetTop'))
          break;
        }
      }

      // 滚动条滚到最后一行tr上
      TR = $("#table-list").find("tr").last()
      if (TR.length > 0) {
        trClick(TR);
        $("div.table-h").prop('scrollTop', TR.prop('offsetTop'))
        break;
      }

    } while (false);
  }

  /**
   * 判断table tbody 出现滚动条
   */
  function tablescrool() {
    var tableH = $('.table-h').height();
    var table2 = $('.table2').height();
    if (table2 > tableH) {
      $('.table-h').addClass('table-scroll');
      $('.table-h').removeClass('padding-r-w');
      $('.table-header').addClass('table-header-scroll');
    } else {
      $('.table-header').removeClass('table-header-scroll');
    }
  }

  /**
   * 选中表格当前行的时候，左边有样式，右边需要联动效果
   */
  $("#table-list").delegate('tr.v-row', 'click', function() {
    var self = $(this);
    trClick(self);
  });

  function trClick(self) {
    var others = self.siblings("tr");
    self.addClass("mul-table-active");
    others.removeClass("mul-table-active");

    var dat = self.data('dat') || {}
    var request = self.data('request') || {}
    var response = self.data('response') || {}
    var post = self.data('post') || ''

    var headersHtml = '';
    headersHtml += linkRightContain('General', {
      "URL": dat.url,
      "Method": dat.method,
      "状态码": dat.status + " (" + dat.statusText + ")",
      "远程主机": dat.ip + ':' + dat.port,
      "Referrer策略": dat.referrerPolicy
    });
    headersHtml += linkRightContain('Response Headers', dat.responseHeaders);
    headersHtml += linkRightContain('Request Headers', dat.requestHeaders);
    headersHtml += linkRightContain('postData', dat.postData);    
    $("#request").html(headersHtml);

    var responseHtml = linkRightResponse(fmtResponse(dat.responseBody));
    $("#response").html(responseHtml);

    $('a#request-tab').trigger('click');
  }

  function fmtResponse(response)
  {
    var type = typeofResponse(response);
    console.warn(type);
    switch (type)
    {
      case 'text':
      case 'html':
      case 'xml':
        return ViewCCC.toString(ViewCCC.xmlEscape(response));
        break;
      case 'json':
        return JSON.stringify(JSON.parse(response), null, 2);
        break;    
    }
    return ViewCCC.toString(response);
  }

  function typeofResponse(response)
  {
    var type = 'text';
    do {
      try {
        $.parseJSON(response);
        type = 'json';
        break;
      } catch (e) {}

      if (/\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i.test(response)) {
        type = 'html';
        break;
      }
      try {
        $.parseXML(response);
        type = 'xml';
        break;
      } catch (e) {}
    } while(false);
    
    return type;
  }

  function clearRightContain() {
    $("#request").html('');
    $("#response").html('');
  }

  function linkRightResponse(data)
  {
    return '<div class="tab-pane-div"><div><pre>' + data + '</pre></div></div>';
  }

  function linkRightData(data, decode) {
    var divs = '';
    if ($.isPlainObject(data)) {
      for (var key in data) {
        divs += '<div class="tab-pane-div"><label>' + key + ' :</label><div>' + data[key] + '</div></div>';
      }
    } else if (typeof data === 'string') {
      if ('' !== data)
      {
        divs += '<div class="tab-pane-div"><div>' + (decode ? decodeURIComponent(data) : data) + '</div></div>';  
      }      
    } else {
      divs += '<div class="tab-pane-div"><div>' + JSON.stringify(data) + '</div></div>';
    }
    return divs;
  }

  function linkRightContain(title, data) {
    data = linkRightData(data, true);
    if (data !== '')
    {
      return "<fieldset><legend>" + title + "</legend>" + data + "</fieldset>";  
    }
    return '';
  }

  /*
   条件筛选 -- 开始
   */
  //地址筛选添加 
  $(".add-domain").click(function() {
    var $trHtml = '<tr>';
    $trHtml += '<td class="domain-name"><div class="form-group"><label>域名: </label> <input id="domain" name="domain" type="text" class="form-control text-overflow" value=""> </div></td>';
    $trHtml += '<td class="rules"><div class="form-group"><label>规则:</label> <select class="form-control" name="rule"> <option value="1">显示</option> <option value="2">隐藏</option> </select></div></td>';
    $trHtml += '<td><a href="#" class="icon-close-s"></a></td>';
    $trHtml += '</tr>';
    $(".table-domain tbody").append($trHtml);
    addressDelete()
    return false
  });
  //地址筛选删除
  function addressDelete() {
    $(".icon-close-s").off('click')
    $('.icon-close-s').click(function() {
      $(this).parent().parent().remove();
      return false
    });
  }
  // 初始化
  addressDelete();
  //地址筛选确定按钮
  $(".filter-domain").on("click", function() {

    /*
      域名禁止  不显示   N个    name:banList
      域名允许  显示    N个     name:allowList
     */
    var allowList = [],
      banList = [];

    var hadError = false;
    //将列表放到这两个里面
    $("#formFilter table").find("tr").each(function() {
      var tdArr = $(this).children();
      var domain = tdArr.eq(0).find("input");
      var rule = tdArr.eq(1).find("select");
      var domainVal = $(domain).val();
      var ruleValue = $(rule).val(); //规则 1是允许，2是禁止

      if (ruleValue == 1) {
        allowList.push(domainVal.replace("*", ""));
      } else {
        banList.push(domainVal.replace("*", ""));
      }
    });

    //判断不能出现即使允许又是过滤
    allowList.forEach(function(allow) {
      if (hadError) return false;
      banList.forEach(function(ban) {
        if (allow == ban) {
          hadError = true;
          window.alert(allow + "不能既是允许又是禁止");
          return false;
        }
      })
    });

    // 出错了提示错误并返回
    if (hadError) return false;

    ViewCCC.filterCond.allowList = allowList
    ViewCCC.filterCond.banList = banList

    $('#address').removeClass('ycb-open');
    ViewCCC.render()
    return false
  });


  // 内容类型 全选/全不选
  $("#selectAll").click(function() {
    if (this.checked) {
      $("#list :checkbox").prop("checked", true);
    } else {
      $("#list :checkbox").prop("checked", false);
    }
  });
  //检查内容类型是否都被选中
  $("#list :checkbox").click(function() {
    var chknum = $("#list :checkbox").size(); //选项总个数
    var chk = 0;
    $("#list :checkbox").each(function() {
      if ($(this).prop("checked") == true) {
        chk++;
      } else { //不全选
        $("#selectAll").prop("checked", false);
        return false;
      }
    });
    if (chknum == chk) {
      $("#selectAll").prop("checked", true);
    }
  });
  //绑定内容类型确定按钮.
  $(".btn-ok").on("click", function() {
    $('#type').removeClass('ycb-open');
    selectedChecked();
    ViewCCC.render()
  });

  /*
   条件筛选 -- 结束
   */

  function filter() {

    // console.log("cond", ViewCCC.filterCond)

    /*
      首先将所有的都禁止掉,然后允许的显示出来.
     */
    var domainList = window.domainData;

    // 默认是全部显示
    domainList.forEach(function(d) {
      d.isHidden = false;
    });
    //校验Url 正则表达式
    var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
    var allowList = ViewCCC.filterCond.allowList || []
    var banList = ViewCCC.filterCond.banList || []
    var contentTypeList = ViewCCC.filterCond.contentTypeList || []

    if (allowList.length > 0) { // 如果包含白名单，则只显示白名单的内容，其它全部隐藏

      domainList.forEach(function(d) {
        d.isHidden = true; // 默认设为 隐藏
        // 只有允许列表中的域名才能被显示
        // var host = urlReg.exec(d.url);
        // var address = (host[0]);
        var address = d.url;
        allowList.forEach(function(item) {
          if (address.indexOf(item) >= 0) {
            d.isHidden = false;
          }
        })
      });

    } else if (banList.length > 0) { //如果只包含黑名单，则仅经用掉黑名单的域名

      domainList.forEach(function(d) {
        d.isHidden = false; // 默认设为 显示
        // 只有允许列表中的域名才能被隐藏
        // var host = urlReg.exec(d.url);
        // var address = (host[0]);
        var address = d.url;
        banList.forEach(function(item) {
          if (address.indexOf(item) >= 0) {
            d.isHidden = true;
          }
        })
      });
    }

    // 过滤内容类型 (仅对显示的请求数据进行过滤)
    if (contentTypeList.length > 0) {
      domainList.forEach(function(d) {
        if (!d.isHidden) {
          var findit = false
          contentTypeList.forEach(function(item) {
            if (item === d.callType) {
              findit = true
              return false // 跳出循环
            }
          })

          if (!findit) {
            d.isHidden = true
          }
        }
      });
    }
  }

  function selectedChecked() {
    var valArr = [];

    $("#list input[type=checkbox]:checked").each(function() {
      var ctype = $(this).val()
      if (ctype != '') valArr.push(ctype)
    });

    ViewCCC.filterCond.contentTypeList = valArr
  }

  $('#action-export').on('click', function() {
    chrome.runtime.sendMessage({
      actionType: 'download',
      filterCond: ViewCCC.filterCond
    }, function(response) {});
  });

  var ViewCCC = {};

  ViewCCC.filterCond = {
    banList: [],
    allowList: [],
    contentTypeList: ['Document', 'XHR']
  }

  ViewCCC.setDataRows = function(rows) {
    window.domainData = rows || []
  }

  ViewCCC.render = function(renderConfig) {
    clearRightContain()
    renderConfig = renderConfig || {}
    filter();
    log("渲染行数: %d", window.domainData.length)
    renderData(window.domainData, renderConfig)
  }

  ViewCCC.addDeleteId = function(requestId) {
    // return;
    var key = 'x:' + requestId;
    deleteIds[key] = true;
  }

  ViewCCC.setDeleteIds = function(ids) {
    deleteIds = ids;
  }

  ViewCCC.getDeleteId = function(requestId) {
    return 'x:' + requestId;
  }

  ViewCCC.toString = function(value) {
    if (typeof value !== 'string') {
      if (value === undefined || value === null) {
        value = '';
      } else if (typeof value === 'function') {
        value = toString(value.call(value));
      } else {
        value = JSON.stringify(value);
      }
    }

    return value;
  }

  ViewCCC.xmlEscape = function(content) {
    var html = '' + content;
    var regexResult = /["&'<>]/.exec(html);
    if (!regexResult) {
      return content;
    }

    var result = '';
    var i;
    var lastIndex;
    var char;
    for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {

      switch (html.charCodeAt(i)) {
        case 34:
          char = '&#34;';
          break;
        case 38:
          char = '&#38;';
          break;
        case 39:
          char = '&#39;';
          break;
        case 60:
          char = '&#60;';
          break;
        case 62:
          char = '&#62;';
          break;
        default:
          continue;
      }

      if (lastIndex !== i) {
        result += html.substring(lastIndex, i);
      }

      lastIndex = i + 1;
      result += char;
    }

    if (lastIndex !== i) {
      return result + html.substring(lastIndex, i);
    } else {
      return result;
    }
  }

  window.ViewCCC = ViewCCC
});
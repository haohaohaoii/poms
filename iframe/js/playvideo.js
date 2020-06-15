/**
 * Created by Administrator on 2019/6/14.
 */
var httpcam = 'http://116.255.130.171:8080';
var getEvent = function () {
    return window.event || arguments.callee.caller.arguments[0];
}
function colse() {
    $('#win').css({
        display: 'none'
    });
    oWebControl.JS_HideWnd();// 先让窗口隐藏，规避插件窗口滞后于浏览器消失问题
    //    oWebControl.JS_Disconnect().then(function(){
    //// 断开与插件服务连接成功
    //        },
    //        function() {
    //// 断开与插件服务连接失败
    //        });

    oWebControl.JS_Disconnect().then(function () {
        document.getElementById('playWnd').style.display = 'none'
    }, function () {
    });
}
var oWebControl = null;// 插件对象
var bIE = (!!window.ActiveXObject || 'ActiveXObject' in window);// 是否为IE浏览器
var pubKey = '';

var iLastCoverLeft = 0;
var iLastCoverTop = 0;
var iLastCoverRight = 0;
var iLastCoverBottom = 0;
var initCount = 0;
// 窗口resize
$(window).resize(function () {
    if (oWebControl != null) {
        oWebControl.JS_Resize(700, 400);
        setWndCover();
    }
});

// 滚动条scroll
$(window).scroll(function () {
    if (oWebControl != null) {
        oWebControl.JS_Resize(700, 400);
        setWndCover();
    }
});

// 设置窗口遮挡
function setWndCover() {
    var navigator = window.navigator.userAgent;
    var iWidth = $(window).width();
    var iHeight = $(window).height();

    var oDivRect = $("#playWnd").get(0).getBoundingClientRect();

    var iCoverLeft = (oDivRect.left < 0) ? Math.abs(oDivRect.left) : 0;
    var iCoverTop = (oDivRect.top < 0) ? Math.abs(oDivRect.top) : 0;
    var iCoverRight = (oDivRect.right - iWidth > 0) ? Math.round(oDivRect.right - iWidth) : 0;
    var iCoverBottom = (oDivRect.bottom - iHeight > 0) ? Math.round(oDivRect.bottom - iHeight) : 0;
    if (navigator.indexOf("Chrome") >= 0) {
        iCoverRight -= 200;
    }
    if (navigator.indexOf("Trident") > 0) {
        iCoverRight -= 200;
    }
    //console.log(iCoverBottom);
    iCoverLeft = (iCoverLeft > 700) ? 700 : iCoverLeft;
    iCoverTop = (iCoverTop > 400) ? 400 : iCoverTop;
    iCoverRight = (iCoverRight > 700) ? 700 : iCoverRight;
    iCoverBottom = (iCoverBottom > 400) ? 400 : iCoverBottom;

    if (iLastCoverLeft != iCoverLeft) {
        iLastCoverLeft = iCoverLeft;
        oWebControl.JS_SetWndCover("left", iCoverLeft);
    }
    if (iLastCoverTop != iCoverTop) {
        iLastCoverTop = iCoverTop;
        oWebControl.JS_SetWndCover("top", iCoverTop);
    }
    if (iLastCoverRight != iCoverRight) {
        iLastCoverRight = iCoverRight;
        oWebControl.JS_SetWndCover("right", iCoverRight);
    }
    if (iLastCoverBottom != iCoverBottom) {
        iLastCoverBottom = iCoverBottom;
        oWebControl.JS_SetWndCover("bottom", iCoverBottom);
    }
}


// 初始化插件
//    console.log($)
function initPlugin(obj) {
    var navigator = window.navigator.userAgent;

    var winmodel = obj.code == 0 ? '2x2' : '1x1';
    document.getElementById('playWnd').style.width = '700px';
    document.getElementById('playWnd').style.height = '400px';
    document.getElementById('playWnd').style.display = 'block';
    if (navigator.indexOf("Chrome") >= 0) {
        document.getElementById('playWnd').style.left = '40%';
        document.getElementById('playWnd').style.top = '30%';
    }
    if (navigator.indexOf("Trident") > 0) {
        document.getElementById('playWnd').style.left = '23%';
        document.getElementById('playWnd').style.top = '24%';
    }
    var event = getEvent();

    event.stopPropagation();
    window.parent.dy();
    oWebControl = new WebControl({
        szPluginContainer: "playWnd",
        iServicePortStart: 15900,
        iServicePortEnd: 15909,
        cbConnectSuccess: function () {
            oWebControl.JS_StartService("window", {
                dllPath: "./VideoPluginConnect.dll"
                //dllPath: "./DllForTest-Win32.dll"
            }).then(function () {

                oWebControl.JS_CreateWnd("playWnd", 700, 400).then(function () {
                    getPubKey(function () {
                        oWebControl.JS_RequestInterface({
                            funcName: "init",
                            argument: JSON.stringify({
                                appkey: '23991440',
                                secret: setEncrypt('otBHSHcAmlctch7bJA9v'),
                                ip: '117.158.156.164',
                                playMode: 0, // 预览
                                port: 801,
                                snapDir: '',
                                videoDir: '',
                                layout: winmodel,
                                enableHTTPS: 0,
                                buttonIDs: '',
                                encryptedFields: 'secret'
                            })
                        }).then(function (oData) {
                            var wndId = -1;
                            pvideo(wndId, obj)

                        });


                    })
                });
            }, function () {

            });
        },
        cbConnectError: function () {
            console.log("cbConnectError");
            oWebControl = null;
            alert('检测插件未安装，请安装插件刷新网页后重试');
            window.location.href = '../../js/VideoWebPlugin.exe'
            WebControl.JS_WakeUp("VideoWebPlugin://");
            initCount++;
            if (initCount < 3) {
                setTimeout(function () {
                    initPlugin();
                }, 3000)
            } else {
                alert('检测插件未安装，请安装插件刷新网页后重试');
                window.location.href = './VideoWebPlugin.exe'
            }
        },
        cbConnectClose: function () {
            console.log("cbConnectClose");
            //document.getElementById('playWnd').style.display='none'
            oWebControl = null;
        }
    });
}
//初始化后播放视频
function pvideo(wndId, obj, index) {
    var a = obj.code == 0 ? false : true;

    if (a) {
        oWebControl.JS_RequestInterface({
            funcName: "startPreview",
            argument: JSON.stringify({
                cameraIndexCode: obj.getAttribute('data'),
                streamMode: 1,
                transMode: 1,
                gpuMode: 0,
                wndId: wndId
            })
        }).then(function (oData) {
        });
    } else {
        if (index) {
            oWebControl.JS_RequestInterface({
                funcName: "stopAllPreview"
            }).then(function (oData) {
            });
        }
        index = index ? index : 1;
        var i = 0;
        var arr = obj[index];
        play(i);
        function play(i) {
            if (arr[i] === undefined) {
                //arr=[];
                return false
            }
            oWebControl.JS_RequestInterface({
                funcName: "startPreview",
                argument: JSON.stringify({
                    cameraIndexCode: arr[i],
                    streamMode: 1,
                    transMode: 1,
                    gpuMode: 0,
                    wndId: i + 1
                })
            }).then(function (oData) {
                i++;
                play(i)
            });
        }
    }


}
// 获取公钥
function getPubKey(callback) {
    oWebControl.JS_RequestInterface({
        funcName: "getRSAPubKey",
        argument: JSON.stringify({
            keyLength: 1024
        })
    }).then(function (oData) {
        if (oData.responseMsg.data) {
            pubKey = oData.responseMsg.data
            callback()
        }
    })
}

// RSA加密
// function setEncrypt(value) {
//     var encrypt = new JSEncrypt();
//     encrypt.setPublicKey(pubKey);
//     return enc
//     rypt.encrypt(value);
// }
function setEncrypt(value) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    return encrypt.encrypt(value);
}
//获取逻辑图数据和单元数据
function getLjtdata(router, dom) {
    layui.$.ajax({
        url: httpUrl + 'hdsMcode/mcodestuteList?mn=' + router.search.mn,
        type: 'get',
        dataType: 'json',
        success: function (data) {

            var model = data.data;
            var dyData = data.erpmn;
            //流量计
            if (model && model.length > 0) {
                var lt = layui.$(".map .ljt li");
                for (var i = 0; i < model.length; i++) {
                    for (var n = 0; n < lt.length; n++) {
                        var atr = lt.eq(n);
                        var statuName = ''
                        if (model[i].mcode == atr.attr('nm')) {


                            if (model[i].ar == 0) {  //模拟数据 0代表正常 1离线  2不正常  3：0
                                atr.css({
                                    "background": "url(../../images/img/ljt_1.png) no-repeat center",
                                    "backgroundSize": "contain"
                                });
                                statuName = '正常在线'
                            } else if (model[i].ar == 1) {
                                atr.css({
                                    "background": "url(../../images/img/ljt_4.png) no-repeat center",
                                    "backgroundSize": "contain"
                                });
                                statuName = '离线'
                            } else if (model[i].ar == 2) {
                                atr.css({
                                    "background": "url(../../images/img/ljt_3.png) no-repeat center",
                                    "backgroundSize": "contain"
                                });
                                statuName = '不正常'
                            } else if (model[i].ar == 3) {
                                atr.css({
                                    "background": "url(../../images/img/ljt_2.png) no-repeat center",
                                    "backgroundSize": "contain"
                                });
                                statuName = '0'
                            }

                            atr.attr('a', model[i].rtd);//计时值
                            atr.attr('b', model[i].cou);//累计值
                            atr.attr('c', model[i].uname);//名字
                            atr.attr('d', statuName); //状态
                            atr.attr('e', model[i].mcode); //编码
                            atr.attr('f', model[i].ct == null ? '' : model[i].ct); //采集时间
                            // atr.attr('typ', model[i].mcode.substr(0, 1));//类型
                            // atr.attr('bm', model[i].mcode);//类型
                            // atr.attr('bfb', model[i].percent);//类型



                        }
                    }
                }
            }
            //单元信息
            if (dyData && dyData.length > 0) {
                var lt = layui.$(".map #dy li");
                for (var i = 0; i < dyData.length; i++) {
                    for (var n = 0; n < lt.length; n++) {

                        var atr = lt.eq(n);
                        if (dyData[i].unitCode == atr.attr('code')) {

                            atr.css({
                                "background": "url(../../images/img/dy.png) no-repeat center",
                                "backgroundSize": "contain"
                            });
                            atr.attr('uname', dyData[i].unitName);//计时值
                            atr.click(function () {
                                getDydata(atr.attr('code'), data.data[0].mn, atr.attr('uname'))
                            })

                        }
                    }
                }
            }
        }
    });
    $(".map .ljt li").each(function () {
        $(this).hover(function () {

            if ($('.map').find('.altLjt')) {
                layui.$('.map').find('.altLjt').remove()
            }
            var that = layui.$(this)
            $.ajax({
                url: httpUrl + 'hdsMcode/mcodeList',
                data: {
                    mn: router.search.mn,
                    mcode: $(this).attr('nm')
                },
                dataType: 'json',
                success: function (res) {
                    if (res.data && res.data.length > 0) {

                    }
                    var fiveDat = res.data
                    fiveDat.reverse()
                    var s1 = 0
                    var s2 = 0
                    var s3 = 0
                    for (var m = 0; m < fiveDat.length; m++) {
                        if (m == 0) {
                            var s1t = fiveDat[m].datatime.split('.')
                            s1t = s1t[0]
                            s1 = '<span style="display: inline-block;width: 31px;">' + fiveDat[m].cou + '</span>' + '<span style="padding-left: 30px;">' + s1t + '</span>'
                        } else if (m == 1) {
                            var s2t = fiveDat[m].datatime.split('.')
                            s2t = s2t[0]
                            s2 = '<span style="display: inline-block;width: 31px;">' + fiveDat[m].cou + '</span>' + '<span style="padding-left: 30px;">' + s2t + '</span>'
                        } else if (m == 2) {
                            var s3t = fiveDat[m].datatime.split('.')
                            s3t = s3t[0]
                            s3 = '<span style="display: inline-block;width: 31px;">' + fiveDat[m].cou + '</span>' + '<span style="padding-left: 30px;">' + s3t + '</span>'
                        }
                    }
                    var offset = that.position();
                    var str;
                    str = '<div class="altLjt">' +
                        '<p style="padding-left:30px">编码:' + '&nbsp;&nbsp;&nbsp;' + '<span style="width: 52px;display: inline-block;">' + that.attr('e') + '</span>' + '<span style="padding-left: 10px;">名称:' + '&nbsp;' + that.attr('c') + '<span>' + '</p>' +
                        '<p style="padding-left:30px">状态:' + '&nbsp;&nbsp;&nbsp;' + '<span style="width: 162px;display: inline-block;">' + that.attr('d') + '</span>' + '</p>' +
                        '<p style="padding-left:17px">实时值:' + '&nbsp;&nbsp;&nbsp;' + s1 + '</p>' +
                        '<p style="padding-left:74px">' + s2 + '</p>' +
                        '<p style="padding-left:74px">' + s3 + '</p>' +
                        '</div>';

                    layui.$('.map').stop().append(str);
                    layui.$('.altLjt').css({
                        "top": offset.top - 170 + 'px',
                        "left": offset.left - layui.$('.altLjt').width() / 2 - 45 + 'px'
                    });

                }
            });
        }, function () {
            layui.$('.altLjt').remove();

        })
    })
}


/**单元信息接口 */
function getDydata(unitCode, mn, unitName) {

    layui.use(['layer', 'table'], function () {
        var table = layui.table;
        var layer = layui.layer;
        layer.open({
            type: 1,
            title: [unitName + '排放', 'background:#1492FF;color:white'],
            content: $('#ui'),
            area: ['720px', '420px'], //宽高

            btnAlign: 'c',
            success: function () {
                $('#ui').css('display', 'block');
                table.render({
                    elem: '#openDanyuan' //指定原始表格元素选择器（推荐id选择器）
                    , id: 'openDanyuan'
                    , method: 'get' //接口http请求类型，默认：get
                    , url: httpUrl + 'unitData/unitDatalist'
                    , width: 660

                    , where: {
                        mn: mn,
                        unitCode: unitCode
                    }
                    , cols: [
                        [{ field: 'data', title: '时间', align: 'center' }
                            , { field: 'data_in', title: '进口', align: 'center' }
                            , { field: 'devs_out', title: '出口', align: 'center' }
                        ]
                    ],
                    done: function () {

                        sessionStorage.mn = mn;
                        sessionStorage.unitCode = unitCode
                    }

                });
            },
            cancel: function () {

                $('#ui').css('display', 'none')
            }
        });
    })
}

function getdata(router, dom) {

    //var conheight=layui.$('.container').height();
    //    console.log(conheight);
    //    layui.$('.statics-param-image').css({
    //        top:'8.5%'
    //    });
    layui.$('#open').click(function () {

        layui.$(this).toggleClass('openl');
        layui.$('#quree').toggleClass('openl');
        layui.$('#ul2').toggleClass('openl');
        layui.$('#ul1').toggleClass('hd');
        if (layui.$(this).hasClass('openl')) {
            clearInterval(t);
        } else {
            t = setInterval(move, 20);
        }
    });

    layui.$('#quree #ul1').hover(function () {
        clearInterval(t)
    }, function () {
        if (layui.$(this).hasClass('openl')) {
            clearInterval(t);
        } else {
            t = setInterval(move, 20);
        }
    }
    );
    var speed = 0;

    function move() {

        speed += 1;
        var width = layui.$('#quree #ul1 li').eq(0).width();
        var left = layui.$('#quree #ul1 li').eq(0);
        if (speed >= width) {
            var node = layui.$('#quree #ul1 li').eq(0);
            node.remove();
            layui.$('#quree #ul1').append(node);
            var lnt = -layui.$('#quree #ul1').width();
            layui.$('#quree #ul1 li').last().css('marginLeft', '10px');
            speed = -11;
        } else {
            left.css('marginLeft', -speed + 'px')
        }
    }

    layui.$.ajax({
        url: httpUrl + 'rtds/qrtds?mn=' + router.search.mn,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            var model = data.data;

            var strl = '';
            var stry = '';
            var jk = '';
            for (var i = 0; i < model.length; i++) {
                if (('' + model[i].mcode).substr(0, 1) == 'e') {

                    if (model[i].mcode.substr(1, 1) == '1') {

                        jk = '进口:';
                    } else if (model[i].mcode.substr(1, 1) == '2') {
                        jk = '出口:';
                    }
                    strl += '<li><p>&nbsp;&nbsp;' + model[i].uname + jk + '&nbsp;&nbsp; 实时值:&nbsp;<span>' + Number(model[i].rtd).toFixed(2) + '</span>&nbsp;&nbsp;累计值:<span>' + model[i].cou + '</span></p></li>'


                } else if (('' + model[i].mcode).substr(0, 1) == 'y') {


                    stry += '<li><p>&nbsp;&nbsp;' + model[i].uname + '液位实时值&nbsp;&nbsp;:&nbsp;<span>' + model[i].rtd + '</span></p></li>'


                }


            }
            layui.$('#ul1').append(strl + stry);
            layui.$('#ul2').append('<div><img src="../../images/img/ll.png" alt=""></div>' + strl + '<div><img src="../../images/img/yw.png" alt=""></div><ul class="both">' + stry + '</ul>');

            t = setInterval(move, 20);
        }
    });
    //获取平面图数据
    layui.$.ajax({
        url: httpUrl + 'rtds/qrtds?mn=' + router.search.mn,
        type: 'get',
        dataType: 'json',
        success: function (data) {

            var model = data.data;
            var lt = layui.$(".map .pmt li");
            for (var i = 0; i < model.length; i++) {
                for (var n = 0; n < lt.length; n++) {
                    var atr = lt.eq(n);

                    if (model[i].mcode == atr.attr('nm')) {


                        if (model[i].mcode.substr(0, 1) == 'e') {
                            atr.css({
                                "background": "url(../../images/img/llj.png) no-repeat center",
                                "backgroundSize": "contain"
                            });
                        } else if (model[i].mcode.substr(0, 1) == 'y') {
                            atr.css({
                                "background": "url(../../images/img/ywj.png) no-repeat center",
                                "backgroundSize": "contain"
                            });
                        }


                        atr.attr('a', model[i].rtd);//进
                        atr.attr('b', model[i].cou);//出
                        atr.attr('c', model[i].uname);//名字
                        atr.attr('typ', model[i].mcode.substr(0, 1));//类型
                        atr.attr('bm', model[i].mcode);//类型
                        atr.attr('bfb', model[i].percent);//类型

                        atr.hover(function () {

                            var offset = layui.$(this).position();
                            var str;
                            var lltype;
                            if (layui.$(this).attr('bm').substr(1, 1) == '1') {
                                lltype = '&nbsp;&nbsp;(进口）'
                            } else if (layui.$(this).attr('bm').substr(1, 1) == '2') {
                                lltype = '&nbsp;&nbsp;（出口）'

                            }
                            if (layui.$(this).attr('typ') == 'e') {
                                str = '<div class="alt">' +
                                    '<p>(&nbsp;' + layui.$(this).attr('bm') + '&nbsp;)' + layui.$(this).attr('c') + lltype + '</p>' +
                                    '<p> 瞬时流量：' + layui.$(this).attr('a') + ' m<sup>3</sup>/h</p>' +
                                    '<p>累计流量：' + layui.$(this).attr('b') + ' m<sup>3</sup></p>' +
                                    '</div>';
                            } else if (layui.$(this).attr('typ') == 'y') {
                                str = '<div class="alt">' +
                                    '<p>(&nbsp;' + layui.$(this).attr('bm') + '&nbsp;)' + layui.$(this).attr('c') + '</p>' +
                                    '<p>液位：' + layui.$(this).attr('a') + '</p>' +
                                    '<p>百分比：' + layui.$(this).attr('bfb') + '%</p>' +
                                    '</div>';
                            }


                            layui.$('.map').stop().append(str);
                            layui.$('.alt').css({
                                "top": offset.top - 160 + 'px',
                                "left": offset.left - layui.$('.alt').width() / 2 - 45 + 'px'
                            });

                        }, function () {
                            layui.$('.alt').remove();

                        })

                    }
                }
            }
        }
    });

    //        视频
    //alert(dom)
    layui.$.ajax({
        url: '../js/look.json',
        type: 'get',
        dataType: 'json',
        success: function (data) {
            var model = data.data;
            //                console.log(data);/
            //                console.log(model[router.search.mn].indexCode);
            layui.$.ajax({
                url: httpUrl + 'cameraInfo/list',
                type: 'get',
                data: {
                    //regionIndexCode:model[router.search.mn].indexCode,
                    //pageNo:'1',
                    //pageSize:'1000';
                    mn: router.search.mn
                },
                dataType: 'json',
                success: function (data) {
                    var html = '';
                    var camerobj = {
                        'code': 0
                    };
                    var camerarr = [];
                    var num = 0;
                    for (var i = 0; i < data.data.length; i++) {
                        html += '<li data="' + data.data[i].cameraIndexCode + '" title="' + data.data[i].cameraName + '" onclick="initPlugin(this)"></li>';
                        camerarr.push(data.data[i].cameraIndexCode)
                        if ((i + 1) % 4 == 0) {
                            num++;
                            camerobj[num] = camerarr;
                            camerarr = [];
                        }
                        if ((data.data.length - num * 4) < 4 && (data.data.length - num * 4) > 0) {
                            num++;
                            camerobj[num] = camerarr;

                        }
                    }
                    var camerstr = '<div class="leftcamera" >上一页</div><div class="rightcamera">下一页</div>';


                    $('body').delegate('#camera', 'click', function () {
                        initPlugin(camerobj)
                        window.parent.camer(camerstr, camerobj);
                    });


                    $(dom).append(html);
                    var lt = layui.$(".map ul li");
                    var st;
                    for (var n = 0; n < lt.length; n++) {
                        if (lt.eq(n).attr('title')) {
                            var atr = lt.eq(n);

                            atr.hover(function () {
                                var offset = layui.$(this).position();


                                st = '<div class="alt">' +
                                    '<p></p>' +
                                    '<p>' + layui.$(this).attr('title') + '</p>' +
                                    '</div>';

                                layui.$('.map').append(st);
                                layui.$('.alt').css({
                                    "top": offset.top - 160 + 'px',
                                    "left": offset.left - layui.$('.alt').width() / 2 - 45 + 'px'
                                });

                            }, function () {

                                layui.$('.alt').remove();

                            })
                        }

                    }

                }
            })
        }
    })
}











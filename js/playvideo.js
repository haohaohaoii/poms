/**
 * Created by Administrator on 2019/6/14.
 */

function colse() {

    oWebControl.JS_Disconnect().then(function () {
        win.style.diaplay = 'none'
    }, function () { });
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
    var iWidth = $(window).width();
    var iHeight = $(window).height();
    var oDivRect = $("#playWnd").get(0).getBoundingClientRect();

    var iCoverLeft = (oDivRect.left < 0) ? Math.abs(oDivRect.left) : 0;
    var iCoverTop = (oDivRect.top < 0) ? Math.abs(oDivRect.top) : 0;
    var iCoverRight = (oDivRect.right - iWidth > 0) ? Math.round(oDivRect.right - iWidth) : 0;
    var iCoverBottom = (oDivRect.bottom - iHeight > 0) ? Math.round(oDivRect.bottom - iHeight) : 0;

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
    win.style.diaplay = 'block'
    //console.log(obj.getAttribute('data'));
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
                                layout: '1x1',
                                enableHTTPS: 0,
                                encryptedFields: 'secret'
                            })
                        }).then(function (oData) {

                            var wndId = -1;
                            oWebControl.JS_RequestInterface({
                                funcName: "startPreview",
                                argument: JSON.stringify({
                                    cameraIndexCode: obj.getAttribute('data'),
                                    streamMode: 0,
                                    transMode: 1,
                                    gpuMode: 0,
                                    wndId: wndId
                                })
                            }).then(function (oData) {

                                //        showCBInfo(JSON.stringify(oData ? oData.responseMsg : ''));
                            });

                        });



                    })
                });
            }, function () {

            });
        },
        cbConnectError: function () {
            // console.log("cbConnectError");
            console.log("检测插件未安装，请安装插件刷新网页后重试");
            oWebControl = null;
            alert('检测插件未安装，请安装插件刷新网页后重试');
            window.location.href = './VideoWebPlugin.exe';
            //$("#playWnd").html("插件未启动，正在尝试启动，请稍候...");
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
            oWebControl = null;
        }
    });



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
function setEncrypt(value) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(pubKey);
    return encrypt.encrypt(value);
}


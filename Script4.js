// JavaScript source code
var drawing = false;
// 前回の座標を記録
var before_x = 0;
var before_y = 0;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//スマホの振り分け
var ua = navigator.userAgent;
if (ua.indexOf('iPhone') > 0) {
    ua = 'iphone';
} else if (ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
    ua = 'sp';
} else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
    ua = 'tab';
} else {
    ua = 'other';
}

//イベントの振り分け
var EVENT = {};
if (ua != 'other') {//スマートフォンだったら
    EVENT.TOUCH_START = 'touchstart';
    EVENT.TOUCH_MOVE = 'touchmove';
    EVENT.TOUCH_END = 'touchend';
} else {//パソコンだったら
    EVENT.TOUCH_START = 'mousedown';
    EVENT.TOUCH_MOVE = 'mousemove';
    EVENT.TOUCH_END = 'mouseup';
}


canvas.addEventListener('mousemove', draw_canvas);

// マウスをクリックしてる時
canvas.addEventListener('mousedown', function (e) {
    drawing = true;
    var rect = e.target.getBoundingClientRect();
    before_x = e.clientX - rect.left;
    before_y = e.clientY - rect.top;
});

// マウスをクリックしていない時
canvas.addEventListener('mouseup', function () {
    drawing = false;
});

// 描画の処理
function draw_canvas(e) {
    if (!drawing) {
        return
    };
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var w = document.getElementById('width').value;
    var color = document.getElementById('color').value;
    var r = parseInt(color.substring(1, 3), 16);
    var g = parseInt(color.substring(3, 5), 16);
    var b = parseInt(color.substring(5, 7), 16);
    // 描画
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(before_x, before_y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
    // 描画最後の座標を前回の座標に代入する
    before_x = x;
    before_y = y;
}

var pen = document.getElementById('pencil');
var era = document.getElementById('eraser');

// 鉛筆と消しゴムの切り替え
function tool(btnNum) {
    // クリックされボタンが鉛筆だったら
    if (btnNum == 1) {
        ctx.globalCompositeOperation = 'source-over';
        pen.className = 'active';
        era.className = '';
    }
    // クリックされボタンが消しゴムだったら
    else if (btnNum == 2) {
        ctx.globalCompositeOperation = 'destination-out';
        pen.className = '';
        era.className = 'active';
    }
}


window.addEventListener('load', function () {

    canvas.width = document.documentElement.clientWidth - 100;
    canvas.height = document.documentElement.clientHeight - 80;

    //背景色
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    var img_datas_cnt = 0;
    var img_datas_arr = new Array();

    //ウィンドウリサイズ時
    window.addEventListener('resize', function (event) {

        // canvasの位置座標を取得（描いたものを伸縮させないため、キャンバスの大きさを変える）
        clientRect = canvas.getBoundingClientRect();
        x = clientRect.left;
        y = clientRect.top;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // 一度消して、保存していた配列データを全て描く（ウィンドウを大きくした場合に戻す）
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        for (var i = 0; i < img_datas_arr.length; i++) ctx.putImageData(img_datas_arr[i], 0, 0);

    });


    // マウスダウンイベントを設定
    window.addEventListener(EVENT.TOUCH_START, function (e) {
        //スマホだったら
        if (ua != 'other') e = e.touches[0];
        startX = e.pageX - x;
        startY = e.pageY - y;
        mousedown = true;

    });
    // マウスアップイベントを設定
    window.addEventListener(EVENT.TOUCH_END, function (e) {
        mousedown = false;
        // 配列に保存しておく
        img_datas_arr[img_datas_cnt] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        img_datas_cnt++;

    });
    // マウスムーブイベントを設定
    window.addEventListener(EVENT.TOUCH_MOVE, function (e) {
        //スマホだったら
        if (ua != 'other') e = e.touches[0];
        if (mousedown) draw(e.pageX - x, e.pageY - y);
    });

    // キャンバスに描く
    function draw(x, y) {
        var target = document.getElementById('canvas');
        var context = target.getContext('2d');
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
        startX = x;
        startY = y;
    }

    //クリアボタンクリック時
    document.getElementById('delbt').addEventListener(EVENT.TOUCH_START, function (e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return false;
    });

    // 保存ボタンクリック時
    document.getElementById('savebt').addEventListener(EVENT.TOUCH_START, function (e) {
        //背景色
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // 要素のイベントをリセットしておく
        e.preventDefault();
        Fnk_SaveBt();
        return false;
    });

    // canvas上のイメージを保存
    function Fnk_SaveBt() {
        // base64エンコード
        var base64 = canvas.toDataURL('image/jpeg');
        var blob = Base64toBlob(base64);

        // blobデータをa要素を使ってダウンロード
        saveBlob(blob, 'memo.jpg');
    }

    // Base64データをBlobデータに変換
    function Base64toBlob(base64) {
        // カンマで分割し、base64データの文字列をデコード
        var tmp = base64.split(',');
        var data = atob(tmp[1]);
        // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
        var mime = tmp[0].split(':')[1].split(';')[0];
        //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
        var buf = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) buf[i] = data.charCodeAt(i);
        // blobデータを作成
        var blob = new Blob([buf], { type: mime });
        return blob;
    }

    // 画像のダウンロード
    function saveBlob(blob, fileName) {
        var url = (window.URL || window.webkitURL);
        // ダウンロード用のURL作成
        var dataUrl = url.createObjectURL(blob);
        // イベント作成
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        // a要素を作成
        var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        a.href = dataUrl;
        a.download = fileName;
        a.dispatchEvent(event);
    }

});

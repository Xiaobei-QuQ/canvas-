var $ = function (query){
    return document.querySelector(query)
}

var canvas = {
    init: function () {
        this.sketchpad = document.getElementById('sketchpad')
        this.context = this.sketchpad.getContext('2d')
        this.percent = 0.5;
        this.alpha = 1;
        this.rgb = [0, 0, 0]
        this.lineWidth = 5
        this.using = true
        this.chooseBrush = false
        this.chooseColor = false
        this.chooseDl = false
        this.chooseClear = false
        this.eraserEnable = false
        this.lastPoint = {x: undefined, y: undefined}
        this.start()
        this.setCircle()
        this.bind()
        this.setBg()
    },
    start: function () {
        setCanvasSize()
        window.onresize = function () {
            setCanvasSize()
        }

        function setCanvasSize() {
            var pageWidth = document.documentElement.clientWidth
            var pageHeight = document.documentElement.clientHeight
            this.sketchpad.width = pageWidth
            this.sketchpad.height = pageHeight
        }
    },
    bind: function () {
        var _this = this
        if (document.documentElement.ontouchstart !== undefined) {
            //触屏设备
            this.sketchpad.ontouchstart = function (node) {
                var x = node.touches[0].clientX
                var y = node.touches[0].clientY
                if (!_this.using) {
                    if (_this.chooseBrush) {
                        _this.chooseBrush = !_this.chooseBrush
                        $('#chooseBrush').classList.remove('active')
                    }
                    if (_this.chooseColor) {
                        _this.chooseColor = !_this.chooseColor
                        $('#chooseColor').classList.remove('active')
                    }
                }
                if (!_this.chooseClear && !_this.chooseDl) {
                    _this.using = true;
                }
                if (_this.eraserEnable) {
                    _this.context.clearRect(x - 5, y - 5, _this.percent * 30, _this.percent * 30)
                } else {
                    _this.lastPoint = {x: x, y: y}
                }
            }
            this.sketchpad.ontouchmove = function (node) {
                var x = node.touches[0].clientX
                var y = node.touches[0].clientY
                if (!_this.using) {
                    return
                }
                if (_this.eraserEnable) {
                    _this.context.clearRect(x - 5, y - 5, _this.percent * 30, _this.percent * 30)
                } else {
                    $('#brush').classList.add('active')
                    _this.newPoint = {x: x, y: y}
                    _this.drawLine(_this.lastPoint.x, _this.lastPoint.y, _this.newPoint.x, _this.newPoint.y)
                    _this.lastPoint = _this.newPoint
                }
            }
            this.sketchpad.ontouchend = function (node) {
                _this.using = false
            }
        } else {
            this.setAlert('PC端请F12审查元素打开移动端模拟器查看',5000)
        }
    },

    drawLine: function (x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1) // 起点
        this.context.lineTo(x2, y2) // 终点
        this.context.closePath()
        this.context.strokeStyle = 'rgb(' + this.rgbString + ')'
        this.context.lineWidth = this.lineWidth * this.percent
        this.context.stroke()
    },

    setCircle() {
        var controlWidth = $('.control-width')
        var circleWidth = $('.circle-width')
        var controlAlpha = $('.control-alpha')
        var circleAlpha = $('.circle-alpha')

        function setWid(node, circle) {
            var distance = node.offsetWidth / 2 - circle.offsetWidth / 2
            circle.style.left = distance + 'px'
        }

        function setAlp(node, circle) {
            var distance = node.offsetWidth - circle.offsetWidth
            circle.style.left = distance + 'px'
        }

        setWid(controlWidth, circleWidth)
        setAlp(controlAlpha, circleAlpha)
    },
    setBg: function () {
        this.context.fillStyle = '#ffffff';
        this.context.fillRect(0, 0, this.sketchpad.width, this.sketchpad.height)
    },
    setAlert: function (text,second) {
        $('.alert').innerText = text
        $('.alert').classList.add('active')
        setTimeout(function () {
            $('.alert').classList.remove('active')
        }, second)
    },
}
canvas.init()


var control = {
    init(){
        this.sketchpad = canvas.sketchpad
        this.context = canvas.context
        this.brush = $('#brush')
        this.color = $('#color')
        this.dl = $('#dl')
        this.clear = $('#clear')
        this.eraser = $('#eraser')
        this.brushContainer = $('.chooseBrush>ul')
        this.colorContainer = $('.chooseColor')
        this.colors = $('.colors')
        this.bind()
    },
    bind(){
        var _this = this
        this.brush.onclick = function () {
            canvas.using = false
            canvas.eraserEnable = false
            _this.detection('brush')
            _this.removeClass(brush)
        }
        this.color.onclick = function () {
            canvas.using = false
            _this.detection('color')
            canvas.eraserEnable = false
            _this.removeClass(color)
        }
        this.dl.onclick = function () {
            _this.detection('dl')
            canvas.eraserEnable = false
            canvas.using = false
            _this.removeClass(dl)
            _this.download()
        }

        this.clear.onclick = function () {
            _this.detection('clear')
            canvas.eraserEnable = false
            canvas.using = false
            _this.clearAll()
            _this.removeClass(clear)
        }
        this.eraser.onclick = function () {
            _this.detection('eraser')
            canvas.eraserEnable = true
            canvas.using = false
            _this.removeClass(eraser)
        }

        this.brushContainer.addEventListener('click',function (e) {
            if(e.target&&e.target.nodeName.toUpperCase()=="IMG"){
                if($('.chooseBrush button.active')){
                    $('.chooseBrush button.active').classList.remove('active')
                }
                e.target.parentElement.classList.add('active')
                $('.footer-control button.brush.active').style.backgroundColor = window.getComputedStyle(e.target.parentElement).backgroundColor
                $('.footer-control button.brush.active img').src = e.target.getAttribute('src')
            }
            if(!e.target.parentNode.classList.contains('brush-pencil')){
                canvas.setAlert('canvas笔刷功能还未完善',1000)
            }
        },false)

        this.colorContainer.addEventListener('click',function (e) {
            if(e.target&&e.target.classList.contains('button')){
                var chooseColor = window.getComputedStyle(e.target).backgroundColor
                $('.footer-control button.color').style.backgroundColor = chooseColor
                canvas.rgb = chooseColor.match(/(\d{1,3})/g)
                _this.chooseAlpha()
            }
        },false)

        this.colors.ontouchstart = function (e) {
            _this.startX = e.touches[0].clientX;
        }

        this.colors.ontouchmove = function (e) {
            _this.moveEndX = e.touches[0].clientX;
            var X = _this.moveEndX - _this.startX;
            if ( X < -20 ) {
                _this.colors.style.left = '-94vw'
                $('.firstPage').classList.remove('active')
                $('.secondPage').classList.add('active')
            }
            if( X > 20 ){
                _this.colors.style.left = '0'
                $('.firstPage').classList.add('active')
                $('.secondPage').classList.remove('active')
            }
        }

        this.chooseSize()

    },
    detection: function (node) {
        if(node === 'brush'){
            canvas.chooseBrush = !canvas.chooseBrush
            canvas.chooseColor = false
            canvas.chooseClear = false
            canvas.chooseDl = false
        }else if(node === 'color'){
            canvas.chooseBrush = false
            canvas.chooseColor = !canvas.chooseColor
            canvas.chooseClear = false
            canvas.chooseDl = false
        }else if (node === 'clear') {
            canvas.chooseBrush = false
            canvas.chooseColor = false
            canvas.chooseClear = true
            canvas.chooseDl = false
        }else if (node === 'dl') {
            canvas.chooseBrush = false
            canvas.chooseColor = false
            canvas.chooseClear = false
            canvas.chooseDl = true
        } else if(node === 'eraser'){
            canvas.chooseBrush = false
            canvas.chooseColor = false
            canvas.chooseClear = false
            canvas.chooseDl = false
        }
        if(canvas.chooseBrush){
            $('#chooseBrush').classList.add('active')
        }else{
            $('#chooseBrush').classList.remove('active')
        }
        if(canvas.chooseColor){
            $('#chooseColor').classList.add('active')
        }else{
            $('#chooseColor').classList.remove('active')
        }
        if(canvas.chooseClear){
            $('.caveat').classList.add('active')
        }else{
            $('.caveat').classList.remove('active')
        }
    },
    removeClass: function (node) {
        $('#brush').classList.remove('active')
        $('#color').classList.remove('active')
        $('#dl').classList.remove('active')
        $('#clear').classList.remove('active')
        $('#eraser').classList.remove('active')
        node.classList.add('active')
    },
    download : function () {
        var url = this.sketchpad.toDataURL('image/png')
        var a = document.createElement('a')
        a.href = url
        a.download = 'My picture'
        a.target = '_blank'
        a.click()
    },
    clearAll: function () {
        var _this = this
        $('#clearAll').onclick = function () {
            _this.context.clearRect(0,0,_this.sketchpad.width,_this.sketchpad.height)
            canvas.setBg()
            $('.caveat').classList.remove('active')
        }
        $('#noClear').onclick = function () {
            $('.caveat').classList.remove('active')
        }
    },
    chooseSize: function () {
        var _this = this
        var controlWidth = $('.control-width')
        var circleWidth = $('.circle-width')
        var controlAlpha = $('.control-alpha')
        var circleAlpha = $('.circle-alpha')
        turnSize(controlWidth,circleWidth)
        turnSize(controlAlpha,circleAlpha)
        function turnSize (node,circle) {
            node.ontouchstart = function (e) {
                var l = circle.offsetLeft
                var x = e.touches[0].clientX
                _this.disX = x - l
                _this.max = node.offsetWidth - circle.offsetWidth
            }
            node.ontouchmove = function (e) {
                var moveX = e.touches[0].clientX
                var moveL = Math.min(_this.max,Math.max(0,moveX - _this.disX))
                circle.style.left = moveL + 'px'
                if(node == $('.control-width')){
                    canvas.percent = moveL / _this.max
                }
                if(node == $('.control-alpha')){
                    canvas.alpha = moveL / _this.max
                    _this.chooseAlpha()
                }
            }
        }
    },
    chooseAlpha : function() {
        canvas.rgbString = canvas.rgb.map(function (value) {
            return  parseInt(value) + parseInt(100 - canvas.alpha * 100)
        })
    },
}
control.init()
var canvas = {
    init: function () {
        this.sketchpad = document.getElementById('sketchpad')
        this.context = this.sketchpad.getContext('2d')
        this.percent = 0.5;
        this.alpha = 1;
        this.rgb = [0,0,0]
        this.lineWidth = 5
        this.using = true
        this.chooseBrush = false
        this.chooseColor = false
        this.chooseDl = false
        this.chooseClear = false
        this.eraserEnable = false
        this.lastPoint = {x:undefined,y:undefined}
        this.start()
        this.setCircle()
        this.bind()
        this.listen()
        this.chooseSize()
        this.chooseAlpha()
        this.setBg()
    },
    start: function() {
        setCanvasSize()
        window.onresize = function() {
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
        if(document.documentElement.ontouchstart !== undefined){
            //触屏设备
            this.sketchpad.ontouchstart = function (node) {
                var x = node.touches[0].clientX
                var y = node.touches[0].clientY
                if(!_this.using){
                    if(_this.chooseBrush){
                        _this.chooseBrush = !_this.chooseBrush
                        document.getElementById('chooseBrush').classList.remove('active')
                    }
                    if(_this.chooseColor){
                        _this.chooseColor = !_this.chooseColor
                        document.getElementById('chooseColor').classList.remove('active')
                    }
                }
                if(!_this.chooseClear && !_this.chooseDl){
                    _this.using = true;
                }
                if(_this.eraserEnable){
                    _this.context.clearRect(x-5,y-5,_this.percent*30,_this.percent*30)
                }else{
                    _this.lastPoint = {x:x,y:y}
                }
            }
            this.sketchpad.ontouchmove = function (node) {
                var x = node.touches[0].clientX
                var y = node.touches[0].clientY
                if(!_this.using){return}
                if(_this.eraserEnable){
                    _this.context.clearRect(x-5,y-5,_this.percent*30,_this.percent*30)
                }else{
                    document.getElementById('brush').classList.add('active')
                    _this.newPoint = {x:x,y:y}
                    _this.drawLine(_this.lastPoint.x,_this.lastPoint.y,_this.newPoint.x,_this.newPoint.y)
                    _this.lastPoint = _this.newPoint
                }
            }
            this.sketchpad.ontouchend = function (node) {
                _this.using = false
            }
        }
    },
    drawLine: function (x1,y1,x2,y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1) // 起点
        this.context.lineTo(x2, y2) // 终点
        this.context.closePath()
        this.context.strokeStyle = 'rgb(' + this.rgbString + ')'
        this.context.lineWidth = this.lineWidth * this.percent
        this.context.stroke()
    },
    listen: function () {
        var _this = this
        var brush = document.getElementById('brush')
        brush.onclick = function () {
            _this.using = false
            _this.eraserEnable = false
            _this.detection('brush')
            _this.removeClass(brush)

        }
        var color = document.getElementById('color')
        color.onclick = function () {
            _this.using = false
            _this.detection('color')
            _this.eraserEnable = false
            _this.removeClass(color)
        }
        var dl = document.getElementById('dl')
        dl.onclick = function () {
            _this.detection('dl')
            _this.eraserEnable = false
            _this.using = false
            _this.removeClass(dl)
            _this.download()
        }
        var clear = document.getElementById('clear')
        clear.onclick = function () {
            _this.detection('clear')
            _this.eraserEnable = false
            _this.using = false
            _this.clearAll()
            _this.removeClass(clear)
        }
        var eraser = document.getElementById('eraser')
        eraser.onclick = function () {
            _this.detection('eraser')
            _this.eraserEnable = true
            _this.using = false
            _this.removeClass(eraser)
        }
        var brushContainer = document.querySelector('.chooseBrush>ul')
        brushContainer.addEventListener('click',function (e) {
            if(e.target&&e.target.nodeName.toUpperCase()=="IMG"){
                if(document.querySelector('.chooseBrush button.active')){
                    document.querySelector('.chooseBrush button.active').classList.remove('active')
                }
                e.target.parentElement.classList.add('active')
                document.querySelector('.footer-control button.brush.active').style.backgroundColor = window.getComputedStyle(e.target.parentElement).backgroundColor
                document.querySelector('.footer-control button.brush.active img').src = e.target.getAttribute('src')
            }
            if(!e.target.parentNode.classList.contains('brush-pencil')){
                _this.setAlert()
            }
        },false)
        var colorContainer = document.querySelector('.chooseColor')
        colorContainer.addEventListener('click',function (e) {
            if(e.target&&e.target.classList.contains('button')){
                var chooseColor = window.getComputedStyle(e.target).backgroundColor
                document.querySelector('.footer-control button.color').style.backgroundColor = chooseColor
                _this.rgb = chooseColor.match(/(\d{1,3})/g)
                _this.chooseAlpha()
            }
        },false)
        var colors = document.querySelector('.colors')
        colors.ontouchstart = function (e) {
            _this.startX = e.touches[0].clientX;
        }
        colors.ontouchmove = function (e) {
            _this.moveEndX = e.touches[0].clientX;
            var X = _this.moveEndX - _this.startX;
            if ( X < -20 ) {
                colors.style.left = '-94vw'
            }
            if( X > 20 ){
                colors.style.left = '0'
            }
        }
    },
    removeClass: function (node) {
        document.getElementById('brush').classList.remove('active')
        document.getElementById('color').classList.remove('active')
        document.getElementById('dl').classList.remove('active')
        document.getElementById('clear').classList.remove('active')
        document.getElementById('eraser').classList.remove('active')
        node.classList.add('active')
    },
    detection: function (node) {
        if(node === 'brush'){
            this.chooseBrush = !this.chooseBrush
            this.chooseColor = false
            this.chooseClear = false
            this.chooseDl = false
        }else if(node === 'color'){
            this.chooseBrush = false
            this.chooseColor = !this.chooseColor
            this.chooseClear = false
            this.chooseDl = false
        }else if (node === 'clear') {
            this.chooseBrush = false
            this.chooseColor = false
            this.chooseClear = true
            this.chooseDl = false
        }else if (node === 'dl') {
            this.chooseBrush = false
            this.chooseColor = false
            this.chooseClear = false
            this.chooseDl = true
        } else if(node === 'eraser'){
            this.chooseBrush = false
            this.chooseColor = false
            this.chooseClear = false
            this.chooseDl = false
        }
        if(this.chooseBrush){
            document.getElementById('chooseBrush').classList.add('active')
        }else{
            document.getElementById('chooseBrush').classList.remove('active')
        }
        if(this.chooseColor){
            document.getElementById('chooseColor').classList.add('active')
        }else{
            document.getElementById('chooseColor').classList.remove('active')
        }
        if(this.chooseClear){
            document.querySelector('.caveat').classList.add('active')
        }else{
            document.querySelector('.caveat').classList.remove('active')
        }
    },
    chooseSize: function () {
        var _this = this
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
                if(node == document.querySelector('.control-width')){
                    _this.percent = moveL / _this.max
                }
                if(node == document.querySelector('.control-alpha')){
                    _this.alpha = moveL / _this.max
                    _this.chooseAlpha()
                }
            }
            node.ontouchend = function (e) {
            }
        }
        var controlWidth = document.querySelector('.control-width')
        var circleWidth = document.querySelector('.circle-width')
        var controlAlpha = document.querySelector('.control-alpha')
        var circleAlpha = document.querySelector('.circle-alpha')
        turnSize(controlWidth,circleWidth)
        turnSize(controlAlpha,circleAlpha)
    },
    chooseAlpha : function() {
        var _this = this
        this.rgbString = this.rgb.map(function (value) {
            return  parseInt(value) + parseInt(100 -_this.alpha * 100)
        })
    },
    setCircle() {
        var controlWidth = document.querySelector('.control-width')
        var circleWidth = document.querySelector('.circle-width')
        var controlAlpha = document.querySelector('.control-alpha')
        var circleAlpha = document.querySelector('.circle-alpha')
        function setWid(node,circle) {
            var distance = node.offsetWidth/2 - circle.offsetWidth/2
            circle.style.left = distance+'px'
        }
        function setAlp(node,circle) {
            var distance = node.offsetWidth - circle.offsetWidth
            circle.style.left = distance+'px'
        }
        setWid(controlWidth,circleWidth)
        setAlp(controlAlpha,circleAlpha)
    },
    setAlert: function () {
        document.querySelector('.alert').classList.add('active')
        setTimeout(function () {
            document.querySelector('.alert').classList.remove('active')
        },1000)
    },
    clearAll: function () {
        var _this = this
        document.getElementById('clearAll').onclick = function () {
            _this.context.clearRect(0,0,_this.sketchpad.width,_this.sketchpad.height)
            _this.setBg()
            document.querySelector('.caveat').classList.remove('active')
        }
        document.getElementById('noClear').onclick = function () {
            document.querySelector('.caveat').classList.remove('active')
        }
    },
    download : function () {
        var url = this.sketchpad.toDataURL('image/png')
        var a = document.createElement('a')
        a.href = url
        a.download = 'My picture'
        a.target = '_blank'
        a.click()
    },
    setBg : function () {
        this.context.fillStyle = '#ffffff';
        this.context.fillRect(0,0,this.sketchpad.width ,this.sketchpad.height)
    }
}
canvas.init()
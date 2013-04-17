var Map = function($container, bkImgUrl) {
    var map,
        $sprites = $container.find('#map'),
        $background = $container.find('#background'),
        context = $background[0].getContext('2d'),
        bkImage = new Image(),
        bkImgLoaded = false;

    context.webkitImageSmoothingEnabled = false;
    bkImage.src = bkImgUrl;
    bkImage.onload = function(){
        bkImgLoaded = true;
        drawBackground(0, 0);
    };

    function drawBackground(x, y) {
        if(!bkImgLoaded){
            bkImage.onload = function(){
                bkImgLoaded = true;
                drawBackground(x, y);
            };
            return;
        }

        var width = $container.width(), 
            height = $container.height();
        
        if($background.width() != width)
            //$background.width(width); TODO: ? why not work
            $background[0].width = width;

        if($background.height() != height)
            //$background.height(height);
            $background[0].height = height;

        context.clearRect(0, 0, width, height);
        var sx = x, sy = y, sw = width, sh = height, 
            dx = 0, dy = 0, dw = width, dh = height;

        if(x < 0) {
            sx = 0;
            sw = width + x;
            dx = -x;
            dw = width + x;
        }

        if(y < 0) {
            sy = 0;
            sh = height + y;
            dy = -y;
            dh = height + y;
        }

        if(x + width > bkImage.width) {
            dw = sw = bkImage.width - x;
        }

        if(y + height > bkImage.height) {
            dh = sh = bkImage.height - y;
        }

        context.drawImage(bkImage, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    var Link = (function(){
        var $graph = $('#graph');
        var context = $graph[0].getContext('2d');
        $graph[0].width = window.screen.width;
        $graph[0].height = window.screen.height;

        function drawCurve(x0, y0, x1, y1){

            var len = Math.sqrt(((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1))),
                t = Math.PI - Math.acos((x1-x0)/len),
                d = (x0<x1 ? 1 : -1);
                x = (x0+x1)/2+d*len*.3*Math.sin(t),
                y = (y0+y1)/2+d*len*.3*Math.cos(t);

            context.beginPath();
            context.moveTo(x0, y0);
            context.quadraticCurveTo(x, y, x1, y1);
            context.stroke();
        }

        function showLinks(sprite){
            if(!sprite.data.detail.team)
                return;

            var items = Sprite.items;
            context.strokeStyle="#e16c5f";
            context.lineWidth = 4;
            for(var id in items){
                if(id == sprite.id)
                    continue;

                var item = items[id];

                if(item.type === 'person' &&  
                    item.data.detail.team === sprite.data.detail.team) {
                    drawCurve(
                        sprite.x()+map.offsetX, 
                        sprite.y()+map.offsetY,
                        item.x()+map.offsetX, 
                        item.y()+map.offsetY);
                }
            }
        }

        function clearAll(){
            context.clearRect(0, 0, $graph.width(), $graph.height());
        }

        return function(sprite){
            if(sprite.type === 'person') {
                sprite.$el
                    .mouseover(function(){
                        showLinks(sprite);
                    })
                    .mouseout(clearAll);
            }
        };
    })();

    map = {
        offsetX : 0,
        offsetY : 0,
        addSprite : function(sprite) {
            $sprites.append(sprite.$el);
            sprite.$el.draggable({ 
                containment: $container, 
                opacity: 0.7, 
                helper: "clone", 
                addClasses: false, 
                appendTo:'body',
                start: function(){
                    Utils.closeAllTips();
                },
                stop : function(e){
                    if(sprite.update({x:e.pageX - map.offsetX, y:e.pageY - map.offsetY})){
                        window.net.server('updateSprite', sprite.data);
                    }
                }
            });
            Link(sprite);
        },
        move : function(x, y){
            this.offsetX = (x || 0), this.offsetY = (y || 0);

            drawBackground(-x, -y);
            $sprites.css('-webkit-transform', 'translate(' + x + 'px, ' + y + 'px)');
        },
        center : function(point){
            var width = $container.width(),
                height = $container.height();

            this.offsetX = (width/2-point.x);
            this.offsetY = (height/2-point.y);

            drawBackground(-this.offsetX, -this.offsetY);
            $sprites.css('-webkit-transform', 'translate(' + this.offsetX + 'px, ' + this.offsetY + 'px)');
        }
    }

    $container.mousedown(function(e){
        if(e.target.id === 'container') {
            $container.addClass('drag');
            var x1 = e.pageX, y1 = e.pageY, mx = map.offsetX, my = map.offsetY, x, y, moving = false;

            $container
                .mousemove(function(e){
                    x = mx + (e.pageX - x1),
                    y = my + (e.pageY - y1);
                    if(!moving) {
                        moving = true;
                        webkitRequestAnimationFrame(function(){
                            map.move(x, y);
                            if(moving){
                                webkitRequestAnimationFrame(arguments.callee);
                            }
                        });
                    }
                })
                .bind('mouseup mouseout', function(e){
                    moving = false;
                    $container.removeClass('drag');
                    $container.unbind('mousemove mouseup mouseout');
                });
        }
    });

    window.onresize = function(e){
        map.move(map.offsetX, map.offsetY);
    };

    return map;
};
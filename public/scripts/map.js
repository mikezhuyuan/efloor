var Map = function($container, bkImgUrl) {
    var map,
        $sprites = $container.find('#map'),
        $background = $container.find('#background'),
        context = $background[0].getContext('2d'),
        bkImage = new Image(),
        bkImgLoaded = false;

    bkImage.src = bkImgUrl;
    bkImage.onload = function(){
        bkImgLoaded = true;
        drawBackground(0, 0);
    };

    function drawBackground(x, y) {
        if(!bkImgLoaded)
            return;

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
                stop : function(e){
                    if(sprite.update({x:e.pageX - map.offsetX, y:e.pageY - map.offsetY})){
                        window.net.server('updateSprite', sprite.data);
                    }
                }
            });
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
                .bind('mouseup mouseleave', function(e){
                    moving = false;
                    $container.removeClass('drag');
                    $container.unbind('mousemove mouseup mouseleave');
                });
        }
    });

    window.onresize = function(e){
        console.log(e);        
        map.move(map.offsetX, map.offsetY);
    };

    return map;
};
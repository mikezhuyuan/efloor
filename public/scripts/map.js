var Map = function() {
    var map,
        $map = $('#map'),
        $container  = $('#container'),
        width = $container.width(),
        height = $container.height();

    map = {
        offsetX : 0,
        offsetY : 0,
        addSprite : function(sprite) {
            sprite.$el.appendTo($map);
        },
        move : function(dx, dy){
            var x = this.offsetX + dx, y = this.offsetY + dy;
            $container.css('background-position',x  + 'px ' + y + 'px');
            $map.css('-webkit-transform', 'translate(' + x + 'px, ' + y + 'px)');
        },
        center : function(point){
            this.offsetX = (width/2-point.x);
            this.offsetY = (height/2-point.y);
            $map.css('-webkit-transform', 'translate(' + this.offsetX + 'px, ' + this.offsetY + 'px)');
        }
    }

    $container.mousedown(function(e){
        if(e.target.id === 'container') {
            var x1 = e.pageX, y1 = e.pageY, dx=0, dy=0;

            $container
                .mousemove(function(e){
                    dx = (e.pageX - x1);
                    dy = (e.pageY - y1);
                    map.move(dx, dy);
                })
                .bind('mouseup mouseleave', function(e){
                    map.offsetX += dx, map.offsetY += dy;
                    $container.unbind('mousemove mouseup mouseleave');
                });
        }
    });

    return map;
};
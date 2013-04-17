
var Legend = function(elemLegend, map) {
    var _this = this;
    this.el = elemLegend;
    this.map = map;

    $(this.el).draggable({ 
        containment: 'document', 
        opacity: 0.7, 
        helper: "clone", 
        addClasses: false, 
        appendTo:'body',
        stop : function(e){
            var sprite = Sprite.new(
                $(_this.el).attr("data-type"),
                e.pageX - _this.map.offsetX, 
                e.pageY - _this.map.offsetY);

            _this.map.addSprite(sprite);
            window.net.server('addSprite', sprite.data);
        }
    });
};
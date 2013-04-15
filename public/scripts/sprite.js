var Sprite = function(data){
    var _this = this;
    this.data = data;
    this.type = data.type;
    
    Sprite.items[this.id = this.data.id] = this;
    this.$el = $(Sprite.tmplSprite(this.data));
    this.$el.qtip(Tip(this));
    this.$el.find(".delete-sprite-button").click(function(){
        _this.remove();
        window.net.server('removeSprite', data.id);
    });

    this.setPosition(data.detail.x, data.detail.y);
};

Sprite.items = Object.create(null);
Sprite.tmplSprite = _.template($("#tmplSprite").html());
Sprite.tmplOverlay  = _.template($("#tmplOverlay").html());

Sprite.new = function(type, x, y) {
    var id = parseInt(Math.random() * 1000000000);
    //TODO: handle person & meeting room
    return new Sprite({
        id:id,
        type:type,
        detail : {
            x:x,
            y:y,
            title:"Title..",
            img:"images/person.png",
            team:"Team..",
            name:"Name..",
            from:"From..",
            desc:"Hello.."
        }
    });
}

Sprite.create = function(data) {
    return new Sprite(data);
}

Sprite.prototype = {
    setPosition:function(x, y){
        this.$el.css({left: x - 18, top: y - 18});
    },
    remove : function(){
        delete Sprite.items[this.id];
        this.$el.remove();
        this.$el = null;
        this.data = null;
    },
    update: function(field,val){
        if(val === undefined) {
            var data = field, updated = false, reposition = false;
            for(var field in data) {
                if(this.updateField(field, data[field])) {
                    if(field === 'x' || field === 'y')
                        reposition = true;
                    updated = true;
                }
            }

            if(reposition) {
                this.setPosition(data.x, data.y);
            }

            return updated;
        } else {
            return this.updateField(field, val);
        }
    },
    updateField : function(field, val){
        if(field && val && this.data.detail[field] != val){
            this.data.detail[field] = val;
            if(field == 'img') {
                this.$el.css('background-image', 'url('+val+')');
            }

            return true;
        }
        
        return false;
    },
    center: function(){
        //close all tips
        _.each(Sprite.items, function(s){
            s.$el.qtip("hide");
        });
        return {
            x:this.x()+this.$el.width()/2,
            y:this.y()+this.$el.height()/2
        }
    },
    x: function(){
        return this.data.detail.x;
    },
    y: function(){
        return this.data.detail.y;
    }
};

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
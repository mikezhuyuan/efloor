var Tip = function(sprite) {
    var _this = sprite;
    function updateSprite(sprite, $field) {
        var field = $field.attr("field"), val;
        if(field === 'img')
            val = $field.val();
        else
            val = $field.html();

        if(sprite.updateField(field, val)){
            window.net.server('updateSprite', sprite.data);
        }
    }
    return {
        content: {
            text: function(){
                var $elemTip = $(Sprite.tmplOverlay(_this.data))
                    , $details = $elemTip.find('li[contenteditable="true"]')
                    , $avatar = $elemTip.find(".profile-avatar")
                    , $avatarImg = $avatar.find(".profile-avatar-img")
                    , $avatarUrl = $avatar.find(".profile-avatar-url");
                $details.click(function(){
                    $(this).siblings().removeClass("profile-editing");
                });
                //update data after hit enter
                $details.keypress(function(e){
                    var $field = $(this);
                    if(e.keyCode === 13){
                        updateSprite(_this, $field);
                        $field.blur();
                        $field.addClass("profile-editing");
                        $field.mousemove(function(){
                            $field.removeClass("profile-editing");
                            $field.unbind("mousemove");
                        });
                        return false;
                    }
                });
                $details.blur(function(){
                    var $field = $(this);
                    updateSprite(_this, $field);
                });
                //avatar
                $avatar.click(function(){
                    var $field = $(this);
                    $field.addClass("profile-editing");
                    $avatarUrl.val($avatarImg.attr("src"));
                });
                $avatarUrl.keypress(function(e){
                    var $field = $(this), val = $field.val();
                    if(e.keyCode === 13){
                        updateSprite(_this, $field);
                        $field.blur();
                        $avatarImg.attr("src", val);
                        $avatar.removeClass("profile-editing");
                        return false;
                    }
                });
                $avatarUrl.blur(function(e){
                    var $field = $(this), val = $field.val();
                    _this.update($field.attr("field"),val);
                    $avatarImg.attr("src", val);
                    $avatar.removeClass("profile-editing");
                });
                return $elemTip;
            },
            title: {
                button: "Close"
            }
        },
        style: {
            classes: 'qtip-shadow qtip-rounded qtip-bootstrap'
        },
        show: {
            event:"click"
        } ,
        hide: {
            event:"click"
        },
        position: {
            container: $("#map")
        }
    };
}

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
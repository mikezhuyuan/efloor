var Sprite = function(data){
    var _this = this;
    this.data = data;
    Sprite.items[this.id = this.data.id] = this;
    this.$el = $(Sprite.tempSprite(this.data));
    this.$el.qtip({
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
                        _this.update($field.attr("field"), $field.html());
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
                    _this.update($field.attr("field"), $field.html());
                });
                //avatar
                $avatar.click(function(){
                    var $field = $(this);
                    $field.addClass("profile-editing");
                });
                $avatarUrl.keypress(function(e){
                    var $field = $(this), val = $field.html();
                    if(e.keyCode === 13){
                        _this.update($field.attr("field"), val);
                        $field.blur();
                        $avatarImg.attr("src", val);
                        $avatar.removeClass("profile-editing");
                        return false;
                    }
                });
                $avatarUrl.blur(function(e){
                    var $field = $(this), val = $field.html();
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
    });
    this.$el.find(".delete-sprite-button").click(function(){
        _this.remove();
        window.net.server('removeSprite', data.id);
    });
    this.setPosition(data.x, data.y);
};

Sprite.new = function(x, y, className) {
    var id = parseInt(Math.random() * 1000000000);
    return new Sprite({
        id:id,
        x:x,
        y:y,
        className:className,
        detail:{
            title:"Title..",
            img:"images/person.png",
            team:"Team..",
            name:"Name..",
            from:"From..",
            content:"Hello.."
        }
    });
}

Sprite.create = function(data) {
    return new Sprite(data);
}

Sprite.items = Object.create(null);

Sprite.tempSprite = _.template($("#tmplSprite").html());
Sprite.tmplOverlay  = _.template($("#tmplOverlay").html());

Sprite.prototype = {
    setPosition:function(x, y){
        this.$el.css({left: x - 40/2, top: y - 40/2});
    },
    remove : function(){
        delete Sprite.items[this.id];
        this.$el.remove();
        this.$el = null;
        this.data = null;
    },
    update: function(field,val){
        if(field && val && this.data.detail[field] !== val){
            this.data.detail[field] = val;
            window.net.server('updateSprite', this.data);
        }
        return this.data.detail;
    },
    center: function(){
        //close all tips
        _.each(Sprite.items, function(s){
            s.$el.qtip("hide");
        });
        return {
            x:this.data.x+this.$el.width()/2,
            y:this.data.y+this.$el.height()/2
        }
    }
};


var Legend = function(elemLegend, map) {
    var _this = this;
    this.el = elemLegend;
    this.map = map;
    this.el.addEventListener("dragend", function(e){
        _this.drop(e);
    });
};
Legend.prototype.drop = function(e){
    var matrix = $('#map').css("-webkit-transform")
        , vals = matrix.match(/-?\d+/g)
        , offsetLeft = vals && vals[4] ? parseInt(vals[4],10) : 0
        , offsetTop = vals && vals[5] ? parseInt(vals[5],10) : 0;
    var sprite = Sprite.new(e.x - offsetLeft, e.y - $(".header").outerHeight() - offsetTop, $(this.el).attr("class"));
    this.map.addSprite(sprite);
    window.net.server('addSprite', sprite.data);
};

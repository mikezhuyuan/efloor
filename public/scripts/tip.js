var Tip = function(sprite) {
    var _this = sprite;
    function updateSprite(sprite, $field) {
        var field = $field.attr("field"), val = $field.val();

        if(sprite.updateField(field, val)){
            window.net.server('updateSprite', sprite.data);
        }
    }

    function person() {
        var $elemTip = $(Sprite.tmplPersonTip(_this.data))
            , $details = $elemTip.find('input')
            , $avatar = $elemTip.find(".profile-avatar")
            , $avatarImg = $avatar.find(".profile-avatar-img")
            , $avatarUrl = $avatar.find(".profile-avatar-url");
        $details.click(function(){
            $(this).siblings().removeClass("profile-editing");
        });
        //update data after hit enter
        $details.keypress(function(e){
            if(e.keyCode === 13){
                var $field = $(this);
                $field.addClass("profile-editing");
                $field.mousemove(function(){
                    $field.removeClass("profile-editing");
                    $field.unbind("mousemove");
                });
                $field.blur();
                return false;
            }
        });
        $details.blur(function(){
            updateSprite(_this, $(this));
        });
        //avatar
        $avatar.click(function(){
            var $field = $(this);
            $field.addClass("profile-editing");
            $avatarUrl.val($avatarImg.attr("src")).focus();
        });
        $avatarUrl.keypress(function(e){
            if(e.keyCode === 13){
                $(this).blur();
                return false;
            }
        });
        $avatarUrl.blur(function(e) {
            var $field = $(this), val = $field.val();
            updateSprite(_this, $field);
            $avatarImg.attr("src", val);
            $avatar.removeClass("profile-editing");
        });
        return $elemTip;
    }

    function room() {
        var $elemTip = $(Sprite.tmplRoomTip(_this.data)),
            $details = $elemTip.find('input'),
            $descView = $elemTip.find('.profile-desc-view'),
            $descEdit = $elemTip.find('.profile-desc-edit')
            field = $descEdit.attr('field');

        //name
        $details.click(function(){
            $(this).siblings().removeClass("profile-editing");
        });
        //update data after hit enter
        $details.keypress(function(e){
            if(e.keyCode === 13){
                var $field = $(this);
                $field.addClass("profile-editing");
                $field.mousemove(function(){
                    $field.removeClass("profile-editing");
                    $field.unbind("mousemove");
                });
                $field.blur();
                return false;
            }
        });
        $details.blur(function(){
            updateSprite(_this, $(this));
        });
        //descripton
        $descView.click(function(){
            $descEdit.val(_this.data.detail[field]);
            $descView.hide();
            $descEdit.show().focus();
        });
        $descEdit.blur(function(){
            updateSprite(_this, $(this));
            $descEdit.hide();
            $descView.show();
        });

        return $elemTip;
    }

    return {
        content: {
            text: _this.type === "person" ? person : room,
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
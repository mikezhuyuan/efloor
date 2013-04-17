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

    function person() {
        var $elemTip = $(Sprite.tmplPersonTip(_this.data))
            , $details = $elemTip.find('li[contenteditable="true"]')
            , $avatar = $elemTip.find(".profile-avatar")
            , $avatarImg = $avatar.find(".profile-avatar-img")
            , $avatarUrl = $avatar.find(".profile-avatar-url");
        $details.click(function(){
            Utils.selectContents(this);
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
    }

    function room() {
        var $elemTip = $(Sprite.tmplRoomTip(_this.data));
        $elemTip.find('.view').click(function(){
            var $input = $(this).parent()
                                .addClass('editing')
                                .find('.edit');
            $input.val(_this.data.detail[$input.attr('field')]);
            $input.select();
        });

        $elemTip.find('.edit').blur(function(){
            var $input = $(this), val = $input.val();
            $input.parent().find('.view').html(val);

            if(_this.updateField($input.attr("field"), val)){
                window.net.server('updateSprite', _this.data);
            }

            $input.parent().removeClass('editing');
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
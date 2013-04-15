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
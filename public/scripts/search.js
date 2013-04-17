var Search = function(map){
    var $search_form = $('#search_form'),
        $search_txt = $('#search_txt'),
        $searchSwitch = $(".search-switch"),
        $search_result = $('#search_result'),
        $search_result_list = $('.search-result-list',$search_result),
        tmplSearchItem = _.template($("#tmplSearchItem").html());

    function searchPoint(){
        var query = $search_txt.val();
        if(!query){
            $search_result.hide();
            return;
        }
        $search_result_list.empty();
        $.get('/search', {q:query}, function(data){
            if(data && data.length) {
                for(var i=0;i<data.length;i++){
                    var item = data[i],
                        sprite = Sprite.items[item.id],
                        el = $(tmplSearchItem(item));
                        (function(sprite){
                            el.click(function(){
                                map.center(sprite.center());
                                sprite.$el.trigger('click');
                                $search_txt.val(sprite.data.detail.name);
                            });
                        })(sprite);
                    $search_result_list.append(el);
                }
                $search_result.css({marginLeft:0}).show();
                $searchSwitch.removeClass("search-switch-show");
            }
            else{
                $search_result.hide();
            }
        }, 'json');
    }
    $search_form.submit(function(){
        searchPoint();
        return false;
    });
    $searchSwitch.click(function(){
        var cls = "search-switch-show";
        $(this).toggleClass(cls);
        if($(this).hasClass(cls)){
            $search_result.animate({
                marginLeft: -180
            });
        }
        else{
            $search_result.animate({
                marginLeft: 0
            });
        }
    });
};
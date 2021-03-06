window.Utils = {
    selectContents: function(el){
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },
    closeAllTips: function() {
    	var items = Sprite.items;
    	for(var id in items){
    		var item = items[id];
    		item.$el.qtip("hide");
    	}
    }
}
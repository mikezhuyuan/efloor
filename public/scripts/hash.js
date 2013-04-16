var Hash = (function(){
    var methods = {};
    function onchange(){
        if(!window.location.hash.length)
            return;
        
        var parts = window.location.hash.substring(1).split('=');
        if(parts.length < 2)
            return;

        var method = parts[0], args = parts[1].split(',');
        methods[method].apply(null, args);
    }
    return {
        register : function(name, fn){
            methods[name] = fn; 
            Hash[name] = function(){
                window.location.hash = name + '=' + Array.prototype.slice.apply(arguments).join(',');
            }
        },
        init : function(){
            console.log('init');
            window.onhashchange = onchange;
            onchange();
        }
    };
})();
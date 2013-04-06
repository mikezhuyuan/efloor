var express = require('express')
var sockjs  = require('sockjs')
var MongoClient = require('mongodb')
var http = require('http')
var users = Object.create(null)
var sprites = Object.create(null)
var handlers = Object.create(null)
var REMOVE_HTML_TAG = /<[^>]*?>/g
var database = {
	addSprite : function(){},
	removeSprite : function(){},
	updateSprite : function(){},
	loadSprites : function(callback){
		callback([])
	},
	search : function(keyword, callback){
		var result = [], regex = new RegExp(keyword);
		for(var key in sprites){			
			var sprite = sprites[key], 
				text = sprite.detail ? sprite.detail.replace(REMOVE_HTML_TAG, '') : '';

			if(regex.test(text)) {
				result.push({id:sprite.id, className:sprite.className, text:text});
			}
		}
		callback(result);
	}
}

//communication
var client = {
	call : function(conn, name) {
		var args = Array.prototype.slice.call(arguments, 2)
		conn.write(JSON.stringify({uid:conn.id, method:name, args:args}))
	}
}

var server = {
	register : function(name, handler) {
		handlers[name] = handler
	}
}

function broadcast(sender, callback) {
	Object.keys(users).forEach(function(id){
		var u = users[id]
		if(u && sender !== id && sender !== u )
			callback(u)
	})
}

var endpoint = sockjs.createServer()
endpoint.on('connection', function(conn) {
	var user = new User(conn)
	console.log('connected')

    conn.on('data', function(msg) {
        console.log('data: ' + msg)
        dispatch(JSON.parse(msg))
    })

    conn.on('close', function(){
    	user.remove()
    	console.log('disconnected')
    })

    function dispatch(data) {
    	var h = handlers[data.method] 
		if(h) {
			data.args.unshift(conn)
			h.apply(null, data.args)
		}
	}

	var data = []
	for(var key in sprites) {
		data.push(sprites[key])
	}

	client.call(conn, 'init', data)
})

//db
MongoClient.connect("mongodb://localhost:27017/efloor", function(err, db) {
	if(err){return console.log('cannot connect to mongodb');}

	var collection = db.collection('sprites');
	database = {
		addSprite : function(data){
			if(data.detail) {
				data.text = data.detail.replace(REMOVE_HTML_TAG, '')
			}
			collection.insert(data, function(err){
				if(err) {
					return console.log(err)
				}
			})
		},
		removeSprite : function(id){
			console.log('delete: ' + id)
			collection.remove({id:id}, function(err){
				if(err) {
					return console.log(err)
				}
			})
		},
		updateSprite : function(data){
			if(data.detail) {
				data.text = data.detail.replace(REMOVE_HTML_TAG, '')
			}
			collection.update({id:data.id}, {$set:{detail:data.detail, text:data.text}}, function(err){
				if(err) {
					return console.log(err)
				}
			})
		},
		loadSprites : function(callback){
			collection
				.find({}, {id:1, x:1, y:1, className:1, detail:1, _id : 0})
				.toArray(function(err, items){
					if(err) {
						return console.log(err)
					}
					callback(items)
				})
		},
		search : function(keyword, callback) {
			if(!keyword || keyword.length < 2){return callback([])}
			collection
				.find({text:new RegExp(keyword)}, {id:1, className:1, text:1, _id : 0})
				.toArray(function(err, items){
					if(err) {
						callback([])
						return console.log(err)
					}
					callback(items)
				})
		}
	};

	database.loadSprites(function(items){
		for(var i=0;i<items.length;i++){
			var item = items[i]
			sprites[item.id] = item
		}
	})
});

//app logic
var User = (function(){
	var type = function(conn) {
		this.id = conn.id
		this.conn = conn

		users[this.id] = this
	}

	type.prototype = {
		remove : function() {
			this.conn = null
			delete users[this.id]
		}
	}

	return type
})()

server.register('addSprite', function(conn, data){
	var id = conn.id
	sprites[data.id] = data
	database.addSprite(data)
	broadcast(id, function(user){
		client.call(user.conn, 'addSprite', data)
	})
})

server.register('removeSprite', function(conn, sid){
	delete sprites[sid]
	database.removeSprite(sid)
	broadcast(conn.id, function(user){
		client.call(user.conn, 'removeSprite', sid)
	})
})

server.register('updateSprite', function(conn, data){
	sprites[data.id] = data
	database.updateSprite(data)
	broadcast(conn.id, function(user){
		client.call(user.conn, 'updateSprite', data)
	})
})

//setup server
var app = express()
app.use(express.static(__dirname+'/public'));
var server = http.createServer(app)

endpoint.installHandlers(server, {prefix:'/endpoint'})

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html')
})

app.get('/search', function(req, res){
	database.search(req.query.q, function(result){
		res.json(result)
	})
})

server.listen(9999, '0.0.0.0')

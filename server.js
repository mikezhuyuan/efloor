var express = require('express')
var sockjs  = require('sockjs')
var http = require('http')
var users = Object.create(null)
var sprites = Object.create(null)
var handlers = Object.create(null)

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
	broadcast(id, function(user){
		client.call(user.conn, 'addSprite', data)
	})
})

server.register('removeSprite', function(conn, sid){
	delete sprites[sid]
	broadcast(conn.id, function(user){
		client.call(user.conn, 'removeSprite', sid)
	})
})

server.register('updateSprite', function(conn, data){
	sprites[data.id] = data
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

server.listen(9999, '0.0.0.0')

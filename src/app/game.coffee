_ = require 'underscore'
io = require 'socket.io'
socket = io.listen(8000)
Physics = require '../../vendor/coffeephysics/engine/Physics.coffee'
Particle = require '../../vendor/coffeephysics/engine/Particle.coffee'
Collision = require '../../vendor/coffeephysics/behaviour/Collision.coffee'
EdgeBounce = require '../../vendor/coffeephysics/behaviour/EdgeBounce.coffee'
Attraction = require '../../vendor/coffeephysics/behaviour/Attraction.coffee'
Behaviour = require '../../vendor/coffeephysics/behaviour/Behaviour.coffee'
Vector = require '../../vendor/coffeephysics/math/Vector.coffee'

class Game

  width: 768
  height: 768
  particlesize: 40
  colors:[
    'red',
    'blue',
    'green',
    'orange',
    'navy',
    'lime'
    ]

  constructor: ->
    @players = {}
    @socket = socket
    @setupSockets()
    @setupPhysics()
    @setEventHandlers()

  setupSockets: ->
    @socket.configure =>
      @socket.set "transports", ['websocket' ,'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
      @socket.set "log level", 2

  setEventHandlers: ->
    @socket.sockets.on 'connection', @onSocketConnection

  onSocketConnection: (client) =>
    data = id: client.id
    @addPlayer data
    self = this
    client.on "disconnect", ->
      data = id: @id
      self.removePlayer data
    client.on "move player", @onMovePlayer

  onMovePlayer: (data) =>
    if data.x isnt null
      acc = new Vector data.x*100, data.y*100
      [player] = _(@physics.particles).where id: data.id
      player.acc = acc

  addPlayer: (player) =>
    @players[player.id] = player

    @socket.sockets.emit 'new player', player

    physicsPlayer = new Particle()
    physicsPlayer.id = player.id
    physicsPlayer.setRadius @particlesize/2
    color = @colors[parseInt(Math.random()*@colors.length)]
    x = Math.random()*@width
    y = Math.random()*@height
    physicsPlayer.moveTo new Vector x, y
    physicsPlayer.setMass 1
    @collision.pool.push physicsPlayer
    physicsPlayer.behaviours.push @collision, @bounds, @center
    @physics.particles.push physicsPlayer

  update: ->
    @physics.step()
    setTimeout =>
      @update()
    , 15

  gameState: ->
    gameData = []
    for player in @physics.particles
      gameData.push
        id: player.id
        pos: player.pos
        vel: player.vel
        acc: player.acc
        radius: player.radius
        mass: player.mass
    @socket.sockets.emit 'game state', gameData
    setTimeout =>
      @gameState()
    , 15

  removePlayer: (player) =>
    [toRemove] = _(@physics.particles).where id: player.id
    @physics.particles = _(@physics.particles).without toRemove
    [toRemove] = _(@collision.pool).where id: player.id
    @collision.pool = _(@collision.pool).without toRemove
    delete @players[player.id]
    @socket.sockets.emit 'remove player', player

  setupPhysics: ->
    @physics = new Physics()
    @collision = new Collision()
    @bounds = new EdgeBounce new Vector(0,0), new Vector(@width, @height)
    @center = new Attraction()
    @center.target.x = @width/2
    @center.target.y = @height/2
    @center.strength = 10


    @update()
    @gameState()

  destructor: ->
    @socket.server.close()

module.exports = Game
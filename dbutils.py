#region imports...
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from datetime import datetime, timedelta
import json

#region yaml
import yaml
def ymlFile_jString(path):
	try:
		content = open(path, 'r')
		return json.dumps(yaml.load(content))
	except Exception as e:
		msg = 'no such file' + path
		#print(msg)
		return msg

def ymlText(path):
	return yaml.load(open(path, 'r'))

def ymlFile_pyObject(path):
	return yaml.load(open(path, 'r'))
#endregion



db = SQLAlchemy()

def db_init(app):
	app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
	app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
	db.init_app(app)

def db_reset():
	db.drop_all()
	db.create_all()
	add_user('felix','BLUE')	
	add_user('amanda','GREEN')	
	add_user('gul','RED')	
	add_user('lauren','BLUEGREEN')	
	add_user('mac','ORANGE')	
	add_user('mimi','skyblue')	
	add_user('nasi','YELLOW')	
	add_user('sarah','PINK')	
	add_user('annabel','PURPLE')
	add_user('meckele','#F28DB2')
	add_user('nimble','#6E52CCFF')
	add_user('ally','#6660f3')
	add_user('blade','#c06996')
	add_user('bob','#033993')
	add_user('leo','#3f3f03')
	add_user('valerie','#03cf9c')
	add_user('wolfgang','#93c6f3')
	add_user('mitra','#9f3ff6')
	# add_game('vienna','aristo',['mimi','felix'])
	# add_game('beijing','innovation',['felix','lauren'])
	# add_game('palma','bridge',['mimi','nasi','amanda','felix'])
	# add_game('manacor','ferrocarril',['mimi','nasi','mac','sarah'])
	# add_game('madrid','aristo',['mimi','lauren','amanda','felix'])
	# add_game('neuilly','catan',['mimi','gul','amanda','felix'])
	# add_game('avignon','chess',['gul','amanda'])

from faker import Faker
import random
fake = Faker()

#db models

#many to many: association game
plays_at_game = db.Table('plays_at_game', 
	db.Column('user_id',db.Integer,db.ForeignKey('user.id'), primary_key = True),
	db.Column('game_id',db.Integer,db.ForeignKey('game.id'), primary_key = True)
)

class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(30), nullable=False, unique=True, index=True)
	color = db.Column(db.String(20))
	rating = db.Column(db.Integer, default=0)
	follows = db.Column(db.Text, default='')
	actions = db.relationship('Action', backref='user') #now I can call Action.user and User.choices (=list of moves this user has to do)
	games_hosting = db.relationship('Game', backref='host') #now I can call Game.host and User.games (=list of games hosted by this user!)
	games = db.relationship('Game',secondary=plays_at_game, back_populates="players")
	# votes = db.relationship('vote', backref='voter') #now I can call Game.host and User.games (=list of games hosted by this user!)
	# proposals = db.relationship('proposal', backref='author') #now I can call Game.host and User.games (=list of games hosted by this user!)
  # products = db.relationship('Product', secondary=order_product)
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

class Action(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	choices = db.Column(db.Text)
	choice = db.Column(db.Text)
	done = db.Column(db.Boolean, default=False)
	created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	due = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	modified = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True, nullable=False)
	game_id = db.Column(db.Integer, db.ForeignKey('game.id'), index=True, nullable=False)
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

class Game(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	gamename = db.Column(db.String(30), nullable=False, index=True)
	name = db.Column(db.String(50), nullable=False, unique=True, index=True)
	fen = db.Column(db.Text)
	step = db.Column(db.Integer, default=0)
	expected = db.Column(db.Text)
	action = db.Column(db.Text)
	status = db.Column(db.String(10), default='start', index=True)
	created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	modified = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	host_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True, nullable=False)
	#actions = db.relationship('Action', backref='game') #now I can call Action.game and Game.choices (=list of moves that are pending for this game)
	players = db.relationship('User',secondary=plays_at_game, back_populates="games")
	def toDict(self):
		o = { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }
		players = _get_players(self.id)
		#print('players in game',self.id,players)
		#print('....',players[0].name)
		playernames = [x.name for x in players]
		#print('names',playernames)
		o['players'] = playernames
		#names = [x.name for x in o['players']]
		return o

class Vote(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	step = db.Column(db.Integer)
	created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	due = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	modified = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	voter = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
	proposal = db.Column(db.Integer, db.ForeignKey('proposal.id'), nullable=False)

class Proposal(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(100), nullable=False, unique=True, index=True)
	text = db.Column(db.Text)
	status = db.Column(db.String(10))
	created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	modified = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	author = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

#old API
def add_user(name,color):
	u=User(name=name,color=color)
	db.session.add(u)
	db.session.commit()

def add_game(name,gamename,players):
	host_id = _get_user(players[0]).id
	g = Game(name=name, gamename=gamename, host_id=host_id, players = [_get_user(x) for x in players])
	db.session.add(g)
	db.session.commit()

def get_users(): return [x.toDict() for x in User.query.all()]
def get_games(): return [x.toDict() for x in Game.query.all()]
def get_actions(): return [x.toDict() for x in Action.query.all()]
def get_game_actions(game): 
	g=Game.query.filter_by(name=game).first()
	#print('...',g.name,g.id)
	return [x.toDict() for x in Action.query.filter_by(game=g).all()]
def get_user_actions(user): 
	g=User.query.filter_by(name=user).first()
	#print('...',g.name,g.id)
	return [x.toDict() for x in Action.query.filter_by(user=g).all()]
def get_actions_for(game,user): 
	g=Game.query.filter_by(name=game).first()
	u=User.query.filter_by(name=user).first()
	#print('...',g.name,g.id,u.name,u.id)
	return [x.toDict() for x in Action.query.filter_by(game=g,user=u).all()]

def get_user(name):	return User.query.filter_by(name=name).first().toDict()
def get_game(name):	return Game.query.filter_by(name=name).first().toDict()

def delete_user(name):
	db.session.delete(_get_user(name))
	db.commit()

def update_user(name,o):
	rec = _get_user(name)
	for k in o:
		rec[k]=o[k]
	db.session.commit()

def get_players(game):
	g = Game.query.filter_by(name=game).first()
	players = _get_players(g.id)
	return [x.toDict() for x in players]
def get_playernames(game):
	g = Game.query.filter_by(name=game).first()
	players = _get_players(g.id)
	return [x.name for x in players]
def get_games_for(name):
	u = User.query.filter_by(name=name).first()
	games =  _get_user_games(u.id)
	return [x.toDict() for x in games]
def get_gamenames_for(name):
	u = User.query.filter_by(name=name).first()
	games =  _get_user_games(u.id)
	return [x.name for x in games]
def updategame(game,step,fen):
	g=_get_game(game)
	g.fen = fen
	g.step = step
	db.session.commit()
	return g.toDict()

def _get_user(name):	return User.query.filter_by(name=name).first()
def _get_game(name):	return Game.query.filter_by(name=name).first()
def _get_action(game,user): return Action.query.filter_by(game=game,user=user).last()
def _get_players(game_id=1):
	players = db.session.query(User).join(plays_at_game).filter_by(game_id=game_id).all()
	return players
def _get_user_games(user_id=1):
	games = db.session.query(Game).join(plays_at_game).filter_by(user_id=user_id).all()
	return games

#big database generation

def get_unique_usernames(n=100):
	usernames = set()
	while len(usernames) < n: usernames.add(fake.first_name().lower())
	#for _ in range(1000): usernames.add(fake.first_name().lower())
	#print('***',usernames)
	usernames = list(usernames)
	return usernames
def get_unique_gamenames(n=100):
	gamenames = set()
	while len(gamenames) < n: gamenames.add(fake.city().lower())
	#for _ in range(1000): gamenames.add(fake.city().lower())
	#print('***',gamenames)
	gamenames = list(gamenames)
	return gamenames

gamenames = get_unique_gamenames()
N = 3
def add_users():
	usernames = get_unique_usernames()
	for i in range(N):
		user = User(name=usernames[i],color=fake.color_name().lower())
		db.session.add(user)
	db.session.commit()

def random_players(users,min,max): #ok
	n = random.randint(min,max)
	indices = random.sample(range(0, len(users)), n)
	res = []
	for i in indices:
		res.append(users[i].name)
	return res

def get_unique_gamename():
	games = Game.query.all() #[x.toDict() for x in Game.query.all()]
	names = [x.name for x in games]
	#print('_____names',names)
	#print('___gamenames')
	while True:
		name=fake.city().lower()
		#print('name',name)
		if not name in names: return name

def get_fantasyname():
	return fake.name

def add_games():
	users = User.query.all()
	games = ['dixit'] #'aristocracy','innovation','catan','powergrid','puerto rico','ferrocarril','dixit','mysterium','dialogue']
	gamenames = get_unique_gamenames()
	for i in range(2):
		#players = random_players(users,2,5)
		name,gamename=gamenames[i],random.choice(games)
		#host_id = _get_user(players[0]).id
		g = Game(name=name, gamename=gamename,host_id=1) #, players = [_get_user(x) for x in players])
		db.session.add(g)
	db.session.commit()

def add_game_players():
	games = Game.query.all()
	users = User.query.all()
	for game in games[1:]: #hab 1 test game mimi-felix drin!
		#k = random.randint(2,5)
		players = random.sample(users,2)
		game.players.extend(players)
		#print('...',len(game.players))
		game.host_id = players[0].id
	db.session.commit()

def add_actions():
	games = Game.query.all()
	choices = '1 2 3 4 5'
	for game in games:
		users = _get_players(game.id)
		for user in users:
			a = Action(choices=choices,choice='',game_id=game.id,user_id=user.id)
			db.session.add(a)
	db.session.commit()

def create_random_data():
	db.drop_all()	
	db.create_all()
	add_user('mimi','skyblue')	
	add_user('felix','BLUE')	
	add_users()
	#add_game('paris','dixit',['mimi','felix'])
	#add_games()
	#add_game_players()
	#add_actions()


#endregion

def delete_game(name):
	db.session.delete(_get_game(name))
	db.commit()

def get_game(name): 
	#print('name',name)
	return _get_game(name).toDict()

def startgame(gamename,players,fen,expected):
	users = []
	#print('fen',fen)
	#print('players',players)
	for uname in players:
		#print('uname',uname)
		u=User.query.filter_by(name = uname).first()
		#print('u',u)
		users.append(u)
	# return {'h':1}
	key=get_unique_gamename()
	#print('...key',key)
	#print('...gamename',gamename)
	g = Game(name=key, gamename=gamename, host_id=0, players=users, fen=json.dumps(fen), expected = json.dumps(expected))
	db.session.add(g)
	db.session.commit()
	#print('g',g.toDict())
	return g.toDict()

def update_game(name,fen,action,expected,step):
	rec = _get_game(name)
	rec.fen = json.dumps(fen)
	rec.action = json.dumps(action)
	rec.expected = json.dumps(expected)
	rec.step = step
	# for k in o:
	# 	rec[k]=o[k]
	db.session.commit()
	return rec.toDict()



























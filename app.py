#region init
from flask import jsonify, Flask, request, send_from_directory, render_template, redirect, url_for
app = Flask(__name__)
BUILD = 'heroku' # dev | heroku
Basepath = "https://www.telecave.net/aroot/base/" if BUILD == 'heroku' else "http://127.10.0.1:8080/aroot/base/" if BUILD == 'public' else "http://localhost:8080/aroot/base/"
app.config['SECRET_KEY'] = 'IJustHopeThisWorks!' #do I need this???
from flask_cors import CORS
CORS(app)
import json
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
#endregion

#region database config
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from datetime import datetime, timedelta
import json

if BUILD == 'dev':
	app.debug = True
	app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
else:
	app.debug = False
	s1='postgresql://fqfvndftkoapxn:cdebf87c414f9b02028ddb454c543016b92722f07b12a7a806a02876ead8bfb1@ec2-44-194-113-156.compute-1.amazonaws.com:5432/d3rg8gpmjvusbu'
	#s1='postgresql://yrvygqeoxvvsbc:a1626c4355cc68f0e885cdd1a136d47b05f0a1dbc13c3b48e591663c3be1abae@ec2-54-145-9-12.compute-1.amazonaws.com:5432/d82a71hp3riqvf'
	app.config['SQLALCHEMY_DATABASE_URI'] = s1

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
#endregion

#region database models
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
	games_hosting = db.relationship('Game', backref='host') #now I can call Game.host and User.games (=list of games hosted by this user!)
	games = db.relationship('Game',secondary=plays_at_game, back_populates="players")
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
	players = db.relationship('User',secondary=plays_at_game, back_populates="games")
	def toDict(self):
		o = { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }
		players = _get_players(self.id)
		playernames = [x.name for x in players]
		o['players'] = playernames
		return o

#endregion

#region database functions
from faker import Faker
import random
fake = Faker()

def _get_game(name):	return Game.query.filter_by(name=name).first()
def _get_players(game_id=1):
	players = db.session.query(User).join(plays_at_game).filter_by(game_id=game_id).all()
	return players

def add_user(name,color):
	u=User(name=name,color=color)
	db.session.add(u)
	db.session.commit()

def delete_game(name):
	db.session.delete(_get_game(name))
	db.commit()

def get_unique_gamename():
	games = Game.query.all()
	names = [x.name for x in games]
	while True:
		name=fake.city().lower()
		if not name in names: return name

def get_game(name): 
	return _get_game(name).toDict()

def get_games(): return [x.toDict() for x in Game.query.all()]

def get_users(): return [x.toDict() for x in User.query.all()]

def startgame(gamename,players,fen,expected):
	users = []
	for uname in players:
		u=User.query.filter_by(name = uname).first()
		users.append(u)
	key=get_unique_gamename()
	g = Game(name=key, gamename=gamename, host_id=0, players=users, fen=json.dumps(fen), expected = json.dumps(expected))
	db.session.add(g)
	db.session.commit()
	return g.toDict()

def update_game(name,fen,action,expected,step):
	rec = _get_game(name)
	rec.fen = json.dumps(fen)
	rec.action = json.dumps(action)
	rec.expected = json.dumps(expected)
	rec.step = step
	db.session.commit()
	return rec.toDict()

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

#endregion

@app.route('/')
def base_route():	return redirect ('/index'); 

# @app.route('/get', methods=['GET'])
# def rget():
# 	Serverdata = {"users":get_users(),"games":get_games()}
# 	return render_template('supersimple.html', Basepath=Basepath, Serverdata=Serverdata)

# @app.route('/post', methods=['POST'])
# def rpost():
# 	data = request.get_json(force = True)
# 	msgtype = data['type']
# 	if msgtype == 'startgame':
# 		g=startgame(data['game'],data['players'],data['fen'],data['expected'])
# 		fen=data['fen']
# 		name=g['name']
# 		return g
# 	elif msgtype == 'move':
# 		name = data['game']
# 		g = get_game(name)
# 		expected = g['expected']
# 		e1=json.loads(expected)
# 		#print('===>expected',type(e1),e1)
# 		action = data['action']
# 		uname = data['uname']
# 		if uname in expected:
# 			e = e1[uname]
# 			if action['type'] == e['type'] and action['step'] == e['step']:
# 				print('updating!!!')
# 				print(data['expected'])
# 				g=update_game(name,data['fen'],data['action'],data['expected'],data['step']) 
# 				print('===>',g['expected'])
# 				return g
# 		print('invalid move!')
# 		return g
# 	elif msgtype == 'poll':
# 		game = data['game']
# 		g = get_game(game)
# 		return g
# 	return data

#region other routes
@app.route('/index')
def r_index():
	return render_template('index.html')

@app.route('/reset')
def r_reset(): 
	db_reset()
	return redirect('/')


if __name__ == "__main__":
	#print('hallo')
	#app.run()
	#app.run() #host='0.0.0.0', port=5051, debug=True)
	app.run(debug = True, port = 5000)

	



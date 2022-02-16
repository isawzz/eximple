#!/var/www/html/flask/scriptapp/scriptapp-venv/bin/python3
from flask import jsonify, Flask, request, send_from_directory, render_template, redirect
app = Flask(__name__, static_folder='')
HEROKUPROD = False #set True for production (need to re-create db on heroku!)
basepath = "https://www.telecave.net/aroot/base/" if HEROKUPROD else "http://localhost:8080/aroot/base/"

# DB, LOGIN _______________________________________

#region database config
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from datetime import datetime

herokudb = 'postgresql://yrvygqeoxvvsbc:a1626c4355cc68f0e885cdd1a136d47b05f0a1dbc13c3b48e591663c3be1abae@ec2-54-145-9-12.compute-1.amazonaws.com:5432/d82a71hp3riqvf'
app.config['SQLALCHEMY_DATABASE_URI'] = herokudb if HEROKUPROD else 'sqlite:///dblocal.db'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres: @localhost:5434/lexus'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

#endregion

#region login config
from flask_login import LoginManager, UserMixin, current_user, login_user, logout_user, login_required

app.config['SECRET_KEY'] = 'IJustHopeThisWorks!' #do I need this???
login_manager = LoginManager(app)

usersLoggedIn = []
#endregion

#region database models

class User(UserMixin, db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(30), unique=True, index=True)
	color = db.Column(db.String(10), nullable=True)
	stars = db.Column(db.Integer, default = 0)
	follows = db.Column(db.Text, default = '')
	followers = db.Column(db.Text, default = '')
	email = db.Column(db.String(120), nullable=True)
	password = db.Column(db.String(120), nullable=True)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)
	# players = db.relationship('Player', backref='user', lazy=True)
	def __repr__(self):
		return self.name
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

class Table(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(30), index=True, unique=True)
	game = db.Column(db.String(50), nullable=False)
	host = db.Column(db.String(30))
	players = db.Column(db.Text, nullable=True)
	status = db.Column(db.Integer, nullable=True)
	fen = db.Column(db.Text, nullable=True)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)
	date_modified = db.Column(db.DateTime, default=datetime.utcnow)
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

class Todo(db.Model):
	__tablename__ = 'todo'
	id = db.Column(db.Integer, primary_key=True)
	content = db.Column(db.String(200), nullable=False)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)
	def __init__(self, content):
		self.content = content
	def __repr__(self):
		return '<Task %r>' % self.id
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

class Feedback(db.Model):
	__tablename__ = 'feedback'
	id = db.Column(db.Integer, primary_key=True)
	customer = db.Column(db.String(200), unique=True)
	dealer = db.Column(db.String(200))
	rating = db.Column(db.Integer)
	comments = db.Column(db.Text())
	def __init__(self, customer, dealer, rating, comments):
		self.customer = customer
		self.dealer = dealer
		self.rating = rating
		self.comments = comments
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

#endregion

#region login functions
@login_manager.user_loader
def load_user(user_id):
	return User.query.get(int(user_id))

#endregion

#region db functions
def add_table(game,name,players):
	t = Table(game=game,name=name, host=players[0],players=','.join(players))
	db.session.add(t)
	db.session.commit()

def db_init_all():
	# User:id,name,color,stars,follows,followers,email,password,date_created
	# Table:id,game,name,host,players,status,fen,date_created,date_modified
	print('.....init db')
	db.drop_all()
	db.create_all()
	i=0
	for info in [('amanda','GREEN'),('felix','BLUE'),('gul','RED'),('lauren','BLUEGREEN'),('mac','ORANGE'),('mimi','skyblue'),('nasi','YELLOW')]:
		pl = User(name=info[0],color=info[1],id=i)
		i+=1
		#print('added user',pl.name)
		db.session.add(pl)
	db.session.commit()
	add_table('dixit','paris',['felix','mimi'])
	add_table('aristocracy','stockholm',['mimi','amanda','felix'])
	add_table('aristocracy','vienna',['mimi','amanda','felix'])
	add_table('dixit','rome',['mimi','gul','mac'])
	return

from sqlalchemy_utils.functions import database_exists
if not database_exists(app.config["SQLALCHEMY_DATABASE_URI"]): db_init_all()

def db_update_following(user):
	#here need to update the following info for each other user in db!!!!
	flist = string_to_arr(user.follows)
	user.follows = arr_to_string(flist)
	users = User.query.order_by(User.name).all() 
	for u in users:
		if u.name == user.name: continue
		followers = string_to_arr(u.followers)
		print('===>followers:', followers)
		if u.name in flist and user.name not in followers: #make sure user.name is in u.following
			followers.append(user.name)
		elif u.name not in flist and user.name in followers: #make sure user.name is NOT in u.following
			followers.remove(user.name)
		u.followers = arr_to_string(followers)

def db_remove_following(user):
	#this user is removed
	follows = string_to_arr(user.follows)
	followers = string_to_arr(user.follows)
	users = User.query.order_by(User.name).all() 
	for u in users:
		if u.name == user.name: continue
		follows2 = string_to_arr(u.follows)
		followers2 = string_to_arr(u.followers)
		if user.name in followers2: #make sure user.name is in u.following
			followers2.remove(user.name)
		if user.name in follows2: #make sure user.name is in u.following
			follows2.remove(user.name)
		u.followers = arr_to_string(followers2)
		u.follows = arr_to_string(follows2)


#endregion

# ROUTES _______________________________________
@app.route('/')
def base_route():	return redirect('/testsocketio') # spiele testsocketio
@app.route('/dbinit')
def dbinit_route():	db_init_all(); return redirect('/spiele')

#region spiele routes
@app.route('/spiele')
def spiele():
	return redirect('/spiele/users')
	# serverData = {"players" : "felix,mimi", "games":"aristocracy,mysterium"}
	# return render_template('spiele/ui0.html',basepath=basepath, serverData=serverData)

def get_users():
	users = User.query.all()
	ulist=[x.toDict() for x in users]
	return users,ulist

def is_contained(sfull,spart):
	print('.......full',sfull)
	print('part',spart)
	return True

def get_tables(user):
	#tables = db.session.query(Table).all() #filter(is_contained(Table.players,user)).all()
	#tables = db.session.query(Table.players.contains(user))
	tables = Table.query.filter(Table.players.contains(user)).all()
	#tables = Table.query.order_by(Table.name).all() 
	# tlist = [x.toDict() for x in tables]
	#filtered = filter(lambda x: user in x.players, tables)
	#tf=tables.filter(user in Table.players)
	# for t in tables:
		#print('???',table.players,type(table.players))
		#print('---',user,user in table.players)
		# t=table.toDict()
	#return filtered
	tablelist = [x.toDict() for x in tables]
	return tables,tablelist

def get_table(table):
	table = db.session.query(Table).filter(Table.name == table).first()
	table = table.toDict()
	#table.players = table.players.split(',')
	return table

@app.route('/spiele/users')
def spiele_users():
	users,ulist = get_users()
	serverData = {"users":ulist}; 
	return render_template('spiele/ui1.html',users=users,basepath=basepath, serverData=serverData)

@app.route('/spiele/tables/<user>')
def spiele_tables(user):
	users,ulist = get_users()
	tables,tablelist = get_tables(user)
	print('tables',tables)
	print('tlist',tablelist)
	serverData = {"users":ulist, "tables":tablelist, "user":user}; 
	return render_template('spiele/ui2.html',users=users, tables=tables, basepath=basepath, serverData=serverData)

@app.route('/play/<table>/<user>', methods=['GET','POST'])
def spiele_play(table,user):
	users,ulist = get_users()
	tabledata = get_table(table)
	if request.method == 'POST':
		msg = request.form['text']
		action = request.form['action']
		print('text',msg)
		#return 'you send a text:'+msg
	else:	
		msg='user ' + user + ' is now playing table '+ table
	print("...",msg)
	serverData = {"users":ulist, "table":table, "tabledata":tabledata, "user":user, "message":msg}; 
	return render_template('spiele/ui3.html',basepath=basepath, serverData=serverData)

@app.route('/delete_user/<int:id>')
def delete_user(id):
	user = User.query.get_or_404(id)
	try:
		db.session.delete(user)
		db.session.commit()
		return redirect('/spiele/users')
	except:
		return f'There was a problem deleting user {id}'

#endregion

#region socketio
from flask_socketio import SocketIO, send
from flask_cors import CORS
import eventlet
CORS(app)
eventlet.monkey_patch()
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('message')
def handle_message(msg):
	print('message: '+msg)
	send('rec '+msg, broadcast=True) #without broadcast, will just send to msg sender

@app.route('/testsocketio')
def testsock():	
	return render_template('tests/test_socketio.html')

@app.get('/stop')
def shutdown():
	socketio.stop()

#region action routes
actions = {}

@app.route('/actionprep/<tablename>/<user>', methods=['POST'])
def r_actionprep(tablename):
	global actions
	#get table record!
	#table = Table.query.filter(Table.name == tablename).first()
	#print('...table',table.id)
	if request.method == 'POST':
		names = request.form['names'].split(',')
		print('......',names)
		actions[tablename] = {}
		for name in names:
			actions[tablename][name] = None
		#here should broadcast table to all players in names!
		#inreaction to this broadcast, they will poll the table
		emit('poll', names, broadcast=True)
		return redirect('/play/<tablename>/<user>') 

@app.route('/action/<table>/<user>/<a>')
def action_route(a):	
	#wenn ein neuer step prepped wir, erhalte 
	if not actions[table]:
		actions[table] = {}
	actions[table][user] = a

	return redirect('/spiele')

#endregion

#region example routes
@app.route('/ui0')
def ui0():
	return render_template('ex/ui0/index.html',basepath=basepath)
@app.route('/ui1')
def ui1():
	return render_template('ex/ui1/index.html',basepath=basepath)
@app.route('/ui2')
def ui2():
	serverData = {"name" : "John", "age" : 36}
	return render_template('ex/ui2/index.html',basepath=basepath, serverData=serverData)
@app.route('/ui3', methods=['GET','POST'])
def ui3():
	serverData = {"name" : "John", "age" : 36}
	if request.method == 'POST':
		text = request.form['text']
		print('save text',text)
		return redirect('/ui3') 
	return render_template('ex/ui3/index.html',basepath=basepath, serverData=serverData)

@app.route('/web0')
@app.route('/web0_ui0')
def web0_ui0():
	serverData = {"name" : "John", "age" : 36}
	return render_template('ex/web0/ui0.html',basepath=basepath, serverData=serverData)
@app.route('/web0_ui1')
def web0_ui1():
	serverData = {"name" : "John", "age" : 36}
	return render_template('ex/web0/ui1.html',basepath=basepath, serverData=serverData)
@app.route('/web0_ui2')
def web0_ui2():
	serverData = {"name" : "John", "age" : 36}
	return render_template('ex/web0/ui2.html',basepath=basepath, serverData=serverData)
@app.route('/web0_ui3')
def web0_ui3():
	serverData = {"name" : "John", "age" : 36}
	return render_template('ex/web0/ui3.html',basepath=basepath, serverData=serverData)

#endregion example routes

#region test routes
@app.route('/test_basemin_m')
def test_basemin_m():
	return render_template('tests/test_basemin_m.html',basepath=basepath)

@app.route('/test_cors')
def test_cors():
	return render_template('tests/test_cors.html',basepath=basepath)


#endregion test routes


if __name__ == "__main__":
	socketio.run(app, port=5000, debug=True)
	#app.run(debug=True)




from flask import jsonify, Flask, request, send_from_directory, render_template, redirect

app = Flask(__name__, static_folder='')

#set location of front end code: to run on Heroku set telecave location!!!
#WAS??!?!?!?!?!? DAS GEHT AUCH MIT LOCALHOST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
#ich muss garnicht auf telecave und heroku postgres gehen!!!!!!!!!!!!!!!!!!!!!!!
#(also mit der db bin ich nicht sicher! aber werd ich checken!)
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
	status = db.Column(db.Integer, nullable=True)
	fen = db.Column(db.Text, nullable=True)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)
	date_modified = db.Column(db.DateTime, default=datetime.utcnow)
	# players = db.relationship('Player', backref='table', lazy=True)
	# def __init__(self, game):
	# 	self.game = game
	def toDict(self):
		return { c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs }

class Player(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	role = db.Column(db.Integer, nullable=True)
	status = db.Column(db.Integer, nullable=True)
	data = db.Column(db.Text, nullable=True)
	date_modified = db.Column(db.DateTime, default=datetime.utcnow)
	table = db.Column(db.String(30), nullable=False)
	user = db.Column(db.String(30), nullable=False)
	# tablename = db.Column(db.String(30), db.ForeignKey('table.name'), nullable=False)
	# username = db.Column(db.String(30), db.ForeignKey('user.name'), nullable=False)
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
	t = Table(game=game,name=name) #,id=1)
	db.session.add(t)
	role='admin'
	for uname in players:
		p1 = Player(user=uname,role=role,table=name)
		role=None
		db.session.add(p1)
	db.session.commit()

def db_init_all():
	print('.....init db')
	db.drop_all()
	db.create_all()
	# User:id,name,color,stars,follows,followers,email,password,date_created
	i=0
	for info in [('amanda','GREEN'),('felix','BLUE'),('gul','RED'),('lauren','BLUEGREEN'),('mac','ORANGE'),('mimi','skyblue'),('nasi','YELLOW')]:
		pl = User(name=info[0],color=info[1],id=i)
		i+=1
		#print('added user',pl.name)
		db.session.add(pl)
	db.session.commit()
	#lets enter a dixit game for mimi,felix
	# Player:id,role,status,data,date_modified,table,user
	# Table:id,game,name,status,fen,date_created,date_modified
	#roles can be: admin,None,
	add_table('dixit','paris',['felix','mimi'])
	add_table('aristocracy','stockholm',['mimi','amanda','felix'])
	add_table('aristocracy','vienna',['mimi','amanda','felix'])
	add_table('dixit','rome',['mimi','gul','mac'])
	return
	t = Table(game='dixit',name='paris',id=1)
	db.session.add(t)
	p1 = Player(user='mimi',role='admin',table='paris',id=1)
	db.session.add(p1)
	p2 = Player(user='felix',table='paris',id=2)
	db.session.add(p2)
	db.session.commit()

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
def base_route():	return redirect('/spiele')
@app.route('/dbinit')
def dbinit_route():	db_init_all(); return redirect('/spiele/users')

#region spiele routes
@app.route('/spiele')
def spiele():
	return redirect('/spiele/users')
	# serverData = {"players" : "felix,mimi", "games":"aristocracy,mysterium"}
	# return render_template('spiele/ui0.html',basepath=basepath, serverData=serverData)

@app.route('/spiele/users')
def spiele_users():
	#wie bekomm ich alle user records? sqlalchemy!
	users = User.query.all()
	ulist=[]
	for u in users:
		uj={'id':u.id,'name':u.name,'color':u.color}
		ulist.append(uj)
	#print('***users',users)
	#print('***users',ulist)
	serverData = {"users":ulist}; #jsonify("hallo") # {"users" : jsonify(ulist), "games":"aristocracy,mysterium"}
	return render_template('spiele/ui1.html',users=users,basepath=basepath, serverData=serverData)

def find_players_on_table(name):
	plrecs = db.session.query(Player).filter(Player.table == name).all()
	return [x.user for x in plrecs]

@app.route('/spiele/tables/<user>')
def spiele_tables(user):
	plrecs = db.session.query(Player).filter(Player.user == user).all()
	# Player:id,role,status,data,date_modified,table,user
	# Table:id,name,game,status,fen,date_created,date_modified
	tables = []
	for rec in plrecs:
		name = rec.table
		trec = db.session.query(Table).filter(Table.name == name).first()
		t1 = trec.toDict()
		t1['players'] = find_players_on_table(t1['name'])
		#t1 = trec.toDict() # dict(trec.items()) #t1 = trec.as_dict() #jsonify(trec)
		#t={'id':trec.id,'name':trec.name,'game':trec.game,'status':trec.status,'fen':trec.fen,'date_created':trec.date_created,'date_modified':trec.date_modified}
		tables.append(t1)
	#print('.....',tables)
	#return ' '.join([x['table'] for x in plrecs])  #das geht einfach nicht egal was ich mache!!!
	#return jsonify(tables[0]) #'hallo' 
	#return jsonify(tables) 
	serverData = {"tables":tables,"user":user}; 
	return render_template('spiele/ui2.html',tables=tables, basepath=basepath, serverData=serverData)

@app.route('/play/<table>/<user>', methods=['GET','POST'])
def spiele_play(table,user):
	if request.method == 'POST':
		msg = request.form['text']
		print('text',msg)
		#return 'you send a text:'+msg
	else:	
		msg='user ' + user + ' is now playing table '+ table
	print("...",msg)
	serverData = {"table":table, "user":user, "message":msg}; 
	return render_template('spiele/ui3.html',basepath=basepath, serverData=serverData)

@app.route('/message', methods=['GET','POST'])
#@app.route('/message/<table>/<user>', methods=['GET','POST'])
def spiele_message():
	table="paris"
	user="felix"
	print('===>got message from',table,user)
	serverData = {"name" : "John", "age" : 36}
	if request.method == 'POST':
		text = request.form['text']
		print('text',text)
		return redirect(f'/play/{table}/{user}') 
	return render_template('ex/ui3/index.html',basepath=basepath, serverData=serverData)
	msg='user ' + user + ' is now playing table '+ table
	print("...",msg)
	serverData = {"table":table,"user":user,"message":msg}; 
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

@app.route('/set_user/<int:id>')
def set_user(id):
	user = User.query.get_or_404(id)
	tables = Table
	try:
		db.session.delete(user)
		db.session.commit()
		return redirect('/spiele/users')
	except:
		return f'There was a problem deleting user {id}'
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
	app.run(debug=True)




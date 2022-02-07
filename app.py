import os
from flask import Flask, render_template, url_for, request, send_from_directory, redirect
from send_mail import send_mail
from utils import *

app = Flask(__name__, static_url_path='', static_folder='')
ENV = 'prod' #prod to use Heroku database, dev to use local database

#region database config
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

if ENV == 'dev':
	app.debug = True
	app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
else:
	app.debug = False
	heroku_postgres_db='postgresql://yrvygqeoxvvsbc:a1626c4355cc68f0e885cdd1a136d47b05f0a1dbc13c3b48e591663c3be1abae@ec2-54-145-9-12.compute-1.amazonaws.com:5432/d82a71hp3riqvf'
	app.config['SQLALCHEMY_DATABASE_URI'] = heroku_postgres_db

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
	name = db.Column(db.String(30), unique=True)
	stars = db.Column(db.Integer, default=0)
	follows = db.Column(db.Text, default='')
	followers = db.Column(db.Text, default='')
	email = db.Column(db.String(120), nullable=True)
	password = db.Column(db.String(120), nullable=True)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)
	def __init__(self, name):
		self.name = name

class Todo(db.Model):
	__tablename__ = 'todo'
	id = db.Column(db.Integer, primary_key=True)
	content = db.Column(db.String(200), nullable=False)
	date_created = db.Column(db.DateTime, default=datetime.utcnow)

	def __init__(self, content):
		self.content = content

	def __repr__(self):
		return '<Task %r>' % self.id

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

#endregion

#region functions
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

def get_user(name):
	return User.query.filter_by(name=name).first()

def get_followers(name): #get list of name's followers
	user = get_user(name)
	return user.followers.split(',')

def get_follows(name): #get list of names name is following
	user = get_user(name)
	return user.follows.split(',')

def add_following(name1,name2): #name1 follows name2
	u1 = get_user(name1)
	u2 = get_user(name2)
	#need to do the following:
	u1_follows = get_follows(name1)
	u2_followers = get_followers(name2)
	addif(u1_follows,name2)
	addif(u2_followers,name1)
	db.commit()
	#add name2 to u1.follows if not there
	#add name1 to u2.followers if not there

#endregion

#region login routes
@login_manager.user_loader
def load_user(user_id):
	return User.query.get(int(user_id))

@app.route('/logintest')
def defaultLogin():
	return redirect('/login/felix')

@app.route('/loginform')
def loginform():
	return render_template('/login/index.html')

@app.route('/loginsubmit', methods=['POST'])
def login_submit():
	if request.method == 'POST':
		name = request.form['name']
		return redirect('/login/'+name) 

@app.route('/login/<name>')
def login(name):
	user = User.query.filter_by(name=name).first()
	print('...trying to login',user)
	if not user and ENV == 'dev':
		print('adding new user:',name)
		user = User(name)
		db.session.add(user)
		db.session.commit()
	if not user:
		return 'not authorized: ' + name
	if name in usersLoggedIn:
		return name + ' already logged in in another window!'
	usersLoggedIn.append(name)
	login_user(user)
	print('===>logged in as', name, usersLoggedIn)
	return redirect('/') #name

@app.route('/logout')
@login_required
def logout():
	name = 'amanda'
	if name in usersLoggedIn: usersLoggedIn.remove(name)
	logout_user()
	print('logged out', name, usersLoggedIn, '................')
	return redirect('/') #name + ', you are logged out!'

# @app.route('/logout/<name>')
# @login_required
# def logout(name):
# 	if not name in usersLoggedIn:
# 		print(name, 'not in usersLoggedIn!!!!!')
# 	else:
# 		usersLoggedIn.remove(name)
# 	logout_user()
# 	print('logged out', name, usersLoggedIn, '................')
# 	return redirect('/') #name + ', you are logged out!'


#endregion

@app.route('/')
def mainmenu():
	return redirect('/mydash')

#region example 1: todo
@app.route('/todo')
def todo_index():
	tasks = Todo.query.order_by(Todo.date_created).all() #.first(), 
	return render_template('todo/index.html', tasks=tasks)
	# return render_template('todo/index.html')

@app.route('/todosubmit', methods=['POST'])
def todo_submit():
	if request.method == 'POST':
		content = request.form['content']
		print('......',content)
		data = Todo(content)
		db.session.add(data)
		db.session.commit()
		return redirect('/todo') 

@app.route('/deltodo/<int:id>')
def del_todo(id):
	task_to_delete = Todo.query.get_or_404(id)
	try:
		db.session.delete(task_to_delete)
		db.session.commit()
		return redirect('/todo')
	except:
		return 'There was a problem deleting that task'

@app.route('/uptodo/<int:id>', methods=['GET', 'POST'])
def up_todo(id):
	task = Todo.query.get_or_404(id)
	if request.method == 'POST':
		content = request.form['content']
		print('......',content)
		task.content = content
		try:
			db.session.commit()
			return redirect('/todo')
		except:
			return 'There was an issue updating your task'
	else:
		return render_template('todo/update.html', task=task)

#endregion example 1: todo

#region example 2: car
@app.route('/car')
def car_index():
	return render_template('car/index.html')

@app.route('/carsubmit', methods=['POST'])
def car_submit():
	if request.method == 'POST':
		customer = request.form['customer']
		dealer = request.form['dealer']
		rating = request.form['rating']
		comments = request.form['comments']
		print(customer, dealer, rating, comments)
		if customer == '' or dealer == '':
			return render_template('car/index.html', message='Please enter required fields')
		if db.session.query(Feedback).filter(Feedback.customer == customer).count() == 0:
			data = Feedback(customer, dealer, rating, comments)
			db.session.add(data)
			db.session.commit()
			send_mail(customer, dealer, rating, comments)
			return render_template('car/success.html')
		return render_template('car/index.html', message='You have already submitted feedback')
#endregion example 2: card dealer feedback

#region example 3: user
@app.route('/user')
def user_index():
	users = User.query.order_by(User.name).all() #.first(), 
	return render_template('user/index.html', users=users)
	#return render_template('user/index.html')

@app.route('/usersubmit', methods=['POST'])
def user_submit():
	if request.method == 'POST':
		name = request.form['name']
		print('......',name)
		data = User(name)
		db.session.add(data)
		db.session.commit()
		return redirect('/user') 

@app.route('/deluser/<int:id>')
def del_user(id):
	print('delete user',id)
	#return f'delete user {id}' #redirect('/user')
	user = User.query.get_or_404(id)
	db_remove_following(user)
	try:
		if user.name in usersLoggedIn: 
			if user.is_active: logout_user(user)
			usersLoggedIn.remove(user.name)
		db.session.delete(user)
		db.session.commit()
		return redirect('/user')
	except:
		return 'There was a problem deleting that user'

@app.route('/upuser/<int:id>', methods=['GET', 'POST'])
def up_user(id):
	user = User.query.get_or_404(id)
	if request.method == 'POST':
		follows = request.form['follows']
		print('......',follows)
		user.follows = follows
		db_update_following(user)
		try:
			db.session.commit()
			return redirect('/user')
		except:
			return 'There was an issue updating your user'
	else:
		return render_template('user/update.html', user=user)

#endregion

#region example 4: consens
@app.route('/consens')
def consens_index():
	print(request)
	return render_template('consens/index.html')
@app.route('/consens/link1')
def consens_link1():
	return render_template('consens/link1.html')
@app.route('/consens/link2')
def consens_link2():
	return render_template('consens/link2.html')
@app.route('/consens/link3')
def consens_link3():
	return render_template('consens/link3.html')

@app.route('/c1search')
def consens_search():
	return 'hallo'

#endregion

#region example 5: dash
@app.route('/dash')
def dash_index():
	if current_user.is_authenticated:
		#print('YES!!!!!!!!!!!!!!!')
		return render_template('dash/index.html',user=current_user.name)
	else: 
		#print('nooooo!!!!!!!!!!!!!!!')
		return render_template('dash/index.html')


#endregion

#region example 5: dash
@app.route('/mydash')
def mydash_index():
	if current_user.is_authenticated:
		#print('YES!!!!!!!!!!!!!!!')
		return render_template('mydash/index.html',user=current_user.name)
	else: 
		#print('nooooo!!!!!!!!!!!!!!!')
		return render_template('mydash/index.html')


#endregion

#region static routes
@app.route('/0')
def index0():
	return send_from_directory('frontstatic/front0', 'index.html')
@app.route('/1')
def index1():
	return send_from_directory('frontstatic/front1', 'index.html')
@app.route('/2')
def index2():
	return send_from_directory('frontstatic/front2', 'index.html')

#endregion

if __name__ == "__main__":
	app.run(debug = True, port = 8181)













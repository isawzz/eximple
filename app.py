from flask import Flask, request, send_from_directory, render_template, redirect

app = Flask(__name__, static_folder='')

#set location of front end code: to run on Heroku set telecave location!!!
#WAS??!?!?!?!?!? DAS GEHT AUCH MIT LOCALHOST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
#ich muss garnicht auf telecave und heroku postgres gehen!!!!!!!!!!!!!!!!!!!!!!!
#(also mit der db bin ich nicht sicher! aber werd ich checken!)
HEROKUPROD = False #set True for production
basepath = "https://www.telecave.net/aroot/base/" if HEROKUPROD else "http://localhost:8080/aroot/base/"

# DB, LOGIN _______________________________________

#region database config
from flask_sqlalchemy import SQLAlchemy
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

#region login functions
@login_manager.user_loader
def load_user(user_id):
	return User.query.get(int(user_id))


#endregion

#region db functions
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
def base_route():
	return redirect('/web0_ui0')

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




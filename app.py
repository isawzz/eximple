#region init
from flask import jsonify, Flask, request, send_from_directory, render_template, redirect
app = Flask(__name__)
BUILD = 'home' # public | heroku   False #set True for production (need to re-create db on heroku!)
Basepath = "https://www.telecave.net/aroot/base/" if BUILD == 'heroku' else "http://127.10.0.1:8080/aroot/base/" if BUILD == 'public' else "http://localhost:8080/aroot/base/"
app.config['SECRET_KEY'] = 'IJustHopeThisWorks!' #do I need this???

from dbutils import *
db_init(app)

from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
import eventlet

CORS(app)
eventlet.monkey_patch()
socketio = SocketIO(app, cors_allowed_origins="*")
clients = []
#endregion

@socketio.on('message') #public event
def handle_message(msg):
	print('::::',msg)
	#send(msg) #OK if msg string
	#emit('message','hallo1') #OK
	emit('message',{'got':msg, 'hallo':1}, json=True) #OK
	#send(f'client: {request.sid} message: {msg}', broadcast=True) #without broadcast, will just send to msg sender
	#print(f'....message from: {msg}', '==>id',request.sid)
	#emit('message',{'got':msg, 'hallo':1},json=True)

@app.route('/testsocketio')
def testsock():	
	return render_template('tests/test_socketio.html', Basepath=Basepath)


@socketio.on('action') #custom event
def handle_action(data):
	print(f'....action: {data}', '==>id',request.sid)
	a = process_action(data['user'],data['game'],data['action'])
	g=Game.query.filter_by(name=data['game']).first()
	agame = Action.query.filter_by(game_id=g.id).all()
	print([x.toDict() for x in agame])
	done = True
	for rec in agame:
		if not rec.choice:
			done = False
			break
	if done:
		msg = f'STEP_COMPLETE {g.step}' 
		print('!!!!!',msg)
		data['done']=True
		emit('action',data,json=True)
		#send({'done':True},json=True) # 'JA') #{'message':msg,'action':a.toDict(), 'done':True}, broadcast=True)	
	else:
		data['done']=False
		emit('action',data,json=True)
		#send({'hallo':1},json=True)
		#socketio.send('hallo') #{'message':f'user {user} moved!','action':a.toDict(), 'done':False}, broadcast=True)	
		#socketio.send(msg,f'user {user} moved!')
	#return a.toDict()
	#print(f'....result: {a}')
	#x={'k':'val'}
	#s=jsonify(x)
	#send(f'hallo, {x}')
	#emit('login',f'client: {request.sid} connected: {msg}', broadcast=True) #without broadcast, will just send to msg sender

@app.route('/')
def base_route():	return redirect ('/singlepage'); # ('/game/paris/felix')

@app.route('/index')
def r_index():
	return render_template('index.html')

@app.route('/singlepage', methods=['GET','POST'])
@app.route('/singlepage/<user>', methods=['GET','POST'])
@app.route('/singlepage/<user>/<game>', methods=['GET','POST'])
@app.route('/singlepage/<user>/<game>/<action>', methods=['GET','POST'])
def r_singlepage(user=None,game=None,action=None):
	if not user:
		user = {'name':'anonymous','color':'blue'}
	if request.method == 'POST':
		socketio.send('hallo', broadcast=True)	
	return render_template('singlepage.html', Basepath=Basepath, Serverdata={"user":user,"game":game,"action":action,"users":get_users(),"games":get_games(),"actions":get_actions()})

@app.route('/reset')
def r_reset(): 
	create_random_data()
	return redirect('/')

@app.route('/info')
def r_info(): 
	return render_template('info.html', Basepath=Basepath, Serverdata={"users":get_users(),"games":get_games(),"actions":get_actions()})

@app.route('/loggedin/<user>', methods=['GET','POST'])
def r_loggedin(user): 
	return render_template('loggedin.html', Basepath=Basepath, Serverdata={"user":get_user(user),"games":get_games_for(user),"actions":get_user_actions(user)}) 

@app.route('/table/<game>/<user>', methods=['GET','POST'])
def r_table(game,user): 
	if user == 'anonymous':
		return render_template('table.html', Basepath=Basepath, Serverdata={"user":{"name":"anonymous","color":'YELLOW'},"game":get_game(game)}) 
	return render_template('table.html', Basepath=Basepath, Serverdata={"user":get_user(user),"game":get_game(game),"actions":get_actions_for(game,user)}) 

@app.route('/action/<game>/<user>/<action>', methods=['GET','POST'])
def r_action(game,user,action): 
	print('action',action)
	action_result = process_action(user,game,action)
	return render_template('table.html', Basepath=Basepath, Serverdata={"user":get_user(user),"game":get_game(game),"actions":get_actions_for(game,user), "action_result":action_result}) 

def process_action(user,game,action):
	g=Game.query.filter_by(name=game).first()
	u=User.query.filter_by(name=user).first()
	a = Action.query.filter_by(user_id=u.id, game_id=g.id).first()
	a.choice = action
	s = a.choices.replace(action,'').replace('  ',' ')
	a.choices = s # '2 3 4 5' #a.choices.split('\W+')
	db.session.commit()
	return a

#region test routes
@app.route('/get_players/<game>')
def r_get_players(game): return jsonify(get_players(game))
@app.route('/get_playernames/<game>')
def r_get_playernames(game): return jsonify(get_playernames(game))
@app.route('/get_games/<user>')
def r_get_games_for(user): return jsonify(get_games_for(user))
@app.route('/get_gamenames/<user>')
def r_get_gamenames_for(user): return jsonify(get_gamenames_for(user))
@app.route('/get_game_actions/<game>')
def r_get_game_actions(game): return jsonify(get_game_actions(game))
#endregion

if __name__ == "__main__":
	#app.run() #host='0.0.0.0', port=5051, debug=True)
	#socketio.run(app, host='0.0.0.0', debug=True)
	#socketio.run(app, host='0.0.0.0', debug=True)
	socketio.run(app, debug=True)
	



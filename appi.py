#region init
from flask import jsonify, Flask, request, send_from_directory, render_template, redirect, url_for
app = Flask(__name__)
BUILD = 'dev' # public | heroku   False #set True for production (need to re-create db on heroku!)
Basepath = "http://www.telecave.net/aroot/base/" if BUILD == 'heroku' else "http://127.10.0.1:8080/aroot/base/" if BUILD == 'public' else "http://localhost:8080/aroot/base/"
app.config['SECRET_KEY'] = 'IJustHopeThisWorks!' #do I need this???

from dbutils import *
db_init(app,BUILD)

from flask_cors import CORS
CORS(app)
import json
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
#endregion


@app.route('/')
def base_route():	return redirect ('/get'); 

#turn={}

@app.route('/get', methods=['GET'])
def rget():
	Serverdata = {"users":get_users(),"games":get_games()}
	return render_template('supersimple.html', Basepath=Basepath, Serverdata=Serverdata)

@app.route('/post', methods=['POST'])
def rpost():
	data = request.get_json(force = True)
	msgtype = data['type']
	if msgtype == 'startgame':
		g=startgame(data['game'],data['players'],data['fen'],data['expected'])
		fen=data['fen']
		name=g['name']
		return g
	elif msgtype == 'move':
		name = data['game']
		g = get_game(name)
		expected = g['expected']
		e1=json.loads(expected)
		#print('===>expected',type(e1),e1)
		action = data['action']
		uname = data['uname']
		if uname in expected:
			e = e1[uname]
			if action['type'] == e['type'] and action['step'] == e['step']:
				print('updating!!!')
				print(data['expected'])
				g=update_game(name,data['fen'],data['action'],data['expected'],data['step']) 
				print('===>',g['expected'])
				return g
		print('invalid move!')
		return g
	elif msgtype == 'poll':
		game = data['game']
		g = get_game(game)
		return g
	return data

#region other routes
@app.route('/singlepage')
def r_singlepage_get():
	print('*** GET /singlepage ***')
	Serverdata = {"users":get_users(),"games":get_games()}
	if 'game' in request.args:
		Serverdata['game'] = request.args['game'] #get_game(request.args['game'])
	if 'user' in request.args:
		Serverdata['user'] = request.args['user'] #get_user(request.args['user'])
	return render_template('singlepage.html', Basepath=Basepath, Serverdata=Serverdata)

@app.route('/update', methods=['POST'])
def r_update_get(user):
	print('*** update ***')
	x = request.form['text']
	jx = json.loads(x)
	print(':::received',jx['user']) #,jx['data']['players'])
	print(':::data',jx['game']) #,jx['data']['players'])

@app.route('/singlepost', methods=['POST'])
def r_singlepost():
	print('*** POST /singlepage ***')
	x = request.form['text']
	jx = json.loads(x)
	print(':::received',jx['type']) #,jx['data']['players'])
	print(':::data',jx['data']) #,jx['data']['players'])
	reqtype = jx['type']
	data = jx['data']
	if reqtype == 'startgame':
		#add game from data
		g=startgame(data['gamename'],data['players'],json.dumps(data['fen']))
		return redirect(url_for('.r_singlepage_get',game=g['name']))
	elif reqtype == 'initgame':
		g=updategame(data['name'],data['step'],json.dumps(data['fen']))
		return redirect(url_for('.r_singlepage_get',game=g['name'],user=data['user']))
	elif reqtype == 'selectgame':
		#print(data['game'])
		return redirect(url_for('.r_singlepage_get',game=data['game'],user=data['user']))
	elif reqtype == 'updategame':
		if 'game' in data and 'turn' in data:
			turn[data['game']] = data['turn']
			print('==>turn',data['game'],turn[data['game']])
		if 'game' in data and 'fen' in data:
			g=updategame(data['game'],data['step'],json.dumps(data['fen']))
		if 'game' in data and 'user' in data and data['game'] in turn:
			print('==>turn',data['game'],turn[data['game']])
			if data['user'] in turn[data['game']]:
				return redirect(url_for('.r_singlepage_get',game=g['name'],user=data['user']))
			else: 
				return {"msg":"not your turn","data":data}
	return redirect(url_for('.r_singlepage_get'))


@app.route('/index')
def r_index():
	return render_template('index.html')

@app.route('/reset')
def r_reset(): 
	db_reset()
	#create_random_data()
	return redirect('/')

#test routes
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

@app.route('/simple_1', methods=['GET','POST'])
def r_simple_1():
	if request.method == 'GET':
		Serverdata = {"users":get_users(),"games":get_games()}
		return render_template('simple.html', Basepath=Basepath, Serverdata=Serverdata)
	else:
		print('request',request.get_json(force=True))

		return {'aber':'hallo'}
		# game = request.form['game']
		# fen = request.form['text']
		# fen1 = request.form['fen']
		# print('fen',type(fen1),fen1['turn'])
		# return fen1
		# players = request.form['players']
		# print('players',players,type(players))
		# sender = request.form['user']
		# table = request.form['table']
		# msgtype = request.form['type']
		# print('*** POST /singlepage ***',sender,game)
		# print('table:',table if table else 'no table',turn[table] if table else request.form['turn'],msgtype)
		# if not table and msgtype == 'startgame':
		# 	g = startgame(game,['mimi','felix'],fen)
		# 	print('g',g)
		# 	#table = g['table']
		# #turn[table] = request.form['turn']
		# return g #'hallo' #table if table else game
		# x = request.form['text']
		# jx = json.loads(x)
		# print(':::received',jx['type']) #,jx['data']['players'])
		# print(':::data',jx['data']) #,jx['data']['players'])
		# reqtype = jx['type']
		# data = jx['data']
		# if reqtype == 'startgame':
		# 	#add game from data
		# 	g=startgame(data['gamename'],data['players'],json.dumps(data['fen']))
		# 	return redirect(url_for('.r_singlepage_get',game=g['name']))
		# elif reqtype == 'initgame':
		# 	g=updategame(data['name'],data['step'],json.dumps(data['fen']))
		# 	return redirect(url_for('.r_singlepage_get',game=g['name'],user=data['user']))
		# elif reqtype == 'selectgame':
		# 	#print(data['game'])
		# 	return redirect(url_for('.r_singlepage_get',game=data['game'],user=data['user']))
		# elif reqtype == 'updategame':
		# 	if 'game' in data and 'turn' in data:
		# 		turn[data['game']] = data['turn']
		# 		print('==>turn',data['game'],turn[data['game']])
		# 	if 'game' in data and 'fen' in data:
		# 		g=updategame(data['game'],data['step'],json.dumps(data['fen']))
		# 	if 'game' in data and 'user' in data and data['game'] in turn:
		# 		print('==>turn',data['game'],turn[data['game']])
		# 		if data['user'] in turn[data['game']]:
		# 			return redirect(url_for('.r_singlepage_get',game=g['name'],user=data['user']))
		# 		else: 
		# 			return {"msg":"not your turn","data":data}
		# return redirect(url_for('.r_singlepage_get'))

@app.route('/simple', methods=['GET','POST'])
def r_simple():
	if request.method == 'GET':
		Serverdata = {"users":get_users(),"games":get_games()}
		return render_template('supersimple.html', Basepath=Basepath, Serverdata=Serverdata)
	else:
		data = request.get_json(force = True)
		msgtype = data['type']
		if msgtype == 'startgame':
			g=startgame(data['game'],data['players'],data['fen'])
			return redirect('/simple') #g
		return data

#endregion

if __name__ == "__main__":
	#print('hallo')
	#app.run()
	app.run(debug=True) #host='0.0.0.0', port=5051, debug=True)
	



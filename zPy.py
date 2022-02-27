
#gevent_server = eventlet.pywsgi.WSGIServer(("0.0.0.0", 8080), app,log = None)

#region logging
import logging
from logging.handlers import MemoryHandler
import sys

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

def log_if_errors(logger, target_handler=None, flush_level=None, capacity=None):
    if target_handler is None:
        target_handler = logging.StreamHandler()
    if flush_level is None:
        flush_level = logging.ERROR
    if capacity is None:
        capacity = 100
    handler = MemoryHandler(capacity, flushLevel=flush_level, target=target_handler)

    def decorator(fn):
        def wrapper(*args, **kwargs):
            logger.addHandler(handler)
            try:
                return fn(*args, **kwargs)
            except Exception:
                logger.exception('call failed')
                raise
            finally:
                super(MemoryHandler, handler).flush()
                logger.removeHandler(handler)
        return wrapper

    return decorator

def write_line(s):
    sys.stderr.write('%s\n' % s)

def foo(fail=False):
    write_line('about to log at DEBUG ...')
    logger.debug('Actually logged at DEBUG')
    write_line('about to log at INFO ...')
    logger.info('Actually logged at INFO')
    write_line('about to log at WARNING ...')
    logger.warning('Actually logged at WARNING')
    if fail:
        write_line('about to log at ERROR ...')
        logger.error('Actually logged at ERROR')
        write_line('about to log at CRITICAL ...')
        logger.critical('Actually logged at CRITICAL')
    return fail

decorated_foo = log_if_errors(logger)(foo)

logger.setLevel(logging.ERROR)

#endregion


#region loggin
import logging
from logging.handlers import RotatingFileHandler
class LevelFilter(object):
    def __init__(self, level):
        self.level = level

    def filter(self, record):
        return record.levelno != self.level

# Redirect stdout and stderr to files
info_handler = RotatingFileHandler("info.log", backupCount=1)
info_handler.setLevel(logging.INFO)
# Don't print stack trace in info.log - optional
info_handler.addFilter(LevelFilter(logging.ERROR))

error_handler = RotatingFileHandler("err.log", backupCount=1)
error_handler.setLevel(logging.ERROR)

logging.root.handlers = [info_handler, error_handler]
#endregion


# from socket import *
# socketio = socket_init(app)
# @app.route('/testsocketio')
# def testsock():	
# 	return render_template('tests/test_socketio.html')

# @app.get('/stop')
# def shutdown():
# 	socketio.stop()
# #endregion


# def socket_init(app):
# 	global socketio
# 	return socketio



# @socketio.on('joined', namespace='/chat')
# def joined(message):
#     """Sent by clients when they enter a room.
#     A status message is broadcast to all people in the room."""
#     # Add client to client list
#     clients.append(request.sid)
#     room = session.get('room')
#     join_room(room)
#     # emit to the first client that joined the room
#     emit('status', {'msg': session.get('name') + ' has entered the room.'}, room=clients[0])


# @app.route('/<user>')
# def base_route_user(user):	return redirect ('/singlepage/'+user); # ('/game/paris/felix')

# @app.route('/<user>/<game>')
# def base_route_user_game(user,game):	return redirect (f'/singlepage/{user}/{game}'); # ('/game/paris/felix')

# @app.route('/<user>/<game>/<action>')
# def base_route_user_game_action(user,game,action):	return redirect (f'/singlepage/{user}/{game}/{action}'); # ('/game/paris/felix')

#region game testing: all users games actions in 1 page, can play any user, anygame











#region feb 16 22
def process_action(game,user,action):
	#die gewaehlte action muss aus der action list raus
	#choice wird zu action gesetzt
	#print('...user',user,'game',game,'action',action)
	g=Game.query.filter_by(name=game).first()
	#print('=>game.id',g.id)
	u=User.query.filter_by(name=user).first()
	#print('=>user.id',u.id)
	a = Action.query.filter_by(user_id=u.id,game_id=g.id).first()
	#print('=>action.choices',a.choices)
	a.choice = action
	s = a.choices
	s=s.replace(action,'').replace('  ',' ')
	#print('...res=',s)
	
	a.choices = s # '2 3 4 5' #a.choices.split('\W+')
	#print('....',a.choices)
	#choices.remove(action)
	#a.choices = ' '.join(choices)
	#a.choices.remove(action)
	#print('a',a.toDict()) #,a.choice)
	db.session.commit()
	return a.toDict()


@app.route('/game/<gamename>/<username>', methods=['GET','POST'])
def game_route(gamename,username):	
	user = get_user(username) if username!='anonymous' else {'name':'anonymous'}
	game = get_game(gamename)
	actions = get_actions(game,user)
	Serverdata = {'actions':actions,'user':user,'game':game}
	if request.method == 'POST':
		process_action(Serverdata,request.form['text'])

	return render_template('simplegame.html',Serverdata=Serverdata) 





















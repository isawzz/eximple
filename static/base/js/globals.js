var TESTING = true; //set to false in production!

var PROJECTNAME = 'basinno';
var USELIVESERVER = false;
var START_IN_MENU = false;
var DEFAULTUSERNAME = 'gul';

// var USE_LOCAL_STORAGE = true;
var CLEAR_LOCAL_STORAGE = false;
var USE_ADDONS = false;

var sent_audio = new Audio("../base/assets/sounds/message_sent.mp3");
var received_audio = new Audio("../base/assets/sounds/message_received.mp3");
var SEEN_STATUS = false;

var Fen, R, Qu, U, G, A, Card = {};
var DB = {}, Daat = {}, DA = {}, Items = {}, Session = {}, Dictionary = {}, TestInfo = {};
var TOMan, TO, TOMain, TOTrial, TOList, TOTicker, TCount, TOAnim;
var BotTicker, POLL_COUNTER = 0;
var Waiting_for = null;
var StepCounter = 0, Autoreload=false, KeepSessionUser = false; 

//#region card globals

const INNO = {
	color: { blue: '#89aad7', red: '#da7887', green: '#72b964', yellow: '#e2e57a', purple: '#9b58ba' },
	sym: {
		tower: { key: 'white-tower', fg: 'silver', bg: 'dimgray' },
		leaf: { key: 'leaf', fg: '#96D6BE', bg: '#275D45' },
		tree: { key: 'leaf', fg: '#96D6BE', bg: '#275D45' },
		bulb: { key: 'lightbulb', fg: 'white', bg: '#69224C' },
		crown: { key: 'queen-crown', fg: '#FEE593', bg: '#A27E44' },
		factory: { key: 'i_factory', fg: '#CD5147', bg: '#6D1A12' },
		clock: { key: 'clock', fg: '#3E84B5', bg: '#0B5884' },
		none: { key: 'flamer', fg: 'silver', bg: 'dimgrey' },
		plus: { key: 'plus', fg: 'silver', bg: '#00000020' },
		fountain: { key: 'fountain', fg: 'silver', bg: '#00000020' },
		flag: { key: 'flying-flag', fg: 'silver', bg: '#00000020' },
		up: { key: 'arrow-up', fg: 'silver', bg: '#00000020' },
		left: { key: 'arrow-left', fg: 'silver', bg: '#00000020' },
		right: { key: 'arrow-right', fg: 'silver', bg: '#00000020' },
	},
	symNames: ['tower', 'tree', 'bulb', 'crown', 'factory', 'clock'],
	phases: [
		{ key: 'init', message: 'select initial card to meld!' },
		{ key: 'just_one_turn', message: 'take your first turn!' },
		{ key: 'two_turns', message: 'take your turn!' },
	],
	special_achievements: {
		MONUMENT: "Claim immediately if you tuck six cards or score six cards during a single turn (May also be claimed via Masonry from Age 1)",
		EMPIRE: "Claim immediately if you have three  or more icons of all six types (May also be claimed via Construction from Age 2)",
		WORLD: "Claim immediately if you have twelve or more clocks on your board (May also be claimed via Translation from Age 3)",
		WONDER: "Claim immediately if you have all five colors on your board, and each is splayed either up or right (May also be claimed via Invention from Age 4)",
		UNIVERSE: "Claim immediately if you have five top cards, and each is of value 8 or higher (May also be claimed via Astronomy from Age 5)",
		LEGEND: "Claim if you meld a city with a left arrow on a color already splayed left",
		REPUTE: "Claim if you meld a city with a right arrow on a color already splayed right",
		FAME: "Claim if you meld a city with a up arrow on a color already splayed up",
		GLORY: "Claim immediately tuck a city with a flag",
		VICTORY: "Claim immediately tuck a city with a fountain",
		SUPREMACY: "Claim immediately if you have 3 or more of one icon in 4 different colors (May also be claimed via Novel from Age 3)",
		DESTINY: "Claim immediately if you have 7 or more cards in your forecast (May also be claimed via Barometer from Age 4)",
		WEALTH: "Claim immediately if you have 8 or more bonuses (May also be claimed via Palampore from Age 5)",
		HERITAGE: "Claim immediately if you have 8 or more numbers in one color (May also be claimed via Loom from Age 6)",
		HISTORY: "Claim immediately if you have 4 or more echoes in one color (May also be claimed via Photography from Age 7)",
	},
};
const ARI = {
	sz_hand: 7,
	stage:{
		2: 'tax',
		3: 'auto market',
		4: 'stall selection',
		5: 'action: command',
		6: 'action step 2',
		7: 'action 3',
		8: 'action 4',
		9: 'action 5',
		100: 'pickup end',
		101: 'build end',
		102: 'select building to upgrade',
	
		10: 'king end: any player end game?',
		11: 'queen: ball',
		12: 'auction: bid',
		13: 'auction: buy',
	
		20: 'payment action',
	}
};
//#endregion cards

//var Otree, Actionlist; //, Odi, F2oid;
var FenPositionList;
var C52, Cinno, Aristocards, Dinno, InnoById, InnoByName, Syms, SymKeys, KeySets, Categories, ByGroupSubgroup, WordP; //, CatSets, SymbolDict, SInfo;
var Userdata, Username, Serverdata, Live;
var Pictures, Goal, Selected, Score, IsAnswerCorrect, QContextCounter = 0;
var uiActivated, aiActivated, auxOpen, GameTimer, STOPAUS = false;
var Settings, SettingsList, SettingsChanged, SelectedMenuKey;
var Players, PlayerOnTurn, GC, GameCounter;

var dLeiste, dScore, dGameTitle, dTable, dTableShield, dTitle, dLinks, dRechts, dOben, dUnten, dPlayerStats, dMessage, dStatus;
var dActions, dActions0, dActions1, dActions2, dActions3, dActions4, dActions5, dError;

var BestMinusScore = Infinity, BestMinusState, BestPlusScore = -Infinity, BestPlusState;
var F_END, F_MOVES, F_APPLYMOVE, F_UNDOMOVE, F_EVAL, DMAX, MAXIMIZER, MINIMIZER, SelectedMove, CANCEL_AI;
var DMM = {}, timit;

//#region shapes
var ShapeKeys = ['hex', 'hexF', 'tri', 'triDown', 'triLeft', 'triRight'];
var PolyClips = {
	hex: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
	test1: 'inset(50% 0% 100% 25% 100% 75% 50% 100% 0% 75% 0% 25% round 10px)',
	test0: 'inset(45% 0% 33% 10% round 10px)',
	hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
	hexF: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
	hexFlat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
	hexflat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
	tri: 'polygon(50% 0%, 100% 100%, 0% 100%)',
	triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
	triUp: 'polygon(50% 0%, 100% 100%, 0% 100%)',
	triup: 'polygon(50% 0%, 100% 100%, 0% 100%)',
	triDown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
	tridown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
	triright: 'polygon(0% 0%, 100% 50%, 0% 100%)',
	triRight: 'polygon(0% 0%, 100% 50%, 0% 100%)',
	trileft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
	triLeft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
	splayup: 'polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)',
}
//#endregion

//#region color constants
var ColorNames; //see base.js colors
const BLUE = '#4363d8';
const BLUEGREEN = '#004054';
const BROWN = '#96613d';
const GREEN = '#3cb44b';
const FIREBRICK = '#800000';
const LIGHTGREEN = '#afff45'; //'#bfef45';
const LIGHTBLUE = '#42d4f4';
const OLIVE = '#808000';
const ORANGE = '#f58231';
const PURPLE = '#911eb4';
const RED = '#e6194B';
const TEAL = '#469990';
const YELLOW = '#ffe119';
const YELLOW2 = '#fff620'; //?pink???
const YELLOW3 = '#ffed01';

const wamber = '#ffc107';
const waqua = '#00ffff';
const wblack = '#000000';
const wblue = '#2196f3';
const wbluegrey = '#607d8b';
const wbluegray = '#607d8b';
const wbrown = '#795548';
const wcyan = '#00bcd4';
const wdarkgrey = '#616161';
const wdeeporange = '#ff5722';
const wdeeppurple = '#673ab7';
const wgreen = '#4caf50';
const wgrey = '#9e9e9e';
const windigo = '#3f51b5';
const wkhaki = '#f0e68c';
const wlightblue = '#87ceeb';
const wlightgreen = '#8bc34a';
const wlight = '#f1f1f1';
const wlime = '#cddc39';
const worange = '#ff9800';
const wpaleblue = '#ddffff';
const wpalegreen = '#ddffdd';
const wpalered = '#ffdddd';
const wpaleyellow = '#ffffcc';
const wpink = '#e91e63';
const wpurple = '#9c27b0';
const wred = '#f44336';
const wsand = '#fdf5e6';
const wteal = '#009688';
const wwhite = '#ffffff';
const wyellow = '#ffeb3b';

const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow',
	'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const ColorDict = {
	black: { c: 'black', E: 'black', D: 'schwarz' },
	blue: { c: 'blue', E: 'blue', D: 'blau' },
	BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
	BLUEGREEN: { c: BLUEGREEN, E: 'bluegreen', D: 'blaugrün' },
	blue1: { c: BLUE, E: 'blue', D: 'blau' },
	BROWN: { c: BROWN, E: 'brown', D: 'braun' },
	deepyellow: { c: YELLOW3, E: 'yellow', D: 'gelb' },
	FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
	gold: { c: 'gold', E: 'gold', D: 'golden' },
	green: { c: 'green', E: 'green', D: 'grün' },
	GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
	green1: { c: GREEN, E: 'green', D: 'grün' },
	grey: { c: 'grey', E: 'grey', D: 'grau' },
	lightblue: { c: LIGHTBLUE, E: 'lightblue', D: 'hellblau' },
	LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
	lightgreen: { c: LIGHTGREEN, E: 'lightgreen', D: 'hellgrün' },
	LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
	lightyellow: { c: YELLOW2, E: 'lightyellow', D: 'gelb' },
	olive: { c: OLIVE, E: 'olive', D: 'oliv' },
	OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
	orange: { c: ORANGE, E: 'orange', D: 'orange' },
	ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
	pink: { c: 'deeppink', E: 'pink', D: 'rosa' },
	purple: { c: PURPLE, E: 'purple', D: 'lila' },
	PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
	red: { c: 'red', E: 'red', D: 'rot' },
	RED: { c: '#e6194B', E: 'red', D: 'rot' },
	red1: { c: RED, E: 'red', D: 'rot' },
	skyblue: { c: 'deepskyblue', E: 'skyblue', D: 'himmelblau' },
	teal: { c: TEAL, E: 'teal', D: 'blaugrün' },
	TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
	violet: { c: 'indigo', E: 'violet', D: 'violett' },
	white: { c: 'white', E: 'white', D: 'weiss' },
	yellow: { c: 'yellow', E: 'yellow', D: 'gelb' },
	yelloworange: { c: '#ffc300', E: 'yellow', D: 'gelb' },
	YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
	YELLOW2: { c: YELLOW2, E: 'yellow', D: 'gelb' },
	yellow1: { c: YELLOW2, E: 'yellow', D: 'gelb' },
	YELLOW3: { c: YELLOW3, E: 'yellow', D: 'gelb' },
};


const PlayerColors = {
	red: '#D01013',
	blue: '#003399',
	green: '#58A813',
	orange: '#FF6600',
	yellow: '#FAD302',
	violet: '#55038C',
	pink: '#ED527A',
	beige: '#D99559',
	sky: '#049DD9',
	brown: '#A65F46',
	white: '#FFFFFF',
	lightblue: '#42d4f4',
	lightgreen: '#afff45',
};
//#endregion

//#region speechGame constants: badge symbols, DD, OPS
const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED,
	GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue', 'deeppink', //** MAXLEVEL 10 */
	TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE, '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'palegreen', '#e6194B'];
var levelKeys = ['island', 'justice star', 'materials science', 'mayan pyramid', 'medieval gate',
	'great pyramid', 'meeple', 'smart', 'stone tower', 'trophy cup', 'viking helmet',
	'flower star', 'island', 'justice star', 'materials science', 'mayan pyramid',];
const DD = {
	yellow: 'gelb', green: 'grün', blue: 'blau', red: 'rot', pink: 'rosa', orange: 'orange', black: 'schwarz',
	white: 'weiss', violet: 'violett', '1st': 'erste', '2nd': 'zweite', '3rd': 'dritte', '4th': 'vierte', '5th': 'fünfte',
	add: 'addiere', subtract: 'subtrahiere', multiply: 'mutipliziere', plus: 'plus', minus: 'minus', times: 'mal',
	'divided by': 'dividiert durch', excellent: 'sehr gut', very: 'sehr', good: 'gut',
	'to the previous number': 'zur vorhergehenden zahl',
	'from the previous number': 'von der vorhergehenden zahl',
	'multiply the previous number by': 'multipliziere die vorhergehende zahl mit',
	'divide the previous number by': 'dividiere die vorhergehende zahl durch',
	'the previous number': 'die vorhergehende zahl', is: 'ist', what: 'was', equals: 'ist gleich', enter: "tippe",
	'to the power of': 'hoch', or: 'oder', less: 'kleiner', greater: 'grösser', than: 'als', equal: 'gleich', and: 'und',
	not: 'nicht', click: 'click', press: 'tippe', quite: 'ziemlich', 'not quite': 'nicht ganz',
	say: 'sage', write: 'schreibe', complete: 'ergänze', 'unequal': 'ungleich', except: 'ausser', EXCEPT: 'AUSSER',
	number: 'Zahl', color: 'farbe', eliminate: 'eliminiere', all: 'alle', with: 'mit', true: 'wahr', false: 'falsch',
	build: 'bilde', count: 'zähle', 'the red dots': 'die roten Punkte',
};
const OPS = { //die muessen vals in settings.games[game] sein!
	'first': { cmd: 'add', link: 'to', wr: '+', sp: 'plus', f: (a, b) => (a + b), min: 20, max: 100 },
	'plus': { cmd: 'add', link: 'to', wr: '+', sp: 'plus', f: (a, b) => (a + b), min: 3, max: 30 },
	'minus': { cmd: 'subtract', link: 'from', wr: '-', sp: 'minus', f: (a, b) => (a - b), min: 1, max: 10 },
	'div': { cmd: 'divide', link: 'by', wr: ':', sp: 'divided by', f: (a, b) => (a / b), min: 2, max: 10 },
	'intdiv': { cmd: 'divide', link: 'by', wr: 'div', sp: 'divided by', f: (a, b) => (Math.floor(a / b)), min: 1, max: 10 },
	'mult': { cmd: 'multiply', link: 'by', wr: 'x', sp: 'times', f: (a, b) => (a * b), min: 2, max: 10 },
	// '**':{wr:'^',sp:'to the power of',f:(a,b)=>(Math.pow(a,b))},
	'pow': { cmd: 'build', link: 'to the power of', wr: '^', sp: 'to the power of', f: (a, b) => (Math.pow(a, b)), min: 0, max: 20 },
	'mod': { cmd: 'build', link: 'modulo', wr: '%', sp: 'modulo', f: (a, b) => (a % b), min: 0, max: 20 },
	'l': { cmd: 'true or false?', link: 'less than', wr: '<', sp: 'less than', f: (a, b) => (a < b) },
	'g': { cmd: 'true or false?', link: 'greater than', wr: '>', sp: 'greater than', f: (a, b) => (a > b) },
	'leq': { cmd: 'true or false?', link: 'less or equal', wr: '<=', sp: 'less or equal', f: (a, b) => (a <= b) },
	'geq': { cmd: 'true or false?', link: 'greater or equal', wr: '>=', sp: 'greater or equal', f: (a, b) => (a >= b) },
	'eq': { cmd: 'true or false?', link: 'equal', wr: '=', sp: 'equal', f: (a, b) => (a == b) },
	'neq': { cmd: 'true or false?', link: 'unequal', wr: '#', sp: 'unequal', f: (a, b) => (a != b) },
	'and': { cmd: 'true or false?', link: 'and', wr: '&&', sp: 'and', f: (a, b) => (a && b) },
	'or': { cmd: 'true or false?', link: 'or', wr: '||', sp: 'or', f: (a, b) => (a || b) },
	'nand': { cmd: 'true or false?', link: 'nand', wr: 'nand', sp: 'nand', f: (a, b) => (!(a && b)) },
	'nor': { cmd: 'true or false?', link: 'nor', wr: 'nor', sp: 'nor', f: (a, b) => (!(a || b)) },
	'xor': { cmd: 'true or false?', link: 'xor', wr: 'xor', sp: 'xor', f: (a, b) => (a && !b || !a && b) },
}

EnglishSentences = [
	'I like unscambling words',
	'it is a beautiful day',
	'you need to work harder',
	'sleep is important',
	'nobody is here',
	'I heard the bell ring',
	'I am going to sleep',
	'he just woke up',
	'he left a minute ago',
	'the cat stretched',
	'Jacob stood on his tiptoes',
	'the car turned around the corner',
	'Kelly twirled in circles',
	'she opened the door',
	'Aaron made a picture',
	'I am sorry',
	'I forgot to eat',
	'Gunter is a Microsoft employee',
	'it is raining',
	'Gunter is going to the store',
	'Felix loves Innovation',
	'Amanda likes playing video games',
	'let us take a walk',
	'Gunter is sleeping',
	'Tom got a new bike',
	'open the jar carefully',
	'read the directions',
	'do not cry',
	'use common sense',
	'make the best of things',
	'they drove to the store',
	['the children opened all the gifts', 'all the children opened all the gifts'],
	'the princesses are dancing gracefully',
	'let us share this cake',
	'the paper sat idle on the desk',
	'Misha walked his dog',
	'the library opens at ten',
	'we would love to go to the library',
	'I rinsed and dried the dishes',
	'Joe stood up and spoke to the crowd',
	'you are in the right place',
	'turn around',
	'take a left at the corner',
	'who am I',
	'who are you',
	'I love you',
	'where are you',
	'I am here',
	'never say never',
	'be quiet',
	'let us try to unscamble a longer sentence',
	'where did I put my keys',
	'how do you do',
	'come on in',
	'do not worry',
	'where are my glasses',
	'we are leaving',
	'there is no time',
	'nobody knows',
	'an apple is a fruit',
	'oranges smell lovely',
	'take a seat',
	'Tom has a bike',
	'Anna plays the flute',
	'Everybody wants to be happy',
	'life is so simple',
	'life is a dream',
	'who is the person sitting in the corner',
	'someone left his umbrella over there',
	'you need to make an appointment for next week',
	'would you like to go to the movies',
	'reading is great fun',
	['yesterday I spoke to my boss', 'I spoke to my boss yesterday'],
	'Max is spending every free minute at the gym',
	'my parent brought me up to always strive for excellence',
	['yesterday I started studying for my upcoming exams', 'I started studying for my upcoming exams yesterday'],
	['I am not afraid of the dark', 'of the dark I am not afraid'],
	['Nick still remembered the first time he drove a bike', 'Nick remembered still the first time he drove a bike'],
	'some people believe that the earth is flat',
	'I am starting to realize that not everybody thinks the same',
	['we are going to have fun today', 'today we are going to have fun'],
	['I will try to have fun today', 'today I will try to have fun'],
	'I am enjoying life as if it were an endless vacation',
	'she said hello to the little girl',
	'my name is not that hard to spell',
	'nobody is helping me with my homework',
	'I would like to become a software engineer',
	'my teacher has been supporting me a lot',
	['the world is full of fun things to do', 'the fun world is full of things to do'],
	['I learn something new every day', 'every day I learn something new'],
	['we cannot leave before noon', 'before noon we cannot leave'],
	['learning is the most enjoyable activity', 'the most enjoyable activity is learning', 'the learning activity is most enjoyable'],
	['my favorite sport is swimming', 'swimming is my favorite sport'],
	['they have two girls and a boy', 'they have a boy and two girls'],
	['nowadays most people have enough food on their table', 'most people have enough food on their table nowadays'],
	['Mary and Samantha arrived at the bus station three hours early', 'Samantha and Mary arrived at the bus station three hours early'],
	['I prefer strawberries over raspberries', 'I prefer raspberries over strawberries'],
	['it is never too late to learn something new', 'to learn something new it is never too late'],
	['I have not had dinner yet', 'I have not yet had dinner'],
	['always be as active as you can', 'be always as active as you can', 'be as active as you can always'],
	['I joined a zoom call a minute ago', 'a minute ago I joined a zoom call'],
	['my brother and I like skiing', 'I and my brother like skiing'],
	['I would like to eat an apple and an orange', 'I would like to eat an orange and an apple'],
	['the wheather is so nice today', 'today the wheather is so nice', 'so nice is the wheather today'],
	['math is the most fun subject of all'],
	['pick up the phone if you can', 'if you can pick up the phone'],
	['he was eating and talking', 'he was talking and eating'],
	['these food items are gluten-free', 'these gluten-free items are food', 'these items are gluten-free food'],
	['the cat and the dog ate', 'the dog and the cat ate'],
	['my parents and I went to watch a movie', 'I and my parents went to watch a movie'],

];

const GirlNames = ['Adrianna', 'Amanda', 'Ashley', 'Belinda', 'Cassandra', 'Charlene', 'Erica', 'Gabriela', 'Gudrun',
	'Jenny', 'Lana', 'Lillian', 'Martha', 'Maurita', 'Melissa', 'Micaela', 'Milda', 'Natalie', 'Natasha',
	'Nimble', 'Rebecca', 'Rhiannon', 'Sabine', 'Stacy'];

const BoyNames = ['Aaron', 'Ariel', 'Billy', 'Cayley', 'Erik',
	'Felix', 'Gunter', 'Gilbert', 'Henry', 'Jacob', 'Jaime', 'John', 'Leo',
	'Marshall', 'Matthew', 'Nathan',
	'Robert', 'Shad', 'Thomas', 'Tim', 'William'];

const UnicodeSymbols = {
	menu: '☰',

};


//#region variables
var FLAG_HINT_ONLY = false;
var FLAG_AI_CANCELED = false;

var PIECES = { EMPTY: 0, wP: 1, wN: 2, wB: 3, wR: 4, wQ: 5, wK: 6, bP: 7, bN: 8, bB: 9, bR: 10, bQ: 11, bK: 12 };
var BRD_SQ_NUM = 120;

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;

var INFINITE = 30000;
var MATE = 29000;

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";


var FILES = { FILE_A: 0, FILE_B: 1, FILE_C: 2, FILE_D: 3, FILE_E: 4, FILE_F: 5, FILE_G: 6, FILE_H: 7, FILE_NONE: 8 };
var RANKS = { RANK_1: 0, RANK_2: 1, RANK_3: 2, RANK_4: 3, RANK_5: 4, RANK_6: 5, RANK_7: 6, RANK_8: 7, RANK_NONE: 8 };

var COLOURS = { WHITE: 0, BLACK: 1, BOTH: 2 };

var SQUARES = {
	A1: 21, B1: 22, C1: 23, D1: 24, E1: 25, F1: 26, G1: 27, H1: 28,
	A8: 91, B8: 92, C8: 93, D8: 94, E8: 95, F8: 96, G8: 97, H8: 98, NO_SQ: 99, OFFBOARD: 100
};

var BOOL = { FALSE: 0, TRUE: 1 };

var CASTLEBIT = { WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8 };

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64);

var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";

var PieceBig = [BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE];
var PieceMaj = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE];
var PieceMin = [BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE];
var PieceVal = [0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000];
var PieceCol = [COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK];

var PiecePawn = [BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE];
var PieceKnight = [BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE];
var PieceKing = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE];
var PieceRookQueen = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE];
var PieceBishopQueen = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE];
var PieceSlides = [BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE];

var KnDir = [-8, -19, -21, -12, 8, 19, 21, 12];
var RkDir = [-1, -10, 1, 10];
var BiDir = [-9, -11, 11, 9];
var KiDir = [-1, -10, 1, 10, -9, -11, 11, 9];

var DirNum = [0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];
var PceDir = [0, 0, KnDir, BiDir, RkDir, KiDir, KiDir, 0, KnDir, BiDir, RkDir, KiDir, KiDir];
var LoopSlidePce = [PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
var LoopNonSlidePce = [PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0];
var LoopSlideIndex = [0, 4];
var LoopNonSlideIndex = [0, 3];
var Kings = [PIECES.wK, PIECES.bK];

var PieceKeys = new Array(14 * 120);
var SideKey;
var CastleKeys = new Array(16);

var Mirror64 = [
	56, 57, 58, 59, 60, 61, 62, 63,
	48, 49, 50, 51, 52, 53, 54, 55,
	40, 41, 42, 43, 44, 45, 46, 47,
	32, 33, 34, 35, 36, 37, 38, 39,
	24, 25, 26, 27, 28, 29, 30, 31,
	16, 17, 18, 19, 20, 21, 22, 23,
	8, 9, 10, 11, 12, 13, 14, 15,
	0, 1, 2, 3, 4, 5, 6, 7
];

var CastlePerm = [
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 7, 15, 15, 15, 3, 15, 15, 11, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
	15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];


/*                         	                        
0000 0000 0000 0000 0000 0111 1111 -> From 0x7F
0000 0000 0000 0011 1111 1000 0000 -> To >> 7, 0x7F
0000 0000 0011 1100 0000 0000 0000 -> Captured >> 14, 0xF
0000 0000 0100 0000 0000 0000 0000 -> EP 0x40000
0000 0000 1000 0000 0000 0000 0000 -> Pawn Start 0x80000
0000 1111 0000 0000 0000 0000 0000 -> Promoted Piece >> 20, 0xF
0001 0000 0000 0000 0000 0000 0000 -> Castle 0x1000000
*/

var MFLAGEP = 0x40000
var MFLAGPS = 0x80000
var MFLAGCA = 0x1000000

var MFLAGCAP = 0x7C000
var MFLAGPROM = 0xF00000

var NOMOVE = 0

var PVENTRIES = 10000;


var GameController = {};
GameController.EngineSide = COLOURS.BOTH;
GameController.PlayerSide = COLOURS.BOTH;
GameController.BoardFlipped = BOOL.FALSE;
GameController.GameOver = BOOL.FALSE;
GameController.BookLoaded = BOOL.FALSE;
GameController.GameSaved = BOOL.TRUE;

// board variables
var brd_side = COLOURS.WHITE;
var brd_pieces = new Array(BRD_SQ_NUM);
var brd_enPas = SQUARES.NO_SQ;
var brd_fiftyMove;
var brd_ply;
var brd_hisPly;
var brd_castlePerm;
var brd_posKey;
var brd_pceNum = new Array(13);
var brd_material = new Array(2);
var brd_pList = new Array(14 * 10);

var brd_history = [];

var brd_bookLines = [];

var brd_moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
var brd_moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
var brd_moveListStart = new Array(MAXDEPTH);

var brd_PvTable = [];
var brd_PvArray = new Array(MAXDEPTH);
var brd_searchHistory = new Array(14 * BRD_SQ_NUM);
var brd_searchKillers = new Array(3 * MAXDEPTH);

var VictimScore = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
var MvvLvaScores = new Array(14 * 14);

//#endregion

//#region accessors converters

function FROMSQ(m) { return (m & 0x7F); }
function TOSQ(m) { return (((m) >> 7) & 0x7F); }
function CAPTURED(m) { return (((m) >> 14) & 0xF); }
function PROMOTED(m) { return (((m) >> 20) & 0xF); }

function PCEINDEX(pce, pceNum) { return (pce * 10 + pceNum); }

function FR2SQ(f, r) { return ((21 + (f)) + ((r) * 10)); }

function SQ64(sq120) { return Sq120ToSq64[(sq120)]; }

function SQ120(sq64) { return Sq64ToSq120[(sq64)]; }

function MIRROR64(sq) { return Mirror64[sq]; }

function RAND_32() { return (Math.floor((Math.random() * 255) + 1) << 23) | (Math.floor((Math.random() * 255) + 1) << 16) | (Math.floor((Math.random() * 255) + 1) << 8) | Math.floor((Math.random() * 255) + 1); }

function SQOFFBOARD(sq) {	if (FilesBrd[sq] == SQUARES.OFFBOARD) return BOOL.TRUE;	return BOOL.FALSE;}

function HASH_PCE(pce, sq) {	brd_posKey ^= PieceKeys[pce * 120 + sq];}
function HASH_CA() { brd_posKey ^= CastleKeys[brd_castlePerm]; }
function HASH_SIDE() { brd_posKey ^= SideKey; }
function HASH_EP() { brd_posKey ^= PieceKeys[brd_enPas]; }

function SqFromAlg(moveAlg) {

	//console.log('SqFromAlg' + moveAlg);
	if (moveAlg.length != 2) return SQUARES.NO_SQ;

	if (moveAlg[0] > 'h' || moveAlg[0] < 'a') return SQUARES.NO_SQ;
	if (moveAlg[1] > '8' || moveAlg[1] < '1') return SQUARES.NO_SQ;

	file = moveAlg[0].charCodeAt() - 'a'.charCodeAt();
	rank = moveAlg[1].charCodeAt() - '1'.charCodeAt();

	return FR2SQ(file, rank);
}
function Move2FromTo(move) {
	var ff = FilesBrd[FROMSQ(move)];
	var rf = RanksBrd[FROMSQ(move)];
	var ft = FilesBrd[TOSQ(move)];
	var rt = RanksBrd[TOSQ(move)];
	return { from: { sq: FROMSQ(move), file: ff, rank: rf }, to: { sq: TOSQ(move), file: ft, rank: rt } };
}
function BoardToFen() {
	var fenStr = '';
	var rank, file, sq, piece;
	var emptyCount = 0;

	for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		emptyCount = 0;
		for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file, rank);
			piece = brd_pieces[sq];
			if (piece == PIECES.EMPTY) {
				emptyCount++;
			} else {
				if (emptyCount != 0) {
					fenStr += String.fromCharCode('0'.charCodeAt() + emptyCount);
				}
				emptyCount = 0;
				fenStr += PceChar[piece];
			}
		}
		if (emptyCount != 0) {
			fenStr += String.fromCharCode('0'.charCodeAt() + emptyCount);
		}

		if (rank != RANKS.RANK_1) {
			fenStr += '/'
		} else {
			fenStr += ' ';
		}
	}

	fenStr += SideChar[brd_side] + ' ';
	if (brd_enPas == SQUARES.NO_SQ) {
		fenStr += '- '
	} else {
		fenStr += PrSq(brd_enPas) + ' ';
	}

	if (brd_castlePerm == 0) {
		fenStr += '- '
	} else {
		if (brd_castlePerm & CASTLEBIT.WKCA) fenStr += 'K';
		if (brd_castlePerm & CASTLEBIT.WQCA) fenStr += 'Q';
		if (brd_castlePerm & CASTLEBIT.BKCA) fenStr += 'k';
		if (brd_castlePerm & CASTLEBIT.BQCA) fenStr += 'q';
	}
	fenStr += ' ';
	fenStr += brd_fiftyMove;
	fenStr += ' ';
	var tempHalfMove = brd_hisPly;
	if (brd_side == COLOURS.BLACK) {
		tempHalfMove--;
	}
	fenStr += tempHalfMove / 2;

	return fenStr;
}

//#endregion

//#region helpers
function ParseFen(fen) {

	var rank = RANKS.RANK_8;
	var file = FILES.FILE_A;
	var piece = 0;
	var count = 0;
	var i = 0;
	var sq64 = 0;
	var sq120 = 0;
	var fenCnt = 0;

	ResetBoard();

	while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
		count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
			case 'r': piece = PIECES.bR; break;
			case 'n': piece = PIECES.bN; break;
			case 'b': piece = PIECES.bB; break;
			case 'k': piece = PIECES.bK; break;
			case 'q': piece = PIECES.bQ; break;
			case 'P': piece = PIECES.wP; break;
			case 'R': piece = PIECES.wR; break;
			case 'N': piece = PIECES.wN; break;
			case 'B': piece = PIECES.wB; break;
			case 'K': piece = PIECES.wK; break;
			case 'Q': piece = PIECES.wQ; break;

			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
				piece = PIECES.EMPTY;
				count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
				break;

			case '/':
			case ' ':
				rank--;
				file = FILES.FILE_A;
				fenCnt++;
				continue;

			default:
				printf("FEN error \n");
				return;
		}

		for (i = 0; i < count; i++) {
			sq64 = rank * 8 + file;
			sq120 = SQ120(sq64);
			if (piece != PIECES.EMPTY) {
				brd_pieces[sq120] = piece;
			}
			file++;
		}
		fenCnt++;
	}

	brd_side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK;
	fenCnt += 2;

	for (i = 0; i < 4; i++) {
		if (fen[fenCnt] == ' ') {
			break;
		}
		switch (fen[fenCnt]) {
			case 'K': brd_castlePerm |= CASTLEBIT.WKCA; break;
			case 'Q': brd_castlePerm |= CASTLEBIT.WQCA; break;
			case 'k': brd_castlePerm |= CASTLEBIT.BKCA; break;
			case 'q': brd_castlePerm |= CASTLEBIT.BQCA; break;
			default: break;
		}
		fenCnt++;
	}
	fenCnt++;

	if (fen[fenCnt] != '-') {
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
		brd_enPas = FR2SQ(file, rank);
	}

	brd_posKey = GeneratePosKey();
	UpdateListsMaterial();
}
function ParseMove(from, to) {

	GenerateMoves();

	var Move = NOMOVE;
	var PromPce = PIECES.EMPTY;
	var found = BOOL.FALSE;
	for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {
		Move = brd_moveList[index];
		if (FROMSQ(Move) == from && TOSQ(Move) == to) {
			PromPce = PROMOTED(Move);
			if (PromPce != PIECES.EMPTY) {
				if ((PromPce == PIECES.wQ && brd_side == COLOURS.WHITE) || (PromPce == PIECES.bQ && brd_side == COLOURS.BLACK)) {
					found = BOOL.TRUE;
					break;
				}
				continue;
			}
			found = BOOL.TRUE;
			break;
		}
	}

	if (found != BOOL.FALSE) {
		if (MakeMove(Move) == BOOL.FALSE) {
			return NOMOVE;
		}
		TakeMove();
		return Move;
	}

	return NOMOVE;
}
function PrintMoveList() {
	var index;
	var move;
	console.log("MoveList:");

	for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

		move = brd_moveList[index];
		console.log("Move:" + (index + 1) + " > " + PrMove(move));

	}
}
function PrSq(sq) {
	var file = FilesBrd[sq];
	var rank = RanksBrd[sq];

	var sqStr = String.fromCharCode('a'.charCodeAt() + file) + String.fromCharCode('1'.charCodeAt() + rank);
	return sqStr;
}
function PrMove(move) {

	var MvStr;

	var ff = FilesBrd[FROMSQ(move)];
	var rf = RanksBrd[FROMSQ(move)];
	var ft = FilesBrd[TOSQ(move)];
	var rt = RanksBrd[TOSQ(move)];

	MvStr = String.fromCharCode('a'.charCodeAt() + ff) + String.fromCharCode('1'.charCodeAt() + rf) +
		String.fromCharCode('a'.charCodeAt() + ft) + String.fromCharCode('1'.charCodeAt() + rt)

	var promoted = PROMOTED(move);

	if (promoted != PIECES.EMPTY) {
		var pchar = 'q';
		if (PieceKnight[promoted] == BOOL.TRUE) {
			pchar = 'n';
		} else if (PieceRookQueen[promoted] == BOOL.TRUE && PieceBishopQueen[promoted] == BOOL.FALSE) {
			pchar = 'r';
		} else if (PieceRookQueen[promoted] == BOOL.FALSE && PieceBishopQueen[promoted] == BOOL.TRUE) {
			pchar = 'b';
		}
		MvStr += pchar;
	}
	return MvStr;
}
function printGameLine() {

	var moveNum = 0;
	var gameLine = "";
	for (moveNum = 0; moveNum < brd_hisPly; ++moveNum) {
		gameLine += PrMove(brd_history[moveNum].move) + " ";
	}
	//console.log('Game Line: ' + gameLine);
	return $.trim(gameLine);

}
function PrintBoard() {
	return;
	var sq, file, rank, piece;

	console.log("\nGame Board:\n");

	for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line = ((rank + 1) + "  ");
		for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file, rank);
			piece = brd_pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}
		console.log(line);
	}

	console.log("");
	var line = "   ";
	for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + String.fromCharCode('a'.charCodeAt() + file) + ' ');
	}
	console.log(line);
	console.log("side:" + SideChar[brd_side]);
	console.log("enPas:" + brd_enPas);
	line = "";
	if (brd_castlePerm & CASTLEBIT.WKCA) line += 'K';
	if (brd_castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if (brd_castlePerm & CASTLEBIT.BKCA) line += 'k';
	if (brd_castlePerm & CASTLEBIT.BQCA) line += 'q';

	console.log("castle:" + line);
	console.log("key:" + brd_posKey.toString(16));
	//PrintPceLists();
}
function PrintPceLists() {
	var piece, pceNum;

	for (piece = PIECES.wP; piece <= PIECES.bK; ++piece) {
		for (pceNum = 0; pceNum < brd_pceNum[piece]; ++pceNum) {
			console.log("Piece " + PceChar[piece] + " on " + PrSq(brd_pList[PCEINDEX(piece, pceNum)]));
		}
	}

}
function PrintSqAttacked() {

	var sq, file, rank, piece;

	console.log("\nAttacked:\n");

	for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line = ((rank + 1) + "  ");
		for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file, rank);
			if (SqAttacked(sq, COLOURS.BLACK) == BOOL.TRUE) piece = "X";
			else piece = "-";
			line += (" " + piece + " ");
		}
		console.log(line);
	}

	console.log("");
}

//#endregion

//#region using book
function LineMatch(BookLine, gameline) {
	//console.log("Matching " + gameline + " with " + BookLine + " len = " + gameline.length);
	for (var len = 0; len < gameline.length; ++len) {
		//console.log("Char Matching " + gameline[len] + " with " + BookLine[len]);
		if (len >= BookLine.length) { /*console.log('no match');*/ return BOOL.FALSE; }
		if (gameline[len] != BookLine[len]) { /*console.log('no match'); */return BOOL.FALSE; }
	}
	//console.log('Match');
	return BOOL.TRUE;
}

function BookMove() {

	var gameLine = printGameLine();
	var bookMoves = [];

	var lengthOfLineHack = gameLine.length;

	if (gameLine.length == 0) lengthOfLineHack--;

	for (var bookLineNum = 0; bookLineNum < brd_bookLines.length; ++bookLineNum) {

		if (LineMatch(brd_bookLines[bookLineNum], gameLine) == BOOL.TRUE) {
			var move = brd_bookLines[bookLineNum].substr(lengthOfLineHack + 1, 4);
			//console.log("Parsing book move:" + move);
			if (move.length == 4) {
				var from = SqFromAlg(move.substr(0, 2));
				var to = SqFromAlg(move.substr(2, 2));
				//console.log('from:'+from+' to:'+to);
				varInternalMove = ParseMove(from, to);
				//console.log("varInternalMove:" + PrMove(varInternalMove));
				bookMoves.push(varInternalMove);
			}
		}

	}

	console.log("Total + " + bookMoves.length + " moves in array");

	if (bookMoves.length == 0) return NOMOVE;

	var num = Math.floor(Math.random() * bookMoves.length);

	return bookMoves[num];
}


function UpdateListsMaterial() {

	var piece, sq, index, colour;

	for (index = 0; index < BRD_SQ_NUM; ++index) {
		sq = index;
		piece = brd_pieces[index];
		if (piece != PIECES.OFFBOARD && piece != PIECES.EMPTY) {
			colour = PieceCol[piece];

			brd_material[colour] += PieceVal[piece];

			brd_pList[PCEINDEX(piece, brd_pceNum[piece])] = sq;
			brd_pceNum[piece]++;
		}
	}
}


//#endregion

//#region board functions
function CheckBoard() {

	var t_pceNum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [0, 0];

	var sq64, t_piece, t_pce_num, sq120, colour, pcount;

	// check piece lists
	for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		for (t_pce_num = 0; t_pce_num < brd_pceNum[t_piece]; ++t_pce_num) {
			sq120 = brd_pList[PCEINDEX(t_piece, t_pce_num)];
			if (brd_pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return BOOL.FALSE;
			}
		}
	}

	// check piece count and other counters	
	for (sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = SQ120(sq64);
		t_piece = brd_pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[PieceCol[t_piece]] += PieceVal[t_piece];
	}

	for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		if (t_pceNum[t_piece] != brd_pceNum[t_piece]) {
			console.log('Error t_pceNum');
			return BOOL.FALSE;
		}
	}

	if (t_material[COLOURS.WHITE] != brd_material[COLOURS.WHITE] || t_material[COLOURS.BLACK] != brd_material[COLOURS.BLACK]) {
		console.log('Error t_material');
		return BOOL.FALSE;
	}
	if (brd_side != COLOURS.WHITE && brd_side != COLOURS.BLACK) {
		console.log('Error brd_side');
		return BOOL.FALSE;
	}
	if (GeneratePosKey() != brd_posKey) {
		console.log('Error brd_posKey');
		return BOOL.FALSE;
	}


	return BOOL.TRUE;
}
function GeneratePosKey() {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.EMPTY;

	// pieces
	for (sq = 0; sq < BRD_SQ_NUM; ++sq) {
		piece = brd_pieces[sq];
		if (piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
			finalKey ^= PieceKeys[(piece * 120) + sq];
		}
	}

	if (brd_side == COLOURS.WHITE) {
		finalKey ^= SideKey;
	}

	if (brd_enPas != SQUARES.NO_SQ) {
		finalKey ^= PieceKeys[brd_enPas];
	}

	finalKey ^= CastleKeys[brd_castlePerm];

	return finalKey;
}
function ResetBoard() {

	var index = 0;

	for (index = 0; index < BRD_SQ_NUM; ++index) {
		brd_pieces[index] = SQUARES.OFFBOARD;
	}

	for (index = 0; index < 64; ++index) {
		brd_pieces[SQ120(index)] = PIECES.EMPTY;
	}

	for (index = 0; index < 14 * 120; ++index) {
		brd_pList[index] = PIECES.EMPTY;
	}

	for (index = 0; index < 2; ++index) {
		brd_material[index] = 0;
	}

	for (index = 0; index < 13; ++index) {
		brd_pceNum[index] = 0;
	}

	brd_side = COLOURS.BOTH;
	brd_enPas = SQUARES.NO_SQ;
	brd_fiftyMove = 0;
	brd_ply = 0;
	brd_hisPly = 0;
	brd_castlePerm = 0;
	brd_posKey = 0;
	brd_moveListStart[brd_ply] = 0;

}
function SqAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;

	if (side == COLOURS.WHITE) {
		if (brd_pieces[sq - 11] == PIECES.wP || brd_pieces[sq - 9] == PIECES.wP) {
			return BOOL.TRUE;
		}
	} else {
		if (brd_pieces[sq + 11] == PIECES.bP || brd_pieces[sq + 9] == PIECES.bP) {
			return BOOL.TRUE;
		}
	}

	for (index = 0; index < 8; ++index) {
		pce = brd_pieces[sq + KnDir[index]];
		if (pce != SQUARES.OFFBOARD && PieceKnight[pce] == BOOL.TRUE && PieceCol[pce] == side) {
			return BOOL.TRUE;
		}
	}

	for (index = 0; index < 4; ++index) {
		dir = RkDir[index];
		t_sq = sq + dir;
		pce = brd_pieces[t_sq];
		while (pce != SQUARES.OFFBOARD) {
			if (pce != PIECES.EMPTY) {
				if (PieceRookQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = brd_pieces[t_sq];
		}
	}

	for (index = 0; index < 4; ++index) {
		dir = BiDir[index];
		t_sq = sq + dir;
		pce = brd_pieces[t_sq];
		while (pce != SQUARES.OFFBOARD) {
			if (pce != PIECES.EMPTY) {
				if (PieceBishopQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = brd_pieces[t_sq];
		}
	}

	for (index = 0; index < 8; ++index) {
		pce = brd_pieces[sq + KiDir[index]];
		if (pce != SQUARES.OFFBOARD && PieceKing[pce] == BOOL.TRUE && PieceCol[pce] == side) {
			return BOOL.TRUE;
		}
	}

	return BOOL.FALSE;
}
//#endregion

//#region move
function InitMvvLva() {
	var Attacker;
	var Victim;
	for (Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for (Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = VictimScore[Victim] + 6 - (VictimScore[Attacker] / 100);
		}
	}
}
function MOVE(from, to, captured, promoted, flag) {	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);}
function MoveExists(move) {

	GenerateMoves();

	var index;
	var moveFound = NOMOVE;
	for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

		moveFound = brd_moveList[index];
		if (MakeMove(moveFound) == BOOL.FALSE) {
			continue;
		}
		TakeMove();
		if (move == moveFound) {
			return BOOL.TRUE;
		}
	}
	return BOOL.FALSE;
}
function AddCaptureMove(move) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
	brd_moveScores[brd_moveListStart[brd_ply + 1]++] = MvvLvaScores[CAPTURED(move) * 14 + brd_pieces[FROMSQ(move)]] + 1000000;
}
function AddQuietMove(move) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = move;

	if (brd_searchKillers[brd_ply] == move) {
		brd_moveScores[brd_moveListStart[brd_ply + 1]] = 900000;
	} else if (brd_searchKillers[MAXDEPTH + brd_ply] == move) {
		brd_moveScores[brd_moveListStart[brd_ply + 1]] = 800000;
	} else {
		brd_moveScores[brd_moveListStart[brd_ply + 1]] = brd_searchHistory[brd_pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
	}
	brd_moveListStart[brd_ply + 1]++;
}
function AddEnPassantMove(move) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
	brd_moveScores[brd_moveListStart[brd_ply + 1]++] = 105 + 1000000;
}
function AddWhitePawnCaptureMove(from, to, cap) {
	if (RanksBrd[from] == RANKS.RANK_7) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}
function AddWhitePawnQuietMove(from, to) {
	if (RanksBrd[from] == RANKS.RANK_7) {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
	} else {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}
function AddBlackPawnCaptureMove(from, to, cap) {
	if (RanksBrd[from] == RANKS.RANK_2) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}
function AddBlackPawnQuietMove(from, to) {
	if (RanksBrd[from] == RANKS.RANK_2) {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
	} else {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}
function GenerateMoves() {
	brd_moveListStart[brd_ply + 1] = brd_moveListStart[brd_ply];
	var pceType;
	var pceNum;
	var pceIndex;
	var pce;
	var sq;
	var tsq;
	var index;
	if (brd_side == COLOURS.WHITE) {
		pceType = PIECES.wP;
		for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pceType, pceNum)];
			if (brd_pieces[sq + 10] == PIECES.EMPTY) {
				AddWhitePawnQuietMove(sq, sq + 10);
				if (RanksBrd[sq] == RANKS.RANK_2 && brd_pieces[sq + 20] == PIECES.EMPTY) {
					AddQuietMove(MOVE(sq, (sq + 20), PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
				}
			}

			if (SQOFFBOARD(sq + 9) == BOOL.FALSE && PieceCol[brd_pieces[sq + 9]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, brd_pieces[sq + 9]);
			}
			if (SQOFFBOARD(sq + 11) == BOOL.FALSE && PieceCol[brd_pieces[sq + 11]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, brd_pieces[sq + 11]);
			}

			if (brd_enPas != SQUARES.NO_SQ) {
				if (sq + 9 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
				if (sq + 11 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}
		if (brd_castlePerm & CASTLEBIT.WKCA) {
			if (brd_pieces[SQUARES.F1] == PIECES.EMPTY && brd_pieces[SQUARES.G1] == PIECES.EMPTY) {
				if (SqAttacked(SQUARES.E1, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.F1, COLOURS.BLACK) == BOOL.FALSE) {
					AddQuietMove(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

		if (brd_castlePerm & CASTLEBIT.WQCA) {
			if (brd_pieces[SQUARES.D1] == PIECES.EMPTY && brd_pieces[SQUARES.C1] == PIECES.EMPTY && brd_pieces[SQUARES.B1] == PIECES.EMPTY) {
				if (SqAttacked(SQUARES.E1, COLOURS.BLACK) == BOOL.FALSE && SqAttacked(SQUARES.D1, COLOURS.BLACK) == BOOL.FALSE) {
					AddQuietMove(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

		pceType = PIECES.wN; // HACK to set for loop other pieces

	} else {
		pceType = PIECES.bP;
		for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pceType, pceNum)];

			if (brd_pieces[sq - 10] == PIECES.EMPTY) {
				AddBlackPawnQuietMove(sq, sq - 10);
				if (RanksBrd[sq] == RANKS.RANK_7 && brd_pieces[sq - 20] == PIECES.EMPTY) {
					AddQuietMove(MOVE(sq, (sq - 20), PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
				}
			}

			if (SQOFFBOARD(sq - 9) == BOOL.FALSE && PieceCol[brd_pieces[sq - 9]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, brd_pieces[sq - 9]);
			}

			if (SQOFFBOARD(sq - 11) == BOOL.FALSE && PieceCol[brd_pieces[sq - 11]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, brd_pieces[sq - 11]);
			}
			if (brd_enPas != SQUARES.NO_SQ) {
				if (sq - 9 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
				if (sq - 11 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}
		if (brd_castlePerm & CASTLEBIT.BKCA) {
			if (brd_pieces[SQUARES.F8] == PIECES.EMPTY && brd_pieces[SQUARES.G8] == PIECES.EMPTY) {
				if (SqAttacked(SQUARES.E8, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.F8, COLOURS.WHITE) == BOOL.FALSE) {
					AddQuietMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

		if (brd_castlePerm & CASTLEBIT.BQCA) {
			if (brd_pieces[SQUARES.D8] == PIECES.EMPTY && brd_pieces[SQUARES.C8] == PIECES.EMPTY && brd_pieces[SQUARES.B8] == PIECES.EMPTY) {
				if (SqAttacked(SQUARES.E8, COLOURS.WHITE) == BOOL.FALSE && SqAttacked(SQUARES.D8, COLOURS.WHITE) == BOOL.FALSE) {
					AddQuietMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
				}
			}
		}

		pceType = PIECES.bN; // HACK to set for loop other pieces
	}


	pceIndex = LoopSlideIndex[brd_side];
	pce = LoopSlidePce[pceIndex++];
	while (pce != 0) {

		for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < DirNum[pce]; ++index) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				while (SQOFFBOARD(t_sq) == BOOL.FALSE) {

					if (brd_pieces[t_sq] != PIECES.EMPTY) {
						if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
							AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
						}
						break;
					}
					AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
					t_sq += dir;
				}
			}
		}
		pce = LoopSlidePce[pceIndex++];
	}

	pceIndex = LoopNonSlideIndex[brd_side];
	pce = LoopNonSlidePce[pceIndex++];

	while (pce != 0) {

		for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < DirNum[pce]; ++index) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				if (SQOFFBOARD(t_sq) == BOOL.TRUE) {
					continue;
				}

				if (brd_pieces[t_sq] != PIECES.EMPTY) {
					if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
						AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
					}
					continue;
				}
				AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
			}
		}
		pce = LoopNonSlidePce[pceIndex++];
	}

}
function GenerateCaptures() {
	brd_moveListStart[brd_ply + 1] = brd_moveListStart[brd_ply];
	var pceType;
	var pceNum;
	var pceIndex;
	var pce;
	var sq;
	var tsq;
	var index;
	if (brd_side == COLOURS.WHITE) {
		pceType = PIECES.wP;
		for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pceType, pceNum)];

			if (SQOFFBOARD(sq + 9) == BOOL.FALSE && PieceCol[brd_pieces[sq + 9]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, brd_pieces[sq + 9]);
			}
			if (SQOFFBOARD(sq + 11) == BOOL.FALSE && PieceCol[brd_pieces[sq + 11]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, brd_pieces[sq + 11]);
			}

			if (brd_enPas != SQUARES.NO_SQ) {
				if (sq + 9 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
				if (sq + 11 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}

		pceType = PIECES.wN; // HACK to set for loop other pieces

	} else {
		pceType = PIECES.bP;
		for (pceNum = 0; pceNum < brd_pceNum[pceType]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pceType, pceNum)];

			if (SQOFFBOARD(sq - 9) == BOOL.FALSE && PieceCol[brd_pieces[sq - 9]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, brd_pieces[sq - 9]);
			}

			if (SQOFFBOARD(sq - 11) == BOOL.FALSE && PieceCol[brd_pieces[sq - 11]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, brd_pieces[sq - 11]);
			}
			if (brd_enPas != SQUARES.NO_SQ) {
				if (sq - 9 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
				if (sq - 11 == brd_enPas) {
					AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
				}
			}
		}

		pceType = PIECES.bN; // HACK to set for loop other pieces
	}


	pceIndex = LoopSlideIndex[brd_side];
	pce = LoopSlidePce[pceIndex++];
	while (pce != 0) {

		for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < DirNum[pce]; ++index) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				while (SQOFFBOARD(t_sq) == BOOL.FALSE) {

					if (brd_pieces[t_sq] != PIECES.EMPTY) {
						if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
							AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
						}
						break;
					}
					t_sq += dir;
				}
			}
		}
		pce = LoopSlidePce[pceIndex++];
	}

	pceIndex = LoopNonSlideIndex[brd_side];
	pce = LoopNonSlidePce[pceIndex++];

	while (pce != 0) {

		for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
			sq = brd_pList[PCEINDEX(pce, pceNum)];

			for (index = 0; index < DirNum[pce]; ++index) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;

				if (SQOFFBOARD(t_sq) == BOOL.TRUE) {
					continue;
				}

				if (brd_pieces[t_sq] != PIECES.EMPTY) {
					if (PieceCol[brd_pieces[t_sq]] == brd_side ^ 1) {
						AddCaptureMove(MOVE(sq, t_sq, brd_pieces[t_sq], PIECES.EMPTY, 0));
					}
					continue;
				}
			}
		}
		pce = LoopNonSlidePce[pceIndex++];
	}

}
function ClearPiece(sq) {

	var pce = brd_pieces[sq];
	var col = PieceCol[pce];
	var index = 0;
	var t_pceNum = -1;

	HASH_PCE(pce, sq);

	brd_pieces[sq] = PIECES.EMPTY;
	brd_material[col] -= PieceVal[pce];

	for (index = 0; index < brd_pceNum[pce]; ++index) {
		if (brd_pList[PCEINDEX(pce, index)] == sq) {
			t_pceNum = index;
			break;
		}
	}

	brd_pceNum[pce]--;
	brd_pList[PCEINDEX(pce, t_pceNum)] = brd_pList[PCEINDEX(pce, brd_pceNum[pce])];

}
function AddPiece(sq, pce) {

	var col = PieceCol[pce];

	HASH_PCE(pce, sq);

	brd_pieces[sq] = pce;
	brd_material[col] += PieceVal[pce];
	brd_pList[PCEINDEX(pce, brd_pceNum[pce])] = sq;
	brd_pceNum[pce]++;
}
function MovePiece(from, to) {

	var index = 0;
	var pce = brd_pieces[from];
	var col = PieceCol[pce];

	HASH_PCE(pce, from);
	brd_pieces[from] = PIECES.EMPTY;

	HASH_PCE(pce, to);
	brd_pieces[to] = pce;

	for (index = 0; index < brd_pceNum[pce]; ++index) {
		if (brd_pList[PCEINDEX(pce, index)] == from) {
			brd_pList[PCEINDEX(pce, index)] = to;
			break;
		}
	}

}
function MakeMove(move) {

	var from = FROMSQ(move);
	var to = TOSQ(move);
	var side = brd_side;

	brd_history[brd_hisPly].posKey = brd_posKey;

	if ((move & MFLAGEP) != 0) {
		if (side == COLOURS.WHITE) {
			ClearPiece(to - 10);
		} else {
			ClearPiece(to + 10);
		}
	} else if ((move & MFLAGCA) != 0) {
		switch (to) {
			case SQUARES.C1:
				MovePiece(SQUARES.A1, SQUARES.D1);
				break;
			case SQUARES.C8:
				MovePiece(SQUARES.A8, SQUARES.D8);
				break;
			case SQUARES.G1:
				MovePiece(SQUARES.H1, SQUARES.F1);
				break;
			case SQUARES.G8:
				MovePiece(SQUARES.H8, SQUARES.F8);
				break;
			default: break;
		}
	}

	if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();

	brd_history[brd_hisPly].move = move;
	brd_history[brd_hisPly].fiftyMove = brd_fiftyMove;
	brd_history[brd_hisPly].enPas = brd_enPas;
	brd_history[brd_hisPly].castlePerm = brd_castlePerm;

	brd_castlePerm &= CastlePerm[from];
	brd_castlePerm &= CastlePerm[to];
	brd_enPas = SQUARES.NO_SQ;

	HASH_CA();

	var captured = CAPTURED(move);
	brd_fiftyMove++;

	if (captured != PIECES.EMPTY) {
		ClearPiece(to);
		brd_fiftyMove = 0;
	}

	brd_hisPly++;
	brd_ply++;

	if (PiecePawn[brd_pieces[from]] == BOOL.TRUE) {
		brd_fiftyMove = 0;
		if ((move & MFLAGPS) != 0) {
			if (side == COLOURS.WHITE) {
				brd_enPas = from + 10;
			} else {
				brd_enPas = from - 10;
			}
			HASH_EP();
		}
	}

	MovePiece(from, to);

	var prPce = PROMOTED(move);
	if (prPce != PIECES.EMPTY) {
		ClearPiece(to);
		AddPiece(to, prPce);
	}

	brd_side ^= 1;
	HASH_SIDE();


	if (SqAttacked(brd_pList[PCEINDEX(Kings[side], 0)], brd_side)) {
		TakeMove();
		return BOOL.FALSE;
	}

	return BOOL.TRUE;
}
function TakeMove() {

	brd_hisPly--;
	brd_ply--;

	var move = brd_history[brd_hisPly].move;
	var from = FROMSQ(move);
	var to = TOSQ(move);

	if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();

	brd_castlePerm = brd_history[brd_hisPly].castlePerm;
	brd_fiftyMove = brd_history[brd_hisPly].fiftyMove;
	brd_enPas = brd_history[brd_hisPly].enPas;

	if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();

	brd_side ^= 1;
	HASH_SIDE();

	if ((MFLAGEP & move) != 0) {
		if (brd_side == COLOURS.WHITE) {
			AddPiece(to - 10, PIECES.bP);
		} else {
			AddPiece(to + 10, PIECES.wP);
		}
	} else if ((MFLAGCA & move) != 0) {
		switch (to) {
			case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
			case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
			case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
			case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
			default: break;
		}
	}

	MovePiece(to, from);

	var captured = CAPTURED(move);
	if (captured != PIECES.EMPTY) {
		AddPiece(to, captured);
	}

	if (PROMOTED(move) != PIECES.EMPTY) {
		ClearPiece(from);
		AddPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
	}
}
//#endregion

//#region perft?
var perft_leafNodes;

function Perft(depth) {
	MakeNullMove();
	if (brd_posKey != GeneratePosKey()) {
		console.log(printGameLine());
		PrintBoard();
		srch_stop = BOOL.TRUE;
		console.log('Hash Error After Make');
	}

	TakeNullMove();
	if (brd_posKey != GeneratePosKey()) {
		console.log(printGameLine());
		PrintBoard();
		srch_stop = BOOL.TRUE;
		console.log('Hash Error After Take');
	}

	if (depth == 0) {
		perft_leafNodes++;
		return;
	}

	GenerateMoves();

	var index;
	var move;
	for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

		move = brd_moveList[index];
		if (MakeMove(move) == BOOL.FALSE) {
			continue;
		}
		Perft(depth - 1);
		TakeMove();
	}

	return;
}

function PerftTest(depth) {

	PrintBoard();
	console.log("Starting Test To Depth:" + depth);
	perft_leafNodes = 0;
	GenerateMoves();
	var index;
	var move;
	var moveNum = 0;
	for (index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {

		move = brd_moveList[index];
		if (MakeMove(move) == BOOL.FALSE) {
			continue;
		}
		moveNum++;
		var cumnodes = perft_leafNodes;
		Perft(depth - 1);
		TakeMove();
		var oldnodes = perft_leafNodes - cumnodes;
		console.log("move:" + moveNum + " " + PrMove(move) + " " + oldnodes);
	}

	console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");
	$("#FenOutput").text("Test Complete : " + perft_leafNodes + " leaf nodes visited");

	return;
}
//#endregion

//#region rules, eval, search
var RookOpenFile = 10;
var RookSemiOpenFile = 5;
var QueenOpenFile = 5;
var QueenSemiOpenFile = 3;
var BishopPair = 30;

var PawnRanksWhite = new Array(10);
var PawnRanksBlack = new Array(10);

var PawnIsolated = -10;
var PawnPassed = [0, 5, 10, 20, 35, 60, 100, 200];

var PawnTable = [
	0, 0, 0, 0, 0, 0, 0, 0,
	10, 10, 0, -10, -10, 0, 10, 10,
	5, 0, 0, 5, 5, 0, 0, 5,
	0, 0, 10, 20, 20, 10, 0, 0,
	5, 5, 5, 10, 10, 5, 5, 5,
	10, 10, 10, 20, 20, 10, 10, 10,
	20, 20, 20, 30, 30, 20, 20, 20,
	0, 0, 0, 0, 0, 0, 0, 0
];

var KnightTable = [
	0, -10, 0, 0, 0, 0, -10, 0,
	0, 0, 0, 5, 5, 0, 0, 0,
	0, 0, 10, 10, 10, 10, 0, 0,
	0, 0, 10, 20, 20, 10, 5, 0,
	5, 10, 15, 20, 20, 15, 10, 5,
	5, 10, 10, 20, 20, 10, 10, 5,
	0, 0, 5, 10, 10, 5, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0
];

var BishopTable = [
	0, 0, -10, 0, 0, -10, 0, 0,
	0, 0, 0, 10, 10, 0, 0, 0,
	0, 0, 10, 15, 15, 10, 0, 0,
	0, 10, 15, 20, 20, 15, 10, 0,
	0, 10, 15, 20, 20, 15, 10, 0,
	0, 0, 10, 15, 15, 10, 0, 0,
	0, 0, 0, 10, 10, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0
];

var RookTable = [
	0, 0, 5, 10, 10, 5, 0, 0,
	0, 0, 5, 10, 10, 5, 0, 0,
	0, 0, 5, 10, 10, 5, 0, 0,
	0, 0, 5, 10, 10, 5, 0, 0,
	0, 0, 5, 10, 10, 5, 0, 0,
	0, 0, 5, 10, 10, 5, 0, 0,
	25, 25, 25, 25, 25, 25, 25, 25,
	0, 0, 5, 10, 10, 5, 0, 0
];

var KingE = [
	-50, -10, 0, 0, 0, 0, -10, -50,
	-10, 0, 10, 10, 10, 10, 0, -10,
	0, 10, 20, 20, 20, 20, 10, 0,
	0, 10, 20, 40, 40, 20, 10, 0,
	0, 10, 20, 40, 40, 20, 10, 0,
	0, 10, 20, 20, 20, 20, 10, 0,
	-10, 0, 10, 10, 10, 10, 0, -10,
	-50, -10, 0, 0, 0, 0, -10, -50
];

var KingO = [
	0, 5, 5, -10, -10, 0, 10, 5,
	-30, -30, -30, -30, -30, -30, -30, -30,
	-50, -50, -50, -50, -50, -50, -50, -50,
	-70, -70, -70, -70, -70, -70, -70, -70,
	-70, -70, -70, -70, -70, -70, -70, -70,
	-70, -70, -70, -70, -70, -70, -70, -70,
	-70, -70, -70, -70, -70, -70, -70, -70,
	-70, -70, -70, -70, -70, -70, -70, -70
];

function MaterialDraw() {
	if (0 == brd_pceNum[PIECES.wR] && 0 == brd_pceNum[PIECES.bR] && 0 == brd_pceNum[PIECES.wQ] && 0 == brd_pceNum[PIECES.bQ]) {
		if (0 == brd_pceNum[PIECES.bB] && 0 == brd_pceNum[PIECES.wB]) {
			if (brd_pceNum[PIECES.wN] < 3 && brd_pceNum[PIECES.bN] < 3) { return BOOL.TRUE; }
		} else if (0 == brd_pceNum[PIECES.wN] && 0 == brd_pceNum[PIECES.bN]) {
			if (Math.abs(brd_pceNum[PIECES.wB] - brd_pceNum[PIECES.bB]) < 2) { return BOOL.TRUE; }
		} else if ((brd_pceNum[PIECES.wN] < 3 && 0 == brd_pceNum[PIECES.wB]) || (brd_pceNum[PIECES.wB] == 1 && 0 == brd_pceNum[PIECES.wN])) {
			if ((brd_pceNum[PIECES.bN] < 3 && 0 == brd_pceNum[PIECES.bB]) || (brd_pceNum[PIECES.bB] == 1 && 0 == brd_pceNum[PIECES.bN])) { return BOOL.TRUE; }
		}
	} else if (0 == brd_pceNum[PIECES.wQ] && 0 == brd_pceNum[PIECES.bQ]) {
		if (brd_pceNum[PIECES.wR] == 1 && brd_pceNum[PIECES.bR] == 1) {
			if ((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB]) < 2 && (brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB]) < 2) { return BOOL.TRUE; }
		} else if (brd_pceNum[PIECES.wR] == 1 && 0 == brd_pceNum[PIECES.bR]) {
			if ((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB] == 0) && (((brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB]) == 1) || ((brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB]) == 2))) { return BOOL.TRUE; }
		} else if (brd_pceNum[PIECES.bR] == 1 && 0 == brd_pceNum[PIECES.wR]) {
			if ((brd_pceNum[PIECES.bN] + brd_pceNum[PIECES.bB] == 0) && (((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB]) == 1) || ((brd_pceNum[PIECES.wN] + brd_pceNum[PIECES.wB]) == 2))) { return BOOL.TRUE; }
		}
	}
	return BOOL.FALSE;
}

var ENDGAME_MAT = 1 * PieceVal[PIECES.wR] + 2 * PieceVal[PIECES.wN] + 2 * PieceVal[PIECES.wP] + PieceVal[PIECES.wK];

function PawnsInit() {
	var index = 0;

	for (index = 0; index < 10; ++index) {
		PawnRanksWhite[index] = RANKS.RANK_8;
		PawnRanksBlack[index] = RANKS.RANK_1;
	}

	pce = PIECES.wP;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		if (RanksBrd[sq] < PawnRanksWhite[FilesBrd[sq] + 1]) {
			PawnRanksWhite[FilesBrd[sq] + 1] = RanksBrd[sq];
		}
	}

	pce = PIECES.bP;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		if (RanksBrd[sq] > PawnRanksBlack[FilesBrd[sq] + 1]) {
			PawnRanksBlack[FilesBrd[sq] + 1] = RanksBrd[sq];
		}
	}
}

function EvalPosition() {

	var pce;
	var pceNum;
	var sq;
	var score = brd_material[COLOURS.WHITE] - brd_material[COLOURS.BLACK];
	var file;
	var rank;
	if (0 == brd_pceNum[PIECES.wP] && 0 == brd_pceNum[PIECES.bP] && MaterialDraw() == BOOL.TRUE) {
		return 0;
	}

	PawnsInit();

	pce = PIECES.wP;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += PawnTable[SQ64(sq)];
		file = FilesBrd[sq] + 1;
		rank = RanksBrd[sq];
		if (PawnRanksWhite[file - 1] == RANKS.RANK_8 && PawnRanksWhite[file + 1] == RANKS.RANK_8) {
			score += PawnIsolated;
		}

		if (PawnRanksBlack[file - 1] <= rank && PawnRanksBlack[file] <= rank && PawnRanksBlack[file + 1] <= rank) {
			score += PawnPassed[rank];
		}
	}

	pce = PIECES.bP;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= PawnTable[MIRROR64(SQ64(sq))];
		file = FilesBrd[sq] + 1;
		rank = RanksBrd[sq];
		if (PawnRanksBlack[file - 1] == RANKS.RANK_1 && PawnRanksBlack[file + 1] == RANKS.RANK_1) {
			score -= PawnIsolated;
		}

		if (PawnRanksWhite[file - 1] >= rank && PawnRanksWhite[file] >= rank && PawnRanksWhite[file + 1] >= rank) {
			score -= PawnPassed[7 - rank];
		}
	}

	pce = PIECES.wN;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += KnightTable[SQ64(sq)];
	}

	pce = PIECES.bN;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= KnightTable[MIRROR64(SQ64(sq))];
	}

	pce = PIECES.wB;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += BishopTable[SQ64(sq)];
	}

	pce = PIECES.bB;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= BishopTable[MIRROR64(SQ64(sq))];
	}

	pce = PIECES.wR;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += RookTable[SQ64(sq)];
		file = FilesBrd[sq] + 1;
		if (PawnRanksWhite[file] == RANKS.RANK_8) {
			if (PawnRanksBlack[file] == RANKS.RANK_1) {
				score += RookOpenFile;
			} else {
				score += RookSemiOpenFile;
			}
		}
	}

	pce = PIECES.bR;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= RookTable[MIRROR64(SQ64(sq))];
		file = FilesBrd[sq] + 1;
		if (PawnRanksBlack[file] == RANKS.RANK_1) {
			if (PawnRanksWhite[file] == RANKS.RANK_8) {
				score -= RookOpenFile;
			} else {
				score -= RookSemiOpenFile;
			}
		}
	}

	pce = PIECES.wQ;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += RookTable[SQ64(sq)];
		file = FilesBrd[sq] + 1;
		if (PawnRanksWhite[file] == RANKS.RANK_8) {
			if (PawnRanksBlack[file] == RANKS.RANK_1) {
				score += QueenOpenFile;
			} else {
				score += QueenSemiOpenFile;
			}
		}
	}

	pce = PIECES.bQ;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= RookTable[MIRROR64(SQ64(sq))];
		file = FilesBrd[sq] + 1;
		if (PawnRanksBlack[file] == RANKS.RANK_1) {
			if (PawnRanksWhite[file] == RANKS.RANK_8) {
				score -= QueenOpenFile;
			} else {
				score -= QueenSemiOpenFile;
			}
		}
	}

	pce = PIECES.wK;
	sq = brd_pList[PCEINDEX(pce, 0)];

	if ((brd_material[COLOURS.BLACK] <= ENDGAME_MAT)) {
		score += KingE[SQ64(sq)];
	} else {
		score += KingO[SQ64(sq)];
	}

	pce = PIECES.bK;
	sq = brd_pList[PCEINDEX(pce, 0)];

	if ((brd_material[COLOURS.WHITE] <= ENDGAME_MAT)) {
		score -= KingE[MIRROR64(SQ64(sq))];
	} else {
		score -= KingO[MIRROR64(SQ64(sq))];
	}

	if (brd_pceNum[PIECES.wB] >= 2) score += BishopPair;
	if (brd_pceNum[PIECES.bB] >= 2) score -= BishopPair;

	if (brd_side == COLOURS.WHITE) {
		return score;
	} else {
		return -score;
	}
}

function GetPvLine(depth) {
	;

	//console.log("GetPvLine");

	var move = ProbePvTable();
	var count = 0;

	while (move != NOMOVE && count < depth) {

		if (MoveExists(move)) {
			MakeMove(move);
			brd_PvArray[count++] = move;
			//console.log("GetPvLine added " + PrMove(move));	
		} else {
			break;
		}
		move = ProbePvTable();
	}

	while (brd_ply > 0) {
		TakeMove();
	}
	return count;

}

function StorePvMove(move) {

	var index = brd_posKey % PVENTRIES;

	brd_PvTable[index].move = move;
	brd_PvTable[index].posKey = brd_posKey;
}

function ProbePvTable() {

	var index = brd_posKey % PVENTRIES;

	if (brd_PvTable[index].posKey == brd_posKey) {
		return brd_PvTable[index].move;
	}

	return NOMOVE;
}
var srch_nodes;
var srch_fh;
var srch_fhf;
var srch_depth;
var srch_time;
var srch_start;
var srch_stop;
var srch_best;
var srch_thinking;

function CheckUp() {
	if (($.now() - srch_start) > srch_time) srch_stop = BOOL.TRUE;
}

function PickNextMove(moveNum) {

	var index = 0;
	var bestScore = 0;
	var bestNum = moveNum;

	for (index = moveNum; index < brd_moveListStart[brd_ply + 1]; ++index) {
		if (brd_moveScores[index] > bestScore) {
			bestScore = brd_moveScores[index];
			bestNum = index;
		}
	}

	temp = brd_moveList[moveNum];
	brd_moveList[moveNum] = brd_moveList[bestNum];
	brd_moveList[bestNum] = temp;

	temp = brd_moveScores[moveNum];
	brd_moveScores[moveNum] = brd_moveScores[bestNum];
	brd_moveScores[bestNum] = temp;
}

function IsRepetition() {

	var index = 0;

	for (index = brd_hisPly - brd_fiftyMove; index < brd_hisPly - 1; ++index) {
		if (brd_posKey == brd_history[index].posKey) {
			return BOOL.TRUE;
		}
	}
	return BOOL.FALSE;
}

function ClearPvTable() {

	for (index = 0; index < PVENTRIES; index++) {
		brd_PvTable[index].move = NOMOVE;
		brd_PvTable[index].posKey = 0;

	}
}

function ClearForSearch() {

	var index = 0;
	var index2 = 0;

	for (index = 0; index < 14 * BRD_SQ_NUM; ++index) {
		brd_searchHistory[index] = 0;
	}

	for (index = 0; index < 3 * MAXDEPTH; ++index) {
		brd_searchKillers[index] = 0;
	}

	ClearPvTable();

	brd_ply = 0;

	srch_nodes = 0;
	srch_fh = 0;
	srch_fhf = 0;
	srch_start = $.now();
	srch_stop = BOOL.FALSE;
}


function Quiescence(alpha, beta) {

	if ((srch_nodes & 2047) == 0) CheckUp();

	srch_nodes++;

	if (IsRepetition() || brd_fiftyMove >= 100) {
		return 0;
	}

	if (brd_ply > MAXDEPTH - 1) {
		return EvalPosition();
	}

	var Score = EvalPosition();

	if (Score >= beta) {
		return beta;
	}

	if (Score > alpha) {
		alpha = Score;
	}

	GenerateCaptures();

	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	Score = -INFINITE;
	var PvMove = ProbePvTable();

	if (PvMove != NOMOVE) {
		for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
			if (brd_moveList[MoveNum] == PvMove) {
				brd_moveScores[MoveNum].score = 2000000;
				break;
			}
		}
	}

	for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {

		PickNextMove(MoveNum);

		if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
			continue;
		}

		Legal++;
		Score = -Quiescence(-beta, -alpha);
		TakeMove();
		if (srch_stop == BOOL.TRUE) return 0;
		if (Score > alpha) {
			if (Score >= beta) {
				if (Legal == 1) {
					srch_fhf++;
				}
				srch_fh++;

				return beta;
			}
			alpha = Score;
			BestMove = brd_moveList[MoveNum];
		}
	}

	if (alpha != OldAlpha) {
		StorePvMove(BestMove);
	}

	return alpha;
}

function AlphaBeta(alpha, beta, depth, DoNull) {


	if (depth <= 0) {
		return Quiescence(alpha, beta);
		// return EvalPosition();
	}
	if ((srch_nodes & 2047) == 0) CheckUp();

	srch_nodes++;

	if ((IsRepetition() || brd_fiftyMove >= 100) && brd_ply != 0) {
		return 0;
	}

	if (brd_ply > MAXDEPTH - 1) {
		return EvalPosition(pos);
	}

	var InCheck = SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1);

	if (InCheck == BOOL.TRUE) {
		depth++;
	}

	var Score = -INFINITE;

	if (DoNull == BOOL.TRUE && BOOL.FALSE == InCheck &&
		brd_ply != 0 && (brd_material[brd_side] > 50200) && depth >= 4) {


		var ePStore = brd_enPas;
		if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
		brd_side ^= 1;
		HASH_SIDE();
		brd_enPas = SQUARES.NO_SQ;

		Score = -AlphaBeta(-beta, -beta + 1, depth - 4, BOOL.FALSE);

		brd_side ^= 1;
		HASH_SIDE();
		brd_enPas = ePStore;
		if (brd_enPas != SQUARES.NO_SQ) HASH_EP();

		if (srch_stop == BOOL.TRUE) return 0;
		if (Score >= beta) {
			return beta;
		}
	}

	GenerateMoves();

	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	Score = -INFINITE;
	var PvMove = ProbePvTable();

	if (PvMove != NOMOVE) {
		for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
			if (brd_moveList[MoveNum] == PvMove) {
				brd_moveScores[MoveNum].score = 2000000;
				break;
			}
		}
	}

	for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {

		PickNextMove(MoveNum);

		if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
			continue;
		}

		Legal++;
		Score = -AlphaBeta(-beta, -alpha, depth - 1, BOOL.TRUE);
		TakeMove();
		if (srch_stop == BOOL.TRUE) return 0;

		if (Score > alpha) {
			if (Score >= beta) {
				if (Legal == 1) {
					srch_fhf++;
				}
				srch_fh++;

				if ((brd_moveList[MoveNum] & MFLAGCAP) == 0) {
					brd_searchKillers[MAXDEPTH + brd_ply] = brd_searchKillers[brd_ply];
					brd_searchKillers[brd_ply] = brd_moveList[MoveNum];
				}
				return beta;
			}
			alpha = Score;
			BestMove = brd_moveList[MoveNum];
			if ((BestMove & MFLAGCAP) == 0) {
				brd_searchHistory[brd_pieces[FROMSQ(BestMove)] * BRD_SQ_NUM + TOSQ(BestMove)] += depth;
			}
		}
	}

	if (Legal == 0) {
		if (InCheck) {
			return -MATE + brd_ply;
		} else {
			return 0;
		}
	}

	if (alpha != OldAlpha) {
		StorePvMove(BestMove);
	}

	return alpha;
}

var domUpdate_depth;
var domUpdate_move;
var domUpdate_score;
var domUpdate_nodes;
var domUpdate_ordering;

function UpdateDOMStats() {
	var scoreText = "Score: " + (domUpdate_score / 100).toFixed(2);
	if (Math.abs(domUpdate_score) > MATE - MAXDEPTH) {
		scoreText = "Score: " + "Mate In " + (MATE - Math.abs(domUpdate_score)) + " moves";
	}

	//console.log("UpdateDOMStats depth:" + domUpdate_depth + " score:" + domUpdate_score + " nodes:" + domUpdate_nodes);
	$("#OrderingOut").text("Ordering: " + domUpdate_ordering + "%");
	$("#DepthOut").text("Depth: " + domUpdate_depth);
	$("#ScoreOut").text(scoreText);
	$("#NodesOut").text("Nodes: " + domUpdate_nodes);
	$("#TimeOut").text("Time: " + (($.now() - srch_start) / 1000).toFixed(1) + "s");
}

function SearchPosition() {

	var bestMove = NOMOVE;
	var bestScore = -INFINITE;
	var currentDepth = 0;
	var pvNum = 0;
	var line;
	ClearForSearch();

	if (GameController.BookLoaded == BOOL.TRUE) {
		bestMove = BookMove();

		if (bestMove != NOMOVE) {
			$("#OrderingOut").text("Ordering:");
			$("#DepthOut").text("Depth: ");
			$("#ScoreOut").text("Score:");
			$("#NodesOut").text("Nodes:");
			$("#TimeOut").text("Time: 0s");
			$("#BestOut").text("BestMove: " + PrMove(bestMove) + '(Book)');
			srch_best = bestMove;
			srch_thinking = BOOL.FALSE;
			return;
		}
	}

	// iterative deepening
	for (currentDepth = 1; currentDepth <= srch_depth; ++currentDepth) {

		bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
		if (srch_stop == BOOL.TRUE) break;
		pvNum = GetPvLine(currentDepth);
		bestMove = brd_PvArray[0];
		line = ("Depth:" + currentDepth + " best:" + PrMove(bestMove) + " Score:" + bestScore + " nodes:" + srch_nodes);

		if (currentDepth != 1) {
			line += (" Ordering:" + ((srch_fhf / srch_fh) * 100).toFixed(2) + "%");
		}
		//console.log(line);

		domUpdate_depth = currentDepth;
		domUpdate_move = bestMove;
		domUpdate_score = bestScore;
		domUpdate_nodes = srch_nodes;
		domUpdate_ordering = ((srch_fhf / srch_fh) * 100).toFixed(2);
	}

	$("#BestOut").text("BestMove: " + PrMove(bestMove));
	UpdateDOMStats();
	srch_best = bestMove;
	srch_thinking = BOOL.FALSE;

}

function ThreeFoldRep() {
	var i = 0, r = 0;
	for (i = 0; i < brd_hisPly; ++i) {
		if (brd_history[i].posKey == brd_posKey) {
			r++;
		}
	}
	return r;
}

function DrawMaterial() {

	if (brd_pceNum[PIECES.wP] != 0 || brd_pceNum[PIECES.bP] != 0) return BOOL.FALSE;
	if (brd_pceNum[PIECES.wQ] != 0 || brd_pceNum[PIECES.bQ] != 0 || brd_pceNum[PIECES.wR] != 0 || brd_pceNum[PIECES.bR] != 0) return BOOL.FALSE;
	if (brd_pceNum[PIECES.wB] > 1 || brd_pceNum[PIECES.bB] > 1) { return BOOL.FALSE; }
	if (brd_pceNum[PIECES.wN] > 1 || brd_pceNum[PIECES.bN] > 1) { return BOOL.FALSE; }
	if (brd_pceNum[PIECES.wN] != 0 && brd_pceNum[PIECES.wB] != 0) { return BOOL.FALSE; }
	if (brd_pceNum[PIECES.bN] != 0 && brd_pceNum[PIECES.bB] != 0) { return BOOL.FALSE; }

	return BOOL.TRUE;
}
var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;

var MirrorFiles = [FILES.FILE_H, FILES.FILE_G, FILES.FILE_F, FILES.FILE_E, FILES.FILE_D, FILES.FILE_C, FILES.FILE_B, FILES.FILE_A];
var MirrorRanks = [RANKS.RANK_8, RANKS.RANK_7, RANKS.RANK_6, RANKS.RANK_5, RANKS.RANK_4, RANKS.RANK_3, RANKS.RANK_2, RANKS.RANK_1];

function MIRROR120(sq) {
	var file = MirrorFiles[FilesBrd[sq]];
	var rank = MirrorRanks[RanksBrd[sq]];
	return FR2SQ(file, rank);
}

//#endregion

//#region ablauf
function CheckAndSet() {
	if (CheckResult() != BOOL.TRUE) {
		GameController.GameOver = BOOL.FALSE;
		$("#GameStatus").text('');
	} else {
		GameController.GameOver = BOOL.TRUE;
		GameController.GameSaved = BOOL.TRUE; // save the game here
		let win = GameController.winner;
		lookupAddToList(GameController, ['games'], isdef(win) ? win : 0);
	}

	ShowFenPosition();
}
function CheckResult() {

	if (brd_fiftyMove > 100) {
		$("#GameStatus").text("GAME DRAWN {fifty move rule}");
		return BOOL.TRUE;
	}

	if (ThreeFoldRep() >= 2) {
		$("#GameStatus").text("GAME DRAWN {3-fold repetition}");
		return BOOL.TRUE;
	}

	if (DrawMaterial() == BOOL.TRUE) {
		$("#GameStatus").text("GAME DRAWN {insufficient material to mate}");
		return BOOL.TRUE;
	}

	//console.log('Checking end of game');
	GenerateMoves();

	var MoveNum = 0;
	var found = 0;
	for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {

		if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
			continue;
		}
		found++;
		TakeMove();
		break;
	}

	$("#currentFenSpan").text(BoardToFen());

	if (found != 0) return BOOL.FALSE;
	var InCheck = SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1);
	console.log('No Move Found, incheck:' + InCheck);

	if (InCheck == BOOL.TRUE) {
		if (brd_side == COLOURS.WHITE) {
			$("#GameStatus").text("GAME OVER {black mates}");
			GameController.winner = 'black';
			return BOOL.TRUE;
		} else {
			$("#GameStatus").text("GAME OVER {white mates}");
			GameController.winner = 'white';
			return BOOL.TRUE;
		}
	} else {
		$("#GameStatus").text("GAME DRAWN {stalemate}"); return BOOL.TRUE;
	}
	console.log('Returning False');
	return BOOL.FALSE;
}
function PreSearch() {

	if (GameController.GameOver != BOOL.TRUE) {
		srch_thinking = BOOL.TRUE;
		StartThinking();
		setTimeout(function () { StartSearch(); }, 200);
	}
}
function StartSearch() {
	srch_depth = MAXDEPTH;
	var t = $.now();
	var tt = $('#ThinkTimeChoice').val();
	//console.log("time:" + t + " TimeChoice:" + tt);
	if (nundef(tt)) tt = 6;
	srch_time = parseInt(tt) * 1000;
	SearchPosition();

	StopThinking();
	//console.log('===>best move found', PrMove(srch_best), srch_best);

	if (FLAG_HINT_ONLY) {
		FLAG_HINT_ONLY = false;
		let info = Move2FromTo(srch_best);
		let sq = info.from.sq;
		HintAnimation(sq, 1000);
	} else {
		MakeMove(srch_best);
		MoveGUIPiece(srch_best);
		CheckAndSet();
	}
}

//#endregion

//#region GUI
$(document).on('click', '.Piece', function (e) {
	console.log("Piece Click");
	if (srch_thinking == BOOL.FALSE && GameController.PlayerSide == brd_side) {
		if (UserMove.from == SQUARES.NO_SQ)
			UserMove.from = ClickedSquare(e.pageX, e.pageY);
		else
			UserMove.to = ClickedSquare(e.pageX, e.pageY);

		MakeUserMove();
	}
});
$(document).on('click', '.Square', function (e) {
	console.log("Square Click");
	if (srch_thinking == BOOL.FALSE && GameController.PlayerSide == brd_side && UserMove.from != SQUARES.NO_SQ) {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
		MakeUserMove();
	}
});
$(document).ajaxComplete(function () {});

function ActivateChessWidgets() {
	StopThinking();
	$("#SetFen").click(function () {
		var fenStr = $("#fenIn").val();
		ParseFen(fenStr);
		PrintBoard();
		SetInitialBoardPieces();
		GameController.PlayerSide = brd_side;
		CheckAndSet();
		EvalPosition();
		//PerftTest(5);
		NewGameAjax();
	});
	$("#UndoButton").click(function () {
		console.log('Undo request... brd_hisPly:' + brd_hisPly);
		if (brd_hisPly > 0) {
			TakeMove(); if (brd_hisPly > 0) TakeMove();
			brd_ply = 0;
			SetInitialBoardPieces();
			$("#currentFenSpan").text(BoardToFen());
		}
	});

	$("#HintButton").click(function () {
		//GameController.PlayerSide = brd_side ^ 1;
		FLAG_HINT_ONLY = true;
		let move = PreSearch();

	});
	$("#SearchButton").click(function () {
		GameController.PlayerSide = brd_side ^ 1;
		PreSearch();
	});

	$("#FlipButton").click(function () {
		GameController.BoardFlipped ^= 1;
		console.log("Flipped:" + GameController.BoardFlipped);
		SetInitialBoardPieces();
	});

	$("#EndGameButton").click(function () {
		let fen = chooseRandom(FenPositionList).FEN;
		console.log('fen',fen)
		NewGame(fen);
		NewGameAjax();
	});
	$("#NewGameButton").click(function () {
		NewGame();
		NewGameAjax();
	});

}
function AddGUIPiece(sq, pce) {
	var rank = RanksBrd[sq];
	var file = FilesBrd[sq];
	var rankName = "rank" + (rank + 1);
	var fileName = "file" + (file + 1);
	pieceFileName = "../base/assets/images/chess/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png";
	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece clickElement " + rankName + " " + fileName + "\"/>";
	//console.log("add on " + imageString);
	$("#ChessBoard").append(imageString);
}
function ClearAllPieces() {
	//console.log("Removing pieces");
	$(".Piece").remove();
}
function ClickedSquare(pageX, pageY) {
	var position = $("#ChessBoard").position();
	let dBoard = mBy('ChessBoard');
	let rBoard = setRectInt(dBoard);
	let dParent = mBy('ChessBoard').parentNode;
	let r = setRectInt(dParent);
	// console.log('____click x,y:', pageX, pageY);
	// console.log('____board x,y:', rBoard.l, rBoard.t);
	// console.log('____position', position.left,position.top);
	// console.log('____board parent x,y:', r.l, r.t);

	// let x=pageX-rBoard.x;
	// let y=pageY-rBoard.t;
	// let col = Math.floor(x/60);
	// let row = Math.floor(y/60);

	//console.log("pageX,Y=" + pageX + "," + pageY + "\nboard top:" + position.top + " board left:" + position.left);

	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);
	var pageX = Math.floor(pageX);
	var pageY = Math.floor(pageY);

	var file = Math.floor((pageX - workedX - r.l) / 60);
	var rank = 7 - Math.floor((pageY - workedY - r.t) / 60);

	var sq = FR2SQ(file, rank); //file=col, rank=row (both 0-based)
	// console.log('sq old',sq);
	// let sq1 = FR2SQ(col,row);
	// console.log('sq new',sq1,'\nflipped',GameController.BoardFlipped);


	if (GameController.BoardFlipped == BOOL.TRUE) {
		sq = MIRROR120(sq);
	}

	//console.log("WorkedX: " + workedX + " WorkedY:" + workedY); // + " File:" + file + " Rank:" + rank);
	//console.log("clicked:" + PrSq(sq));

	SetSqSelected(sq); // must go here before mirror

	return sq;

}
function DeselectSq(sq) {

	if (GameController.BoardFlipped == BOOL.TRUE) {
		sq = MIRROR120(sq);
	}

	$(".Square").each(function (index) {
		if ((RanksBrd[sq] == 7 - Math.round($(this).position().top / 60)) && (FilesBrd[sq] == Math.round($(this).position().left / 60))) {
			$(this).removeClass('SqSelected');
		}
	});
}
function EvalInit() {
	var index = 0;

	for (index = 0; index < 10; ++index) {
		PawnRanksWhite[index] = 0;
		PawnRanksBlack[index] = 0;
	}
}
function HintAnimation(sq, ms = 2000) {
	if (GameController.BoardFlipped == BOOL.TRUE) { sq = MIRROR120(sq); }
	$(".Square").each(function (index) {
		if ((RanksBrd[sq] == 7 - Math.round($(this).position().top / 60)) && (FilesBrd[sq] == Math.round($(this).position().left / 60))) {
			animateProperty(this, 'opacity', '1', '0', '1', ms);
		}
	});
}
function InitBoardSquares() {


	var light = 0;
	var rankName;
	var fileName;
	var divString;
	var lightString;
	var lastLight = 0;

	for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {
		light = lastLight ^ 1;
		lastLight ^= 1;
		rankName = "rank" + (rankIter + 1);
		for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {
			fileName = "file" + (fileIter + 1);
			if (light == 0) lightString = "Light";
			else lightString = "Dark";
			divString = "<div class=\"Square clickElement " + rankName + " " + fileName + " " + lightString + "\"/>";
			//console.log(divString);
			light ^= 1;
			$("#ChessBoard").append(divString);
		}
	}
}
function InitBoardVars() {

	var index = 0;
	for (index = 0; index < MAXGAMEMOVES; index++) {
		brd_history.push({
			move: NOMOVE,
			castlePerm: 0,
			enPas: 0,
			fiftyMove: 0,
			posKey: 0
		});
	}

	for (index = 0; index < PVENTRIES; index++) {
		brd_PvTable.push({
			move: NOMOVE,
			posKey: 0
		});
	}

}
function InitHashKeys() {
	var index = 0;

	for (index = 0; index < 13 * 120; ++index) {
		PieceKeys[index] = RAND_32();
	}

	SideKey = RAND_32();

	for (index = 0; index < 16; ++index) {
		CastleKeys[index] = RAND_32();
	}
}
function InitSq120To64() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq64 = 0;
	for (index = 0; index < BRD_SQ_NUM; ++index) {
		Sq120ToSq64[index] = 65;
	}

	for (index = 0; index < 64; ++index) {
		Sq64ToSq120[index] = 120;
	}

	for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file, rank);
			Sq64ToSq120[sq64] = sq;
			Sq120ToSq64[sq] = sq64;
			sq64++;
		}
	}
}
function InitFilesRanksBrd() {

	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq64 = 0;

	for (index = 0; index < BRD_SQ_NUM; ++index) {
		FilesBrd[index] = SQUARES.OFFBOARD;
		RanksBrd[index] = SQUARES.OFFBOARD;
	}

	for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file, rank);
			FilesBrd[sq] = file;
			RanksBrd[sq] = rank;
		}
	}
}
function MakeUserMove() {
	if (UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
		console.log("User Move:" + PrSq(UserMove.from) + PrSq(UserMove.to));

		var parsed = ParseMove(UserMove.from, UserMove.to);

		DeselectSq(UserMove.from);
		DeselectSq(UserMove.to);

		console.log("Parsed:" + parsed);

		if (parsed != NOMOVE) {
			MakeMove(parsed);
			MoveGUIPiece(parsed);
			CheckAndSet();
			PreSearch();
		} else {
			ShowChessMessage('illegal move!',1000);
		}

		UserMove.from = SQUARES.NO_SQ;
		UserMove.to = SQUARES.NO_SQ;
	}
}
function MoveGUIPiece(move) {
	var from = FROMSQ(move);
	var to = TOSQ(move);

	var flippedFrom = from;
	var flippedTo = to;
	var epWhite = -10;
	var epBlack = 10;

	if (GameController.BoardFlipped == BOOL.TRUE) {
		flippedFrom = MIRROR120(from);
		flippedTo = MIRROR120(to);
		epWhite = 10;
		epBlack = -10;
	}

	if (move & MFLAGEP) {
		var epRemove;
		if (brd_side == COLOURS.BLACK) {
			epRemove = flippedTo + epWhite;
		} else {
			epRemove = flippedTo + epBlack;
		}
		console.log("en pas removing from " + PrSq(epRemove));
		RemoveGUIPiece(epRemove);
	} else if (CAPTURED(move)) {
		RemoveGUIPiece(flippedTo);
	}

	var rank = RanksBrd[flippedTo];
	var file = FilesBrd[flippedTo];
	var rankName = "rank" + (rank + 1);
	var fileName = "file" + (file + 1);

	/*if(GameController.BoardFlipped == BOOL.TRUE) {
		rankName += "flip";
		fileName += "flip";
	}*/

	$(".Piece").each(function (index) {
		//console.log( "Picture:" + index + ": " + $(this).position().top + "," + $(this).position().left );
		if ((RanksBrd[flippedFrom] == 7 - Math.round($(this).position().top / 60)) && (FilesBrd[flippedFrom] == Math.round($(this).position().left / 60))) {
			//console.log("Setting pic ff:" + FilesBrd[from] + " rf:" + RanksBrd[from] + " tf:" + FilesBrd[to] + " rt:" + RanksBrd[to]);
			$(this).removeClass();
			$(this).addClass("Piece clickElement " + rankName + " " + fileName);
		}
	});

	if (move & MFLAGCA) {
		if (GameController.BoardFlipped == BOOL.TRUE) {
			switch (to) {
				case SQUARES.G1: RemoveGUIPiece(MIRROR120(SQUARES.H1)); AddGUIPiece(MIRROR120(SQUARES.F1), PIECES.wR); break;
				case SQUARES.C1: RemoveGUIPiece(MIRROR120(SQUARES.A1)); AddGUIPiece(MIRROR120(SQUARES.D1), PIECES.wR); break;
				case SQUARES.G8: RemoveGUIPiece(MIRROR120(SQUARES.H8)); AddGUIPiece(MIRROR120(SQUARES.F8), PIECES.bR); break;
				case SQUARES.C8: RemoveGUIPiece(MIRROR120(SQUARES.A8)); AddGUIPiece(MIRROR120(SQUARES.D8), PIECES.bR); break;
			}
		} else {
			switch (to) {
				case SQUARES.G1: RemoveGUIPiece(SQUARES.H1); AddGUIPiece(SQUARES.F1, PIECES.wR); break;
				case SQUARES.C1: RemoveGUIPiece(SQUARES.A1); AddGUIPiece(SQUARES.D1, PIECES.wR); break;
				case SQUARES.G8: RemoveGUIPiece(SQUARES.H8); AddGUIPiece(SQUARES.F8, PIECES.bR); break;
				case SQUARES.C8: RemoveGUIPiece(SQUARES.A8); AddGUIPiece(SQUARES.D8, PIECES.bR); break;
			}
		}
	}
	var prom = PROMOTED(move);
	console.log("PromPce:" + prom);
	if (prom != PIECES.EMPTY) {
		console.log("prom removing from " + PrSq(flippedTo));
		RemoveGUIPiece(flippedTo);
		AddGUIPiece(flippedTo, prom);
	}

	printGameLine();
}
function NewGame(fen) {
	if (nundef(fen)) fen = START_FEN;

	ParseFen(fen);
	PrintBoard();
	SetInitialBoardPieces();
	GameController.PlayerSide = brd_side;

	CheckAndSet();
	GameController.GameSaved = BOOL.FALSE;

	//console.log('_________________\nGameController', GameController);
	//console.log('turn', SideChar[brd_side],'fen', fen);

	if (SideChar[brd_side] == 'b') {
		GameController.PlayerSide = brd_side ^ 1;
		PreSearch();

	}

}
function NewGameAjax() {
	//console.log('new Game Ajax');
	/*$.ajax({
		url : "insertNewGame.php",
		cache: false
		}).done(function( html ) {
			console.log('result:' + html);
		});*/
}
function RemoveGUIPiece(sq) {
	//console.log("remove on:" + PrSq(sq));
	$(".Piece").each(function (index) {
		//console.log( "Picture:" + index + ": " + $(this).position().top + "," + $(this).position().left );
		if ((RanksBrd[sq] == 7 - Math.round($(this).position().top / 60)) && (FilesBrd[sq] == Math.round($(this).position().left / 60))) {
			//console.log( "Picture:" + index + ": " + $(this).position().top + "," + $(this).position().left );	
			$(this).remove();
		}
	});
}
function SetSqSelected(sq) {

	if (GameController.BoardFlipped == BOOL.TRUE) {
		sq = MIRROR120(sq);
	}

	$(".Square").each(function (index) {
		//console.log("Looking Sq Selected RanksBrd[sq] " + RanksBrd[sq] + " FilesBrd[sq] " + FilesBrd[sq] + " position " + Math.round($(this).position().left/60) + "," + Math.round($(this).position().top/60));	
		if ((RanksBrd[sq] == 7 - Math.round($(this).position().top / 60)) && (FilesBrd[sq] == Math.round($(this).position().left / 60))) {
			//console.log("Setting Selected Sq");
			$(this).addClass('SqSelected');
		}
	});
}
function SetInitialBoardPieces() {
	var sq;
	var sq120;
	var file, rank;
	var rankName;
	var fileName;
	var imageString;
	var pieceFileName;
	var pce;
	ClearAllPieces();
	for (sq = 0; sq < 64; ++sq) {

		sq120 = SQ120(sq);

		pce = brd_pieces[sq120]; // crucial here

		if (GameController.BoardFlipped == BOOL.TRUE) {
			sq120 = MIRROR120(sq120);
		}

		file = FilesBrd[sq120];
		rank = RanksBrd[sq120];


		if (pce >= PIECES.wP && pce <= PIECES.bK) {
			rankName = "rank" + (rank + 1);
			fileName = "file" + (file + 1);

			pieceFileName = "../base/assets/images/chess/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png";
			imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
			//console.log(imageString);
			$("#ChessBoard").append(imageString);
		}
	}

}
function ShowChessMessage(s,ms){
	//showFleetingMessage(`<div style='margin-left:-178px;width:483px;text-align:center;'>${s}</div>`,0,{fg:'red',bg:'blue'},true);
	//dTitle.innerHTML = `<div style='margin-left:78px;width:483px;text-align:center;'>Turn: ${pl}`;
	//mBy('GameStatus').innerHTML = 'HALOOOOOO';
	console.log('message:',s);

	$("#GameStatus").text(s);
	if (isdef(ms)) setTimeout(()=>$("#GameStatus").text(''),ms)
}
function ShowFenPosition() {
	//var fenStr = BoardToFen();
	$("#currentFenSpan").text(BoardToFen());
	//console.log('turn', SideChar[brd_side], 'fen', BoardToFen());

	let pl = SideChar[brd_side] == 'b' ? 'BLACK (AI)' : 'WHITE (you)';
	mStyle(dTitle, { align: 'left' }); //,bg:'random'});
	// dTitle.innerHTML = `<div style='position:absolute;left:0px;top:0px;padding-bottom:10px'>Turn: ${pl}</div>`;
	dTitle.innerHTML = `<div style='margin-left:78px;width:483px;text-align:center;'>Turn: ${pl}</div>`;
	//console.log('fen',BoardToFen());
	//console.log('Turn:',SideChar[brd_side] == 'b'?'BLACK (AI)':'WHITE (you)');

}
function StartChessGame() {
	InitFilesRanksBrd();
	InitSq120To64();
	InitHashKeys();
	InitBoardVars();
	InitMvvLva();
	InitBoardSquares();
	EvalInit();
	srch_thinking = BOOL.FALSE;
	$('#fenIn').val(START_FEN);
	//console.log('___________');
	NewGame();
	NewGameAjax();
}
function StartThinking() {
	let img = mBy('ThinkingPng');
	show(img);
	mClass(img, 'blinkFast');
	mBy('dShield').style.display = 'block';
	// show('dShield');
}
function StopThinking() {
	let img = mBy('ThinkingPng');
	mClassRemove(img, 'blinkFast');
	hide(img);
	hideShield();
	//mBy('dShield').style.display = 'none';
	// hide('dShield');
}


//#endregion








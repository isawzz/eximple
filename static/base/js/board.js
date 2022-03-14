//#region sudoku utilities
function arrToMatrix(arr, rows, cols) {
	let i = 0, res = [];
	for (let r = 0; r < rows; r++) {
		let rarr = [];
		for (let c = 0; c < cols; c++) {
			let a = arr[i]; i++;
			rarr.push(a);
		}
		res.push(rarr);
	}
	return res;
}
function sudokuSampleToIndexMatrix(s, rows, cols) {
	//all 0 entries => ' ', and all numbers>0 => 
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	//console.log('letters',letters);
	let nums = letters.map(x => Number(x));
	//console.log('nums',nums);
	let res = [];
	for (const n of nums) {
		if (n === 0) res.push(' ');
		else res.push(n - 1);
	}
	//console.log('numbers',nums);
	let matrix = arrToMatrix(res, rows, cols);
	return matrix;
}
function stringToMatrix(s, rows, cols) {
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	//console.log('letters',letters);
	let nums = letters.map(x => Number(x));
	//console.log('numbers',nums);
	let matrix = arrToMatrix(nums, rows, cols);
}
function getSudokuPatternFromDB(r, c, index) {
	let key = '' + r + 'x' + c;
	let numSamples = Object.keys(DB.games.gColoku.samples[key]).length;
	//console.log('r', r, 'c', c, numSamples)
	if (nundef(index)) index = randomNumber(0, numSamples - 1); else if (index >= numSamples) index = 1;
	let sample = DB.games.gColoku.samples[key][index];
	//console.log('sample', sample, 'index', index, sample.sol, r, c)
	let pattern = sudokuSampleToIndexMatrix(sample.sol, r, c);
	//console.log('pattern',pattern);
	let puzzle = sudokuSampleToIndexMatrix(sample.min, r, c);
	return { pattern: pattern, puzzle: puzzle };
}
function getSudokuPattern(r, c) {
	//mach das pattern es sollte 16 geben!
	// 0 1 2 3 
	// 3 2 0 1
	// 2 3 1 0
	// 1 0 2 3

	// 0 1 2 3 
	// 2 3 0 1
	// 3 0 1 2
	// 1 2 3 0

	// 0 1 2 3 
	// 2 3 0 1
	// 1 0 3 2
	// 3 2 1 0
	let patterns = {
		44: [
			[[0, 1, 2, 3], [2, 3, 0, 1], [3, 0, 1, 2], [1, 2, 3, 0]],
			[[0, 1, 2, 3], [3, 2, 0, 1], [2, 3, 1, 0], [1, 0, 3, 2]],
			[[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]],
		],
	};
	return chooseRandom(patterns['' + r + c]);
}
function destroySudokuRule(pattern, rows, cols) {
	let sz = Math.min(rows, cols);
	let [r1, r2] = choose(range(0, sz - 1), 2);
	let c = chooseRandom(range(0, sz - 1));
	// arrSwap2d(pattern, r1, c, r2, c);


	//TEST arrSwap2d(pattern, 0, 3, 1, 3);return;

	//generate row error
	if (coin(50)) { arrSwap2d(pattern, r1, c, r2, c); }

	//generate col error
	else if (coin(50)) { arrSwap2d(pattern, c, r1, c, r2); }

}
function hasDuplicate(arr, efunc) {
	let di = {};
	if (nundef(efunc)) efunc = x => { return x === ' ' };
	let i = -1;
	//console.log('check for dupl in',arr)
	for (const a of arr) {
		//console.log('i', i, 'a', a)
		i += 1;
		if (efunc(a)) continue; //!isNumber(a) && a==' ') {console.log('H!',a);continue;}
		if (a in di) return { i: i, val: a };
		di[a] = true;
	}
	return false;
}

function checkSudokuRule(matrix) {
	//should return at least one example of offending tiles if incorrect! null otherwise!

	//check rows is simple!
	let i = 0;
	for (const arr of matrix) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'row', row: i, col: dd.i, val: dd.val, info: dd, i: i };
			return err;
		}
		i += 1;
	}

	i = 0;
	for (const arr of bGetCols(matrix)) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'column', col: i, row: dd.i, val: dd.val, i: i, info: dd };
			return err;
		}
		i += 1;
	}

	//console.log('still here!');

	// let sub0=bGetSubMatrix(pattern,0,2,0,2);
	// let sub1=bGetSubMatrix(pattern,0,2,2,2);
	// let sub2=bGetSubMatrix(pattern,2,2,0,2);
	// let sub3=bGetSubMatrix(pattern,2,2,2,2);
	let [rows, cols] = [matrix.length, matrix[0].length];
	let rowsEach = rows == 9 ? 3 : 2;
	let colsEach = cols == 4 ? 2 : 3;
	let chunks = bGetChunksWithIndices(matrix, rowsEach, colsEach);
	//printMatrix(chunks, 'quadrants');



	i = 0;
	for (const arr of chunks) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let val = dd.val;
			let err = { type: 'quadrant', row: val.row, col: val.col, val: val.val, i: i, info: dd };
		}
		i += 1;
	}

	return null;
}
function checkSudokuRule_trial1(matrix) {
	//should return at least one example of offending tiles if incorrect! null otherwise!

	for (const arr of matrix) { let dd = hasDuplicate(arr); if (dd) return { type: 'row', info: dd }; }

	for (const arr of bGetCols(matrix)) { let dd = hasDuplicate(arr); if (dd) return { type: 'column', info: dd }; }

	//console.log('still here!');

	// let sub0=bGetSubMatrix(pattern,0,2,0,2);
	// let sub1=bGetSubMatrix(pattern,0,2,2,2);
	// let sub2=bGetSubMatrix(pattern,2,2,0,2);
	// let sub3=bGetSubMatrix(pattern,2,2,2,2);
	let chunks = bGetChunks(matrix, 2, 2);
	//printMatrix(chunks, 'quadrants');
	for (const arr of chunks) { let dd = hasDuplicate(arr); if (dd) return { type: 'quadrant', info: dd }; }

	return null;
}
//#endregion

//#region board 2d arr utilities
function bGetSubMatrix(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	//console.log('rows',rows,res);return;
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push(arr2d[r][c]);
		}
		rIndex += 1;
	}
	//console.log('res',res)
	//printMatrix(res,'res')
	return res;
}
function bGetSubMatrixWithIndices(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	//console.log('rows',rows,res);return;
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push({ row: r, col: c, val: arr2d[r][c] });
		}
		rIndex += 1;
	}
	//console.log('res',res)
	//printMatrix(res,'res')
	return res;
}
function bGetChunksWithIndices(arr2d, rowsEach, colsEach) {
	//das returned nicht flattened arrays of just entries, but flattened arrays of {row:r,col:c,val:entry}
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			//console.log('rFrom',r,'cFrom',c)
			m1 = bGetSubMatrixWithIndices(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
		//printMatrix(m1,'quad'+res.length);
	}
	return res;
}
function bGetChunks(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			//console.log('rFrom',r,'cFrom',c)
			m1 = bGetSubMatrix(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
		//printMatrix(m1,'quad'+res.length);
	}
	return res;
}
function bGetRows(arr2d) {
	return arr2d;
}
function bGetCols(arr2d) {
	let rows = arr2d.length;
	let cols = arr2d[0].length;

	let res = [];
	for (let c = 0; c < cols; c++) { res.push([]); }
	//console.log('res',res);

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			res[c].push(arr2d[r][c]);
		}
	}

	return res;
}
function printMatrix(arr2d, title = 'result') {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let arr = arrFlatten(arr2d);
	// console.log('arr', arr,rows,cols)
	let s = toBoardString(arr, rows, cols);
	console.log(title, s)
}

//#endregion

//#region board utilities
var StateDict = {};
var EmptyFunc = x => nundef(x) || x == ' ';


function bGetCol(arr, icol, rows, cols) {
	let iStart = icol;
	let res = [];
	for (let i = iStart; i < iStart + (cols * rows); i += cols) res.push(arr[i]);
	return res;
}
function bGetRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let arrNew = arr.slice(iStart, iStart + cols);

	let res = [];
	for (let i = iStart; i < iStart + cols; i++) res.push(arr[i]);

	console.assert(sameList(arrNew, res), 'NOOOOOO');
	return res;
}

function bNei(arr, idx, rows, cols, includeDiagonals = true) {
	let nei = [];
	//ang tile ist 0,0
	//get r,c from index: 
	let [r, c] = iToRowCol(idx, rows, cols);

	if (r > 0) nei.push(idx - cols); else nei.push(null);
	if (r > 0 && c < cols - 1 && includeDiagonals) nei.push(idx - cols + 1); else nei.push(null);
	if (c < cols - 1) nei.push(idx + 1); else nei.push(null);
	if (r < rows - 1 && c < cols - 1 && includeDiagonals) nei.push(idx + cols + 1); else nei.push(null);
	if (r < rows - 1) nei.push(idx + cols); else nei.push(null);
	if (r < rows - 1 && c > 0 && includeDiagonals) nei.push(idx + cols - 1); else nei.push(null);
	if (c > 0) nei.push(idx - 1); else nei.push(null);
	if (r > 0 && c > 0 && includeDiagonals) nei.push(idx - cols - 1); else nei.push(null);
	//console.log('idx', idx, 'rows', rows, 'cols', cols, 'r', r, 'c', c);
	return nei;

}
function iFromRowCol(row, col, rows, cols) { return row * cols + col; }
function iToRowCol(idx, rows, cols) { let c = idx % cols; let r = (idx - c) / rows; return [r, c]; }
function bCheck(r, c, rows, cols) { return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : null; }
function bNeiDir(arr, idx, dir, rows, cols, includeDiagonals = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	switch (dir) {
		case 0: if (r > 0) return (idx - cols); else return (null);
		case 1: if (r > 0 && c < cols - 1 && includeDiagonals) return (idx - cols + 1); else return (null);
		case 2: if (c < cols - 1) return (idx + 1); else return (null);
		case 3: if (r < rows - 1 && c < cols - 1 && includeDiagonals) return (idx + cols + 1); else return (null);
		case 4: if (r < rows - 1) return (idx + cols); else return (null);
		case 5: if (r < rows - 1 && c > 0 && includeDiagonals) return (idx + cols - 1); else return (null);
		case 6: if (c > 0) return (idx - 1); else return (null);
		case 7: if (r > 0 && c > 0 && includeDiagonals) return (idx - cols - 1); else return (null);
	}
	return null;
}
function bRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		let i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i || !EmptyFunc(arr[i])) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break;
		else indices.push(i);
		if (!EmptyFunc(arr[i])) break;
	}
	return indices;
}
function isOppPiece(sym, plSym) { return sym && sym != plSym; }
function bCapturedPieces(plSym, arr, idx, rows, cols, includeDiagonals = true) {
	//console.log('player sym',plSym,'arr',arr,'idx', idx,'rows', rows,'cols', cols);
	let res = [];
	let nei = bNei(arr, idx, rows, cols, includeDiagonals);
	//console.log('nei',nei);
	for (let dir = 0; dir < 8; dir++) {
		let i = nei[dir];
		if (nundef(i)) continue;

		let el = arr[i];
		//console.log('___i',i,'el',el,'checking dir',dir);
		if (EmptyFunc(el) || el == plSym) continue;
		let inew = [];
		let MAX = 100, cmax = 0;

		while (isOppPiece(el, plSym)) {
			//console.log('index',i,'is opp',el)
			if (cmax > MAX) break; cmax += 1;
			inew.push(i);
			i = bNeiDir(arr, i, dir, rows, cols);
			//console.log(i,cmax,'dir',dir);
			if (nundef(i)) break;
			el = arr[i];
			//console.log('i',i,'el',el,'max',cmax);
		}
		if (el == plSym) {
			//add all the captured pieces to res
			res = res.concat(inew);
		}
	}
	return res;
}
function bFullRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + cols; i++) if (arr[i] != x) return null;
	return x;
}
function bStrideRow(arr, irow, rows, cols, stride) {
	//console.log('hallo!', cols, stride)
	for (let i = 0; i <= cols - stride; i++) {
		let ch = bStrideRowFrom(arr, irow, i, rows, cols, stride);
		//console.log('ch', ch, i)
		if (ch) return ch;
	}
	return null;
}
function bStrideRowFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(cols, icol, stride)
	if (cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + stride; i++) if (arr[i] != x) return null;
	return x;
}
function bStrideCol(arr, icol, rows, cols, stride) {
	//console.log('hallo!', rows, stride)
	for (let i = 0; i <= rows - stride; i++) {
		let ch = bStrideColFrom(arr, i, icol, rows, cols, stride);
		//console.log('ch', ch, i)
		if (ch) return ch;
	}
	return null;
}
function bStrideColFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + cols * stride; i += cols) if (arr[i] != x) return null;
	return x;
}
function bStrideDiagFrom(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride || cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < iStart + (cols + 1) * stride; i += cols + 1) if (arr[i] != x) return null;
	return x;
}
function bStrideDiag2From(arr, irow, icol, rows, cols, stride) {
	//console.log(irow, icol, rows, cols, stride)
	if (rows - irow < stride || icol - stride + 1 < 0) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	//console.log('starting el:', x)
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols - 1; i < iStart + (cols - 1) * stride; i += cols - 1) if (arr[i] != x) return null;
	return x;
}
function bFullCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + (cols * rows); i += cols) if (arr[i] != x) return null;
	return x;
}
function bFullDiag(arr, rows, cols) {
	let iStart = 0;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < arr.length; i += cols + 1) { if (arr[i] != x) return null; }//console.log(i,arr[i]); }
	return x;
}
function bFullDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	//console.log(iStart,arr[iStart]);
	for (let i = iStart + cols - 1; i < arr.length - 1; i += cols - 1) { if (arr[i] != x) return null; }//console.log(i,arr[i]); }
	return x;
}
function bPartialRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = null;
	for (let i = iStart; i < iStart + cols; i++) {
		if (EmptyFunc(arr[i])) continue;
		else if (EmptyFunc(x)) x = arr[i];
		else if (arr[i] != x) return null;
	}
	return x;
}
function bPartialCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = null;
	for (let i = iStart; i < iStart + (cols * rows); i += cols) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag(arr, rows, cols) {
	let iStart = 0;
	let x = null;
	for (let i = iStart; i < arr.length; i += cols + 1) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = null;
	//console.log(iStart,arr[iStart]);
	for (let i = iStart; i < arr.length - 1; i += cols - 1) {
		if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null;
	}
	return x;
}
function boardToNode(state) {
	let res = new Array();
	for (let i = 0; i < state.length; i++) {
		if (state[i] == null) res[i] = ' ';
		else res[i] = state[i];
		//else if (state[i]=='O')
	}
	return res;
}
function printBoard(arr, rows, cols, reduced = true) {
	let arrR = boardArrOmitFirstRowCol(arr, rows, cols);
	let s = toBoardString(arrR, rows, cols);
	console.log('board', s);
}
function boardArrOmitFirstRowCol(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);

			res.push(boardArr[i]);
		}
	}
	return res;

}
// new version von printState:
function toBoardString(arr, rows, cols) {
	let s = '\n';
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let item = arr[r * cols + c];

			s += '' + (nundef(item) ? '_' : item) + ' ';
		}
		s += '\n';
	}
	return s;
}
function printState(state, cols, rows) {
	//console.log('___________',state)
	let formattedString = '';
	state.forEach((cell, index) => {
		formattedString += isdef(cell) ? ` ${cell == '0' ? ' ' : cell} |` : '   |';
		if ((index + 1) % cols == 0) {
			formattedString = formattedString.slice(0, -1);
			if (index < rows * cols - 1) {
				let s = '\u2015\u2015\u2015 '.repeat(cols);
				formattedString += '\n' + s + '\n'; //\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
				// formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
			}
		}
	});
	console.log('%c' + formattedString, 'color: #6d4e42;font-size:10px');
	console.log();
}
function bCreateEmpty(rows, cols) { return new Array(rows * cols).fill(null); }

function checkWinnerPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkWinner(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkBoardEmpty(arr) { for (const x of arr) { if (!EmptyFunc(x)) return false; } return true; }
function checkBoardFull(arr) { for (const x of arr) if (EmptyFunc(x)) return false; return true; }

//TTT
function checkPotentialTTT(arr, rows, cols) { return checkWinnerPossible(arr, rows, cols); }
function checkWinnerTTT(arr, rows, cols) { return checkWinner(arr, rows, cols); }
function checkWinnerC4(arr, rows = 6, cols = 7, stride = 4) {
	//console.log(arr,rows,cols,stride)

	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}
//#endregion

//#region Board classes
class Board {
	constructor(rows, cols, handler, cellStyle) {
		let styles = isdef(cellStyle) ? cellStyle : { margin: 4, w: 150, h: 150, bg: 'white', fg: 'black' };
		this.rows = rows;
		this.cols = cols;
		let items = this.items = iGrid(this.rows, this.cols, dTable, styles);
		items.map(x => {
			let d = iDiv(x);
			mCenterFlex(d);
			d.onclick = handler;
		});
		//console.log(this.items)
	}
	get(ir, c) {
		if (isdef(c)) {
			// interpret as row,col
			let idx = ir * this.cols + c;
			return this.items[idx];
		} else {
			//interpret as index
			return this.items[ir];
		}
	}
	getState() {
		return this.items.map(x => x.label);
	}
	setState(arr, colors) {

		if (isEmpty(arr)) return;
		if (isList(arr[0])) { arr = arrFlatten(arr); }

		for (let i = 0; i < arr.length; i++) {
			let item = this.items[i];
			let val = arr[i];
			if (!EmptyFunc(val)) {
				addLabel(item, val, { fz: 60, fg: colors[val] });
			} else item.label = val;
			//item.label = arr[i];

		}
	}
	clear() {
		for (const item of this.items) {
			let dLabel = iLabel(item);
			if (isdef(dLabel)) { removeLabel(item); item.label = null; }
		}
	}
}

class Board2D {
	constructor(rows, cols, dParent, cellStyles, boardStyles, handler) {
		cellStyles = this.cellStyles = isdef(cellStyles) ? cellStyles : { margin: 4, w: 150, h: 150, bg: 'white', fg: 'black' };
		boardStyles = this.boardStyles = isdef(boardStyles) ? boardStyles : { bg: 'silver', fg: 'black' };
		this.rows = rows;
		this.cols = cols;
		this.dParent = dParent;
		//let dGridParent = this.dGridParent = mDiv(dParent,{bg:'green'});
		let dBoard = this.dBoard = mDiv(dParent);//, boardStyles);
		let items = this.items = this.fill(dBoard, this.rows, this.cols, null, cellStyles);
	}
	fill(d, rows, cols, items, cellStyles) {
		if (nundef(items)) items = [];
		clearElement(d);
		mStyle(d, { display: 'grid', 'grid-template-columns': cols });
		for (let i = 0; i < rows * cols; i++) {
			let item = items[i];
			if (isdef(item)) {
				let d1 = iDiv(item);
				if (isdef(d1)) mAppend(d, iDiv(item));
				else {
					d1 = mDiv(d, cellStyles); iAdd(item, { div: d1 }); mAppend(d, d1);
				}
			} else {
				let [r, c] = iToRowCol(i);
				item = { row: r, col: c, index: i };
				let d1 = mDiv(d, cellStyles); iAdd(item, { div: d1 }); mAppend(d, d1);
			}
			mStyle(iDiv(item), cellStyles);
			items.push(item)
		}
		return items;
	}
	get(ir, c) {
		if (isdef(c)) {
			// interpret as row,col
			let idx = ir * this.cols + c;
			return this.items[idx];
		} else {
			//interpret as index
			return this.items[ir];
		}
	}
	getState() {
		return this.items.map(x => x.label);
	}
	setState(arr, colors) {

		if (isEmpty(arr)) return;
		if (isList(arr[0])) { arr = arrFlatten(arr); }

		for (let i = 0; i < arr.length; i++) {
			let item = this.items[i];
			let val = arr[i];
			if (!EmptyFunc(val)) {
				addLabel(item, val, { fz: 60, fg: colors[val] });
			} else item.label = val;
			//item.label = arr[i];

		}
	}
	clear() {
		for (const item of this.items) {
			let dLabel = iLabel(item);
			if (isdef(dLabel)) { removeLabel(item); item.label = null; }
		}
	}
}

//#endregion

//#region expand and reduce board (perlen 1. version)
function reduceBoard(board, rNew, cNew, iModify) {
	//console.log(board.rows,board.cols, 'iModify',iModify)
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];

	//console.log('boardArrOld',boardArrOld)

	let rest = [];
	if (rOld > rNew) { rest = bGetRow(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	else if (cOld > cNew) { rest = bGetCol(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	//console.log('restPerlen', rest)

	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iModify) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			// else if (x == iModify) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r + 1, c] : [r, c + 1];

				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				//console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: rest };
}
function expandBoard(board, rNew, cNew, iInsert) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];

	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (x == iInsert) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r - 1, c] : [r, c - 1];

				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
				//console.log('TRANFER!!!', boardArrOld[iOld]);
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: [] };

}
function insertColNew(board, cClick) { return expandBoard(board, board.rows, board.cols + 1, cClick + 1); }
function insertRowNew(board, cClick) { return expandBoard(board, board.rows + 1, board.cols, cClick + 1); }
function removeColNew(board, cClick) { return reduceBoard(board, board.rows, board.cols - 1, cClick); }
function removeRowNew(board, cClick) { return reduceBoard(board, board.rows - 1, board.cols, cClick); }
//#endregion

function getCenters(layout, rows, cols, wCell, hCell,) {
	if (layout == 'quad') { return quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { return hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { return circleCenters(rows, cols, wCell, hCell); }
}
function getCentersFromAreaSize(layout, wBoard, hBoard, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function getCentersFromRowsCols(layout, rows, cols, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function quadCenters(rows, cols, wCell, hCell) {
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let x = 0; y = 0;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let center = { x: x + offX, y: y + offY };
			centers.push(center);
			x += wCell;
		}
		y += hCell; x = 0;
	}
	//last,x,y+offX,offY 	
	return [centers, wCell * cols, hCell * rows];
}
function circleCenters(rows, cols, wCell, hCell) {
	//find center
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;

	//console.log('cx,cy', cx, cy)

	let centers = [{ x: cx, y: cy }];

	//calc wieviele schichten sich ausgehen?
	let rx = cx + wCell / 2; let dradx = rx / wCell;
	let ry = cy + hCell / 2; let drady = ry / hCell;
	let nSchichten = Math.floor(Math.min(dradx, drady));
	//console.log('Schichten', nSchichten)

	for (let i = 1; i < nSchichten; i++) {
		let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
		//console.log('newCenters',newCenters,'w',wsch,'h',hsch);//,'\n',newCenters.centers.length);
		for (const nc of newCenters) {
			//console.log('adding point',nc);
			centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
		}
	}
	return [centers, wCell * cols, hCell * rows];
}
function cCircle(c, sz, n, disp = -90) {
	//disp=0 would be starting from east for flat hex!
	//return starting from north towards NW in clockwise order, n equidistant points along circle with center c and diameter sz
	let rad = sz / 2;
	centers = getEllipsePoints(rad, rad, n, disp)
	centers = centers.map(pt => ({ x: pt.X + c.x, y: pt.Y + c.y }));
	return centers;
}
function oneCircleCenters(rows, cols, wCell, hCell) {
	//find center
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;

	//console.log('cx,cy',cx,cy)

	let centers = [{ x: cx, y: cy }];


	//wieviele will ich placen?
	let n = 8;
	//was ist radius?
	let radx = cx - wCell / 2;
	let rady = cy - hCell / 2;

	//console.log('radx,rady',radx,rady)

	let peri = Math.min(radx, rady) * 2 * Math.PI;
	//console.log('.............n',n)
	n = Math.floor(peri / Math.min(wCell, hCell));
	//console.log('.............n',n)
	while (n > 4 && n % 4 != 0 && n % 6 != 0) n -= 1;
	//console.log('.............n',n)

	centers = getEllipsePoints(radx, rady, n)
	centers = centers.map(pt => ({ x: pt.X + cx, y: pt.Y + cy }));

	return [centers, wCell * cols, hCell * rows];
}

//#region hex: colarr stuff!
function hexCenters(rows, cols, wCell = 100, hCell) {
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let startSmaller = Math.floor(rows / 2) % 2 == 1;

	let x = 0; y = 0;
	for (let r = 0; r < rows; r++) {
		let isSmaller = startSmaller && r % 2 == 0 || !startSmaller && r % 2 == 1;
		let curCols = isSmaller ? cols - 1 : cols;
		let dx = isSmaller ? wCell / 2 : 0;
		dx += offX;
		for (let c = 0; c < curCols; c++) {
			let center = { x: dx + c * wCell, y: offY + r * hline };
			centers.push(center);
		}
	}
	return [centers, wCell * cols, hCell / 4 + rows * hline];
}
function _calc_hex_col_array_old(rows, cols) {
	let colarr = []; //how many cols in each row
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (i < (rows - 1) / 2) cols += 1;
		else cols -= 1;
	}
	return colarr;
}
function _calc_hex_col_array(rows, cols) {
	let colarr = []; //how many cols in each row
	//let b = (rows - 1) / 2; //Math.floor(rows/2);
	let even = rows % 2 == 0;

	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (even && i < (rows / 2) - 1) cols += 1;
		else if (even && i > rows / 2) cols -= 1;
		else if (!even && i < (rows - 1) / 2) cols += 1;
		else if (!even || i >= (rows - 1) / 2) cols -= 1;
	}
	return colarr;
}
function fillColarr(colarr, items) {
	//eg  colarr=[2,4,3], items:[a,b,c,d,e,f,g,h,i] =>returns [[a,b],[c,d,e,f],[g,h,i]]
	let i = 0;
	let result = [];
	for (const r of colarr) {
		let arr = [];
		for (let c = 0; c < r; c++) {
			arr.push(items[i]); i++;
		}
		result.push(arr);
	}
	return result;

}

function hex1Count(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let total = 0;
	for (let r = 0; r < colarr.length; r++) { total += colarr[r]; }
	return total;
}
function hex1Indices(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let iStart = Math.floor(rows / 2);
	let inc = -1;
	let res = [];
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let icol = iStart + 2 * c;
			let irow = r;
			res.push({ row: irow, col: icol });
		}
		if (iStart == 0) inc = 1;
		iStart += inc;
	}
	return res;
}

function hex1Centers(rows, cols, wCell = 100, hCell = null) {
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
	//rows = 7, cols = 6;
	let colarr = _calc_hex_col_array(rows, cols);
	//console.log('colarr', colarr);
	let maxcols = arrMax(colarr);
	//calc x offset of row: (maxcols-colarr[i])*wCell/2
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];

	let x = 0; y = 0;
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let dx = (maxcols - n) * wCell / 2;
			let dy = r * hline;
			let center = { x: dx + c * wCell + offX, y: dy + offY };
			centers.push(center);
		}
	}
	//console.log(centers)
	return [centers, wCell * maxcols, hCell / 4 + rows * hline];
}

function hex1Board(dParent, rows, topcols, styles = {}) {
	let g = new UIGraph(dParent, styles);
	let [w, h] = [valf(lookup(styles, ['node', 'w']), 50), valf(lookup(styles, ['node', 'h']), 50)];
	//let [rows, topcols] = [5, 3];
	let total = hex1Count(rows, topcols);
	//console.log('for rows', rows, 'and cols', topcols, 'need', total, 'nodes')
	let nids = g.addNodes(total);
	g.hex1(rows, topcols, w + 4, h + 4);
	let indices = hex1Indices(rows, topcols);
	//console.log('indices', indices);
	//correct, jetzt soll jeder node die bekommen!
	let ids = g.getNodeIds();
	//console.log('node ids:', ids);
	//return;
	let di = {};
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		lookupSet(di, [row, col], id);
		g.setProp(id, 'row', row);
		g.setProp(id, 'col', col);
		g.setProp(id, 'label', `${row},${col}`);
		//g.setStyle(id, 'label', 'data(label)');
	}
	//let labels=g.getNodes().map(x=>x.data().label);
	//console.log('labels',labels);
	//let label=g.cy.getElementById(ids[1]).data('label');

	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		let nid2 = lookup(di, [row, col + 2]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col - 1]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col + 1]); if (nid2) g.addEdge(id, nid2);
	}

	//let deg=g.getDegree(ids[1]); //cy.getElementById(ids[1]).data('label');
	//let deg1=g.getDegree(ids[10]); //cy.getElementById(ids[1]).data('label');
	//let deg2=g.getDegree(ids[18]); //cy.getElementById(ids[1]).data('label');
	//console.log('das geht: label',label,deg,deg1,deg2);

	let byrc = {};
	for (const r in di) {
		byrc[r] = {};
		for (const c in di[r]) {
			byrc[r][c] = g.getNode(di[r][c]).data();
		}
	}
	g.di = di;
	g.byrc = byrc;
	g.rc = (i, j, f) => (isdef(f)) ? f(g.getNode(di[i][j])) : g.getNode(di[i][j]);
	return g;
}

function catanBoard(dParent, rows, topcols, styles = {}) {
	let g = hex1Board(dParent, rows, topcols, styles);
	hexCornerNodes(g);

}
function correctPolys(polys, approx = 10) {
	//console.log('citySize', citySize, 'approx', approx);
	let clusters = [];
	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					//console.log('diff', dx, dy);
					if (dx < approx && dy < approx) {
						//console.log('FOUND X!!!', dx,dy);
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				clusters.push([pt]);
			}
		}
	}

	//now all points of all polys are in clusters
	//go through clusters, computer mean for all points in a clusters
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}

	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}

function getCornerVertices(centers, w = 100, h = 100) {
	let polys = [];
	for (const pt of centers) {
		let poly = getHexPoly(pt.x, pt.y, w, h);
		polys.push(poly);
	}
	let vertices = correctPolys(polys, 1);
	return vertices;
}
function hexCornerNodes(g) {
	let nodes = g.getNodes();
	let centers = nodes.map(x => x.data('center'));
	let vertices = getCornerVertices(centers);

	//now create points for unique vertices!
	//danach muss ich noch das neighborhood machen
	for (const f of nodes) {
		let center = f.data('center');
		console.log('center', center)

	}

}

function makeEdge(dParent, v1, v2, dFromEdge, ew = 20) {

	let switched = false;
	if (v1.x == v2.x) {
		if (v1.y > v2.y) { let h = v2; v2 = v1; v1 = h; switched = true; }
		let w = ew / 2;
		let sp = `polygon(${v1.x - w + ew}px ${v1.y + dFromEdge + ew}px, ${v1.x + w + ew}px ${v1.y + dFromEdge + ew}px, ${v2.x + w + ew}px ${v2.y - dFromEdge + ew}px, ${v2.x - w + ew}px ${v2.y - dFromEdge + ew}px)`;
		let de = mDiv(dParent, { position: 'absolute', left: -ew, top: -ew, w: '120%', h: '120%' });
		mClass(de, 'edge');
		mStyle(de, { 'clip-path': sp });
		return mItem(null, { div: de }, { type: 'edge' },true);
	}
	if (v1.x > v2.x) { let h = v2; v2 = v1; v1 = h; switched = true; }

	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y;

	let m = dy / dx;
	let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];

	let alpha = Math.atan(m);

	let xa = x1 + dFromEdge * Math.cos(alpha);
	let ya = y1 + dFromEdge * Math.sin(alpha);

	let xe = x2 - dFromEdge * Math.cos(alpha);
	let ye = y2 - dFromEdge * Math.sin(alpha);

	let m2 = -1 / m;
	let beta = Math.atan(m2);

	let w = ew / 2;
	let x1t = xa + w * Math.cos(beta);
	let y1t = ya + w * Math.sin(beta);
	let x1b = xa - w * Math.cos(beta);
	let y1b = ya - w * Math.sin(beta);

	let x2t = xe + w * Math.cos(beta);
	let y2t = ye + w * Math.sin(beta);
	let x2b = xe - w * Math.cos(beta);
	let y2b = ye - w * Math.sin(beta);

	let de = mDiv(dParent, { position: 'absolute', left: 0, top: 0, w: '120%', h: '120%' });
	mStyle(de, { 'clip-path': `polygon(${x1t}px ${y1t}px, ${x2t}px ${y2t}px, ${x2b}px ${y2b}px, ${x1b}px ${y1b}px)` });
	mClass(de, 'edge');
	return mItem(null, { div: de }, { type: 'edge' },true);
}
function neighborhood(items, byrc) {
	let adjList = [];
	let di = {};
	for (const info of items) {

		if (info.type != 'field') continue;
		//nodes from north! null if dont exist
		let [r, c] = [info.row, info.col];
		//nodes for each field
		info.nodeItems = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r - 1, c - 1]),
		];
		info.nodes = info.nodeItems.map(x => isdef(x) ? x.id : null);
		delete info.nodeItems;

		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neiItems = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];
		info.nei = info.neiItems.map(x => isdef(x) ? x.id : null);
		delete info.neiItems;

	}

}
function addRowsCols(items) {
	let byrc = {};

	let byx = sortBy(items, 'x');
	let c = 0, x = byx[0].x;
	for (let i = 0; i < byx.length; i++) {
		let item = byx[i];
		if (!isCloseTo(item.x, x, 2)) { c += 1; x = item.x; }
		item.col = c;
	}

	let byy = sortBy(items, 'y');
	let r = 0, y = byy[0].y;
	for (let i = 0; i < byy.length; i++) {
		let item = byy[i];
		if (!isCloseTo(item.y, y, 2)) { r += 1; y = item.y; }
		item.row = r;
		lookupSet(byrc, [item.row, item.col], item);
	}

	return byrc;
}


//#endregion hex

//#region mGraph


class AGraph {
	constructor() {
		this.init(...arguments);
		this.posDict = {};
	}
	init() {
		let defOptions = {
			maxZoom: 1,
			minZoom: .001,
			motionBlur: false,
			// wheelSensitivity: 0.05,
			zoomingEnabled: false,
			userZoomingEnabled: false,
			panningEnabled: false,
			userPanningEnabled: false,
			boxSelectionEnabled: false,
			layout: { name: 'preset' },
			elements: [],
		};

		this.cy = cytoscape(defOptions);
	}
	clear() { this.cy.destroy(); }

	//#region access and algos
	getComponents() { return this.cy.elements().components(); }
	getComponentIds() { return this.cy.elements().components().map(x => x.id()); }
	getCommonEdgeId(nid1, nid2) { return nid1 + '_' + nid2; }
	getNumComponents() { return this.cy.elements().components().length; }
	getNode(id) { return this.cy.getElementById(id); }
	getEdge(id) { return this.cy.getElementById(id); }
	getNodes() { return this.cy.nodes(); }
	getNodeIds() { return this.cy.nodes().map(x => x.id()); }
	getNodeData() { return this.cy.nodes().map(x => x.data()); }
	getNodePositions() { return this.cy.nodes.map(x => x.position()); }
	getEdges() { return this.cy.edges(); }
	getEdgeIds() { return this.cy.edges().map(x => x.id()); }
	getPosition(id) {
		let node = this.getNode(id);
		let pos = node.renderedPosition();
		//console.log('node', node, pos);
		return pos; //this.cy.getElementById(id).renderedPosition();
	}
	getSize(id) {
		let node = this.getNode(id);
		let pos = node.bb();//renderedBoundingBox();
		//console.log('node', node, pos);
		return pos; //this.cy.getElementById(id).renderedPosition();

	}
	getProp(id, prop) { return this.cy.getElementById(id).data(prop); }
	getDegree(id) { return this.cy.getElementById(id).degree(); }
	getNodeWithMaxDegree(idlist) {
		if (nundef(idlist)) idlist = this.cy.elements().filter('node').map(x => x.data().id);
		let imax = arrMinMax(idlist, x => this.getDegree(x)).imax;
		let id = idlist[imax];
		return id;
	}
	getShortestPathsFrom(id) { let res = this.cy.elements().dijkstra('#' + id); return res; }
	getShortestPathFromTo(nid1, nid2) {
		//console.log(nid1, nid2)
		let funcs = this.dijkstra = this.getShortestPathsFrom(nid1);
		// let len = funcs.distanceTo('#' + nid2);
		let path = funcs.pathTo('#' + nid2);
		return path;

	}
	getLengthOfShortestPath(nid1, nid2) {
		let funcs = this.dijkstra = this.getShortestPathsFrom(nid1);
		let len = funcs.distanceTo('#' + nid2);
		//let path = funcs.pathTo('#' + nid2);
		return len;
	}
	setPositionData(prop = 'center') {
		let ids = this.getNodeIds();
		for (const id of ids) {
			let pos = this.getProp(id, prop);
			if (isdef(pos)) this.setPosition(id, pos.x, pos.y);
			else return false;
		}
		return true;
	}
	sortNodesByDegree(idlist, descending = true) {
		//console.log('idlist',idlist)
		if (nundef(idlist)) idlist = this.cy.nodes.map(x => x.data().id);
		// if (nundef(idlist)) idlist = this.cy.elements().filter('node').map(x => x.data().id);
		let nodes = idlist.map(x => this.getNode(x));
		for (const n of nodes) {
			n.degree = this.getDegree(n.id());
			//console.log('id',n.id(),'has degree',n.degree);
		}
		if (descending) sortByDescending(nodes, 'degree'); else sortBy(nodes, 'degree');
		return nodes;
	}
	storeCurrentPositions(prop = 'center') {
		for (const n of this.getNodes()) {
			let id = n.id();
			//console.log('id', id);
			let pos = this.getPosition(id);
			//console.log('current pos', id, pos);
			this.setProp(id, prop, pos);
			//console.log('new val', this.getProp(id, prop));
		}
	}
	//#endregion

	//#region add/remove nodes, edges
	addNode(data, coords) {
		if (nundef(data)) data = {};
		if (nundef(data.id)) data.id = getFruid();
		if (isdef(coords)) {
			coords.x -= this.cy.pan().x;
			coords.y -= this.cy.pan().y;
		} else { coords = { x: 0, y: 0 }; }
		var ele = this.cy.add({
			group: 'nodes',
			data: data,
			position: coords
		});
		return ele.id();
	}
	addNodes(n, datalist, coordlist) {
		let ids = [];
		if (nundef(datalist)) datalist = new Array(n).map(x => ({ id: getFruid() }));
		if (nundef(coordlist)) coordlist = new Array(n).map(x => ({ coords: { x: 0, y: 0 } }));
		for (let i = 0; i < n; i++) {
			let id = this.addNode(datalist[i], coordlist[i]);
			ids.push(id);
		}
		return ids;
	}
	addEdge(nid1, nid2, data) {
		//console.log('addEdge',nid1,nid2,data)
		if (nundef(data)) data = {};
		data.id = this.getCommonEdgeId(nid1, nid2);

		data.source = nid1;
		data.target = nid2;
		var ele = this.cy.add({
			group: 'edges',
			data: data,
		});
		return ele.id();
	}
	addEdges(nOrNodePairList) {
		//nodePairList should be of the form: [[nid1,nid2], ...]
		if (isNumber(nOrNodePairList)) {
			//make n random nodes!
			let nids = this.getNodeIds();
			let prod = arrPairs(nids);
			nOrNodePairList = choose(prod, nOrNodePairList);
		}
		let res = [];
		for (const pair of nOrNodePairList) {
			res.push(this.addEdge(pair[0], pair[1]));
		}
		return res;
	}
	removeNode(node) { this.removeElement(node); return this.getNodeIds(); }
	removeEdge(edge) { this.removeElement(edge); return this.getEdgeIds(); }
	removeElement(ne) { if (!isString(ne)) ne = ne.id(); this.cy.getElementById(ne).remove(); }
	//#endregion

	//#region modify nodes, edges (data, position...)
	setPosition(id, x, y) { this.cy.getElementById(id).position({ x: x, y: y }); }

	setProp(id, prop, val) { this.cy.getElementById(id).data(prop, val); }

	//#endregion

}
class UIGraph extends AGraph {

	init(dParent, styles = {}) {
		//console.log('dParent', dParent)
		let defOptions = {
			maxZoom: 1,
			minZoom: .001,
			motionBlur: false,
			wheelSensitivity: 0.05,
			zoomingEnabled: true,
			userZoomingEnabled: true,
			panningEnabled: true,
			userPanningEnabled: true,
			boxSelectionEnabled: false,
			elements: [],
		};

		this.id = getUID();
		let dOuter = mDiv(dParent, styles.outer, this.id);//, 'Outer graph');
		let gStyles = valf(styles.inner, { w: 640, h: 420 });
		let dContainer = mDiv(dOuter, { position: 'relative', w: gStyles.w, h: gStyles.h, align: 'left' });

		let styleDict = {
			node: { 'label': 'data(label)', width: 25, height: 25, 'background-color': 'red', color: "#fff", "text-valign": "center", "text-halign": "center" },
			edge: { width: 2, 'line-color': 'silver', 'curve-style': 'haystack', },
			'node.high': { 'background-color': 'yellow' },
			'node.trans': { opacity: '0.5' },
		}
		for (const ks of ['node', 'edge', 'node.high', 'node.trans']) {
			if (isdef(styles[ks])) {
				let mStyles = styles[ks];
				let cyStyles = translateStylesToCy(mStyles, ks);
				copyKeys(cyStyles, styleDict[ks]);
				// console.log('style dict', styles[ks])
				// for (const k in styles[ks]) {
				// 	mStyleToCy(k, styles[ks][k], styleDict[ks]);
				// }
			}
		}
		let cyStyle = [];
		for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }

		let options = { container: dContainer, style: cyStyle };
		copyKeys(options, defOptions);

		this.cy = cytoscape(defOptions);
		iAdd(this, { div: dOuter, dCy: dContainer });

	}
	//#region layouts
	hex(rows, cols, wCell, hCell) {

		let centers = this.hexPositions = getCentersFromRowsCols('hex', rows, cols, wCell, hCell)[0];
		//console.log('centers', centers);
		this.storePositions('hex', centers);
		this.storePositions('preset', centers);

		//jetzt retrieve
		this.retrievePositions('hex');
		this.cy.layout({ name: 'preset' }).run();
		this.center();
		//for (const n of this.cy.nodes()) { n.position(centers.x, centers.y); }

	}
	hex1(rows, cols, wCell, hCell) {

		let centers = this.hexPositions = getCentersFromRowsCols('hex1', rows, cols, wCell, hCell)[0];
		//console.log('centers', centers);
		//centers = centers.map(pt=>{return {x:pt.y,y:pt.x};});
		this.storePositions('hex1', centers);
		this.storePositions('preset', centers);
		let nodes = this.getNodes();
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			let center = centers[i];
			node.data('center', center);
		}

		//jetzt retrieve
		this.retrievePositions('hex1');
		this.cy.layout({ name: 'preset' }).run();
		this.center();
		//for (const n of this.cy.nodes()) { n.position(centers.x, centers.y); }

	}
	breadthfirst() { this.cy.layout({ name: 'breadthfirst', animate: true }).run(); }
	circle() { this.cy.layout({ name: 'circle', animate: 'end' }).run(); }
	concentric() { this.cy.layout({ name: 'concentric', animate: true }).run(); }
	//cola() { this.cy.layout({ name: 'cola', animate: 'end' }).run(); }
	comcola() {
		let defaults = {
			name: 'cola',
			animate: true, // whether to show the layout as it's running
			refresh: 1, // number of ticks per frame; higher is faster but more jerky
			maxSimulationTime: 4000, // max length in ms to run the layout
			ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
			fit: true, // on every layout reposition of nodes, fit the viewport
			padding: 30, // padding around the simulation
			boundingBox: undefined, //{x1:0,y1:0,x2:200,y2:200,w:200,h:200}, //undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
			nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

			// layout event callbacks
			ready: function () { }, // on layoutready
			stop: function () { }, // on layoutstop

			// positioning options
			randomize: false, // use random node positions at beginning of layout
			avoidOverlap: true, // if true, prevents overlap of node bounding boxes
			handleDisconnected: true, // if true, avoids disconnected components from overlapping
			convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
			nodeSpacing: function (node) { return 10; }, // extra spacing around nodes
			flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
			alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
			gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

			// different methods of specifying edge length
			// each can be a constant numerical value or a function like `function( edge ){ return 2; }`
			edgeLength: undefined, // sets edge length directly in simulation
			edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
			edgeJaccardLength: undefined, // jaccard edge length in simulation

			// iterations of cola algorithm; uses default values on undefined
			unconstrIter: undefined, // unconstrained initial layout iterations
			userConstIter: undefined, // initial layout iterations with user-specified constraints
			allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

			// infinite layout options
			infinite: false // overrides all other options for a forces-all-the-time mode
		};
		let options = {
			name: 'cola',
			convergenceThreshold: 100,
			// padding: 25,
			// nodeSpacing: 5,
			// edgeLengthVal: 2,
			// animate: true,
			// randomize: false,
			// maxSimulationTime: 1500,
			// ready: this.reset.bind(this),
			// flow: null,
			boundingBox: { x1: 20, y1: 20, w: 200, h: 200 },
		};
		copyKeys(options, defaults);
		console.log(defaults.boundingBox)
		this.cy.layout(defaults).run();
	}
	cola() { this.cy.layout({ name: 'cola' }).run(); }
	cose() { this.cy.layout({ name: 'cose', animate: 'end' }).run(); }
	// dagre() { this.cy.layout({ name: 'dagre', fit: true, padding: 25, animate: 'end' }).run(); }
	euler() { this.cy.layout({ name: 'euler', fit: true, padding: 25, animate: 'end' }).run(); }
	fcose() {
		var defaultOptions = {

			// 'draft', 'default' or 'proof' 
			// - "draft" only applies spectral layout 
			// - "default" improves the quality with incremental layout (fast cooling rate)
			// - "proof" improves the quality with incremental layout (slow cooling rate) 
			quality: "default",
			// Use random node positions at beginning of layout
			// if this is set to false, then quality option must be "proof"
			randomize: true,
			// Whether or not to animate the layout
			animate: true,
			// Duration of animation in ms, if enabled
			animationDuration: 500,
			// Easing of animation, if enabled
			animationEasing: undefined,
			// Fit the viewport to the repositioned nodes
			fit: true,
			// Padding around layout
			padding: 30,
			// Whether to include labels in node dimensions. Valid in "proof" quality
			nodeDimensionsIncludeLabels: false,
			// Whether or not simple nodes (non-compound nodes) are of uniform dimensions
			uniformNodeDimensions: false,
			// Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
			packComponents: true,
			// Layout step - all, transformed, enforced, cose - for debug purpose only
			step: "all",

			/* spectral layout options */

			// False for random, true for greedy sampling
			samplingType: true,
			// Sample size to construct distance matrix
			sampleSize: 25,
			// Separation amount between nodes
			nodeSeparation: 75,
			// Power iteration tolerance
			piTol: 0.0000001,

			/* incremental layout options */

			// Node repulsion (non overlapping) multiplier
			nodeRepulsion: node => 4500,
			// Ideal edge (non nested) length
			idealEdgeLength: edge => 50,
			// Divisor to compute edge forces
			edgeElasticity: edge => 0.45,
			// Nesting factor (multiplier) to compute ideal edge length for nested edges
			nestingFactor: 0.1,
			// Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
			numIter: 2500,
			// For enabling tiling
			tile: true,
			// Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingVertical: 10,
			// Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
			tilingPaddingHorizontal: 10,
			// Gravity force (constant)
			gravity: 0.25,
			// Gravity range (constant) for compounds
			gravityRangeCompound: 1.5,
			// Gravity force (constant) for compounds
			gravityCompound: 1.0,
			// Gravity range (constant)
			gravityRange: 3.8,
			// Initial cooling factor for incremental layout  
			initialEnergyOnIncremental: 0.3,

			/* constraint options */

			// Fix desired nodes to predefined positions
			// [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
			fixedNodeConstraint: undefined,
			// Align desired nodes in vertical/horizontal direction
			// {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
			alignmentConstraint: undefined,
			// Place two nodes relatively in vertical/horizontal direction
			// [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
			relativePlacementConstraint: undefined,

			/* layout event callbacks */
			ready: () => { }, // on layoutready
			stop: () => { }, // on layoutstop
			name: 'fcose',
		};
		this.cy.layout(defaultOptions).run(); //{name: 'fcose'}).run(); 
	}
	gridLayout() { this.cy.layout({ name: 'grid', animate: true }).run(); }
	presetLayout_dep() {
		let hasCenterProp = this.setPositionData();

		if (!hasCenterProp) {
			console.log('no positions are preset: store first!');
		} else {
			let options = {
				name: 'preset',
				positions: undefined, //function (n){return this.getNode(n.id()).data().center;}, //this.posDict, //undefined, // undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
				zoom: undefined, // the zoom level to set (prob want fit = false if set)
				pan: undefined, // the pan level to set (prob want fit = false if set)
				fit: true, // whether to fit to viewport
				padding: 30, // padding on fit
				animate: true, // whether to transition the node positions
				animationDuration: 500, // duration of animation in ms if enabled
				animationEasing: undefined, // easing of animation if enabled
				animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
				ready: undefined, // callback on layoutready
				stop: undefined, // callback on layoutstop
				transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
			};
			this.cy.layout(options);
			this.reset();
		}
	}
	presetLayout() {
		this.retrievePositions('prest');
		this.cy.layout({ name: 'preset' }).run();
		this.center();
	}
	randomLayout() { this.cy.layout({ name: 'random', animate: 'true' }).run(); }
	klay() {
		let klayDefaults = {
			// Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
			addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
			aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
			borderSpacing: 20, // Minimal amount of space to be left to the border
			compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
			crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
			/* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
			INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
			/* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
			INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
			direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
			/* UNDEFINED, RIGHT, LEFT, DOWN, UP */
			edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
			edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
			feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
			fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
			/* NONE Chooses the smallest layout from the four possible candidates.
			LEFTUP Chooses the left-up candidate from the four possible candidates.
			RIGHTUP Chooses the right-up candidate from the four possible candidates.
			LEFTDOWN Chooses the left-down candidate from the four possible candidates.
			RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
			BALANCED Creates a balanced layout from the four possible candidates. */
			inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
			layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
			linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
			mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
			mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
			nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
			/* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
			LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
			INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
			nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
			/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
			LINEAR_SEGMENTS Computes a balanced placement.
			INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
			SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
			randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
			routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
			separateConnectedComponents: true, // Whether each connected component should be processed separately
			spacing: 20, // Overall setting for the minimal amount of space to be left between objects
			thoroughness: 7 // How much effort should be spent to produce a nice layout..
		};

		var options = {
			nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
			fit: true, // Whether to fit
			padding: 20, // Padding on fit
			animate: true, // Whether to transition the node positions
			animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
			animationDuration: 500, // Duration of animation in ms if enabled
			animationEasing: undefined, // Easing of animation if enabled
			transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
			ready: this.reset.bind(this), // Callback on layoutready
			stop: undefined, // Callback on layoutstop
			klay: {
				addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
				aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
				borderSpacing: 20, // Minimal amount of space to be left to the border
				compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
				crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
				cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
				direction: 'UNDEFINED', // Overall direction of edges: /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
				edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
				edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
				feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
				fixedAlignment: 'NONE', // node placer alignment: NONE | LEFTUP | RIGHTUP | LEFTDOWN | RIGHTDOWN | BALANCED
				inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
				layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
				linearSegmentsDeflectionDampening: 0.3,// 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
				mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
				mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
				nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering NETWORK_SIMPLEX (expensive!) | LONGEST_PATH | INTERACTIVE comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
				nodePlacement: 'INTERACTIVE', // Strategy for Node Placement BRANDES_KOEPF | LINEAR_SEGMENTS | INTERACTIVE | SIMPLE
				/* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
				LINEAR_SEGMENTS Computes a balanced placement.
				INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
				SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
				randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
				routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
				separateConnectedComponents: true, // Whether each connected component should be processed separately
				spacing: 20, // Overall setting for the minimal amount of space to be left between objects
				thoroughness: 3 // How much effort should be spent to produce a nice layout..
			},
			name: 'klay',

			priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
		};
		this.cy.layout(options).run();
	}
	retrievePositions(key) {
		if (nundef(key)) key = 'prest';
		let di = this.posDict[key];
		for (const n of this.getNodes()) {
			let id = n.id();
			let pos = di[id];
			if (isdef(pos)) this.setPosition(id, pos.x, pos.y);
		}
	}
	storePositions(key, poslist = []) {
		//console.log('positions', poslist)
		if (nundef(key)) key = 'prest';
		this.posDict[key] = {};
		let i = 0;
		for (const n of this.getNodes()) {
			let id = n.id();
			let pos = valf(poslist[i], this.getPosition(id));
			i += 1;
			this.posDict[key][id] = pos;
		}
	}
	storeSizes(key, poslist = []) {
		if (nundef(key)) key = 'size';
		this.posDict[key] = {};
		let i = 0;
		for (const n of this.getNodes()) {
			let id = n.id();
			let pos = valf(poslist[i], this.getSize(id));
			i += 1;
			this.posDict[key][id] = pos;
		}
	}
	//#endregion

	//#region zoom pan fit center
	fit() { this.cy.fit(); }
	center() { this.cy.center(); } //console.log('bb:', this.cy.elements().bb()); }
	reset() { this.pan0(); this.zoom1(); this.center(); this.fit(); }
	pan0() { this.cy.pan({ x: 0, y: 0 }); }
	zoom1() { this.cy.zoom(1); }

	isPan() { return this.cy.panningEnabled(); }
	isZoom() { return this.cy.zoomingEnabled(); }
	enablePanZoom() { this.pan(true); this.zoom(true); }
	pan(isOn, reset = true) {
		this.cy.panningEnabled(isOn);
		this.cy.userPanningEnabled(isOn);
		if (!isOn && reset) { this.pan0(); this.center(); }
	}
	zoom(isOn, minZoom = .25, maxZoom = 1, reset = true) {
		this.cy.zoomingEnabled(isOn);
		this.cy.userZoomingEnabled(isOn);
		if (!isOn && reset) { this.zoom1(); this.center(); }
		else if (isOn) { this.cy.minZoom(minZoom); this.cy.maxZoom(maxZoom); }
	}
	//#endregion

	setSizeToContent() {
		this.cy.zoomingEnabled(false);
		this.updateBounds();

	}
	updateBounds() {
		var bounds = this.cy.elements().boundingBox();
		let dContainer = this.live.dCy;
		dContainer.css('height', bounds.h + 100);
		dContainer.css('width', bounds.w + 100);
		this.cy.center();
		this.cy.resize();
		//fix the Edgehandles
		dContainer.cytoscapeEdgehandles('resize');
	}

	//#region UI functions
	enableDD() { this.enableDragging(); }
	disableDD() { this.disableDragging(); }
	enableDragging() { this.cy.nodes().grabify(); }
	disableDragging() { this.cy.nodes().ungrabify(); }

	showGraph() { }
	showControls(dWhere, lWhich) {
		if (!this.hasControls) this.addLayoutControls(dWhere, lWhich);

		if (nundef(dWhere)) dWhere = iDiv(this);

	}
	showExtent() { let bb = this.cy.elements().bb(); console.log('graph size:', bb.w, bb.h); }
	showSize() { this.showExtent(); }
	hideGraph() { }
	hideControls() { }
	mount() { }
	unmount() { }

	//old API: weg damit!!!
	closeLayoutControls() { if (isdef(this.sb)) hide(this.sb); }
	addLayoutControls(dParent, buttonlist) {
		if (nundef(dParent)) dParent = iDiv(this);
		let buttons = {
			BFS: mButton('BFS', () => this.breadthfirst(), dParent, {}, ['tbb']),
			circle: mButton('circle', () => this.circle(), dParent, {}, ['tbb']),
			CC: mButton('CC', () => this.concentric(), dParent, {}, ['tbb']),
			cola: mButton('cola', () => this.comcola(), dParent, {}, ['tbb']),
			cose: mButton('cose', () => this.cose(), dParent, {}, ['tbb']),
			// dagre: mButton('dagre', () => this.dagre(), sb, {}, ['tbb']),
			euler: mButton('euler', () => this.euler(), dParent, {}, ['tbb']),
			fcose: mButton('fcose', () => this.fcose(), dParent, {}, ['tbb']),
			grid: mButton('grid', () => this.gridLayout(), dParent, {}, ['tbb']),
			klay: mButton('klay', () => this.klay(), dParent, {}, ['tbb']),
			prest: mButton('prest', () => this.presetLayout(), dParent, {}, ['tbb']),
			rand: mButton('rand', () => this.randomLayout(), dParent, {}, ['tbb']),
			center: mButton('center', () => this.center(), dParent, {}, ['tbb']),
			fit: mButton('fit', () => this.fit(), dParent, {}, ['tbb']),
			reset: mButton('reset', () => this.reset(), dParent, {}, ['tbb']),
			show: mButton('show', () => this.showGraph(), dParent, {}, ['tbb']),
			hide: mButton('hide', () => this.hideGraph(), dParent, {}, ['tbb']),
			store: mButton('store', () => this.storeCurrentPositions(), dParent, {}, ['tbb']),
		};
		for (const b in buttons) {
			if (isdef(buttonlist) && !buttonlist.includes(b)) hide(buttons[b]);
		}
		return buttons;
	}
	addVisual(dParent, styles = {}) {

		if (this.hasVisual) return;
		this.hasVisual = true;
		this.id = nundef(dParent.id) ? getUID() : dParent.id;
		// mIfNotRelative(dParent);

		let styleDict = {
			node: { 'width': 25, 'height': 25, 'background-color': 'red', "color": "#fff", 'label': 'data(id)', "text-valign": "center", "text-halign": "center", },
			edge: { 'width': 2, 'line-color': 'silver', 'curve-style': 'haystack', },
			'node.highlight': { 'background-color': 'yellow' },
			'node.trans': { 'opacity': '0.5' },
		}
		for (const ks of ['node', 'edge', 'node.highlight', 'node.trans']) {
			if (isdef(styles[ks])) {
				for (const k in styles[ks]) {
					let [prop, val] = translateToCssStyle(k, styles[ks][k], false);
					styleDict[ks][prop] = val;
				}
			}
		}
		let cyStyle = [];
		for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }

		//let d1=
		let size = getSize(dParent);
		let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w, left: 0, top: 0, h: size.h, align: 'left' });
		// let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w - 80, left: 40, top: 0, h: size.h, align: 'left' });

		// // console.log('size',size)
		// // let dCy = mDiv(dParent, { position: 'absolute', left: 40, top: 0, w: 'calc( 100% - 80px )', h: '100%' });
		// // let dCy = mDiv(dParent, {display:'inline-block', position: 'absolute', left: 40, top: 0, w: size.w-80, h: size.h });
		this.cy.mount(d1);
		this.cy.style(cyStyle);
		// console.log('extent',g.cy.extent());
		this.enablePanZoom();
		iAdd(this, { div: dParent, dCy: d1 });
	}

	//#endregion

	//#region events
	nodeEvent(evname, handler) { this.cy.on(evname, 'node', ev => handler(ev.target)); }
	mStyle(elid, styles, group = 'node') {
		if (isString(elid)) elid = this.cy.getElementById(elid);
		let di = translateStylesToCy(styles, group);
		for (const k in di) {
			// let css = mStyleTranslate(k, styles[k]);
			elid.style(k, di[k]);
		}

	}
	setLabel(id, label, styles) {
		let ele = this.cy.getElementById(id);
		ele.data('label', label);
		this.mStyle(id, styles, isdef(this.getNode(id)) ? 'node' : 'edge');

	}
	setStyle(elid, prop, val) {
		if (isString(elid)) elid = this.cy.getElementById(elid);
		//console.log('elid', prop, val)
		elid.style(prop, val);
	}
	setClass(elid, className) {
		if (isString(elid)) elid = this.cy.getElementById(elid);
		//console.log('elid', className, val)
		elid.class(className);
	}
	//#endregion
}
class MazeGraph extends AGraph {
	constructor(dParent, rows, cols, sz, gap = 4) {
		super();

		[this.cols, this.rows, this.sz, this.gap] = [cols, rows, sz, gap];
		let m = this.m = this.createMaze(cols, rows, sz, gap);
		let dMaze = this.dMaze = this.createDiv(dParent, cols, rows, sz, gap);

		let szMaze = getSize(dMaze);
		let dGraph = this.dGraph = mDiv(dParent, { align:'left', w: szMaze.w, h: szMaze.h, bg: 'pink', maleft: 20},'d_graph');//, opacity: 0 });
		this.mazeId = dGraph.id = getUID();
		
		let sb = this.sb = mDiv(dParent, { w: 40 }); mCenterCenterFlex(this.sb);
		hide(dGraph);hide(sb);

		this.items = this.createCellItems();
		//console.log('items', this.items)
	}
	clear(){super.clear(); } //dTable.firstChild.remove(); } //mBy(this.mazeId).remove();}
	getTopLeftCell() { return this.getCell(0, 0); }
	getTopRightCell() { return this.getCell(0, this.cols - 1); }
	getBottomLeftCell() { return this.getCell(this.rows - 1, 0); }
	getBottomRightCell() { return this.getCell(this.rows - 1, this.cols - 1); }

	getCell(row, col) { return this.matrix[row][col]; }// mBy(this.getCommonIdTable(row, col)); }
	getCommonId(row, col) { return '' + row + "-" + col; }
	getCommonIdTable(row, col) { return 'td_' + this.getCommonId(row, col); }
	getRCI(edgeId) {
		//edge id is of the form r1-c1_r2-c2
		let [r1, c1, r2, c2] = allNumbers(edgeId).map(x => Math.abs(x));	//console.log('r,c 1:',r1,c1,'\nr,c 2:',r2,c2);
		let i1, i2; //indices that have to be switched form 1 to 0
		i1 = r1 < r2 ? 2 : r1 > r2 ? 0 : c1 < c2 ? 1 : 3;
		i2 = i1 == 0 ? 2 : i1 == 1 ? 3 : i1 == 2 ? 0 : 1;
		return [r1, c1, i1, r2, c2, i2];
	}
	getRelativeDirections(item1, item2) {
		//edge id is of the form r1-c1_r2-c2
		let [r1, c1, r2, c2] = [item1.row, item1.col, item2.row, item2.col];//allNumbers(edgeId).map(x=>Math.abs(x));	//console.log('r,c 1:',r1,c1,'\nr,c 2:',r2,c2);
		let i1, i2; //indices that have to be switched form 1 to 0
		i1 = r1 < r2 ? 2 : r1 > r2 ? 0 : c1 < c2 ? 1 : 3;
		i2 = i1 == 0 ? 2 : i1 == 1 ? 3 : i1 == 2 ? 0 : 1;
		return [i1, i2];
	}
	createCellItems() {
		//each cellItem should contain: div:table td, sz, row, col, maze arr, id=idNode, idCell
		let items = [];
		this.matrix = [];
		for (let r = 0; r < this.rows; r++) {
			this.matrix[r] = [];
			for (let c = 0; c < this.cols; c++) {
				let id = this.getCommonId(r, c);
				let item = { id: id, nid: id, nodeId: id, cellId: this.getCommonIdTable(r, c), row: r, col: c, sz: this.sz, marr: this.m[r, c] };
				delete Items[id];
				iAdd(item, { div: mBy(this.getCommonIdTable(r, c)) });
				items.push(item);

				this.matrix[r][c] = item;
				//console.log('item', item)
			}
		}
		return items;
	}
	createDiv(dParent, cols, rows, sz, gap=1) {
		let [wCell, hCell] = [sz, sz];
		let [wTotal, hTotal] = [cols * (wCell + gap) + gap, rows * (hCell + gap) + gap];
		let dGridOuter = this.dMaze = mDiv(dParent, { wmin: wTotal, hmin: hTotal, position:'relative' });
		let m = this.m;
		let [x,y]=[0,0];
		let sBorder = `${gap}px solid black`;
		let noBorder = `${gap}px solid transparent`;
		this.dCells = [];
		for (var r = 0; r < m.length; r++) {
			x=0;
			this.dCells[r]=[];
			for (var c = 0; c < m[r].length; c++) {
				let info = m[r][c];
				let dCell = mDiv(dGridOuter,{w:wCell,h:hCell,position:'absolute',top:y,left:x,bg:'gray'});
				dCell.id = this.getCommonIdTable(r, c);
				dCell.style.borderTop = info[0] == 0? sBorder:noBorder;
				dCell.style.borderRight = info[1] == 0? sBorder:noBorder;
				dCell.style.borderBottom = info[2] == 0? sBorder:noBorder;
				dCell.style.borderLeft = info[3] == 0? sBorder:noBorder;
				x+=wCell+gap;
				this.dCells[r].push(dCell);
			}
			y+=hCell+gap;
		}
		return dGridOuter;
	}

	createDiv_orig(dParent, cols, rows, sz, gap) {
		let [wCell, hCell] = [sz, sz];
		let [wTotal, hTotal] = [cols * (wCell + gap), rows * (hCell + gap)];
		let dGridOuter = this.dMaze = mDiv(dParent, { wmin: wTotal, hmin: hTotal });

		let m = this.m;
		let id = 'tMaze';
		setCSSVariable('--wCell', `${wCell}px`);
		setCSSVariable('--hCell', `${hCell}px`);
		let tMaze = createElementFromHtml(`
			<table id="${id}">
			<tbody></tbody>
			</table>
		`);
		mAppend(dGridOuter, tMaze);
		// let sBorder = `${gap}px solid black`;
		let sBorder = `${1}px solid black`;
		for (var i = 0; i < m.length; i++) {
			$('#tMaze > tbody').append("<tr>");
			for (var j = 0; j < m[i].length; j++) {
				var selector = this.getCommonIdTable(i, j);
				$('#tMaze > tbody').append("<td id='" + selector + "'>&nbsp;</td>");
				if (m[i][j][0] == 0) { $('#' + selector).css('border-top', sBorder); }
				if (m[i][j][1] == 0) { $('#' + selector).css('border-right', sBorder); }
				if (m[i][j][2] == 0) { $('#' + selector).css('border-bottom', sBorder); }
				if (m[i][j][3] == 0) { $('#' + selector).css('border-left', sBorder); }
				//mStyle(mBy(selector), { bg: coin(30) ? 'random' : 'lightgreen' });
			}
			$('tMmaze > tbody').append("</tr>");
		}
		return dGridOuter;
	}
	createMaze(cols, rows, sz, gap) {
		// Establish variables and starting grid
		var dxy = sz + 2 * gap;
		var offs = dxy / 2 + gap;

		var totalCells = cols * rows;
		var cells = new Array();
		var unvis = new Array();
		for (var i = 0; i < rows; i++) {
			cells[i] = new Array();
			unvis[i] = new Array();
			for (var j = 0; j < cols; j++) {
				cells[i][j] = [0, 0, 0, 0];
				let pos = { x: offs + dxy * j, y: offs + dxy * i };
				this.addNode({ id: this.getCommonId(i, j), row: i, col: j, center: pos }, pos);
				unvis[i][j] = true;
			}
		}

		// Set a random position to start from
		var currentCell = [Math.floor(Math.random() * rows), Math.floor(Math.random() * cols)];
		var path = [currentCell];
		unvis[currentCell[0]][currentCell[1]] = false;
		var visited = 1;

		// Loop through all available cell positions
		while (visited < totalCells) {
			// Determine neighboring cells
			var pot = [[currentCell[0] - 1, currentCell[1], 0, 2],
			[currentCell[0], currentCell[1] + 1, 1, 3],
			[currentCell[0] + 1, currentCell[1], 2, 0],
			[currentCell[0], currentCell[1] - 1, 3, 1]];
			var neighbors = new Array();

			// Determine if each neighboring cell is in game grid, and whether it has already been checked
			for (var l = 0; l < 4; l++) {
				if (pot[l][0] > -1 && pot[l][0] < rows && pot[l][1] > -1 && pot[l][1] < cols && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
			}

			// If at least one active neighboring cell has been found
			if (neighbors.length) {
				// Choose one of the neighbors at random
				let next = neighbors[Math.floor(Math.random() * neighbors.length)];

				// Remove the wall between the current cell and the chosen neighboring cell
				cells[currentCell[0]][currentCell[1]][next[2]] = 1;
				cells[next[0]][next[1]][next[3]] = 1;

				let row = currentCell[0];
				let col = currentCell[1];
				let row2 = next[0];
				let col2 = next[1];
				this.addEdge(this.getCommonId(row, col), this.getCommonId(row2, col2), {});

				// Mark the neighbor as visited, and set it as the current cell
				unvis[next[0]][next[1]] = false;
				visited++;
				currentCell = [next[0], next[1]];
				path.push(currentCell);
			}
			// Otherwise go back up a step and keep going
			else {
				currentCell = path.pop();
			}
		}
		return cells;
	}

	setItemBorder(item, dir) {
		let prop = getBorderPropertyForDirection(dir);
		iDiv(item).style[prop] = `${this.gap}px solid black`;
		//mStyle(cell,{bg:'red'}); cell.innerHTML = dir;
	}
	setItemColor(item, color) { mStyle(iDiv(item), { bg: color }); }
	setItemContent(item, text) { iDiv(item).innerHTML = text; }
	removeItemContent(item) { iDiv(item).innerHTML = ''; }
	disconnectCells(nid1, nid2) {
		this.removeEdge(this.getCommonEdgeId(nid1, nid2));
		let [item1, item2] = [Items[nid1], Items[nid2]];
		//console.log('item1', item1, item2);

		let [dir1, dir2] = this.getRelativeDirections(item1, item2);
		// this.setItemColor(item1,'green');
		// this.setItemColor(item2,'lightgreen');
		//this.setItemContent(item1,'1');this.removeItemContent(item1);
		//console.log('directions:', dir1, dir2);
		this.setItemBorder(item1, dir1);
		this.setItemBorder(item2, dir2);
	}
	cutPath(path, min, max) {
		let edges = path.edges();
		let len = edges.length;
		let [imin, imax] = [Math.floor(len * min), Math.floor(len * max)];
		let i = randomNumber(imin, imax);
		let edge = edges[i];
		let [nid1, nid2] = edge.connectedNodes().map(x => x.id());
		this.disconnectCells(nid1, nid2);
	}

	breadCrumbs(path, color = 'sienna', sz = 10) {
		for (const cell of path.nodes().map(x => Items[x.id()])) {
			mCellContent(iDiv(cell), { w: sz, h: sz, bg: color, fg: 'white', rounding: '50%' });
		}
	}
	colorComponents() {
		//this.showGraph();
		// let g = this.graph;

		let comps = this.getComponents();
		//get hue wheel!!!
		let wheel = getColorWheel('red', comps.length);
		//console.log('wheel', wheel)
		let i = 0;
		for (const comp of comps) {
			// this.breadCrumbs(comp, wheel[i], 20); i += 1;
			this.breadCrumbs(comp, wheel[i]); i += 1;
		}

	}
	showGraph() {
		this.dGraph.style.opacity = 1;
		if (this.hasVisual) {show(this.dGraph); return;}
		this.addVisual(this.dGraph);
		this.storeCurrentPositions();
		this.addLayoutControls(this.sb, ['show','hide','prest', 'grid', 'klay', 'rand', 'euler', 'reset', 'store']);//,'grid','euler','prest');		
		// setTimeout(() => {
		// 	this.comcola();
		// 	this.addLayoutControls(this.sb, ['cola', 'fit', 'prest', 'grid', 'klay', 'rand', 'euler', 'cose', 'reset', 'store']);//,'grid','euler','prest');
		// }, 2000);
	}
	hideGraph() {
		if (isdef(this.dGraph) && this.hasVisual) {
			//this.dGraph.style.opacity = 0;
			this.dGraph.style.display = 'none';
			// hide(this.dGraph);
		}
	}

}

function applyStyles(g, id, styles) { g.mStyle(id, styles, isdef(g.getNode(id)) ? 'node' : 'edge'); }
function setSymLabel(g, id, key, styles = {}) {
	if (nundef(Syms[key])) return;
	let info = Syms[key];
	console.log('family', info.family);
	g.setLabel(id, info.text, addKeys({ fz: 40, family: info.family }, styles));
}







//#endregion


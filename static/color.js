//#region color
var ColorDi, ColorNames, ColorDict;
function anyColorToStandardString(cAny, a, allowHsl = false) {
	//if allowHsl is false: only return rgb,rgba,or hex7,hex9 string! >pBSC algo!!!
	//if a is undefined, leaves a as it is in cAny, otherwise modifies to a
	if (Array.isArray(cAny)) {
		// cAny is rgb array
		if (cAny.length < 3) {
			return randomHexColor();
		} else if (cAny.length == 3) {
			//assume this is a rgb
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		}
	} else if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			//this is rbg or rgba string
			if (cAny[3] == 'a') {
				//rgba string!
				//console.log('its an rgba string!!!!!');
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				// simple rgb string
				if (a < 1) {
					//console.log(cAny.length)
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			//hsl or hsla string
			//if hsla and hsla allowed do same as for rgba
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					//simple hsl string
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')'; //cAny.substring(0,cAny.length-1) + ',' + a + ')';
				}
			} else {
				//convert hsl(a) into rgb(a)
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return anyColorToStandardString(cAny, a, allowHsl);
			}
		} else {
			//cAny is color name
			let newcAny = colorNameToHex(cAny);
			//console.log(cAny,newcAny);
			return anyColorToStandardString(newcAny, a, allowHsl);
		}
	} else if (typeof cAny == 'object') {
		//console.log('anyColorToStandardString: cAny is object!!!', cAny);
		//koennte {h: ,s: , l:} oder {r: ,g: ,b:} sein
		if ('h' in cAny) {
			//hsl object
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return anyColorToStandardString(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			//rgb object
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
} //ok
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.substr(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	//console.log('alpha from', zero1, 'to', hex);
	return hex;
} //ok
function bestContrastingColor(color, colorlist) {
	//console.log('dddddddddddddddd')
	let contrast = 0;
	let result = null;
	let rgb = colorRGB(color, true);
	rgb = [rgb.r, rgb.g, rgb.b];
	for (c1 of colorlist) {
		let x = colorRGB(c1, true)
		x = [x.r, x.g, x.b];
		let c = getContrast(rgb, x);
		//console.log(rgb,x,c);
		if (c > contrast) { contrast = c; result = c1; }
	}
	//console.log(contrast,result)
	return result;
}
function helleFarbe(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let wheel = getHueWheel(contrastTo, minDiff, mod, start);
	//console.log('wheel',wheel)
	let hue = chooseRandom(wheel);
	let hsl = colorHSLBuild(hue, 100, 50);
	return hsl;
}
function getColorWheel(contrastTo, n) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	let start = hc;
	let inc = Math.round(360 / (n + 1));
	start += inc;
	for (let i = 0; i < n; i++) {
		wheel.push(start % 360);
		start += inc;
	}
	return wheel.map(x => colorHSLBuild(x));
}
function getHueWheel(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	while (start < 360) {
		let d1 = Math.abs((start + 360) - hc);
		let d2 = Math.abs((start) - hc);
		let d3 = Math.abs((start - 360) - hc);
		let min = Math.min(d1, d2, d3);
		if (min > minDiff) wheel.push(start);
		start += mod;
	}
	return wheel;
}
function getPalette(color, type = 'shade') {
	color = anyColorToStandardString(color);
	return colorPalShade(color);
}
function getPaletteFromImage(img) {
	let palette0 = ColorThiefObject.getPalette(img);
	let palette = [];
	for (const pal of palette0) {
		let color = anyColorToStandardString(pal);
		palette.push(color);
	}
	//console.log(palette)
	//console.log('palette', palette)
	return palette;
}
function getTransPalette(color = '#000000') {
	let res = [];
	for (const alpha of [.0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]) res.push(colorTrans(color, alpha));
	return res;
}
function getTransPalette9(color = '#000000') {
	let res = [];
	for (const alpha of [.1, .2, .3, .4, .5, .6, .7, .8, .9]) res.push(colorTrans(color, alpha));
	return res;
}
function colorHue(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.h;
} //ok
function colorHSL(cAny, asObject = false) {
	//returns { h:[0,360], s:[0,1], l:[0,1]}
	let res = anyColorToStandardString(cAny, undefined, true);
	//console.log(res)
	let shsl = res;
	if (res[0] == '#') {
		//res is a hex string
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	//console.log(shsl);
	let n = allNumbers(shsl);
	//console.log(n);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
} //ok
function colorHSLBuild(hue, sat = 100, lum = 50) { let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)'; return result; }
function colorBlend(zero1, c0, c1, log = true) {
	c0 = anyColorToStandardString(c0);
	c1 = anyColorToStandardString(c1);
	return pSBC(zero1, c0, c1, log);
} //ok
function colorLighter(c, zero1 = .2, log = true) {
	c = anyColorToStandardString(c);
	return pSBC(zero1, c, undefined, !log);
} //ok
function colorDarker(c, zero1 = .8, log = true) {
	//1 is darkest,0 is orig color
	c = anyColorToStandardString(c);
	return pSBC(-zero1, c, undefined, !log);
} //ok
function colorPalShadeX(color, n) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	let step = 1.6 / (n - 1);
	for (let frac = -0.8; frac <= 0.8; frac += step) { //0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function colorShade(plusMinus1, color, log = true) {
	let c = anyColorToStandardString(color);
	return pSBC(plusMinus1, c, undefined, !log);
} //ok
function colorTrans(cAny, alpha = 0.5) {
	return anyColorToStandardString(cAny, alpha);
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	//jetzt ist bg rgb object
	const nThreshold = 105; //40; //105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
	// return 'white';
}
function colorHex(cAny) {
	//returns hex string w/ alpha channel or without
	let c = anyColorToStandardString(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		//it is now an rgba string and has alpha
		let res = pSBC(0, c, 'c');
		//console.log('in colorHex!!!!', c, res);
		return res;
	}
} //ok
function colorRGB(cAny, asObject = false) {
	//returns { r:[0,255], g:[0,255], b:[0,255]}
	let res = anyColorToStandardString(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	//console.log(shsl);
	let n = allNumbers(srgb);
	//console.log(n);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
} //ok
function ensureColorNames() {
	if (isdef(ColorNames)) return;
	ColorNames = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorNames[names[i].toLowerCase()] = '#' + hexes[i];
	}
}
function colorNameToHex(cName) { let key = cName.toLowerCase(); ensureColorNames(); return key in ColorNames ? ColorNames[key] : randomHexColor(); } //ok
function colorPalShade(color) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function getColorDictColor(c) { return isdef(ColorDict[c]) ? ColorDict[c].c : c; }
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
} //ok
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
} //ok
function getBrightness(c) {
	function luminance(r, g, b) {
		var a = [r, g, b].map(function (v) {
			v /= 255;
			return v <= 0.03928
				? v / 12.92
				: Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}
	let x = colorRGB(c, true);
	return luminance(x.r, x.g, x.b);
}
function getContrast(rgb1, rgb2) {
	// usage:
	// contrast([255, 255, 255], [255, 255, 0]); // 1.074 for yellow
	// contrast([255, 255, 255], [0, 0, 255]); // 8.592 for blue
	// minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes
	var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	return (brightest + 0.05)
		/ (darkest + 0.05);
}
function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function computeColor(c) { return (c == 'random') ? randomColor() : c; }
function computeColorX(c) {

	let res = c;
	if (isList(c)) return chooseRandom(c);
	else if (isString(c) && startsWith(c, 'rand')) {
		res = randomColor();
		let spec = c.substring(4);
		//console.log('______________________', spec);
		if (isdef(window['color' + spec])) {
			//console.log('YES!');
			res = window['color' + spec](res);
		}

	}
	return res;
}
function getExtendedColors(bg, fg, alpha) {
	//#region doc 
	/* handles values random, inherit, contrast	*/
	//#endregion 
	//if (fg == 'contrast') console.log('bg',bg,'fg',fg);
	bg = computeColorX(bg);
	fg = computeColorX(fg);
	if (bg == 'inherit' && (nundef(fg) || fg == 'contrast')) {
		fg = 'inherit'; //contrast to parent bg!

	} else if (fg == 'contrast' && isdef(bg) && bg != 'inherit') fg = colorIdealText(bg);
	else if (bg == 'contrast' && isdef(fg) && fg != 'inherit') { bg = colorIdealText(fg); }
	if (isdef(alpha)) bg = colorTrans(bg, alpha);
	return [bg, fg];
}
function pSBC(p, c0, c1, l) {
	//usage:
	// (blacken) -1.0 <= p <= 1.0 (whiten), or (c0) 0 <= p <= 1.0 (c1) when blending (ie., c1 given)
	// c0: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... from color
	// c1: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... to color (blending)
	// 		or 'c' for conversion between hex string and rgb string
	// l true:log blending, [false:linear blending]=default!
	let r,
		g,
		b,
		P,
		f,
		t,
		h,
		i = parseInt,
		m = Math.round,
		a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr)
		this.pSBCr = d => {
			let n = d.length,
				x = {};
			if (n > 9) {
				([r, g, b, a] = d = d.split(',')), (n = d.length);
				if (n < 3 || n > 4) return null;
				(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
				else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
			}
			return x;
		};
	(h = c0.length > 9),
		(h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
		(f = pSBCr(c0)),
		(P = p < 0),
		(t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
		(p = P ? p * -1 : p),
		(P = 1 - p);
	if (!f || !t) return null;
	if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
	else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
	(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
} //ok SUPER COOL!!!!

//color converters good!
function hexToHSL(H) {
	let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		// convert hex to RGB first
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length == 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		// then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function hexAToHSLA(H) {
	let ex = /^#([\da-f]{4}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;
		// 4 digits
		if (H.length == 5) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
			a = '0x' + H[4] + H[4];
			// 8 digits
		} else if (H.length == 9) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
			a = '0x' + H[7] + H[8];
		}

		// normal conversion to HSLA
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		a = (a / 255).toFixed(3);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBToHex7(c) {
	let n = allNumbers(c);
	if (c.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1);
} //ok
function rgbToHex(rgbStr) { return rgbStr && '#' + rgbStr.slice(4, -1).split(',').map(x => (+x).toString(16).padStart(2, '0')).join(''); }
function RGBAToHex9(rgba) {
	let n = allNumbers(rgba); //allNumbers does not catch .5 as float!
	//console.log('all numbers:', n);
	if (n.length < 3) {
		//console.log('RGBAToHex ERROR!', rgba);
		return randomHexColor();
	}
	let a = n.length > 3 ? n[3] : 1;
	let sa = alphaToHex(a);
	//console.log('sa:', sa);
	if (rgba.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1) + sa;
} //ok
function RGBToHSL(rgb) {
	let ex = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
	if (ex.test(rgb)) {
		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
		rgb = rgb
			.substr(4)
			.split(')')[0]
			.split(sep);

		// convert %s to 0–255
		for (let R in rgb) {
			let r = rgb[R];
			if (r.indexOf('%') > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
		}

		// make r, g, and b fractions of 1
		let r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
} //ok
function RGBAToHSLA(rgba) {
	let ex = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(rgba)) {
		let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
		rgba = rgba
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (rgba.indexOf('/') > -1) rgba.splice(3, 1);

		for (let R in rgba) {
			let r = rgba[R];
			if (r.indexOf('%') > -1) {
				let p = r.substr(0, r.length - 1) / 100;

				if (R < 3) {
					rgba[R] = Math.round(p * 255);
				}
			}
		}

		// make r, g, and b fractions of 1
		let r = rgba[0] / 255,
			g = rgba[1] / 255,
			b = rgba[2] / 255,
			a = rgba[3],
			// find greatest and smallest channel values
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// calculate hue
		// no difference
		if (delta == 0) h = 0;
		// red is max
		else if (cmax == r) h = ((g - b) / delta) % 6;
		// green is max
		else if (cmax == g) h = (b - r) / delta + 2;
		// blue is max
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// make negative hues positive behind 360°
		if (h < 0) h += 360;

		// calculate lightness
		l = (cmax + cmin) / 2;

		// calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLToRGB(hsl, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;

		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		// keep hue fraction of 360 if ending up over
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}

		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok



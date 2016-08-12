'use strict'
/* globals Reveal */

/*
 * 		SETTINGS
*/

var theme = 'night'



/*
 * 		NATIVES STUFF
*/



var natives = {
	allowed: true,
	status: function () { return -1 },
	optNext: function () { },
};

(function initNatives() {
	// jshint -W054
	try {
		natives.status = new Function('f', 'return %GetOptimizationStatus(f)')
		natives.optNext = new Function('f', '%OptimizeFunctionOnNextCall(f)')
	} catch (e) {
		natives.allowed = false
	}
} ())





/*
 * 		STUFF CALLED BY THE PRESENTATION
*/




window.runTimerTest = function (arg) {
	// inputs
	var el = document.querySelector('.reveal .present code')
	var body = el.innerText
	body = conform(body)
	// the test
	var ct = timerTest_impl(body, arg)
	// show output
	body += '\n// ' + fmt(ct)
	el.innerText = body
	// to get styling
	el.focus()
	el.blur()
}


function conform(str) {
	var lines = str.split(/\n/)
	var last = lines.pop()
	while (last.length === 0) last = lines.pop()
	if (/^\/\//.test(last)) last = lines.pop()
	lines.push(last)
	return lines.join('\n')
}


function timerTest_impl(body, arg) {
	// jshint -W054
	// build function that will be run
	var template = function ($dur) {
		//---
		//setup
		var $ct = 0, $t = performance.now() + $dur
		while (performance.now() < $t) {
			$ct++
			//body
		}
		return $ct
		//---
	}
	var setup = ''
	if (arg == 'arr') {
		setup = 'var arr = []; while (arr.length < 1000) arr.push(0); \n '
	}
	var fstr = template.toString()
		.split('//---')[1]
		.split('//setup').join(setup)
		.split('//body').join(body)
		.concat('; var $qqq = ' + Math.random()) // just in case
	var fn
	try {
		fn = new Function('$dur', fstr)
		fn(10)
	} catch (err) { }
	window.fstr = fstr
	if (!fn) return '[syntax error]'
	// optimize it if possible
	natives.optNext(fn)
	fn(50)
	fn(50)
	fn(50)
	// run the timer test
	var ct = fn(1000)
	// sanity
	if (natives.allowed) {
		var s = natives.status(fn)
		if (s !== 1) console.warn('Timer function not optimized.. status: ', s)
	}
	return fmt(ct) + ' calls/sec'
}


function fmt(n) {
	if (isNaN(n)) return n.toString()
	var e = Math.floor(Math.log10(n))
	if (e < 3) return n.toString()
	var tens = Math.pow(10, e - 2)
	n = Math.round(n / tens) * tens
	if (e < 6) return (n / 1e3) + 'k'
	return (n / 1e6) + 'M'
}





/*
 * 		SLIDE EVENTS
*/


Reveal.addEventListener('codeEditable1', setEditable, false)
Reveal.addEventListener('codeEditable2', setEditable, false)

function setEditable() {
	var el = document.querySelector('.reveal .present code')
	el.contentEditable = true
}


Reveal.addEventListener('showOptStatus1', showOpt, false)
Reveal.addEventListener('showOptStatus2', showOpt, false)

function showOpt() {
	var el = document.querySelector('.reveal .present code')
	el.contentEditable = true
	el.oninput = showOpt_impl
	showOpt_impl({ target: el })
}

function statusName(status) {
	if (status === -1) return '(syntax error)'
	if (status === 1) return 'optimized'
	if (status === 2) return 'not optimized'
	if (status === 3) return 'always optimized'
	if (status === 4) return 'never optimized'
	if (status === 6) return 'maybe deoptimized'
	if (status === 7) return 'optimized by Turbofan'
	return 'unknown - run presentation locally with chrome flags!'
}

function showOpt_impl(ev) {
	if (!natives.allowed) return
	// find status
	var status = getOptStatus(ev.target.innerText)
	// display text version
	var out = document.querySelector('.reveal .present blockquote strong')
	out.textContent = statusName(status)
	// color code element
	var quote = document.querySelector('.reveal .present blockquote')
	var cl = quote.classList
	var ok = 'opted'
	var ng = 'deopted'
	switch (status) {
		case 1:
		case 3:
		case 7:
			// optimized
			if (cl.contains(ng)) cl.remove(ng)
			if (!cl.contains(ok)) cl.add(ok)
			break
		case 2:
		case 4:
			// deoptimized
			if (cl.contains(ok)) cl.remove(ok)
			if (!cl.contains(ng)) cl.add(ng)
			break
		default:
			// unknown or syntax error
		if (cl.contains(ok)) cl.remove(ok)
		if (cl.contains(ng)) cl.remove(ng)
	}
}


function getOptStatus(body) {
	// jshint -W054
	if (/arr\w*\[/.test(body)) body = 'var arr = []; ' + body
	var fn
	try {
		fn = new Function(body)
		fn()
	} catch (err) {
		return -1
	}
	natives.optNext(fn)
	fn()
	console.log(fn.toString())
	return natives.status(fn)
}







/*
 * 		HACKS FOR STYLING, ETC
*/



// set the theme
window.setTheme = function (name) {
	document.getElementById('theme').setAttribute('href', 'css/theme/' + name + '.css')
}
window.setTheme(theme)



// embiggen buttons
addRule('.reveal button', 'font-size: inherit; padding: 10px 15px; margin: 10px;')

// ditto for code windows
addRule('.reveal pre', 'font-size: 30px; line-height: 1.3em;')

// tweak regular text size
addRule('.reveal ul, .reveal ol, .reveal p', 'font-size: 35px; line-height: 1.5em;')
addRule('.reveal h1', 'font-size: 100px; line-height: 1.4em;')

// rules for optimization status
addRule('blockquote.opted',   'background-color: #353;')
addRule('blockquote.deopted', 'background-color: #533;')



// Dynamically add css rules, see: https://davidwalsh.name/add-rules-stylesheets
function addRule(selector, rule) {
	if (!__sheet) {
		var style = document.createElement('style')
		style.appendChild(document.createTextNode('')) // apparently needed for webkit
		document.head.appendChild(style)
		__sheet = style.sheet
	}
	if ('insertRule' in __sheet) __sheet.insertRule(selector + "{" + rule + "}", 0)
	else if ('addRule' in __sheet) __sheet.addRule(selector, rule, 0)
}
var __sheet

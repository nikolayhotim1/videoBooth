'use strict';
let videos = {
	video1: 'video/demovideo1',
	video2: 'video/demovideo2'
};

let effectFunction = null;

window.onload = function () {
	let video = document.getElementById('video');

	video.src = `${videos['video1']}${getFormatExtension()}`;

	// add click handlers to control anchors
	let controlLinks = document.querySelectorAll('a.control');

	for (let i = 0; i < controlLinks.length; i++) {
		controlLinks[i].onclick = handleControl;
	}

	// add click handlers to effect anchors
	let effectLinks = document.querySelectorAll('a.effect');

	for (let i = 0; i < effectLinks.length; i++) {
		effectLinks[i].onclick = setEffect;
	}

	// add click handlers to videoSelection anchors
	let videoLinks = document.querySelectorAll('a.videoSelection');

	for (let i = 0; i < videoLinks.length; i++) {
		videoLinks[i].onclick = setVideo;
	}

	// add click handlers to video play
	// video.onplay = processFrame;
	// video.onended = endedHandler;
	video.addEventListener('play', processFrame, false);
	video.addEventListener('ended', endedHandler, false);

	pushUnpushButtons('video1', []);
	pushUnpushButtons('normal', []);
}

function setEffect(e) {
	let id = e.target.getAttribute('id');

	if (id === 'normal') {
		pushUnpushButtons('normal', ['western', 'noir', 'scifi']);

		effectFunction = null;
	} else if (id === 'western') {
		pushUnpushButtons('western', ['normal', 'noir', 'scifi']);

		effectFunction = western;
	} else if (id === 'noir') {
		pushUnpushButtons('noir', ['normal', 'western', 'scifi']);

		effectFunction = noir;
	} else if (id === 'scifi') {
		pushUnpushButtons('scifi', ['normal', 'western', 'noir']);

		effectFunction = scifi;
	}
}

function setVideo(e) {
	let id = e.target.getAttribute('id');
	let video = document.getElementById('video');

	if (id === 'video1') {
		pushUnpushButtons('video1', ['video2']);
	} else if (id === 'video2') {
		pushUnpushButtons('video2', ['video1']);
	}

	video.src = `${videos[id]}${getFormatExtension()}`;
	video.play();

	pushUnpushButtons('play', ['pause']);
}

function getFormatExtension() {
	let video = document.getElementById('video');

	if (video.canPlayType('video/mp4') !== '') {
		return '.mp4';
	} else if (video.canPlayType('video/ogg') !== '') {
		return '.ogv';
	} else if (video.canPlayType('video/webm') !== '') {
		return '.webm';
	}
}

function handleControl(e) {
	let id = e.target.getAttribute('id');
	let video = document.getElementById('video');

	if (id === 'play') {
		pushUnpushButtons('play', ['pause']);

		video.play();
	} else if (id === 'pause') {
		pushUnpushButtons('pause', ['play']);

		video.pause();
	} else if (id === 'loop') {
		if (isButtonPushed('loop')) {
			pushUnpushButtons('', ['loop']);
		} else {
			pushUnpushButtons('loop', []);
		}

		video.loop = !video.loop;
	} else if (id === 'mute') {
		if (isButtonPushed('mute')) {
			pushUnpushButtons('', ['mute']);
		} else {
			pushUnpushButtons('mute', []);
		}

		video.muted = !video.muted;
	}
}

// ended event handler
function endedHandler() {
	pushUnpushButtons('', ['play']);
}

function processFrame() {
	let video = document.getElementById('video');

	if (video.paused || video.ended) {
		return;
	}

	let bufferCanvas = document.getElementById('buffer');
	let displayCanvas = document.getElementById('display');
	let buffer = bufferCanvas.getContext('2d');
	let display = displayCanvas.getContext('2d');

	buffer.drawImage(video, 0, 0, bufferCanvas.width, bufferCanvas.height);

	let frame = buffer.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
	let length = frame.data.length / 4;

	for (let i = 0; i < length; i++) {
		let r = frame.data[i * 4 + 0];
		let g = frame.data[i * 4 + 1];
		let b = frame.data[i * 4 + 2];

		if (effectFunction) {
			effectFunction(i, r, g, b, frame.data);
		}
	}

	display.putImageData(frame, 0, 0);

	setTimeout(processFrame, 0);
	// try this line instead of the setTimeout above if you are on Chrome
	// requestAnimationFrame(processFrame);
}

// bwcartoon is an extra filter for an exercise
function bwcartoon(pos, outputData) {
	let offset = pos * 4;

	if (outputData[offset] < 120) {
		outputData[offset] = 80;
		outputData[++offset] = 80;
		outputData[++offset] = 80;
	} else {
		outputData[offset] = 255;
		outputData[++offset] = 255;
		outputData[++offset] = 255;
	}

	outputData[++offset] = 255;
	++offset;
}

function noir(pos, r, g, b, data) {
	let brightness = (3 * r + 4 * g + b) >>> 3;

	if (brightness < 0) brightness = 0;

	data[pos * 4 + 0] = brightness;
	data[pos * 4 + 1] = brightness;
	data[pos * 4 + 2] = brightness;
}

function western(pos, r, g, b, data) {
	let brightness = (3 * r + 4 * g + b) >>> 3;

	data[pos * 4 + 0] = brightness + 40;
	data[pos * 4 + 1] = brightness + 20;
	data[pos * 4 + 2] = brightness - 20;
	data[pos * 4 + 3] = 255; //220;
}

function scifi(pos, r, g, b, data) {
	let offset = pos * 4;

	data[offset] = Math.round(255 - r);
	data[offset + 1] = Math.round(255 - g);
	data[offset + 2] = Math.round(255 - b);
}

function pushUnpushButtons(idToPush, idArrayToUnpush) {
	if (idToPush !== '') {
		let anchor = document.getElementById(idToPush);
		let theClass = anchor.getAttribute('class');

		if (!theClass.indexOf('selected') >= 0) {
			theClass = theClass + ' selected';

			anchor.setAttribute('class', theClass);

			let newImage = `url(images/${idToPush}pressed.png)`;

			anchor.style.backgroundImage = newImage;
		}
	}

	for (let i = 0; i < idArrayToUnpush.length; i++) {
		let anchor = document.getElementById(idArrayToUnpush[i]);
		let theClass = anchor.getAttribute('class');

		if (theClass.indexOf('selected') >= 0) {
			theClass = theClass.replace('selected', '');

			anchor.setAttribute('class', theClass);
			anchor.style.backgroundImage = '';
		}
	}
}

function isButtonPushed(id) {
	let anchor = document.getElementById(id);
	let theClass = anchor.getAttribute('class');

	return (theClass.indexOf('selected') >= 0);
}
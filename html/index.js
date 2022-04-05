const socket = io();
const canvas = document.getElementById('canvas');
const score = document.getElementById('score');
const hp = document.getElementById('hp');
const attack = document.getElementById('attack');
const defense = document.getElementById('defense');
const color = document.getElementById('color');
const gameover = document.getElementById('gameover');
const leader = document.getElementById('leader');

const ctx = canvas.getContext('2d');
let dead = false;
let id = null;
let you = null;
let key = null;
let players = {};

socket.on('players', function (serverPlayers) {
	id = socket.id;
	players = serverPlayers;
	you = players[id];
});

function clear() {
	ctx.clearRect(0, 0, 600, 400);
}

function drawMap() {
	ctx.fillStyle = 'rgb(0, 200, 0)';
	ctx.fillRect(0, 0, 600, 400);

	if (you) {
		score.innerHTML = you.score;
		hp.innerHTML = you.hp;
		attack.innerHTML = you.attack;
		defense.innerHTML = you.defense;
		color.style.backgroundColor = you.color;
		if (you.top) {
			leader.style.display = 'block';
		} else {
			leader.style.display = 'none';
		}
	}
}

function playerInput() {
	if (key) {
		socket.emit('input', key);
		key = null;
	}
}

function drawPlayers() {
	Object.values(players).forEach(function (player) {
		if (player.hp > 0) {
			ctx.fillStyle = player.color;
			ctx.fillRect(player.x, player.y, 10, 10);
		}
	});
}

function gameoverCheck() {
	if (you && you.hp <= 0) {
		dead = true;
		gameover.style.display = 'block';
	}
}

window.addEventListener('keydown', function (e) {
	key = e.key;
});

setInterval(function () {
	if (!dead) {
		clear();
		drawMap();
		playerInput();
		drawPlayers();
		gameoverCheck();
	}
}, 100);

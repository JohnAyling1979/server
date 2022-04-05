const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
});

class Player {
    constructor() {
        this.hp = 10;
        this.attack = 2;
        this.defense = 1;
        this.direction = 'n';
        this.score = 0;
        this.color = `rgb(${getRandomInt(50, 205)}, ${getRandomInt(50, 205)}, ${getRandomInt(50, 205)})`;
        this.x = getRandomInt(0, 59) * 10;
        this.y = getRandomInt(0, 39) * 10;
        this.top = false;
    }

    input(direction) {
        console.log(direction);
        switch (direction) {
            case 'w':
                this.y -= 10;
                this.direction = 'n';
                if (this.y < 0) {
                    this.y = 0;
                }
                break;
            case 's':
                this.y += 10;
                this.direction = 's';
                if (this.y > 390) {
                    this.y = 390;
                }
                break;
            case 'a':
                this.x -= 10;
                this.direction = 'w';
                if (this.x < 0) {
                    this.x = 0;
                }
                break;
            case 'd':
                this.x += 10;
                this.direction = 'e';
                if (this.x > 590) {
                    this.x = 590;
                }
                break;
            case ' ':
                this.fire();
                break;
        }
    }

    fire() {
        switch (this.direction) {
            case 'n':
                Object.keys(players).forEach(uuid => {
                    if (players[uuid].hp > 0 && this.y > players[uuid].y && this.x === players[uuid].x) {
                        this.score++;
                        players[uuid].hp -= this.attack;
                    }
                });
                break;
            case 's':
                Object.keys(players).forEach(uuid => {
                    if (players[uuid].hp > 0 && this.y < players[uuid].y && this.x === players[uuid].x) {
                        this.score++;
                        players[uuid].hp -= this.attack;
                    }
                });
                break;
            case 'e':
                Object.keys(players).forEach(uuid => {
                    if (players[uuid].hp > 0 && this.x < players[uuid].x && this.y === players[uuid].y) {
                        this.score++;
                        players[uuid].hp -= this.attack;
                    }
                });
                break;
            case 'w':
                Object.keys(players).forEach(uuid => {
                    if (players[uuid].hp > 0 && this.x > players[uuid].x && this.y === players[uuid].y) {
                        this.score++;
                        players[uuid].hp -= this.attack;
                    }
                });
                break;
        }
    }
}

const players = {}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * max) + min;
}

io.on('connection', (socket) => {
    const id = socket.id;
    players[id] = new Player();

    console.log(`a user ${id} connected`);

    io.emit('players', players);

    socket.on('input', (input) => {
        players[id].input(input);

        let top = null;
        Object.keys(players).forEach(playerId => {
            players[playerId].top = false;

            if (top === null && players[playerId].score > 0) {
                top = playerId;
            } else if (players[playerId] > players[top]) {
                top = playerId;
            }
        });

        if (top) {
            players[top].top = true;
        }

        io.emit('players', players);
    });

    socket.on('disconnect', () => {
        delete (players[id]);
        io.emit('players', players);
        console.log(`user ${id} disconnected`);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
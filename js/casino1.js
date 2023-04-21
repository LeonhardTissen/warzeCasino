// tutorial variable
figured_it_out = false;

// canvas
cvs = document.getElementById('screen')
ctx = cvs.getContext('2d')
fps = 60

// elements
grass = document.getElementById('grass')
background = document.body

// sources
sprites = new Image();
sprites.src = "/assets/sprites.png"
sounds = {}
sounds.bounce = new Audio()
sounds.bounce.src = "/assets/sounds/bounce.mp3"
sounds.loss = new Audio()
sounds.loss.src = "/assets/sounds/loss.mp3"
sounds.jump = new Audio()
sounds.jump.src = "/assets/sounds/jump.mp3"
sounds.diamond = new Audio()
sounds.diamond.src = "/assets/sounds/diamond.mp3"
sounds.wall = new Audio()
sounds.wall.src = "/assets/sounds/wall.mp3"
sounds.super = new Audio()
sounds.super.src = "/assets/sounds/super.mp3"
sounds.life = new Audio()
sounds.life.src = "/assets/sounds/life.mp3"
sounds.lifegain = new Audio()
sounds.lifegain.src = "/assets/sounds/lifegain.mp3"
sounds.slash = new Audio()
sounds.slash.src = "/assets/sounds/slash.mp3"
sounds.warmup = new Audio()
sounds.warmup.src = "/assets/sounds/warmup.mp3"

// themes
themes = [
["#28C138", "#77C2FF"],
["#28553E", "#495071"],
["#07380E", "#0C0A38"],
["#E2BD00", "#24D8D2"],
["#D66D0A", "#73A0D6"],
["#6B1309", "#493536"],
["#898781", "#000000"],
["#7A481F", "#F9B1E6"],
["#463087", "#515ABC"]
]

// resizing window
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false
}
resizeCanvas();

// key events
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case "d":
        case "ArrowRight":
            figured_it_out = true;
            game.walkingright = true;
            game.direction = 0;
            break;
        case "a":
        case "ArrowLeft":
            figured_it_out = true;
            game.walkingleft = true;
            game.direction = 1;
            break;
        case "w":
        case "ArrowUp":
            figured_it_out = true;
            if (game.height == 0) {
                game.yvelocity = 20;
                sounds.jump.play();
            }
            break;
    }
})
document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case "d":
        case "ArrowRight":
            game.walkingright = false;
            break;
        case "a":
        case "ArrowLeft":
            game.walkingleft = false;
            break;
    }
})

function newdiamond() {
    diamonds.push([Math.random() * (cvs.width - 160), Math.random() * 500 + 200, Math.random() * 1000])
}
function newcloud() {
    clouds.push([Math.random() * cvs.width - 160, Math.random() * 500 + 200, Math.random() * 1000])
}
function increasescore() {
    game.score ++;
    if (game.score % 50 == 0) {
        game.world ++;
        setworld(game.world)
        if (game.lives < 3) {
            game.lives ++;
            sounds.lifegain.play();
        }
    }
}
function setworld(world) {
    grass.style.backgroundColor = themes[world%themes.length][0]
    background.style.backgroundColor = themes[world%themes.length][1]
    game.world = world
}

function resetgame() {
    game = {
        position: 300,
        direction: 0,
        time: 0,
        animation: 0,
        walking: false,
        walkingleft: false,
        walkingright: false,
        velocity: 0,
        yvelocity: 0,
        height: 0,
        hatx: 20,
        haty: 300,
        hatxvel: 2,
        hatyvel: 15,
        score: 0,
        superblock: -80,
        resetincoming: 0,
        spear: -160,
        spearattack: 0,
        lives: 3,
        world: 0,
        weizecolor: localStorage.getItem('weizecolor')
    }
    // pre generate clouds
    clouds = []
    for (nc = 0; nc < 8; nc ++) {
        newcloud()
    }
    // pre generate diamonds
    diamonds = []
    newdiamond(); newdiamond();
    await_reset = false;
    setworld(0)
}
resetgame()

function draw() {
    if (cvs.width < 1500) {
        ctx.font = "50px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Your window is too small. Resize or Zoom.", cvs.width/2, cvs.height/2)
        await_reset = true
        return;
    } else if (await_reset) {
        resetgame()
    }
    if (game.resetincoming > 100) {
        resetgame()
    }
    // increase time passed
    game.time ++;
    // remind the user of the controls
    if (game.time > 500 && !figured_it_out) {
        alert("Use the arrow keys to move! Collect diamonds using your hat and don't let it fall off!")
        figured_it_out = true;
    }
    // animation variable, every 5 ticks
    game.animation = Math.round(game.time/5)
    // clear previous frame
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    // clouds
    for (cloud = 0; cloud < clouds.length; cloud ++) {
        c = clouds[cloud]
        ctx.drawImage(sprites, 0, 32 + Math.floor(c[2] % 3) * 16, 32, 16, c[0] + Math.sin(c[2]+game.time/30) * 15 + Math.cos(c[2]+game.time/200) * 30, cvs.height - 300 - c[1], 320, 160)
    }
    // diamonds
    for (diamond = 0; diamond < diamonds.length; diamond ++) {
        c = diamonds[diamond]
        ctx.drawImage(sprites, 32 + game.animation % 5 * 16, 16, 16, 16, c[0], cvs.height - c[1] - 300, 160, 160)
        // hat colliding with diamonds
        if (game.hatx + 100 > c[0] && game.hatx - 100 < c[0] && game.haty + 100 > c[1] && game.haty - 100 < c[1]) {
            diamonds.splice(diamond, 1)
            if (diamonds.length < 2 + Math.min(Math.floor(game.world / 3), 3)) newdiamond();
            increasescore()
            diamond --;
            sounds.diamond.cloneNode().play()
        }
    }
    // walking in either direction
    game.walking = (game.walkingright || game.walkingleft)
    // draw character
    if (game.weizecolor) ctx.filter = "hue-rotate(" + game.weizecolor + "deg)";
    ctx.drawImage(sprites, game.direction * 16, (game.height > 0 ? 16 : game.animation % 2 * 16 * (game.velocity == 0 ? 0 : 1)), 16, 16, game.position, cvs.height - 300 - game.height, 160, 160)
    ctx.filter = "none";
    if (game.walking) {
        // apply horizontal velocity
        if (Math.abs(game.velocity) < 70) {
            game.velocity += (game.direction ? -1 : 1);
        }
    } else {
        if (game.velocity != 0) {
            // decrease horizontal velocity
            if (game.velocity > 0) {
                game.velocity --;
            } else {
                game.velocity ++;
            }
        }
    }
    if (game.height > 0 || game.yvelocity > 0) {
        // apply vertical velocity to player
        game.height += game.yvelocity
        game.yvelocity --;
    } else {
        // reset player height
        game.height = 0;
        game.yvelocity = 0;
    }
    // change the horizontal position
    game.position += game.velocity
    // borderless movement
    if (game.position < -160) game.position = cvs.width;
    if (game.position > cvs.width) game.position = -160;

    // hat goes too low
    if (game.haty < -300) {
        if (game.lives > 0) {
            // lose a life
            game.lives --;
            game.hatyvel = 25;
            game.haty = -300
            sounds.life.play();
        } else {
            // game over
            game.resetincoming ++
            if (game.resetincoming == 1) {
                sounds.loss.play();
            }
        }
    } else {
        // apply physics
        game.hatx += game.hatxvel;
        game.haty += game.hatyvel;
        game.hatyvel -= 0.3;
        // hat bounces off wall
        if (game.hatx < 0 || game.hatx > cvs.width - 160) {
            sounds.wall.play()
            game.hatxvel *= -1;
            game.hatx += game.hatxvel;
        }
        // if hat goes too high
        if (game.haty > 800) game.hatyvel -= 0.2
        // if hat goes too fast
        if (Math.abs(game.hatxvel) > 18) game.hatxvel /= 1.1
        // draw hat
        ctx.drawImage(sprites, 32, 0, 16, 16, game.hatx, cvs.height - 300 - game.haty, 160, 160)
        // hat collides with player
        if (game.position + 100 > game.hatx && game.position - 100 < game.hatx && game.height + 120 > game.haty && game.height + 80 < game.haty && game.hatyvel < 0) {
            increasescore()
            game.hatyvel = Math.abs(game.hatyvel)
            game.hatxvel += game.velocity / 2
            sounds.bounce.play();
            if (game.hatxvel >  30) game.hatxvel =  30;
            if (game.hatxvel < -30) game.hatxvel = -30;
        }
    }

    // draw score
    score_as_string = game.score.toString()
    for (digit = 0; digit < score_as_string.length; digit ++) {
        ctx.drawImage(sprites, score_as_string[digit] * 8, 80, 8, 8, 10 + digit * (80 + game.resetincoming), 10, 80 + game.resetincoming, 80 + game.resetincoming)
    }
    // draw hearts
    ctx.drawImage(sprites, (game.lives > 2 ? 112 : 128), 16, 16, 16, cvs.width - 10 - 160, 10, 160, 160)
    ctx.drawImage(sprites, (game.lives > 1 ? 112 : 128), 16, 16, 16, cvs.width - 10 - 320, 10, 160, 160)
    ctx.drawImage(sprites, (game.lives > 0 ? 112 : 128), 16, 16, 16, cvs.width - 10 - 480, 10, 160, 160)
    if (game.superblock < -80) {
        // spawn superblock randomly
        if (Math.floor(Math.random() * 400) == 0) {
            game.superblock = cvs.width;
        }
    } else {
        // move superblock left
        game.superblock -= 8 + Math.min(game.world, 12);
        // collide with superblock
        if (game.position + 100 > game.superblock && game.position - 20 < game.superblock && game.yvelocity > 0 && game.height < 200 && game.height > 160) {
            game.yvelocity = 0;
            game.superblock = -80
            if (game.lives == 3) {
                for (i = 0; i < Math.random() * 5 + 5; i++) {
                    newdiamond();
                }
                sounds.super.play();	
            } else {
                game.lives ++;
                sounds.lifegain.play();
            }
        }
        ctx.drawImage(sprites, 48 + game.animation % 6 * 8, 0, 8, 8, game.superblock, cvs.height - 500, 80, 80)
    }
    // moving spear
    if (game.score > 15) {
        if (game.spearattack) {
            if (game.spearattack > 180 - Math.min(game.world, 10) * 10) {
                // attack resets
                game.spearattack = 0;
            } else {
                // attack progresses
                game.spearattack ++;
                if (game.spearattack > 60 - Math.min(game.world, 30)) {
                    // spear touches you
                    if (game.spear + 70 > game.position && game.spear - 70 < game.position && game.height < 120) {
                        game.yvelocity += 15;
                        game.velocity += Math.floor(Math.random() * 40) - 20
                        sounds.slash.play();
                    }
                }
            }
        } else {
            if (game.spear + 20 > game.position && game.spear - 20 < game.position) {
                game.spearattack ++;
                sounds.warmup.play();
            } else {
                if (game.spear > game.position) {
                    game.spear -= 3 + Math.min(game.world, 30);
                } else {
                    game.spear += 3 + Math.min(game.world, 30);
                }
            }
        }
        ctx.drawImage(sprites, 32 + (game.spearattack == 0 ? game.animation % 2 * 16 : (game.spearattack > 60 - Math.min(game.world, 30) ? 32 : 0)), 32, 16, 32, game.spear, cvs.height - 320, 160, 320)
    }
}

setInterval(draw, 1000 / fps)
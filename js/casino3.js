// canvas
cvs = document.getElementById('screen')
ctx = cvs.getContext('2d')
fps = 60
speed = 1
candyenabled = true;
flyhacks = false;
rainbowenabled = true;
scrollbackground = true;
musicenabled = true;
scrollspeedonstart = 0.5;
gravity = 0.8;
increment = 2000;
platformdifficulty = 1;
figured_it_out = false;
if (localStorage.getItem('candyenabled') != null) candyenabled = (localStorage.getItem('candyenabled') == "false" ? false : true);
if (localStorage.getItem('scrollbackground') != null) scrollbackground = (localStorage.getItem('scrollbackground') == "false" ? false : true);
if (localStorage.getItem('rainbowenabled') != null) rainbowenabled = (localStorage.getItem('rainbowenabled') == "false" ? false : true);
if (localStorage.getItem('platformdifficulty') != null) platformdifficulty = parseFloat(localStorage.getItem('platformdifficulty'));
if (localStorage.getItem('scrollspeedonstart') != null) scrollspeedonstart = parseFloat(localStorage.getItem('scrollspeedonstart'));
if (localStorage.getItem('casino3music') != null) musicenabled = (localStorage.getItem('casino3music') == 'true' ? true : false);

// sources
sprites = new Image()
sprites.src = "/assets/sprites3.png"
sounds = {}
sounds.diamond = new Audio()
sounds.diamond.src = "/assets/sounds/diamond.mp3"
sounds.bounce = new Audio()
sounds.bounce.src = "/assets/sounds/bounce.mp3"
sounds.super = new Audio()
sounds.super.src = "/assets/sounds/super.mp3"
sounds.slash = new Audio()
sounds.slash.src = "/assets/sounds/slash.mp3"
sounds.life = new Audio()
sounds.life.src = "/assets/sounds/life.mp3"
sounds.lifegain = new Audio()
sounds.lifegain.src = "/assets/sounds/lifegain.mp3"
sounds.win = new Audio()
sounds.win.src = "/assets/sounds/win.mp3"
sounds.jump = new Audio()
sounds.jump.src = "/assets/sounds/jump.mp3"
sounds.warmup = new Audio()
sounds.warmup.src = "/assets/sounds/warmup.mp3"
sounds.beep = new Audio()
sounds.beep.src = "/assets/sounds/beep.mp3"
sounds.wall = new Audio()
sounds.wall.src = "/assets/sounds/wall.mp3"
sounds.loss = new Audio()
sounds.loss.src = "/assets/sounds/loss.mp3"
sounds.upgrade = new Audio()
sounds.upgrade.src = "/assets/sounds/upgrade.mp3"
sounds.music = new Audio();
sounds.music.src = "/assets/sounds/casino3.mp3";
sounds.music.loop = true;

// resizing window
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false
}
resizeCanvas();

function setFps(frames) {
    fps = frames
    clearInterval(updates);
    updates = setInterval(draw, 1000 / fps)
    speed = 60 / fps
}

// key events
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case "a":
        case "ArrowLeft":
            figured_it_out = true;
            game.holdingleft = true;
            break;
        case "d":
        case "ArrowRight":
            figured_it_out = true;
            game.holdingright = true;
            break;
        case "r":
            resetgame();
            break;
        case " ":
        case "w":
        case "ArrowUp":
            if ((game.onground || flyhacks) && game.alive) {
                figured_it_out = true;
                game.yvel = Math.max(19, Math.min(Math.abs(game.xvel * 1.5), 39));
                if (game.yvel > 30) {
                    game.candyshitting = true;
                }
                game.onground = 0;
                sounds.jump.play();
            } else if (!game.alive && game.time > 60) {
                resetgame();
            }
            break;
        case "p":
            togglesettings();
            break;
    }
})
document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case "a":
        case "ArrowLeft":
            game.holdingleft = false;
            break;
        case "d":
        case "ArrowRight":
            game.holdingright = false;
            break;
    }
})


function resetgame() {
    game = {
        time: 0,
        animations: 0,
        floor: 0,
        floorcombo: 0,
        floorcombocooldown: 0,
        x: 0,
        y: 0,
        xvel: 0,
        yvel: 0,
        scrollspeed: 0,
        scroll: 0,
        platforms: [[0, 1]],
        direction: 0,
        onground: 5,
        holdingleft: false,
        holdingright: false,
        quickscrollvelocity: 0,
        alive: true,
        highestfloor: 0,
        highestcombo: 0,
        comboword: 0,
        music: false,
        displaycomboword: 0,
        score: 0,
        candy: [],
        candyshitting: false,
        hurry: -38,
        addedfloors: 0,
        weizecolor: localStorage.getItem('weizecolor')
    }
    for (p = 0; p < 50; p ++) {newplatform(0.4 * platformdifficulty)}
    for (p = 0; p < 49; p ++) {newplatform(0.35 * platformdifficulty)}
    newplatform(1);
    sounds.music.pause();
    sounds.music.currentTime = 0;
}
resetgame()
function newplatform(width) {
    game.platforms.push([Math.random() * (1 - width), width])
}
function displaycombo(combo) {
    if (combo >= 4) {
        game.highestcombo = Math.max(combo, game.highestcombo);
        game.score += combo * 10
    }
    if      (combo >=  4 && combo <=  6) {game.comboword = 0; game.displaycomboword = 100; sounds.win.play()}
    else if (combo >=  7 && combo <= 14) {game.comboword = 1; game.displaycomboword = 100; sounds.win.play()}
    else if (combo >= 15 && combo <= 24) {game.comboword = 2; game.displaycomboword = 150; sounds.super.play()}
    else if (combo >= 25 && combo <= 34) {game.comboword = 3; game.displaycomboword = 150; sounds.super.play()}
    else if (combo >= 35 && combo <= 49) {game.comboword = 4; game.displaycomboword = 150; sounds.super.play()}
    else if (combo >= 50 && combo <= 69) {game.comboword = 5; game.displaycomboword = 150; sounds.super.play()}
    else if (combo >= 70 && combo <= 99) {game.comboword = 6; game.displaycomboword = 150; sounds.super.play()}
    else if (combo > 99) 				 {game.comboword = 7; game.displaycomboword = 200; sounds.slash.play()}
}
function newcandy(x,y,xvel,yvel) {
    game.candy.push([x,y,Math.random() * 20 - 10 + xvel, Math.random() * 20 - 10 + yvel])
}
function togglesettings() {
    settingsscreen = document.getElementById('settingsscreen')
    show = (settingsscreen.style.display == "block")
    settingsscreen.style.display = (show ? "none" : "block")
    game.paused = !show
    if (show && musicenabled) {
        sounds.music.play()
    } else {
        sounds.music.pause()
    }
}
function settingsconfetti(value) {
    candyenabled = value;
    localStorage.setItem('candyenabled', value)
}
function settingsbackground(value) {
    scrollbackground = value;
    localStorage.setItem('scrollbackground', value)
}
function settingsrainbow(value) {
    rainbowenabled = value;
    localStorage.setItem('rainbowenabled', value)
}
function settingsmusic(value) {
    musicenabled = value;
    localStorage.setItem('casino3music', value)
}
function settingsplatform(value) {
    platformdifficulty = value;
    localStorage.setItem('platformdifficulty', value)
}
function settingsscrollspeed(value) {
    scrollspeedonstart = value;
    localStorage.setItem('scrollspeedonstart', value)
}

function draw() {
    //clear canvas of any demons
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    if (!game.paused) {
        game.time ++;
        if (game.alive) {
            game.scroll += game.scrollspeed * speed;
        }
        if (game.time % 5 == 0) game.animations ++
        if (game.time > 300 && !figured_it_out) {
            alert("Use the arrow keys (or WAD) to move. Get as high as you can without falling. Running faster makes you jump higher.")
            figured_it_out = true;
        }
    }

    //draw background
    if (scrollbackground) {
        for (wall = 0; wall < cvs.height / 32; wall ++) {
            for (hor = 1; hor < cvs.width / 32; hor ++) {
                ctx.drawImage(sprites, 96, 0, 32, 32, hor * 64 * 3, (-32 + (game.scroll / 2) % 32 + wall * 32) * 6, 64 * 3, 64 * 3)
            }
        }
    }

    //draw walls
    for (wall = 0; wall < cvs.height / 32; wall ++) {
        ctx.drawImage(sprites, 64, 0, 32, 32, 0, (-32 + game.scroll % 32 + wall * 32) * 6, 64 * 3, 64 * 3)
        ctx.drawImage(sprites, 64, 0, 32, 32, cvs.width - 64 * 3, (-32 + game.scroll % 32 + wall * 32) * 6, 64 * 3, 64 * 3)
    }

    //draw hurry
    if (game.hurry != -38) {
        ctx.globalAlpha = 0.5
        ctx.drawImage(sprites, 0, 102, 86, 38, cvs.width / 2 - 86 * 3, game.hurry, 86 * 6, 38 * 6)
        ctx.globalAlpha = 1;
        game.hurry -= 5;
    }

    var player_height = cvs.height - 160 - game.y + game.scroll * 6
    //draw platforms
    touching_floor = false;
    for (p = Math.max(game.floor - 20, 0); p < Math.min(game.floor + 20, game.platforms.length); p ++) {
        x = 64 * 3 + (cvs.width - 64 * 6) * game.platforms[p][0];
        y = cvs.height - 64 - p * 192 + game.scroll * 6
        w = (cvs.width - 64 * 6) * game.platforms[p][1]
        h = 10 * 3
        if (game.x + 32 * 7 > x && 
            game.x + 32 * 6 + 10 < x + w && 
            player_height + 100 > y && 
            player_height + 80 < y) {
            touching_floor = true;
            standing_on = p
        }
        ctx.drawImage(sprites, 0, 150 + Math.floor(p/100) % 5 * 10, 92, 10, x, y, w, h)
        platformstring = p.toString()
        for (digit = 0; digit < platformstring.length; digit ++) {
            ctx.drawImage(sprites, platformstring[digit] % 10 * 8, 32, 8, 8, x + w/2 - 4 * 3 * platformstring.length + 8 * 3 * digit, y + 36, 8 * 3, 8 * 3)
        }
    }
    //ground
    if (touching_floor && game.yvel <= 0) {
        game.onground = 10;
        game.candyshitting = false;
        game.yvel = 0;
        if (standing_on != game.floor) {
            if (standing_on >= game.floor + 2) {
                game.floorcombo += standing_on - game.floor;
                game.floorcombocooldown = 200;
            } else {
                displaycombo(game.floorcombo)
                game.floorcombo = 0;
                game.floorcombocooldown = 0;
            }
            game.floor = standing_on;
            if (game.floor > game.highestfloor) {
                if (Math.floor(game.floor / 50) != Math.floor(game.highestfloor / 50)) {
                    sounds.warmup.play();
                    if (candyenabled) {
                        for (c = 0; c < 50; c ++) {
                            newcandy(c / 50 * cvs.width, cvs.height, 0, 40);
                        }
                    }
                    switch (game.addedfloors) {
                        case 0: for (p = 0; p < 50; p ++) {newplatform(0.3 * platformdifficulty)}; break;
                        case 1: for (p = 0; p < 49; p ++) {newplatform(0.275 * platformdifficulty)}; newplatform(1); break;
                        case 2: for (p = 0; p < 50; p ++) {newplatform(0.25 * platformdifficulty)}; break;
                        case 3: for (p = 0; p < 49; p ++) {newplatform(0.225 * platformdifficulty)}; newplatform(1); break;
                        case 4: for (p = 0; p < 50; p ++) {newplatform(0.2 * platformdifficulty)}; break;
                        case 5: for (p = 0; p < 49; p ++) {newplatform(0.175 * platformdifficulty)}; newplatform(1); break;
                        case 6: for (p = 0; p < 50; p ++) {newplatform(0.15 * platformdifficulty)}; break;
                        case 7: for (p = 0; p < 49; p ++) {newplatform(0.125 * platformdifficulty)}; newplatform(1); break;
                        case 8: for (p = 0; p < 50; p ++) {newplatform(0.1 * platformdifficulty)}; break;
                        case 9: for (p = 0; p < 49; p ++) {newplatform(0.075 * platformdifficulty)}; newplatform(1); break;
                        case 10: for (p = 0; p < 50; p ++) {newplatform(0.07 * platformdifficulty)}; break;
                        case 11: for (p = 0; p < 49; p ++) {newplatform(0.025 * platformdifficulty)}; newplatform(1); break;
                    }
                    game.addedfloors ++;
                }
                game.highestfloor = game.floor
            }
        }
    } else {
        if (game.onground > 0) game.onground --;
    }

    //combo
    if (game.floorcombocooldown != 0) {
        if (game.alive && !game.paused) game.floorcombocooldown --;
        slider_px = game.floorcombocooldown / 200 * cvs.height / 3
        slider_max = cvs.height / 3
        slider_border = 10
        ctx.fillStyle = "#000"
        ctx.fillRect(64 - slider_border, slider_max - slider_border, 64 + slider_border * 2, slider_max + slider_border * 2)
        ctx.fillStyle = "#F00"
        if (rainbowenabled) ctx.filter = "hue-rotate(" + game.time % 90 * 4 + "deg)";
        ctx.fillRect(64, slider_max + (slider_max - slider_px), 64, slider_px)
        combostring = game.floorcombo.toString()
        for (digit = 0; digit < combostring.length; digit ++) {
            ctx.drawImage(sprites, combostring[digit] % 10 * 8, 32, 8, 8, 96 - 4 * 6 * combostring.length + 8 * 6 * digit, cvs.height / 3 * 2 + 36, 8 * 6, 8 * 6)
        }
        ctx.filter = "none"
    } else if (game.floorcombo > 0) {
        displaycombo(game.floorcombo)
        game.floorcombo = 0;
    }

    //eyecandy
    if (!game.paused) {
        if (rainbowenabled) ctx.filter = "hue-rotate(" + game.time % 90 * 4 + "deg)";
        for (c = 0; c < game.candy.length; c ++) {
            candy = game.candy[c]
            candy[0] += candy[2] * speed
            candy[1] -= candy[3] * speed
            candy[3] -= 0.8 * speed;
            ctx.drawImage(sprites, 81, 32, 9, 8, candy[0], candy[1], 9 * 3, 8 * 3)
            if (candy[0] < 9 * 3 || candy[0] > cvs.width || candy[1] > cvs.height) {
                game.candy.splice(c, 1);
                c --;
            }
        }
        ctx.filter = "none"
    };

    if (game.scrollspeed > 0 && !game.music) {
        if (musicenabled) {
            sounds.music.play();
            game.music = true;
        };
    }

    if (game.alive && !game.paused) {
        //draw player
        game.direction = (game.xvel < 0 ? 1 : 0)
        if (game.weizecolor && rainbowenabled) ctx.filter = "hue-rotate(" + game.weizecolor + "deg)";
        ctx.drawImage(sprites, game.direction * 16, (game.onground ? (Math.abs(game.xvel) < 1 ? 0 : game.animations % 2) : 1) * 16, 16, 16, 64 * 3 +game.x -12, player_height, 32 * 3, 32 * 3)
        ctx.filter = "none"

        if (game.candyshitting && candyenabled && game.time % 3 == 0) newcandy(64 * 3 +game.x -12 + 32, player_height+64, 0, 0)

        //combo word
        if (game.displaycomboword > 0) {
            game.displaycomboword --;
            size = Math.sin(game.time / 5) * ((game.comboword + 1) / 10) + 3
            ctx.drawImage(sprites, 128, game.comboword * 32, 128, 32, cvs.width / 2 - 128 * size, cvs.height / 2 - 32 * 	size, 128 * size * 2, 32 * size * 2)
        }

        //general physics
        if (!(game.holdingleft && game.holdingright)) {
            if (game.holdingleft) {
                game.xvel --;
            }
            else if (game.holdingright) {
                game.xvel ++;
            }
        }
        game.x += game.xvel * speed
        game.y += game.yvel * speed
        if (!game.onground) {
            game.yvel -= gravity * speed;
        }
        if (game.yvel < -20) {
            game.yvel = -20
        }
        if (game.xvel > 100) {
            game.xvel /= 1.5
        } else if (Math.abs(game.xvel) < 3) {
            game.xvel /= 1.2
        } else {
            game.xvel /= 1.03
        }
        if (game.x < 0) {
            game.x = 0;
            game.xvel *= -1;
            sounds.wall.play();
        } else if (game.x > cvs.width - 64 * 6 - 72) {
            game.x = cvs.width - 64 * 6 - 72
            game.xvel *= -1;
            sounds.wall.play();
        }
        if (game.alive) {
            game.scroll += game.quickscrollvelocity * speed
        }
        if (player_height < 0) {
            game.quickscrollvelocity += 0.3;
        } else if (game.quickscrollvelocity > 1) {
            game.quickscrollvelocity /= 1.5;
        } else {
            game.quickscrollvelocity = 0;
        }
        // screen starts scrolling now
        if (game.scroll > 0 && game.scrollspeed == 0) {
            game.scrollspeed = scrollspeedonstart;
            game.time = 0;
        }
        // screen scrolls faster
        increment = 2000;
        if (game.time == increment && game.floor < 5) {
            game.time = 0;
        }
        if (game.time % 2000 == 1999) {
            game.scrollspeed += 0.2;
            sounds.upgrade.play();
            game.hurry = cvs.height;
        }
        if (player_height > cvs.height && game.alive) {
            sounds.loss.play();
            game.alive = false;
            sounds.music.pause();
            game.music = false;
            game.time = 0;
            game.score += game.highestfloor * 10 + game.highestcombo * 20 + Math.round(game.time / 60) * 10
        }
    } else {
        if (!game.alive) {
            sounds.music.pause();
            ctx.drawImage(sprites, 0, 40, 128, 32, cvs.width / 2 - 128 * 3, cvs.height / 4 - 32 * 3, 128 * 6, 32 * 6)
            ctx.drawImage(sprites, 0, 72, 44, 30, cvs.width / 3, cvs.height / 2, 44 * 6, 30 * 6)
            if (rainbowenabled) ctx.filter = "hue-rotate(" + game.time % 90 * 4 + "deg)";
            scorestring = game.score.toString()
            for (digit = 0; digit < scorestring.length; digit ++) {
                ctx.drawImage(sprites, scorestring[digit] % 10 * 8, 32, 8, 8, cvs.width / 3 * 2 - 8 * 6 * scorestring.	length + 8 * 6 * digit, cvs.height / 2, 8 * 6, 8 * 6)
            }
            scorestring = game.highestfloor.toString()
            for (digit = 0; digit < scorestring.length; digit ++) {
                ctx.drawImage(sprites, scorestring[digit] % 10 * 8, 32, 8, 8, cvs.width / 3 * 2 - 8 * 6 * scorestring.	length + 8 * 6 * digit, cvs.height / 2 + 64, 8 * 6, 8 * 6)
            }
            scorestring = game.highestcombo.toString()
            for (digit = 0; digit < scorestring.length; digit ++) {
                ctx.drawImage(sprites, scorestring[digit] % 10 * 8, 32, 8, 8, cvs.width / 3 * 2 - 8 * 6 * scorestring.	length + 8 * 6 * digit, cvs.height / 2 + 128, 8 * 6, 8 * 6)
            }
            ctx.filter = "none"
        }
    }
    window.requestAnimationFrame(draw);
}

draw();
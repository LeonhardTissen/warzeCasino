// canvas
cvs = document.getElementById('screen')
ctx = cvs.getContext('2d')
fps = 60;

// hash
old_game = (location.hash == "#old")
const max_diamonds = (old_game ? 10000 : 5);			

// sources
sprites = new Image()
sprites.src = "/assets/sprites2.png"
sounds = {}
sounds.diamond = new Audio()
sounds.diamond.src = "/assets/sounds/diamond.mp3"
sounds.bounce = new Audio()
sounds.bounce.src = "/assets/sounds/bounce.mp3"
sounds.super = new Audio()
sounds.super.src = "/assets/sounds/super.mp3"
sounds.life = new Audio()
sounds.life.src = "/assets/sounds/life.mp3"
sounds.lifegain = new Audio()
sounds.lifegain.src = "/assets/sounds/lifegain.mp3"
sounds.win = new Audio()
sounds.win.src = "/assets/sounds/win.mp3"
sounds.jump = new Audio()
sounds.jump.src = "/assets/sounds/jump.mp3"
sounds.beep = new Audio()
sounds.beep.src = "/assets/sounds/beep.mp3"

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
    if (game.yourturn) {
        switch (event.key) {
            case "a":
            case "ArrowLeft":
                if (game.cursor > 0) {
                    game.cursor --;
                    game.cursoroffset += 200;
                    sounds.beep.cloneNode().play();
                }
                break;
            case "d":
            case "ArrowRight":
                if (game.cursor < 6) {
                    game.cursor ++;
                    game.cursoroffset -= 200;
                    sounds.beep.cloneNode().play();
                }
                break;
            case "w":
            case "ArrowUp":
                if (game.cursor > 0 && game.cursor < 6) {
                    game.selectedcards[game.cursor-1] = (game.selectedcards[game.cursor-1] == 0 ? 1 : 0)
                    sounds.bounce.play()
                } else if (game.cursor == 0) {
                    sounds.diamond.cloneNode().play();
                    if (game.diamondbet < Math.min(max_diamonds, game.money)) {
                        game.diamondbet ++;
                    } else {
                        game.diamondbet = Math.ceil(game.money / 100);
                    }
                } else {
                    game.yourturn = false;
                    game.cardanimation = 1;
                    sounds.super.play();
                }
                break;
        }
    }
    if (event.key == "ArrowUp") {
        resetround();
    }
})


function resetgame() {
    game = {
        time: 0,
        animations: 0,
        money: 5,
        cursor: 3,
        cards: [],
        selectedcards: [0,0,0,0,0],
        enemycards: [],
        enemyselectedcards: [0,0,0,0,0],
        yourturn: true,
        diamondbet: 1,
        cardanimation: 0,
        cardschanged: false,
        enemyhasplayed: false,
        winnerdecided: false,
        multiplier: 0,
        enemyfeeling: 0,
        enemyheight: 0,
        enemyvelocity: 0,
        enemybufferedjumps: 0,
        cursoroffset: 0
    }
    shufflecards(false)
    shufflecards(true)
}
resetgame()
function shufflecards(enemy) {
    new_list = [randomcard(), randomcard(), randomcard(), randomcard(), randomcard()]
    if (enemy) {
        game.enemycards = new_list
    } else {
        game.cards = new_list
    }
}
function resetround() {
    if (game.winnerdecided) {
        if (game.money <= 0) {
            if (window.top == window.self) {
                location.replace('/casino#2')
            } else {
                const messageObject = {
                    type: 'link',
                    link: '/casino#2'
                };
                parent.postMessage(JSON.stringify(messageObject), "*");
            }
        } else {
            game.yourturn = true;
            game.cardanimation = 0;
            game.cursor = 1;
            game.diamondbet = Math.ceil(game.money / 100);
            game.cardschanged = false;
            game.enemyhasplayed = false;
            game.winnerdecided = false;
            game.selectedcards = [0,0,0,0,0];
            game.enemyselectedcards = [0,0,0,0,0];
            game.enemyfeeling = 0;
            game.enemybufferedjumps = 0;
            shufflecards(false);
            shufflecards(true);
        }
    }
}
function randomcard() {
    return Math.floor(Math.random() * 6)
}

function draw() {
    game.time ++;
    game.cursoroffset /= 1.5
    if (game.cardanimation > 0) {
        game.cardanimation ++;
        if (game.cardanimation > 280 && !game.cardschanged) {
            for (card = 0; card < 5; card ++) {
                if (game.selectedcards[card] == 1) game.cards[card] = randomcard();
            }
            game.cardschanged = true
        }
    }
    if (game.time % 10 == 0) game.animations ++;
    // clear the screen of any bacteria
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    // draw the enemy
    ctx.drawImage(sprites, 300 + game.enemyfeeling * 16, (game.enemyheight > 0 ? 16 : 0), 16, 16, cvs.width/2 - 80, cvs.height - 710 - game.enemyheight, 160, 160)
    if (game.enemyheight > 0) {
        game.enemyvelocity -= 0.7
        game.enemyheight += game.enemyvelocity
    } else {
        if (game.enemybufferedjumps > 0) {
            game.enemyvelocity = 16;
            game.enemyheight += game.enemyvelocity
            game.enemybufferedjumps --;
            sounds.jump.play();
        } else {
            game.enemyheight = 0;
        }
    }
    // draw the cursor
    if (game.yourturn) {
        ctx.drawImage(sprites, 80, 128, 32, 32, cvs.width/2 - 80 - 480 + 160 * game.cursor + game.cursoroffset, cvs.height - 200, 160, 160)
    }
    // draw the cards and their face
    for (card = 0; card < 5; card ++) {
        ctx.drawImage(sprites, 64, 0, 64, 96, cvs.width/2 - 80 - 320 + 160 * card, cvs.height - 450 - game.selectedcards[card] * 50 + (game.selectedcards[card] == 1 ? -(game.cardanimation ** 2) : Math.min(game.cardanimation * 4, 200)), 160, 240)
        ctx.drawImage(sprites, game.cards[card] * 32, 96, 32, 32, cvs.width/2 - 60 - 320 + 160 * card, cvs.height - 390 - game.selectedcards[card] * 50 + (game.selectedcards[card] == 1 ? -(game.cardanimation ** 2) : Math.min(game.cardanimation * 4, 200)), 120, 120)
        if (game.selectedcards[card] == 1 && game.cardanimation > 100) {
            if (game.cardanimation > 280 + card * 20) {
                game.cardanimation ++;
                flip_card = 80 - (Math.min(game.cardanimation - card * 20, 360) - 280)
            } else if (game.cardanimation > 200 + card * 20) {
                game.cardanimation ++;
                flip_card = game.cardanimation - card * 20 - 200
            } else {
                flip_card = 0;
            }
            ctx.drawImage(sprites, (game.cardanimation - 20 * card > 280 ? 64 : 0), 0, 64, 96, cvs.width/2 - 80 - 320 + 160 * card + flip_card, cvs.height - 1000 + Math.min((game.cardanimation - 100) ** 1.7, 750), 160 - flip_card * 2, 240)
            if (game.cardanimation > 280 + card * 20) {
                ctx.drawImage(sprites, game.cards[card] * 32, 96, 32, 32, cvs.width/2 - 60 - 320 + 160 * card + flip_card * 0.75, cvs.height - 190, 120 - flip_card * 1.5, 120)
            }
        }
    }
    // ai
    if (game.cardanimation > 450 && !game.enemyhasplayed) {
        for (card = 0; card < 5; card ++) {
            foundmatch = false
            for (compcard = 0; compcard < 5; compcard ++) {
                if (card == compcard) compcard ++;
                if (game.enemycards[card] == game.enemycards[compcard]) foundmatch = true
            }
            game.enemyselectedcards[card] = (foundmatch ? 0 : 1)
        }
        for (card = 0; card < 5; card ++) {
            if (game.enemyselectedcards[card] == 1) game.enemycards[card] = randomcard()
        }
        game.enemyhasplayed = true;
    }

    // draw the enemy cards
    if (game.cardanimation > 450) {
        for (card = 0; card < 5; card ++) {
            ctx.drawImage(sprites, (game.cardanimation > 600 ? 64 : 0), 0, 64, 96, cvs.width/2 - 80 - 320 + 160 * card, cvs.height - 520 - (game.enemyselectedcards[card] == 1 ?
                Math.min(
                    (game.cardanimation - 450) ** 1.5, 
                    Math.max(
                        (650 - game.cardanimation) * 5, 
                        0
                    )
                )
            : 0), 160, 240)
            if (game.cardanimation > 650) {
                ctx.drawImage(sprites, game.enemycards[card] * 32, 96, 32, 32, cvs.width/2 - 60 - 320 + 160 * card, cvs.height - 460, 120, 120)
            }
        }
    }
    // decide winner
    if (game.cardanimation > 800 && !game.winnerdecided) {
        countcards = [0,0,0,0,0,0]
        countenemycards = [0,0,0,0,0,0]
        for (card = 0; card < 5; card ++) {
            countcards[5-game.cards[card]] ++;
            countenemycards[5-game.enemycards[card]] ++;
        }
        highestcard = 0;
        highestcardtemp = 0;
        highestenemycard = 0;
        highestenemycardtemp = 0;
        for (slot = 0; slot < 6; slot ++) {
            if (countcards[slot] >= highestcardtemp) {
                highestcardtemp = countcards[slot]
                highestcard = slot
            }
            if (countenemycards[slot] >= highestenemycardtemp) {
                highestenemycardtemp = countenemycards[slot]
                highestenemycard = slot
            }
        }
        countcards.sort().reverse();
        countenemycards.sort().reverse();
        yourlevel = 0;
        enemylevel = 0;
        if (countcards[0] == 5) {
            yourlevel = 6;
        } else if (countcards[0] == 4) {
            yourlevel = 5;
        } else if (countcards[0] == 3 && countcards[1] == 2) {
            yourlevel = 4;
        } else if (countcards[0] == 3) {
            yourlevel = 3;
        } else if (countcards[0] == 2 && countcards[1] == 2) {
            yourlevel = 2;
        } else if (countcards[0] == 2) {
            yourlevel = 1;
        }
        if (countenemycards[0] == 5) {
            enemylevel = 6;
        } else if (countenemycards[0] == 4) {
            enemylevel = 5;
        } else if (countenemycards[0] == 3 && countenemycards[1] == 2) {
            enemylevel = 4;
        } else if (countenemycards[0] == 3) {
            enemylevel = 3;
        } else if (countenemycards[0] == 2 && countenemycards[1] == 2) {
            enemylevel = 2;
        } else if (countenemycards[0] == 2) {
            enemylevel = 1;
        }
        if (yourlevel == enemylevel) {
            if (highestcard == highestenemycard) {
                game.winner = "draw"
            } else if (highestcard > highestenemycard) {
                game.winner = "you"
            } else {
                game.winner = "enemy"
            }
        } else if (yourlevel > enemylevel) {
            game.winner = "you"
        } else {
            game.winner = "enemy"
        }
        game.winnerdecided = true;
        sounds.win.play();
        if (game.winner == "you") {
            game.enemyfeeling = 2
            game.enemybufferedjumps = 1;
            switch(yourlevel) {
                case 1: game.multiplier = (old_game ? 2  : 2); break;
                case 2: game.multiplier = (old_game ? 3  : 2); break;
                case 3: game.multiplier = (old_game ? 4  : 2); break;
                case 4: game.multiplier = (old_game ? 6  : 2); break;
                case 5: game.multiplier = (old_game ? 8  : 3); break;
                case 6: game.multiplier = (old_game ? 16 : 4); break;
            }
            game.money += game.multiplier * game.diamondbet;
        } else if (game.winner == "enemy") {
            game.enemyfeeling = 1
            game.enemybufferedjumps = 3;
            game.money -= game.diamondbet
        }
    }
    if (game.winnerdecided) {
        switch(game.winner) {
            case "you": y = 128; break;
            case "enemy": y = 149; break;
            case "draw": y = 170; break;
        }
        ctx.drawImage(sprites, 160, y, 93, 21, cvs.width / 2 - 93 * 3, cvs.height / 2 - 21 * 3, 93 * 6, 21 * 6)
        if (game.winner == "you") {
            for (y = 0; y < game.diamondbet; y ++) {
                for (x = 0; x < game.multiplier; x ++) {
                    ctx.drawImage(sprites, ((game.animations + x + y) % 5) * 16, 128, 16, 16, cvs.width / 2 - 24 -	 game.multiplier * 24 + x * 16 * 3, cvs.height/2 + 100 + y * 16 * 3, 48, 48)
                }	
            }
        }
    }
    // draw gui
    ctx.drawImage(sprites, 192, 0, 65, 96, 10, 10, 65 * 3, 96 * 3)
    ctx.drawImage(sprites, 258, !old_game * 100, 16, 96, 210, 10, 16 * 3, 96 * 3)
    ctx.drawImage(sprites, 274, 0, 26, 192, cvs.width - 10 - 26 * 3, 10, 26 * 3, 192 * 3)
    ctx.drawImage(sprites, (game.animations % 5) * 16, 128, 16, 16, 10, cvs.height - 16 * 6 - 10, 16 * 6, 16 * 6)
    moneystring = game.money.toString()
    for (digit = 0; digit < moneystring.length; digit ++) {
        ctx.drawImage(sprites, moneystring[digit] % 10 * 8, 144, 8, 8, 10 + 16 * 6 + 8 * 6 * digit, cvs.height - 80, 8 * 6, 8 * 6)
    }
    // draw diamonds
    for (diamond = 0; diamond < game.diamondbet; diamond ++) {
        ctx.drawImage(sprites, game.animations % 5 * 16, 128, 16, 16, cvs.width/2 - 40 - 480, cvs.height - 300 - 80 * diamond, 80, 80)
    }
    // draw button to submit
    ctx.drawImage(sprites, 128, game.selectedcards.includes(1) * 32, 64, 32, cvs.width/2 - 80 + 480, cvs.height - 290, 160, 80)
}

setInterval(draw, 1000 / fps)
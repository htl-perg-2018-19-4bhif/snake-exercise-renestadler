//Include the required modules
const keypress = require('keypress');
const ansi = require('ansi');

// make `process.stdin` begin emitting "keypress" events
cursor = ansi(process.stdout);
keypress(process.stdin);
// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if (key) {
        switch (key.name) {
            case "up":
                if (snakeLength === 1 || lastDirection !== 0) {
                    direction = 2;
                } break;
            case "down":
                if (snakeLength === 1 || lastDirection !== 2) {
                    direction = 0;
                } break;
            case "left":
                if (snakeLength === 1 || lastDirection !== 1) {
                    direction = 3;
                }
                break;
            case "right":
                if (snakeLength === 1 || lastDirection !== 3) {
                    direction = 1;
                }
                break;
            case "escape":
                removeStuff(snakePos);
                removeStuff(applePos);
                printEnd(1, rownum);
                process.stdout.write('\x1B[?25h');
                process.exit(0);
                break;
        }
    }
});
process.stdin.setRawMode(true);
process.stdin.resume();

/*Declaration and Initialization of all Variables*/
var snakeLength = 1; //Current length of the snake
var appleNum = 1; //Number of apples in the game
var speed = 500; //Current 'real' speed of the game 
var speedOut = 5; //Current speed, which is shown as output
var direction = 1; //Direction which is the snake moving currently
var lastDirection = direction; //The direction, which the snake has taken before
var applePos = []; //Positions of the apple(s)
var snakePos = []; //Position of the parts of the snake

//Checking the arguments and add the border
process.stdout.write('\x1Bc');
rownum = parseInt(checkArgs());
drawBorder(rownum);
/*Adding the firstpart of the snake and the first apple(s)*/
var snakeTurn = [];
snakeTurn.push(Math.round(rownum / 2));
snakeTurn.push(Math.round(rownum / 2));
snakePos.push(snakeTurn);
for (i = 0; i < appleNum; i++) {
    applePos.push(generateApple(rownum, snakePos, applePos));
}

drawSnakes(snakePos);
drawApples(applePos);
printInfos(snakeLength, speedOut, rownum + 3);
playSnake();

//Primary function for playing the snake-game 
function playSnake() {
    //Timer to wait for the next move of the snake
    const timer = setInterval(() => {
        lastDirection = direction;
        moveSnake(snakePos, lastDirection);
        //Safing the tail of the snake for use, if an apple is consumed
        var tail = snakePos.shift();
        //Checking if an apple is consumed or any part of the snake or the wall is hit
        var result = checkSnakeApple(snakePos, applePos, rownum);
        if (result === -1) {
            //Something hit - end the game
            removeBlock(tail);
            snakePos.pop();
            removeStuff(snakePos);
            removeStuff(applePos);
            printEnd(0, rownum);
            process.stdout.write('\x1B[?25h');
            process.exit(0);
        } else if (result === 1) {
            //An apple is consumed - add the tail and generate a new apple
            snakePos.unshift(tail);
            snakeLength++;
            //Check if snake has max length - if yes, end the game
            if (snakeLength === Math.pow(rownum, 2)) {
                removeStuff(snakePos);
                removeStuff(applePos);
                printEnd(2, rownum);
                process.stdout.write('\x1B[?25h');
                process.exit(0);
            }
            newApple = 0;
            removeApple(applePos, snakePos[snakePos.length - 1]);
            if (snakeLength + appleNum - 1 < Math.pow(rownum, 2)) {
                newApple = generateApple(rownum, snakePos, applePos);
                applePos.push(newApple);
            }
            //increase the speed of the snake
            if (speed - 25 >= 100) {
                speed = speed - 25;
                speedOut++;
            } else {
                speed = 100;
            }
            drawSnake(snakePos[snakePos.length - 2], false);
            drawSnake(snakePos[snakePos.length - 1], true);
            if (newApple !== 0) {
                drawApple(newApple);
            }
            printInfos(snakeLength, speedOut, rownum + 3);
            clearInterval(timer);
            return playSnake(rownum);
        } else {
            removeBlock(tail);
            if (snakePos.length >= 2) {
                drawSnake(snakePos[snakePos.length - 2], false);
            }
            drawSnake(snakePos[snakePos.length - 1], true);
            printInfos(snakeLength, speedOut, rownum + 3);
        }
    }, speed);
}

//Check the arguments and return the number of row and cols, you want to play with
function checkArgs() {
    if (process.argv.length === 2) {
        return 10;
    } else if (process.argv.length === 4) {
        if (process.argv.indexOf("-n") !== -1) {
            index = process.argv.indexOf("-n") + 1;
            if (parseInt(process.argv[index]) < 3) {
                printUsage();
            } else {
                return process.argv[index];
            }
        } else if (process.argv.indexOf("-a") !== -1) {
            index = process.argv.indexOf("-a") + 1;
            if (parseInt(process.argv[index]) < 1 || (parseInt(process.argv[index]) >= Math.pow(10, 2))) {
                printUsage();
            } else {
                appleNum = parseInt(process.argv[index]);
            }
            return 10;
        } else {
            printUsage();
        }
    } else if (process.argv.length === 6) {
        numRows = 10;
        if (process.argv.indexOf("-n") !== -1) {
            index = process.argv.indexOf("-n") + 1;
            if (parseInt(process.argv[index]) < 3) {
                printUsage();
            } else {
                numRows = process.argv[index];
            }
        } else {
            printUsage();
        }
        if (process.argv.indexOf("-a") !== -1) {
            index = process.argv.indexOf("-a") + 1;
            if (parseInt(process.argv[index]) < 1 || (parseInt(process.argv[index]) >= Math.pow(numRows, 2))) {
                printUsage();
            } else {
                appleNum = parseInt(process.argv[index]);
                return numRows;
            }
        } else {
            printUsage();
        }
    }
    printUsage();
}

//If wrong arguments are used, this method is called to print the right usage of this program
function printUsage() {
    console.error("Usage: node <programname> [-n <rownum> | -a <applenum>]");
    process.exit(-1);
}

//Remove that apple, which is eaten by the snake, from the array
function removeApple(applePos, snakePos) {
    for (i = 0; i < applePos.length; i++) {
        if (applePos[i][0] === snakePos[0] && applePos[i][1] === snakePos[1]) {
            for (j = i; j < applePos.length - 1; j++) {
                applePos[j] = applePos[j + 1];
            }
            applePos.pop();
            return;
        }
    }
}

//Draw the border for the snake-game
function drawBorder(rownum) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.grey();
    for (i = 1; i < rownum * 2 + 5; i++) {
        cursor.goto(i, 0).write(' ');
    }
    for (i = 0; i < rownum * 2 + 5; i++) {
        cursor.goto(i, rownum + 2).write(' ');
    }
    for (i = 0; i < rownum + 2; i++) {
        cursor.goto(1, i).write(' ');
        cursor.goto(2, i).write(' ');
    }
    for (i = 0; i < rownum + 2; i++) {
        cursor.goto(rownum * 2 + 3, i).write(' ');
        cursor.goto(rownum * 2 + 4, i).write(' ');
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Draw all the apples
function drawApples(applePos) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.red().hex("#100000");
    for (i = 0; i < applePos.length; i++) {
        cursor.goto(applePos[i][0] * 2 + 1, applePos[i][1] + 1).write('\'');
        cursor.goto(applePos[i][0] * 2 + 2, applePos[i][1] + 1).write('\'');
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Draw one apple
function drawApple(applePos) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.red().hex("#100000");
    cursor.goto(applePos[0] * 2 + 1, applePos[1] + 1).write('\'');
    cursor.goto(applePos[0] * 2 + 2, applePos[1] + 1).write('\'');
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Draw all the snakes
function drawSnakes(snakePos) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.green().hex("#000703");
    for (i = 0; i < snakePos.length; i++) {
        if (i == snakePos.length - 1) {
            cursor.bg.green().red();
            cursor.goto(snakePos[i][0] * 2 + 1, snakePos[i][1] + 1).write(':');
            cursor.goto(snakePos[i][0] * 2 + 2, snakePos[i][1] + 1).write(':');
        } else {
            cursor.goto(snakePos[i][0] * 2 + 1, snakePos[i][1] + 1).write('-');
            cursor.goto(snakePos[i][0] * 2 + 2, snakePos[i][1] + 1).write('-');
        }
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Draw the head of the snake
function drawSnake(snakePos, isHead) {
    process.stdout.write('\x1B[?25h');
    if (isHead) {
        cursor.bg.green().red();
        cursor.goto(snakePos[0] * 2 + 1, snakePos[1] + 1).write(':');
        cursor.goto(snakePos[0] * 2 + 2, snakePos[1] + 1).write(':');
    } else {
        cursor.bg.green().hex("#000703");
        cursor.goto(snakePos[0] * 2 + 1, snakePos[1] + 1).write('-');
        cursor.goto(snakePos[0] * 2 + 2, snakePos[1] + 1).write('-');
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Print all the infos concerning the game
function printInfos(snakeLength, speed, rownum) {
    process.stdout.write('\x1B[?25h');
    cursor.bold();
    cursor.goto(1, rownum).write("Points:\t" + (parseInt(snakeLength) - 1));
    cursor.goto(1, rownum + 1).write("SnakeLength:\t" + snakeLength);
    cursor.goto(1, rownum + 2).write("Speed:\t" + speed);
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Remove stuff from one single coordinate
function removeBlock(pos) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.black();
    cursor.goto(pos[0] * 2 + 1, pos[1] + 1).write(' ');
    cursor.goto(pos[0] * 2 + 2, pos[1] + 1).write(' ');
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Remove a whole array of coordinates
function removeStuff(anyPos) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.black();
    for (i = 0; i < anyPos.length; i++) {
        cursor.goto(anyPos[i][0] * 2 + 1, anyPos[i][1] + 1).write(' ');
        cursor.goto(anyPos[i][0] * 2 + 2, anyPos[i][1] + 1).write(' ');
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

//Print the end result 
function printEnd(endType, rownum) {
    process.stdout.write('\x1B[?25h');
    cursor.bg.hex("#100000").red();
    for (i = rownum - 5; i < rownum + 5; i++) {
        cursor.goto(i + 3, Math.round(rownum / 2)).write(' ');
    }
    switch (endType) {
        case 0:
            cursor.goto(rownum - 2, Math.round(rownum / 2) + 1).write("Game Over!"); break;
        case 1:
            cursor.goto(rownum - 2, Math.round(rownum / 2) + 1).write(" Game End!"); break;
        case 2:
            cursor.goto(rownum - 2, Math.round(rownum / 2) + 1).write(" Game Won!"); break;
        default: break;
    }
    for (i = rownum - 5; i < rownum + 5; i++) {
        cursor.goto(i + 3, Math.round(rownum / 2) + 2).write(' ');
    }
    cursor.reset();
    cursor.goto(1, rownum + 6);
    process.stdout.write('\x1B[?25l');
}

//Generates a new apple at a random position
function generateApple(rownum, snakePos, applePos) {
    var curApple = [];
    curApple.push(Math.floor(Math.random() * (rownum)) + 1);
    curApple.push(Math.floor(Math.random() * (rownum)) + 1);

    //Checking if the position of the apple is valid
    for (i = 0; i < snakePos.length; i++) {
        if (snakePos[i][0] === curApple[0] && snakePos[i][1] === curApple[1]) {
            return generateApple(rownum, snakePos, applePos);
        }
    }
    for (i = 0; i < applePos.length; i++) {
        if (applePos[i][0] === curApple[0] && applePos[i][1] === curApple[1]) {
            return generateApple(rownum, snakePos, applePos);
        }
    }
    return curApple;
}

//move the snake like that: 0...down 1...right 2...up 3...left
function moveSnake(snakePos, direction) {
    var curPos = snakePos.length - 1;
    var newPos = [];
    switch (direction) {
        case 0: newPos.push(snakePos[curPos][0]);
            newPos.push(snakePos[curPos][1] + 1);
            break;
        case 1: newPos.push(snakePos[curPos][0] + 1);
            newPos.push(snakePos[curPos][1]);
            break;
        case 2: newPos.push(snakePos[curPos][0]);
            newPos.push(snakePos[curPos][1] - 1);
            break;
        case 3: newPos.push(snakePos[curPos][0] - 1);
            newPos.push(snakePos[curPos][1]);
            break;
        default: break;
    }
    snakePos.push(newPos);
}

//check if snake collected apple, ran into a wall or simply hit herself
function checkSnakeApple(snakePos, applePos, rownum) {
    var snakeLength = snakePos.length - 1;

    //Check if the apple is consumed
    for (i = 0; i < applePos.length; i++) {
        if (snakePos[snakeLength][0] === applePos[i][0] &&
            snakePos[snakeLength][1] === applePos[i][1]) {
            return 1;
        }
    }

    //Check if a wall is hit
    if (snakePos[snakeLength][0] < 1 ||
        snakePos[snakeLength][1] < 1 ||
        snakePos[snakeLength][0] === rownum + 1 ||
        snakePos[snakeLength][1] === rownum + 1) {
        return -1;
    }

    //Check if another part of the snake is hit
    for (i = 0; i < snakeLength; i++) {
        if (snakePos[i][0] === snakePos[snakeLength][0] &&
            snakePos[i][1] === snakePos[snakeLength][1]) {
            return -1;
        }
    }
    return 0;
}
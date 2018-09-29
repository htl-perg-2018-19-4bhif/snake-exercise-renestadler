//Setting the colors of all items
const chalk = require('chalk');
const keypress = require('keypress');

//Problem: the colors are not shown in their actual brightness in the built-in terminal
//Solution: use an foreign terminal window to get the perfect color-vision
border = chalk.bgRgb(128, 128, 128);
snakeHead = chalk.bgRgb(0, 255, 0).rgb(255, 0, 0);
snakeBack = chalk.bgRgb(0, 255, 0).rgb(18, 147, 5);
apple = chalk.bgRgb(255, 0, 0).rgb(10, 0, 0);
end = chalk.bgRgb(45, 0, 0).rgb(255, 0, 0);

rownum = parseInt(checkArgs());

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if (key) {
        if (key.name === "up") {
            if (snakeLength === 1 || lastDirection !== 0) {
                direction = 2;
            }
        } else if (key.name === "down") {
            if (snakeLength === 1 || lastDirection !== 2) {
                direction = 0;
            }
        } else if (key.name === "left") {
            if (snakeLength === 1 || lastDirection !== 1) {
                direction = 3;
            }
        } else if (key.name === "right") {
            if (snakeLength === 1 || lastDirection !== 3) {
                direction = 1;
            }
        } else if (key.name === "escape") {
            printEnd(field, snakeLength, speedOut, 1);
            process.exit(0);
        }
    }
});
process.stdin.setRawMode(true);
process.stdin.resume();

/*Declaration and Initialization of all Variables*/
var field = initField(rownum);
var snakeLength = 1; //Current length of the snake
var speed = 500; //Current 'real' speed of the game 
var speedOut = 5; //Current speed, which is shown as output
var direction = 1; //Direction which is the snake moving currently
var lastDirection = direction; //The direction, which the snake has taken before
var applePos = []; //Positions of the apple(s)
var snakePos = []; //Position of the parts of the snake

/*Adding the firstpart of the snake and the first apple*/
var snakeTurn = [];
snakeTurn.push(Math.round(rownum / 2) - 1);
snakeTurn.push(Math.round(rownum / 2) - 1);
snakePos.push(snakeTurn);
applePos.push(generateApple(rownum, snakePos));

/*Print the field the first time and start the primary game*/
insertAppleSnake(field, applePos, snakePos);
printField(field, snakeLength, speedOut);
playSnake(rownum);

//Primary function for playing the snake-game 
function playSnake(rownum) {
    //Timer to wait for the next move of the snake
    const timer = setInterval(() => {
        //Removing apples and snakes from the field
        clearField(field);
        lastDirection = direction;
        moveSnake(snakePos, lastDirection);
        //Safing the tail of the snake for use, if an apple is consumed
        var tail = snakePos.shift();
        //Checking if an apple is consumed or any part of the snake or the wall is hit
        var result = checkSnakeApple(snakePos, applePos, rownum);
        if (result === -1) {
            //Something hit - end the game
            printEnd(field, snakeLength, speedOut, 0);
            process.exit(0);
        } else if (result === 1) {
            //An apple is consumed - add the tail and generate a new apple
            snakePos.unshift(tail);
            snakeLength++;
            //Check if snake has max length - if yes, end the game
            if (snakeLength === Math.pow(rownum - 2, 2)) {
                clearInterval(timer);
                printEnd(field, snakeLength, speedOut, 2);
                process.exit(0);

            }
            //Apple generation and reseting of the timer
            applePos.shift();
            applePos.push(generateApple(rownum, snakePos));

            //increase the speed of the snake
            if (speed - 25 >= 100) {
                speed = speed - 25;
                speedOut++;
            } else {
                speed = 100;
            }
            insertAppleSnake(field, applePos, snakePos);
            printField(field, snakeLength, speedOut);
            clearInterval(timer);
            return playSnake(rownum);
        }
        //Output of the field again
        insertAppleSnake(field, applePos, snakePos);
        printField(field, snakeLength, speedOut);
    }, speed);
}

//Check the arguments and return the number of row and cols, you want to play with
function checkArgs() {
    if (process.argv.length === 4) {
        if (process.argv[2] === "-n") {
            if (parseInt(process.argv[3]) >= 5) {
                return process.argv[3];
            }
            else {
                printUsage();
            }
        } else {
            printUsage();
        }
    } else if (process.argv.length === 2) {
        return 10;
    } else {
        printUsage();
    }
}

//If wrong arguments are used, this method is called to print the right usage of this program
function printUsage() {
    console.error("Usage: node <programname> [-n <rownum>]");
    process.exit(-1);
}

//Function for printing the playField including all stub and reset
function printField(field, snakeLength, speed) {
    //Clear the console
    process.stdout.write('\033c');

    //Output the whole field
    console.log("Press ESC to end the game and have a lot of fun with my snake version:");
    for (i = 0; i < field.length; i++) {
        for (n = 0; n < field.length * 2; n++) {
            if (field[i][n] === '.') {
                process.stdout.write(border.visible(' '));
            } else if (field[i][n] === ';') {
                process.stdout.write(snakeHead.visible(':'));
            } else if (field[i][n] === ' ') {
                process.stdout.write(snakeBack.visible('-'));
            } else if (field[i][n] === 'a') {
                process.stdout.write(apple.visible('\''));
            } else {
                process.stdout.write(' ');
            }
        }
        console.log();
    }
    console.log("Points:\t" + (parseInt(snakeLength) - 1));
    console.log("SnakeLength:\t" + snakeLength);
    console.log("Speed:\t" + speed);
}

function printEnd(field, snakeLength, speed, endType) {
    fieldsize = Math.round(field.length / 2);
    //Clear the console
    process.stdout.write('\033c');
    for (i = 0; i < field.length; i++) {
        if (i === fieldsize - 1) {
            for (j = 0; j < field.length - 5; j++) {
                if (j < 2) {
                    process.stdout.write(border.visible(' '));
                } else {
                    process.stdout.write(end.visible(' '));
                }
            }
            switch (endType) {
                case 0: process.stdout.write(end.visible("Game Over!")); break;
                case 1: process.stdout.write(end.visible(" Game End!")); break;
                case 2: process.stdout.write(end.visible(" Game Won!")); break;
                default: break;
            }
            for (j = field.length + 5; j < field.length * 2; j++) {
                if (j >= field.length * 2 - 2) {
                    process.stdout.write(border.visible(' '));
                } else {
                    process.stdout.write(end.visible(' '));
                }
            }
        } else {
            for (n = 0; n < field.length * 2; n++) {
                if (field[i][n] === '.') {
                    process.stdout.write(border.visible(' '));
                } else {
                    process.stdout.write(end.visible(' '));
                }
            }
        }
        console.log();
    }
    console.log("Points:\t" + (parseInt(snakeLength) - 1));
    console.log("SnakeLength:\t" + snakeLength);
    console.log("Speed:\t" + speed);
}

//Initialize the playField before starting the game
function initField(rownum) {
    var field = [];
    for (i = 0; i < rownum; i++) {
        var fieldWidth = [];
        if (i === 0 || i == rownum - 1) {
            for (n = 0; n < rownum * 2; n++) {
                fieldWidth.push('.');
            }
        } else {
            for (n = 0; n < rownum * 2; n++) {
                if (n <= 1 || n >= 2 * (rownum - 1)) {
                    fieldWidth.push('.');
                } else {
                    fieldWidth.push('');
                }
            }
        }
        field.push(fieldWidth);
    }
    return field;
}

//Clear the field into the borders
function clearField(field) {
    for (i = 1; i < field.length - 1; i++) {
        for (j = 2; j < field[i].length - 2; j++) {
            field[i][j] = '';
        }
    }
}

//Generates a new apple at a random position
function generateApple(rownum, snakePos) {
    var applePos = [];
    applePos.push(Math.floor(Math.random() * (rownum - 2)) + 1);
    applePos.push(Math.floor(Math.random() * (rownum - 2)) + 1);

    //Checking if the position of the apple is valid
    for (i = 0; i < snakePos.length; i++) {
        if (snakePos[i][0] === applePos[0] && snakePos[i][1] === applePos[1]) {
            return generateApple(rownum, snakePos);
        }
    }
    return applePos;
}

//move the snake like that: 0...down 1...right 2...up 3...left
function moveSnake(snakePos, direction) {
    var curPos = snakePos.length - 1;
    var newPos = [];
    switch (direction) {
        case 0: newPos.push(snakePos[curPos][0] + 1);
            newPos.push(snakePos[curPos][1]);
            break;
        case 1: newPos.push(snakePos[curPos][0]);
            newPos.push(snakePos[curPos][1] + 1);
            break;
        case 2: newPos.push(snakePos[curPos][0] - 1);
            newPos.push(snakePos[curPos][1]);
            break;
        case 3: newPos.push(snakePos[curPos][0]);
            newPos.push(snakePos[curPos][1] - 1);
            break;
        default: break;
    }
    snakePos.push(newPos);
}

//Insert Apples and Snakes into the field
function insertAppleSnake(field, applePos, snakePos) {
    //Insertion of the apple
    for (i = 0; i < applePos.length; i++) {
        field[applePos[i][0]][applePos[i][1] * 2] = 'a';
        field[applePos[i][0]][applePos[i][1] * 2 + 1] = 'a';
    }

    //Insertion of the snake
    for (i = 0; i < snakePos.length; i++) {
        if (i == snakePos.length - 1) {
            field[snakePos[i][0]][snakePos[i][1] * 2] = ';';
            field[snakePos[i][0]][snakePos[i][1] * 2 + 1] = ';';
        } else {
            field[snakePos[i][0]][snakePos[i][1] * 2] = ' ';
            field[snakePos[i][0]][snakePos[i][1] * 2 + 1] = ' ';
        }
    }
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
    if (snakePos[snakeLength][0] === 0 ||
        snakePos[snakeLength][1] === 0 ||
        snakePos[snakeLength][0] === rownum - 1 ||
        snakePos[snakeLength][1] === rownum - 1) {
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
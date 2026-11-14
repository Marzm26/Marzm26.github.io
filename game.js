window.onload = function () {
    "use strict";

    //Variables
    const balls = [];
    const blocks = [];
    const blockPositions = [];
    const barriers = [];
    var barrierPositions = {};

    var level = 0;
    var gameSpeed = 1;
    const keysDown = {};

    var blockSizeX = 25;
    var blockSizeY = 25;

    //[size, color, speed, cost, name]
    const ballTypes = [
        { size: 7, color: "yellow", speed: 1, cost: 25, name: "Basic", amount: 0, power: 1 },
        { size: 8.5, color: "pink", speed: 0.75, cost: 200, name: "Plasma", amount: 0, other: { splash: 50 }, power: 3 },
        { size: 8, color: "white", speed: 2.5, cost: 500, name: "Sniper", amount: 0, power: 5 },
        { size: 10, color: "gray", speed: 0.75, cost: 1500, name: "Cannon", amount: 0, power: 100 },
        { size: 5, color: "purple", speed: 2, cost: 500, name: "Gravity", amount: 0, other: { gravity: 0.1 }, power: 1 }
    ];
    //colors
    const blockTypes = [
        "skyblue",
        "pink",
        "red",
        "yellow",
        "orange",
        "blue",
        "red",
        "voilet",
        "purple",
        "teal"
    ];

    const buttons = [];

    //Player
    var clickPower = 1;
    var costMultiplier = 1.5;
    var cash = 15;
    var mouseX;
    var mouseY;
    let cashTxt = new Text("$" + cash, "10pt Verdana");
    cashTxt.setPosition(getWidth() - 100, 15);
    cashTxt.setColor("white");
    cashTxt.layer = 2;

    let levelTxt = new Text("Level " + level, "10pt Verdana");
    levelTxt.setPosition(getWidth() - 100, 30);
    levelTxt.setColor("white");
    levelTxt.layer = 2;


    function btn(ballType, x, y) {
        var ballInfo = ballTypes[ballType];
        var rect = new Rectangle(40, 40);
        rect.setPosition(x, y);
        rect.setColor("orange");
        add(rect);

        var c = new Circle(ballInfo.size);
        add(c);
        c.setPosition(x + 20, y + 20);
        c.setColor(ballInfo.color);
        c.setBorderColor("black");
        c.setBorderWidth(2);

        let name = new Text(ballInfo.name, "7pt Arial");
        name.setPosition(x + 5, y + 12);
        name.setColor("black");
        add(name);

        let txt = new Text("", "7pt Arial");
        txt.setPosition(x + 5, y + 33);
        txt.setColor("black");
        add(txt);

        buttons.push({ rect: rect, x: x, y: y, txt: txt, cost: ballInfo.cost });

        updateButton(ballType, buttons[ballType]);
    }

    document.addEventListener('mousemove', function (event) {
        mouseX = event.offsetX;
        mouseY = event.offsetY;
    });

    document.addEventListener("click", function () {
        var v = -1;
        var x = mouseX;
        var y = mouseY;

        for (var i = 0; i < buttons.length; i++) {
            var btnInfo = buttons[i];
            var bX = btnInfo.x;
            var bY = btnInfo.y;

            if (x >= bX && x <= bX + 40 && y >= bY && y <= bY + 40) {
                if (cash >= btnInfo.cost) {
                    v = i;
                    cash -= btnInfo.cost;
                }
                break;
            }
        }

        if (v > -1) {
            newBall(v);
        }

        for (var blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
            var blockInfo = blocks[blockIndex];
            var bX = blockInfo.x;
            var bY = blockInfo.y;

            if (x >= bX && x <= bX + blockSizeX && y >= bY && y <= bY + blockSizeY) {
                damageBlock(clickPower, blockInfo);

                if (blockInfo.health <= 0) {
                    destroyBlock(blockIndex);
                    blockIndex--;
                }
                break;
            }
        }
    })

    function updateButton(ballType, btn) {
        var ballInfo = ballTypes[ballType];
        btn.cost = Math.round(ballInfo.cost + ballInfo.cost * (ballInfo.amount) * costMultiplier);
        btn.txt.setText("$" + btn.cost);
    }

    function addButton(ballType) {
        var ballInfo = ballTypes[ballType];

        var buttonShort = document.createElement("button");
        updateButton(ballType, buttonShort);

        var body = document.getElementsByTagName("body")[0];

        buttonShort.style.width = '50px'; // setting the width to 200px
        buttonShort.style.height = '100px'; // setting the height to 200px
        buttonShort.style.background = 'black'; // setting the background color to teal
        buttonShort.style.color = 'white'; // setting the color to white
        buttonShort.style.fontSize = '8px'; // setting the font size to 20px

        body.appendChild(buttonShort);

        buttonShort.addEventListener("click", function () {
            newBall(ballType);
        });

        buttons[ballType] = buttonShort;
    }

    function AddShop() {
        for (var i = 0; i < ballTypes.length; i++) {
            btn(i, 5 + (50 * i), 5);
        }
    }

    document.addEventListener('keydown', (event) => {
        keysDown[event.code] = true;

        if (keysDown["ShiftLeft"] == true) {
            var num = event.code.substring(5, 6); //Take the number out of "Digit#", like "Digit2" -> "2"

            if (Number(num)) { //Turn the string into a number
                newBall(Number(num) - 1);
            }
        } else {
            var num = event.code.substring(5, 6);

            if (Number(num) || num == 0) {
                gameSpeed = 2 * Number(num);
            }
        }


        if (event.key == "c") { p(cash); }
    });

    document.addEventListener('keyup', (event) => {
        keysDown[event.code] = false;
    });

    function p(str) { console.log(str); }

    function randomNumber(min, max) {
        return min + (Math.random() * max);
    }

    function randomRoundedNumber(min, max) {
        return Math.round(randomNumber(min, max));
    }
    function sqrt(num) { return Math.sqrt(num); }
    function between(num, x1, x2) {
        return num >= x1 && num <= x2 || num <= x1 && num >= x2;
    }

    //(x1−xC)2+(y−yC)2≤r2 or (x2−xC)2+(y−yC)2≤r2

    function getClosestPosInRect(b, rect) {
        var bx = b.x;
        var by = b.y;

        var rx = rect.x + blockSizeX / 2;
        var ry = rect.y + blockSizeY / 2;

        var clampedX = clamp(bx, rx - blockSizeX / 2, rx + blockSizeX / 2);
        var clampedY = clamp(by, ry - blockSizeY / 2, ry + blockSizeY / 2);

        return { x: clampedX, y: clampedY };
    }
    function collide_ballrect(ball, rect) {
        var bx = ball.x;
        var by = ball.y;

        var hitPos = getClosestPosInRect(ball, rect)
        var hitX = hitPos.x;
        var hitY = hitPos.y;

        var dx = bx - hitX;
        var dy = by - hitY;
        var dist = (dx ** 2 + dy ** 2) ** 0.5;

        if (dist > ball.size) { return false; }
        if (dist == 0) { dist = 0.0001; }

        //var angle =  Math.atan2(dy, dx);

        //Cannon balls don't bounce if theyre stronger than the colliding block
        if (ball.name == "Cannon" && rect["health"] && ball.power >= rect.health) {
            return true;
        }

        var fractX = dx / dist; //how much of the distance is x
        var fractY = dy / dist; //how much of the distance is y
        var overlap = ball.size - dist; //more distance = less overlap
        ball.x += overlap * fractX;
        ball.y += overlap * fractY;

        var vn = ball.speed;

        if (fractX != 0) { ball.vx = vn * fractX; }
        if (fractY != 0) { ball.vy = vn * fractY; }

        return true;
    }

    function intersects(ballInfo, blockInfo) {
        return collide_ballrect(ballInfo, blockInfo);
        // Find the nearest point on the 
        // rectangle to the center of 
        // the circle
        /*let Xn = Math.max(blockInfo.x, Math.min(ballInfo.x, blockInfo.x2));
        let Yn = Math.max(blockInfo.y, Math.min(ballInfo.y, blockInfo.y2));
          
        // Find the distance between the 
        // nearest point and the center 
        // of the circle
        // Distance between 2 points, 
        // (x1, y1) & (x2, y2) in 
        // 2D Euclidean space is
        // ((x1-x2)**2 + (y1-y2)**2)**0.5
        let Dx = Xn - ballInfo.x;
        let Dy = Yn - ballInfo.y;
        var collides = (Dx * Dx + Dy * Dy) <= ballInfo.size * ballInfo.size;
        
        if (collides) {
            //p("Dx: " + Dx);
            //p("Dy: " + Dy);
            
            //Prevent balls from being stuck inside solely barriers
            if (Dx == 0 && Dy == 0 && !blockInfo["name"]) {
                ballInfo.x += ballInfo.size;
                ballInfo.y += ballInfo.size;
            }
            
            var bounce = true;
            if (blockInfo["health"] && ballInfo.name == "Cannon" && ballInfo.power >= blockInfo.health) {
                bounce = false;
            }
            
            if (bounce) {
                var radius = ballInfo.size / 2;
                if ((ballInfo.x + radius >= blockInfo.x || ballInfo.x + radius <= blockInfo.x) && Dx !== 0) {
                    ballInfo.vx *= -1;
                    
                    if (ballInfo.x + radius >= blockInfo.x) { ballInfo.x += 1; }
                    if (ballInfo.x + radius <= blockInfo.x) { ballInfo.x -= 1; }
                } else
                if ((ballInfo.y + radius >= blockInfo.y || ballInfo.y + radius <= blockInfo.y) && Dy !== 0) {
                    ballInfo.vy *= -1;
                    
                    if (ballInfo.y + radius >= blockInfo.y) { ballInfo.y += 1; }
                    if (ballInfo.y + radius <= blockInfo.y) { ballInfo.y -= 1; }
                }
            }
            
            if (between(blockInfo.x, ballInfo.x, ballInfo.prevX) || 
            between(blockInfo.x + blockSizeX, ballInfo.x, ballInfo.prevX) ||
            between(blockInfo.y, ballInfo.y, ballInfo.prevY) ||
            between(blockInfo.y + blockSizeY, ballInfo.y, ballInfo.prevY)) {
                if (ballInfo.x > blockInfo.x) { //Ball is to the right of block
                    //ballInfo.x = blockInfo.x + ballInfo.size * 1.1;
                } else if (ballInfo.x < blockInfo.x) {
                    //ballInfo.x = blockInfo.x - ballInfo.size * 1.1;
                }
                if (ballInfo.y > blockInfo.y) { //Ball is below block
                    //ballInfo.y = blockInfo.y + ballInfo.size * 1.1;
                } else if (ballInfo.y < blockInfo.y) {
                    //ballInfo.y = blockInfo.y - ballInfo.size * 1.1;
                }
                
                //if (ballInfo.x  == blockInfo.x) { p("hi"); }
            }
        }
        
        return collides;*/
    }

    const PI = Math.PI;
    function newBall(index) {
        //Set the type
        var ballInfo = ballTypes[index];
        ballInfo.amount += 1;

        var button = buttons[index];
        updateButton(index, button);

        //Random velocity
        var speed = ballInfo.speed;
        var randomAngle = Math.random() * 2 * PI;
        var velX = speed * Math.sin(randomAngle);
        var velY = speed * Math.cos(randomAngle);

        var c = new Circle(ballInfo.size);
        add(c);
        c.setPosition(200, 250);
        c.setColor(ballInfo.color);
        c.setBorderColor("black");
        c.setBorderWidth(2);

        balls.push({
            name: ballInfo.name,
            type: index,
            x: 200, y: 250,
            vx: velX, vy: velY,
            speed: ballInfo.speed, power: ballInfo.power,
            obj: c, size: ballInfo.size,
            other: ballInfo.other,
        });
    }

    var rect = new Rectangle(getWidth(), 50);
    rect.setPosition(0, 0);
    rect.setColor("black");
    add(rect);

    AddShop();

    function newBlock(x, y) {
        if (barrierPositions["x" + x] && barrierPositions["x" + x]["y" + y]) { return; }

        var rect = new Rectangle(blockSizeX, blockSizeY);
        rect.setPosition(x, y);
        rect.setColor("black");

        rect.setBorderColor("black");
        rect.setBorderWidth(3);

        add(rect);
        var health = level;

        blocks.push({
            x: x, y: y, x2: x + blockSizeX, y2: y + blockSizeY, health: level, block: rect,
            prevX: x, prevY: y
        });
        blockPositions[x / blockSizeX][y / blockSizeY] = blocks[blocks.length - 1];
    }

    function makeBlocks(startX, startY, rows, cols) {
        for (var r = 0; r < rows; r++) {
            blockPositions[r] = [];

            for (var c = 0; c < cols; c++) {
                if (c == 1) {
                    //console.log("Middle X is " + (startX + (50 * r)));
                }
                newBlock(startX + (blockSizeX * r), startY + (blockSizeY * c));
            }
        }
    }

    function newBarrier(x, y) {
        //Skip if one is already in the same position
        if (barrierPositions["x" + x]["y" + y]) {
            return;
        }

        var rect = new Rectangle(blockSizeX, blockSizeY);
        rect.setPosition(x, y);
        rect.setColor("black");

        rect.setBorderColor("black");
        rect.setBorderWidth(3);

        add(rect);

        barriers.push({
            x: x, y: y, x2: x + blockSizeX, y2: y + blockSizeY, block: rect
        });

        barrierPositions["x" + x]["y" + y] = barriers[barriers.length - 1];
    }

    function makeBarriers(startX, startY, rows, cols) {
        for (var r = 0; r < rows; r++) {
            var x = startX + (blockSizeX * r);
            if (!barrierPositions["x" + x]) {
                barrierPositions["x" + x] = {};
            }

            for (var c = 0; c < cols; c++) {
                var y = startY + (blockSizeY * c);
                newBarrier(x, y);
            }
        }
    }

    function pow(x, x2) { return Math.pow(x, x2); }
    function abs(x) { return Math.abs(x); }

    function getRev() {
        if (level % 2 == 0) { return 1; } else { return -1; }
    }

    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }

    function damageBlock(damage, blockInfo) {
        blockInfo.health -= damage;

        var color
        if (blockTypes[blockInfo.health - 1]) {
            color = blockTypes[blockInfo.health - 1];
        } else {
            color = "black";
        }
        blockInfo.block.setColor(color);

        cash += damage;
    }

    function destroyBlock(index) {
        var blockInfo = blocks[index];
        makeNearbyBlocksVisible(blockInfo);
        blocks.splice(index, 1);
        remove(blockInfo.block);
    }

    function blockDist(b1, b2) {
        return Math.sqrt(pow(b1.x - b2.x, 2) + pow(b1.y - b2.y, 2));
    }

    var newLevel = false;
    function MainLoop() {
        if (gameSpeed <= 0) { return; }

        for (var i = 0; i < balls.length; i++) {
            var b = balls[i];
            var size = ballTypes[b.type].size;

            if (b["other"] && b.other["gravity"]) {
                var rev = getRev();
                if (newLevel) {
                    b.vy = rev * b.speed;
                }

                b.vy = clamp(b.vy + (rev * b.other.gravity * gameSpeed), -b.speed, b.speed);
            }

            b.prevX = b.x;
            b.prevY = b.y;
            b.x += b.vx * gameSpeed;
            b.y += b.vy * gameSpeed;

            b.obj.setPosition(b.x, b.y);

            //--Checking collisions
            //Edges
            var hitWall = false;
            if (b.x < 0 + size) { //Left edge
                b.vx = -b.vx;
                b.x = size;
                hitWall = true;
            } else if ((b.x) > getWidth() - (size / 2)) { //Right edge
                b.vx = -b.vx;
                b.x = getWidth() - size / 2;
                hitWall = true;
            }
            if (b.y > getHeight() - size) { //Bottom edge
                b.vy = -b.vy;
                b.y = getHeight() - size;
                hitWall = true;
            } else if ((b.y) < 50 + b.size) { //Top edge
                b.vy = -b.vy;
                b.y = 50 + b.size;
                hitWall = true;
            }

            //Barriers
            for (var barrierIndex = 0; barrierIndex < barriers.length; barrierIndex++) {
                var barrierInfo = barriers[barrierIndex];
                collide_ballrect(b, barrierInfo);
            }

            //Blocks
            var closestBlock;
            var closestDist = 500;
            for (var v = 0; v < blocks.length; v++) {
                var blockInfo = blocks[v];

                var bX = blockInfo.x;
                var bY = blockInfo.y;

                if (blockInfo.health <= 0) {
                    destroyBlock(v);
                    v--;
                    continue;
                }

                //Check if its the closest so far
                var dist = blockDist(b, blockInfo);
                if (!closestBlock || dist < closestDist) {
                    closestDist = dist;
                    closestBlock = blockInfo;
                }

                //Check for collision
                var collides = collide_ballrect(b, blockInfo);

                if (collides) {
                    if (b.name == "Plasma") {
                        var range = b.other.splash;

                        for (var index = 0; index < blocks.length; index++) {
                            var blockInfo2 = blocks[index];
                            var block2 = blockInfo2.block;
                            var bX2 = blockInfo2.x + (blockSizeX / 2);
                            var bY2 = blockInfo2.y + (blockSizeY / 2);

                            if (abs(bX2 - b.x) <= range && abs(bY2 - b.y) <= range) {
                                damageBlock(b.power, blockInfo2);

                                if (blockInfo2.health <= 0) {
                                    destroyBlock(index);
                                    index--;
                                }
                            }
                        }
                    }

                    damageBlock(b.power, blockInfo);

                    continue;
                }
            }

            if (closestBlock && b.name == "Sniper" & hitWall) {
                var angle = Math.atan2(closestBlock.x - b.x, closestBlock.y - b.y);
                // console.log(angle);
                b.vx = b.speed * Math.sin(angle);
                b.vy = b.speed * Math.cos(angle);

            }
        } //End of main loop

        newLevel = false;
    }

    function makeVisible(blockInfo, xOffset, yOffset) {
        if (!blockPositions[(blockInfo.x + xOffset) / blockSizeX]) { return; }

        var b2 = blockPositions[(blockInfo.x + xOffset) / blockSizeX][(blockInfo.y + yOffset) / blockSizeY];
        if (!b2) { return; }

        var healthString = (b2.health - 1) + "";
        var color = blockTypes[parseInt(healthString.charAt(healthString.length - 1))];
        b2.block.setColor(color);
    }

    function makeNearbyBlocksVisible(blockInfo) {
        makeVisible(blockInfo, -blockSizeX, 0);
        makeVisible(blockInfo, blockSizeX, 0);
        makeVisible(blockInfo, 0, -blockSizeY);
        makeVisible(blockInfo, 0, blockSizeY);
    }

    function destroyBarrier(index = Number) {
        var blockInfo = barriers[index];
        makeNearbyBlocksVisible(blockInfo);
        barriers.splice(index, 1);
        remove(blockInfo.block);
    }
    function clearBarriers() {
        barrierPositions = {};
        for (var index = 0; index < barriers.length; index++) {
            destroyBarrier(index);
            index--;
        }
    }

    function draw() {
        if (blocks.length == 0) {
            newLevel = true;
            level++;
            clearBarriers();
            levelTxt.setText("Level " + level);

            var levelString = level + "";
            var lastNum = parseInt(levelString.charAt(levelString.length - 1));

            if (lastNum == 0) {
                makeBarriers(50, 100, 4, 1);
                makeBarriers(50, 100, 1, 4);

                makeBarriers(250, 100, 4, 1);
                makeBarriers(325, 100, 1, 4);

                makeBarriers(50, 325, 1, 4);
                makeBarriers(50, 400, 4, 1);

                makeBarriers(325, 325, 1, 4);
                makeBarriers(250, 400, 4, 1);
            } else if (lastNum == 9) {

            } else if (lastNum == 8) {

            } else if (lastNum == 7) {

            } else if (lastNum == 6) {

            } else if (lastNum == 5) {

            } else if (lastNum == 4) {
                makeBarriers(75, 125, 3, 3);
                makeBarriers(250, 125, 3, 3);
                makeBarriers(75, 325, 3, 3);
                makeBarriers(250, 325, 3, 3);
            } else if (lastNum == 3) {
                makeBarriers(75, 150, 3, 3);
                makeBarriers(250, 150, 3, 3);
                makeBarriers(150, 300, 4, 3);
            } else if (lastNum == 2) {
                makeBarriers(100, 150, 8, 1);
                makeBarriers(100, 350, 8, 1);
            } else {
                makeBarriers(125, 175, 6, 1);
                makeBarriers(125, 175, 1, 7);
                makeBarriers(250, 175, 1, 7);
            }

            makeBlocks(0, 50, Math.round(400 / blockSizeX), Math.round(430 / blockSizeY));
        }
        //p("X: " + Math.round(mouseX / blockSizeX) * blockSizeX + ", Y: " + Math.round(mouseY / blockSizeY) * blockSizeY);
        MainLoop();

        cashTxt.setText("$" + cash);

        requestAnimationFrame(draw);
    }

    add(cashTxt);
    add(levelTxt);
    draw();
}
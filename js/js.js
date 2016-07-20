
var winner = [
    "                                          ",
    "   !       ! ! !!   ! !!   ! !!!!! !!!    ",
    "   !       ! ! ! !  ! ! !  ! !     !  !   ",
    "   !   !   ! ! !  ! ! !  ! ! !!!   !  !   ",
    "    ! ! ! !  ! !   !! !   !! !     !!!    ",
    "     !   !   ! !    ! !    ! !!!!! !  !   ",
    "                                          ",
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "                                          "
];
var simpleLevelPlan = [
    "                                         ",
    "                                oo       ",
    "xo    x  o  o  o  !!           xxxx      ",
    "xxx   xxxxxxxxxxxxx!            xx       ",
    "x     x           !!            xx       ",
    "x     x                         xx       ",
    "x    xx  = = = = = = = =       xxxx      ",
    "x     x                         xx       ",
    "x                  o            xx       ",
    "xxx              xxxxx        0 xx       ",
    "                              xxxxxx     ",
    "x=    xxxxxx                             ",
    "xxxxxxx                                  ",
    "               xxxxxx     x!!!!!!x       ",
    "   o    o                 xxxxxxxx       ",
    " x                                       ",
    " x  xxxxxxxxxxxxx      =              xx ",
    "xx              x          o      o      ",
    "x       =       x                        ",
    "x               xxxxx    xxxxxxxx        ",
    "xxxxx              o                     ",
    "x                                        ",
    "x @           x    =                   x ",
    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ",
    "                                         "
];


var scale = 20;
var getPlayer;
var player;
var elements;
var dead;

function MobileElements(element, x, y, speed){
    this.element = element;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.reverse = true;
    document.body.getElementsByClassName('game')[0].appendChild(element);
}

MobileElements.prototype.findStartPosition = function(){
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
};


function createDomElement(type, someClass){
    var newDomElement = document.createElement(type);
    if(someClass)
        newDomElement.setAttribute('class', someClass);
    return newDomElement;
}

function displayFrame(level){
    var x, y;
    document.body.appendChild(createDomElement('div', 'game'));
    var myFrame = document.body.getElementsByClassName('game')[0];
    myFrame.style.width = (level[0].length * scale) + 'px';
    for (var i = 0; i < level.length - 1; i++){
        var across = level[i];
        myFrame.appendChild(createDomElement('div'));
        var lastAcross = myFrame.lastChild;
        lastAcross.style.height = scale + 'px';
        for (var j = 0; j < across.length; j++){
            if (across[j] == 'x') {
                lastAcross.appendChild(createDomElement('div', 'wall'));
                elements.wallCoordinates.y.push(lastAcross.lastChild.offsetTop) && elements.wallCoordinates.x.push(lastAcross.lastChild.offsetLeft);
            }  else if(across[j] == '!'){
                x = j * scale;
                y = i * scale;
                elements.lavaStatic.x.push(x) && elements.lavaStatic.y.push(y);
                lastAcross.appendChild(createDomElement('div', 'lava'));
            } else if(across[j] == '='){
                var lavaAcross = createDomElement('div', 'lava');
                lavaAcross.style.position = 'absolute';
                lavaAcross.style.float = 'left';
                x = j * scale;
                y = i * scale;
                var someLavaAcross = new MobileElements(lavaAcross,x,y,5);
                someLavaAcross.findStartPosition();
                elements.lavaAcross.push(someLavaAcross);
                lastAcross.appendChild(createDomElement('div', 'back'));
            } else if(across[j] == 'o'){
                var coin = createDomElement('div', 'coin');
                x = j * scale + 5;
                y = i * scale + 5;
                var someCoin = new MobileElements(coin,x,y,1);
                someCoin.findStartPosition();
                elements.coins.push(someCoin);
                lastAcross.appendChild(createDomElement('div', 'back'));
            } else if(across[j] == '@'){
                var icon = createDomElement('div', 'player');
                x = j * scale;
                y = i * scale - scale / 2;
                player.x = x;
                player.y = y;
                document.body.getElementsByClassName('game')[0].appendChild(icon);
                icon.style.left = x + 'px';
                icon.style.top = y + 'px';
                lastAcross.appendChild(createDomElement('div', 'back'));
            }  else {
                lastAcross.appendChild(createDomElement('div', 'back'));

            }

        }
    }
}


function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function coinY(){

    var positionY = 0;
    var balance = true;
    return function(){
        if (positionY <= 5 && balance){
            if (positionY >= 5)
                balance = false;
            return positionY+=0.25;
        } else {
            if (positionY == -5)
                balance = true;
            return positionY-=0.25;
        }


    }

}

var coinYMove = coinY();

function lavaAcrossMoveWrapper(){
    var xModule;
    return function(){
        (this.reverse) ? xModule = -scale : xModule = scale;
        for (var j = 0; j < elements.wallCoordinates.x.length - 1; j++){
            if (this.x + xModule == elements.wallCoordinates.x[j] && this.y == elements.wallCoordinates.y[j]){
                (this.reverse) ? this.reverse = false : this.reverse = true;
            }
        }

        (this.reverse) ?  this.x -= this.speed : this.x += this.speed;
        return this.x;
    }
}

MobileElements.prototype.lavaAcrossMove = lavaAcrossMoveWrapper();



var arrowCodes = {37: "left", 38: "up", 39: "right", 65: "left", 87: "up", 68: "right" };

function trackKeys(codes) {
    var pressed = Object.create(null);
    function handler(event) {
        if (codes.hasOwnProperty(event.keyCode)) {
            var down = event.type == "keydown";
            pressed[codes[event.keyCode]] = down;
            event.preventDefault();
        }
    }
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);
    return pressed;
}

var arrows = trackKeys(arrowCodes);

var mainPhysicsWrapper = function(player){
    var playerSpeed = 7;
    var moveLeft = playerSpeed;
    var moveRight = playerSpeed;
    var moveTop = 20;
    var moveDown = 20;
    var doJump;
    var rangeToPlayer;
    var speedRange;
    var jumpLength;
    var counterJump = 0;
    var jumpActive = false;
    var playerX1;
    var playerY1;
    var elementX1;
    var elementY1;

    function checkMovable(playerX, playerY, elementX, elementY, type){
        if(type == 'coins'){
            playerX1 = playerX + scale;
            playerY1 = playerY + scale * 1.5;
            elementX1 = elementX + 10;
            elementY1 = elementY + 10;

        } else if(type == 'lava'){
            playerX1 = playerX + scale;
            playerY1 = playerY + scale * 1.5;
            elementX1 = elementX + scale;
            elementY1 = elementY + scale;

        } else {
            playerX += -playerSpeed;
            playerY += -20;
            playerX1 = playerX + scale + playerSpeed * 2;
            playerY1 = playerY + scale * 1.5 - 1 + 20 * 2;
            elementX1 = elementX + scale;
            elementY1 = elementY + scale + 1;
        }


        return     (
                (playerX >= elementX && playerX <= elementX1)
                || (playerX1 >= elementX && playerX1 <= elementX1)
                || (playerX <= elementX && playerX1 >= elementX1)
                || (elementX <= playerX && elementX1 >= playerX1)
            ) && (
                (playerY >= elementY && playerY <= elementY1)
                || (playerY1 >= elementY && playerY1 <= elementY1)
                || (playerY <= elementY && playerY1 >= elementY1)
                || (elementY <= playerY && elementY1 >= playerY1)

            )
    }

    function getCoins(){
        for( var k = 0; k < elements.coins.length; k++){
            if(checkMovable(player.x, player.y, elements.coins[k].x, elements.coins[k].y, 'coins')){
                var delCoin = elements.coins[k].element;
                delCoin.parentNode.removeChild(delCoin);
                elements.coins.splice(k, 1)


            }
        }


    }

    function checkDead(){
        for( var k = 0; k < elements.lavaAcross.length; k++){
            if(checkMovable(player.x, player.y, elements.lavaAcross[k].x, elements.lavaAcross[k].y, 'lava')){
                console.log('lavaAcross');

                return true;
            }
        }
        for(k = 0; k < elements.lavaStatic.x.length; k++){
            if(checkMovable(player.x, player.y, elements.lavaStatic.x[k], elements.lavaStatic.y[k], 'lava')){

                console.log('lavaStatic');

                return true;


            }
        }


        return false;

    }
    function jump(arg){

        var result = Math.ceil( 16*(1- -(counterJump*counterJump - 2*counterJump)));
        if(arg == 'Down'){
            counterJump += 0.05;
            if(counterJump < 1.5){
                counterJump = 1.5;
            } else if( counterJump > 1.9 )
                counterJump = 2;
        }

        //       console.log('result jump', result, counterJump);
        if (arg == 'Up'){
            counterJump += 0.05;
            jumpActive = true;
            if(counterJump >= 1 || result < 3){
                jumpActive = false;
                counterJump = 1;
            }
        }
        return result;






    }


    return function(){
        playerSpeed = 7;
        moveLeft = playerSpeed;
        moveRight = playerSpeed;
        moveTop = 20;
        moveDown = 20;
        doJump = false;








        for (var i = 0; i < elements.wallCoordinates.x.length - 1; i++){

            if (checkMovable(player.x, player.y, elements.wallCoordinates.x[i], elements.wallCoordinates.y[i], scale)){
                //   console.log('main', player.x + 20, player.y, elements.wallCoordinates.x[i], elements.wallCoordinates.y[i] + 20);
                if(player.x > elements.wallCoordinates.x[i]
                    && ((elements.wallCoordinates.y[i] + 20) - player.y) > 1
                    && (player.y + scale * 1.5 > elements.wallCoordinates.y[i])
                ){
                    moveLeft = player.x - (elements.wallCoordinates.x[i] + 20);
                    if (moveLeft <= 0)
                        moveLeft = false;

                }

                if(player.x < elements.wallCoordinates.x[i]
                    && ((elements.wallCoordinates.y[i] + 20) - player.y) > 1
                    && (player.y + scale * 1.5 > elements.wallCoordinates.y[i])
                ){
                    moveRight = elements.wallCoordinates.x[i] - (player.x + 20);
                    if (moveRight <= 0)
                        moveRight = false;

                }
                if((player.y >= elements.wallCoordinates.y[i] + 20)
                    && (player.x + 20 != elements.wallCoordinates.x[i])
                    && (player.x != elements.wallCoordinates.x[i] + 20)
                    && (elements.wallCoordinates.x[i] + 20 > player.x && player.x + 20 > elements.wallCoordinates.x[i])
                ) {
                    moveTop = player.y - (elements.wallCoordinates.y[i] + 20);

                    if (moveTop <= 0)
                        moveTop = false;


                }
                //todo дописать проверку по Х
                if(player.y + scale * 1.5 == elements.wallCoordinates.y[i]){
                    doJump = true;
                }

                if(player.y + scale * 1.5 <= elements.wallCoordinates.y[i]

                    && (elements.wallCoordinates.x[i] + 20 > player.x && player.x + 20 > elements.wallCoordinates.x[i])
                ){
                    moveDown = elements.wallCoordinates.y[i] - (player.y + scale * 1.5);
                    if (moveDown <= 0)
                        moveDown = false;

                }
                /*
                 if(player.x + 20 <= elements.wallCoordinates.x[i] && player.y >= elements.wallCoordinates.y[i] + 20){

                 console.log(player.x + 20, player.y, elements.wallCoordinates.x[i], elements.wallCoordinates.y[i] + 20);
                 rangeToPlayer = Math.sqrt( Math.pow(((player.x + 20) - elements.wallCoordinates.x[i]), 2) + Math.pow((player.y - (elements.wallCoordinates.y[i] + 20)), 2))
                 speedRange = Math.sqrt( Math.pow(playerSpeed, 2) + Math.pow(playerSpeed, 2));
                 if(rangeToPlayer <= speedRange){
                 moveRight = elements.wallCoordinates.x[i] - (player.x + 20);

                 }

                 } else if((player.x >= elements.wallCoordinates.x[i] + 20 && player.y >= elements.wallCoordinates.y[i] + 20)){
                 rangeToPlayer = Math.sqrt( Math.pow((player.x - (elements.wallCoordinates.x[i] + 20)), 2) + Math.pow((player.y - (elements.wallCoordinates.y[i] + 20)), 2))
                 speedRange = Math.sqrt( Math.pow(playerSpeed, 2) + Math.pow(playerSpeed, 2));
                 if(rangeToPlayer <= speedRange){
                 moveLeft = player.x - (elements.wallCoordinates.x[i] + 20);

                 }

                 } else if(player.x >= elements.wallCoordinates.x[i] + 20 && player.y + scale * 1.5 <= elements.wallCoordinates.y[i]){
                 rangeToPlayer = Math.sqrt( Math.pow((player.x - (elements.wallCoordinates.x[i] + 20)), 2) + Math.pow(((player.y + scale * 1.5) - elements.wallCoordinates.y[i]), 2))

                 if(player.y + scale * 1.5 == elements.wallCoordinates.y[i + 1] && player.x + 20 > elements.wallCoordinates.x[i + 1] && player.x + 20 <=  elements.wallCoordinates.x[i + 1] + 20){
                 var some = true;
                 }


                 if(!some && rangeToPlayer < playerSpeed ){
                 moveLeft = player.x - (elements.wallCoordinates.x[i] + 20);
                 }

                 } else if (player.x + 20 <= elements.wallCoordinates.x[i] && player.y + scale * 1.5 <= elements.wallCoordinates.y[i]){
                 rangeToPlayer = Math.sqrt( Math.pow(((player.x + 20) - elements.wallCoordinates.x[i]), 2) + Math.pow(((player.y + scale * 1.5) - elements.wallCoordinates.y[i]), 2))
                 if(player.y + scale * 1.5 == elements.wallCoordinates.y[i - 1] && player.x >= elements.wallCoordinates.x[i - 1] && player.x < elements.wallCoordinates.x[i - 1] + 20){
                 var some1 = true;
                 }


                 if(!some1 && rangeToPlayer < playerSpeed ){
                 moveRight = elements.wallCoordinates.x[i] - (player.x + 20);
                 }


                 }*/

            }



        }

        getCoins();
        if (checkDead()){
            dead = true;

        }



        if (arrows.right && moveRight){
            player.x += moveRight;
            getPlayer.style.left = player.x + 'px';
        } else if (arrows.left && moveLeft){
            player.x -= moveLeft;
            getPlayer.style.left = player.x + 'px';
        }

        if (arrows.up && moveTop && doJump || jumpActive && moveTop){
            jumpLength = jump('Up');
            if (moveTop <= jumpLength){
                player.y -= moveTop;
                jumpActive = false;
                counterJump = 0;
            } else
                player.y -= jumpLength;
            getPlayer.style.top = player.y + 'px';
        } else if (moveDown && !jumpActive){
            jumpLength = jump('Down');
            if (moveDown <= jumpLength){
                player.y += moveDown;
                counterJump = 0;
            } else
                player.y += jumpLength;
            getPlayer.style.top = player.y + 'px';
        }

    }
}


var pauseForAnimation;
elements = {
    wallCoordinates: {
        x: [],
        y: []
    },
    coins: [],
    lavaAcross: [],
    lavaStatic: {
        x: [],
        y: []
    }
};
player = {
    x: null,
    y: null
};

var mainAnimation = true;
var mainPhysics = mainPhysicsWrapper(player);
var oldTime;

function clearLevelAndStartNew(){
    var myFrame = document.body.getElementsByClassName('game')[0];
    myFrame.parentNode.removeChild(myFrame);
    elements = {
        wallCoordinates: {
            x: [],
            y: []
        },
        coins: [],
        lavaAcross: [],
        lavaStatic: {
            x: [],
            y: []
        }
    };

    displayFrame(simpleLevelPlan);
    getPlayer = document.body.getElementsByClassName('player')[0];
    animationElements();



}
var counter = 0;

function animationElements(){

    var time =  new Date().getTime();

    if (time >  oldTime + 18 || oldTime == null){
        oldTime = time;

        if(dead){


            counter += 0.2;
            getPlayer.style.boxShadow = '0 0 5px ' + counter + 'px darkred';


            setTimeout(function() {
                if (dead){
                    console.log('1');
                    getPlayer.style.boxShadow = '0 0 0px ' + 0 + 'px rgba(255,0,0,5)';
                    counter = -2;
                    clearLevelAndStartNew();

                }
                console.log('2');
                dead = false;


            }, 1200);


        } else if (mainAnimation){


            mainPhysics(player);
            if (elements.coins.length == 0){
                var myFrame = document.body.getElementsByClassName('game')[0];
                myFrame.parentNode.removeChild(myFrame);
                displayFrame(winner);
                console.log('You Won!')
                mainAnimation = false;
            }

            for (var i = 0; i < elements.coins.length; i++){
                elements.coins[i].element.style.top = elements.coins[i].y + coinYMove() + 'px';
            }
            for (i = 0; i < elements.lavaAcross.length; i++){
                elements.lavaAcross[i].element.style.left = elements.lavaAcross[i].lavaAcrossMove() +  'px';
            }

        }

    }


    requestAnimationFrame(animationElements);




}


function main(){

    displayFrame(simpleLevelPlan);
    getPlayer = document.body.getElementsByClassName('player')[0];
    animationElements();
}
main();
var myFrame = document.body.getElementsByClassName('game')[0];
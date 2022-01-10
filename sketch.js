/*

The Game Project 8 - Make it Awesome 

*/
//Here I'm declaring all of the variables that I will be using to make my game
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

// Boolean variables to control the movement of the game character.
var isLeft = false;
var isRight = false;
var isFalling = false;
var isPlummeting = false;
var isFound = false;
var gameScore = 0;
var lives;
var increValue;
var background_color;
var moon_location;
var sun_location;

var sun_appears = 500;
var moon_appears = 1000;
var speed = 1;

var sound_jump;
var sound_moving;
var sound_dying;

function preload()
{
	//Loading the sound effect for the game
    sound_jump = loadSound('assets/jump_sound.wav');
    sound_moving = loadSound('assets/running_sound.wav');
    sound_dying = loadSound('assets/dying_sound.wav');
}

function setup()
{
    createCanvas(1024, 576);
    lives = 4;
    startGame();
}

function draw()
{
	// Changing the color of the background 
    background(0,0, background_color);
  	//Conditions to change the color of the background 
    if ((sun_appears > 0) && (sun_appears < 500)) 
    {
        background_color = sun_location
    }
    if ((sun_appears > -555) && (sun_appears < 0)) 
    {
        background_color = moon_location
    }
    //Drawing the Sun
    fill (255, 240,102);
    ellipse (210, sun_appears, 100, 100);
  	//Changing the location of the sun 
    sun_appears = sun_appears - speed
    if (sun_appears <= -555)
    {
        sun_appears = 500;
    } 
  	//Recording the value of the y-coordinate, in order to know when to change the color of the background.
    sun_location = (-1.8 * ( sun_appears - 300));
    //Drawing the Moon
    fill (240);
    ellipse (210, moon_appears, 100, 100);
  	// Changing the location of the moon
    moon_appears = moon_appears - speed
    if (moon_appears <= -555)
    {
        moon_appears = 500;
    } 
  	//Recording the value of the y-coordinate, in order to know when to change the color of the background.
    moon_location = -300 + moon_appears * 1.8;
    
	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground

	// Drawing the clouds.
    push();
    translate(scrollPos, 0);
    drawClouds();
    pop();

	// Drawing the mountains.
    push();
    translate(scrollPos, 0);
    drawMountains();
    pop();

	// Drawing the trees.
    push();
    translate(scrollPos, 0);
    drawTrees();
    pop();

	// Drawing the canyons.
    push();
    translate(scrollPos, 0);
    for(var canyon_index = 0; canyon_index< canyon.length; canyon_index++)
    {
        drawCanyon(canyon[canyon_index])
        checkCanyon(canyon[canyon_index])
    }
    pop();

	// Drawing the collectable items
    push();
    translate(scrollPos, 0);
    for(var collectable_index=0; collectable_index < collectables.length; collectable_index++){
        checkCollectable(collectables[collectable_index]);
        if(collectables[collectable_index].isFound == false)
        {
            drawCollectable(collectables[collectable_index]);
            calculateGameScore();
        }
    }
    pop();
    
    //Drawing the platforms
    push();
    translate(scrollPos, 0);
    drawPlatform();
    checkPlatform(); 
    pop();
    
    // Drawing the enemies 
    push();
    translate(scrollPos, 0);
    for(var enemy_index = 0; enemy_index < enemyAction_list.length; enemy_index++)
    {
        enemyAction_list[enemy_index].draw();
        enemyAction_list[enemy_index].update();
        enemyAction_list[enemy_index].isContact();
    }
    pop();
    
	// Drawing game character.
    drawGameChar();
    
    //The game should stop working if the end-user ran out of 4 lives
    if(lives <= 0)
    {
       //background()	
       textSize(50);	
       text("Game Over", 350, 250);
       isLeft = false;
       isRight = false;
       isFalling = false;
       isPlummeting = false;
    }
    
    // The game should stop working once the end-user reached the flagpole because he completed the game level
    if(flagpole.isReached == true)
    {
    	//background
    	textSize(40);
        text("Level complete. Press space to continue.", 200, 250);
        
        isLeft = false;
        isRight = false;
        isFalling = false;
        isPlummeting = false;
    }
    
	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}
    
    // Logic to make the game character rise and fall.
    if(gameChar_y <= floorPos_y)
    {
        gameChar_y += 1;
    } 
    else
    {
        isFalling = false;
        isPlummeting = false;
    }

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
    
    //The score that the end-user got will be displayed at the top left corner.
    // textSize();
    // text("Game score: " + gameScore, 20, 50);
    
    //Playing the sound effect, restarting the  level and reducing number of lives
    // if the character is has more than zero lives and the character is reaches 633 on the y-axis
     if(gameChar_y > 633 && lives > 0)
       {
       sound_dying.play();
       startGame();  
       lives -= 1;
       }
    // Calling the function that is drawing the number of lives on the screen
    textSize(12.5);
    drawLives();
    text("Lives: ", 20, 25);
    //The score that the end-user got will be displayed at the top left corner.
    // textSize();
    text("Game score: " + gameScore, 20, 50);
    // Calling the function that is drawing the flagpole on the screen
    renderFlagpole();

    if(dist(3500, 433, gameChar_world_x, gameChar_y) < 60)
    {
        flagpole.isReached = true;
    }
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed(){
    
    if(keyCode === 65 && lives >= 0)
    {
        isLeft = true;
        sound_moving.play();
    }

    if(keyCode === 68 && lives >= 0)
    {
        isRight = true;
        sound_moving.play();
    }

    if(keyCode === 87 && isFalling == false && lives >= 0)
    {
        isFalling = true;
        gameChar_y -= 100;
        sound_jump.play();
    }
}

function keyReleased()
{
    if(keyCode === 65)
    {
        isLeft = false;
        isRight = false;
        sound_moving.stop();
    }

    if(keyCode === 68)
    {
        isRight = false;
        isLeft = false;
        sound_moving.stop();
    }
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
	// Drawing game character
    if(isLeft && isFalling)
	{
        fill(0);
		rect(gameChar_x - 6, gameChar_y - 63, 10, 30)
	    ellipse(gameChar_x - 1, gameChar_y - 70, 15, 15)
	    beginShape();
	    vertex(gameChar_x - 6, gameChar_y - 57);
	    vertex(gameChar_x - 16, gameChar_y - 65);
	    vertex(gameChar_x - 15, gameChar_y - 55);
	    vertex(gameChar_x - 6, gameChar_y - 49);
	    vertex(gameChar_x - 6, gameChar_y - 57);
	    endShape();
	    beginShape();
	    vertex(gameChar_x + 4, gameChar_y - 51);
	    vertex(gameChar_x + 4, gameChar_y - 44);
	    vertex(gameChar_x + 14, gameChar_y - 37);
	    vertex(gameChar_x + 14, gameChar_y - 44);
	    endShape();
	    triangle(gameChar_x - 11, gameChar_y - 38, gameChar_x - 21, gameChar_y - 18, gameChar_x - 3, gameChar_y - 31);
	    triangle(gameChar_x + 9, gameChar_y - 38, gameChar_x + 19, gameChar_y - 18, gameChar_x + 1, gameChar_y - 31);
	    fill('white');
	    ellipse(gameChar_x - 1, gameChar_y - 70, 10, 10);
	    fill(0);
	    ellipse(gameChar_x - 1, gameChar_y - 72.5, 15, 3)
    }
    
	else if(isRight && isFalling)
	{
        fill(0);
		rect(gameChar_x - 6, gameChar_y - 63, 10, 30);
	    ellipse(gameChar_x - 1, gameChar_y - 70, 15, 15);
	    beginShape();
	    vertex(gameChar_x + 4, gameChar_y - 60);
	    vertex(gameChar_x + 4, gameChar_y - 53);
	    vertex(gameChar_x + 16, gameChar_y - 57);
	    vertex(gameChar_x + 14, gameChar_y - 65);
	    endShape();
	    beginShape();
	    vertex(gameChar_x - 6, gameChar_y - 57);
	    vertex(gameChar_x - 16, gameChar_y - 52);
	    vertex(gameChar_x - 15, gameChar_y - 45);
	    vertex(gameChar_x - 6, gameChar_y - 50);
	    endShape();
	    triangle(gameChar_x - 11, gameChar_y - 38, gameChar_x - 21, gameChar_y - 18, gameChar_x - 3, gameChar_y - 31);
	    triangle(gameChar_x + 9, gameChar_y - 38, gameChar_x + 19, gameChar_y - 18, gameChar_x + 1, gameChar_y - 31);
	    fill('white');
	    ellipse(gameChar_x - 1, gameChar_y - 70, 10, 10);
	    fill(0);
	    ellipse(gameChar_x - 1, gameChar_y - 72.5, 15, 3);
    }
    
	else if(isLeft)
	{
        fill(0);
		rect(gameChar_x - 6, gameChar_y - 47, 10, 30);
        ellipse(gameChar_x - 1, gameChar_y - 54, 15, 15);
        triangle(gameChar_x - 13, gameChar_y - 13, gameChar_x, gameChar_y - 2, gameChar_x - 3, gameChar_y - 17);
        triangle(gameChar_x, gameChar_y - 13, gameChar_x + 13, gameChar_y - 2, gameChar_x + 10, gameChar_y - 17);
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 39);
        vertex(gameChar_x - 16, gameChar_y - 47);
        vertex(gameChar_x - 15, gameChar_y - 37);
        vertex(gameChar_x - 6, gameChar_y - 31);
        vertex(gameChar_x - 6, gameChar_y - 39);
        endShape();
        beginShape();
        vertex(gameChar_x + 4, gameChar_y - 36);
        vertex(gameChar_x + 4, gameChar_y - 29);
        vertex(gameChar_x + 14, gameChar_y - 22);
        vertex(gameChar_x + 14, gameChar_y - 29);
        endShape();
        fill('white');
        ellipse(gameChar_x - 1, gameChar_y - 54, 10, 10);
        fill(0);
        ellipse(gameChar_x - 1, gameChar_y - 56.5, 15, 3);
    }
    
	else if(isRight)
	{
        fill(0);
		rect(gameChar_x - 8, gameChar_y - 47, 10, 30); 
        ellipse(gameChar_x - 3, gameChar_y - 54, 15, 15);
        triangle(gameChar_x - 3, gameChar_y - 13, gameChar_x - 17, gameChar_y - 2, gameChar_x - 12, gameChar_y - 19);
        triangle(gameChar_x + 12, gameChar_y - 13, gameChar_x - 3, gameChar_y - 2, gameChar_x + 1, gameChar_y - 19);
        beginShape();
        vertex(gameChar_x + 2, gameChar_y - 42);
        vertex(gameChar_x + 2, gameChar_y - 35);
        vertex(gameChar_x + 14, gameChar_y - 39);
        vertex(gameChar_x + 12, gameChar_y - 47);
        endShape();
        beginShape();
        vertex(gameChar_x - 8, gameChar_y - 39);
        vertex(gameChar_x - 18, gameChar_y - 34);
        vertex(gameChar_x - 17, gameChar_y - 25);
        vertex(gameChar_x - 8, gameChar_y - 32);
        endShape();
        fill('white');
        ellipse(gameChar_x - 3, gameChar_y - 54, 10, 10);
        fill(0); 
        ellipse(gameChar_x - 3, gameChar_y - 56.5, 15, 3);
    }
    
	else if(isFalling || isPlummeting)
	{
        fill(0);
		rect(gameChar_x - 5, gameChar_y - 62, 10, 30);
        ellipse(gameChar_x, gameChar_y - 69, 15, 15);
        beginShape();
        vertex(gameChar_x + 5, gameChar_y - 57);
        vertex(gameChar_x + 5, gameChar_y - 50);
        vertex(gameChar_x + 22, gameChar_y - 54);
        vertex(gameChar_x + 20, gameChar_y - 62);
        vertex(gameChar_x + 5, gameChar_y - 57);
        endShape();
        beginShape();
        vertex(gameChar_x - 5, gameChar_y - 57);
        vertex(gameChar_x - 5, gameChar_y - 50);
        vertex(gameChar_x - 20, gameChar_y - 54);
        vertex(gameChar_x - 20, gameChar_y - 62);
        endShape();
        triangle(gameChar_x - 10, gameChar_y - 37, gameChar_x - 20, gameChar_y - 17, gameChar_x - 2, gameChar_y - 30);
        triangle(gameChar_x + 10, gameChar_y - 37, gameChar_x + 20, gameChar_y - 17, gameChar_x + 2, gameChar_y - 30);
        fill('white');
        ellipse(gameChar_x, gameChar_y - 69, 10, 10);
        fill(0); 
        ellipse(gameChar_x, gameChar_y - 72, 15, 3);
    }
    
	else
	{
        fill(0);
        rect(gameChar_x - 8, gameChar_y - 47, 10, 30);
        rect(gameChar_x - 18, gameChar_y - 42, 10, 5);
        rect(gameChar_x + 2, gameChar_y - 42, 10, 5);
        ellipse(gameChar_x - 3, gameChar_y - 54, 15, 15);
        triangle(gameChar_x - 1, gameChar_y - 17, gameChar_x + 7, gameChar_y - 17, gameChar_x + 7, gameChar_y - 2);
        triangle(gameChar_x - 13, gameChar_y - 17, gameChar_x - 5, gameChar_y - 17, gameChar_x - 13, gameChar_y - 2);
        fill('white');
        ellipse(gameChar_x - 3, gameChar_y - 54, 10, 10);
        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 56.5, 15, 3);
    }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.

function drawClouds() {
    
    push();
    translate(scrollPos, 0);
	for(var cloud_index = 0; cloud_index < clouds.length; cloud_index++)
    {
		noStroke();
		fill('white');
		ellipse(clouds[cloud_index].x_pos, clouds[cloud_index].y_pos, 125, 50);
        ellipse(clouds[cloud_index].x_pos_1, clouds[cloud_index].y_pos_1, 25, 25);
        ellipse(clouds[cloud_index].x_pos_2, clouds[cloud_index].y_pos_2, 25, 25);
        ellipse(clouds[cloud_index].x_pos_3, clouds[cloud_index].y_pos_3, 25, 25);
        ellipse(clouds[cloud_index].x_pos_4, clouds[cloud_index].y_pos_4, 25, 25);
        ellipse(clouds[cloud_index].x_pos_5, clouds[cloud_index].y_pos_5, 25, 25);
        ellipse(clouds[cloud_index].x_pos_6, clouds[cloud_index].y_pos_6, 25, 25);
        ellipse(clouds[cloud_index].x_pos_7, clouds[cloud_index].y_pos_7, 25, 25);
        ellipse(clouds[cloud_index].x_pos_8, clouds[cloud_index].y_pos_8, 25, 25);
        ellipse(clouds[cloud_index].x_pos_9, clouds[cloud_index].y_pos_9, 25, 25);
        ellipse(clouds[cloud_index].x_pos_10, clouds[cloud_index].y_pos_10, 25, 25);
        ellipse(clouds[cloud_index].x_pos_11, clouds[cloud_index].y_pos_11, 25, 25);
        ellipse(clouds[cloud_index].x_pos_12, clouds[cloud_index].y_pos_12, 25, 25);
        ellipse(clouds[cloud_index].x_pos_13, clouds[cloud_index].y_pos_13, 25, 25);
        ellipse(clouds[cloud_index].x_pos_14, clouds[cloud_index].y_pos_14, 25, 25);
	}
    pop();
}

// Function to draw mountains objects.
function drawMountains() {
    for(var mountain_index = 0; mountain_index < mountain.length; mountain_index++)
    {
        fill('grey');
        triangle(mountain[mountain_index].tri_1.x_pos_1, mountain[mountain_index].tri_1.y_pos_1, mountain[mountain_index].tri_1.x_pos_2, mountain[mountain_index].tri_1.y_pos_2, mountain[mountain_index].tri_1.x_pos_3, mountain[mountain_index].tri_1.y_pos_3);
    
        triangle(mountain[mountain_index].tri_2.x_pos_1, mountain[mountain_index].tri_2.y_pos_1, mountain[mountain_index].tri_2.x_pos_2, mountain[mountain_index].tri_2.y_pos_2, mountain[mountain_index].tri_2.x_pos_3,mountain[mountain_index].tri_2.y_pos_3);
        
        triangle(mountain[mountain_index].tri_3.x_pos_1, mountain[mountain_index].tri_3.y_pos_1, mountain[mountain_index].tri_3.x_pos_2, mountain[mountain_index].tri_3.y_pos_2, mountain[mountain_index].tri_3.x_pos_3, mountain[mountain_index].tri_3.y_pos_3);
    }
}

// Function to draw trees objects.
function drawTrees() {
    
	for(var tree_index = 0; tree_index < trees_x.length; tree_index++)
    {
        fill('brown')
        rect(trees_x[tree_index] - 4, treePos_y + 45, 20, 100);
        fill(78, 254, 55);
        ellipse(trees_x[tree_index] + 8, treePos_y + 22, 75, 90);
        ellipse(trees_x[tree_index] - 27, treePos_y + 12, 25, 25);
        ellipse(trees_x[tree_index] - 22, treePos_y - 11, 25, 25);
        ellipse(trees_x[tree_index] - 2, treePos_y - 23, 25, 25);
        ellipse(trees_x[tree_index] + 18, treePos_y - 23, 25, 25);
        ellipse(trees_x[tree_index] + 33, treePos_y - 13, 25, 25); 
        ellipse(trees_x[tree_index] + 38, treePos_y + 2, 25, 25);
        ellipse(trees_x[tree_index] + 41, treePos_y + 22, 25, 25);
        ellipse(trees_x[tree_index] + 38, treePos_y + 42, 25, 25);
        ellipse(trees_x[tree_index] + 33, treePos_y + 57, 25, 25);
        ellipse(trees_x[tree_index] - 27, treePos_y + 37, 25, 25);
        ellipse(trees_x[tree_index] - 17, treePos_y + 57, 25, 25);
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
    fill(173,216,230);
    rect(t_canyon.x_pos_rect, t_canyon.width_rect, 50, 145);
    triangle(t_canyon.x_pos_1_tri_1, t_canyon.y_pos_1_tri_1, t_canyon.x_pos_2_tri_1, t_canyon.y_pos_2_tri_1, t_canyon.x_pos_3_tri_1, t_canyon.y_pos_3_tri_1);
    triangle(t_canyon.x_pos_1_tri_2, t_canyon.y_pos_1_tri_2, t_canyon.x_pos_2_tri_2, t_canyon.y_pos_2_tri_2, t_canyon.x_pos_3_tri_2, t_canyon.y_pos_3_tri_2);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
    if((gameChar_world_x > t_canyon.x_pos_rect - (t_canyon.width_rect/10-20)) && (gameChar_world_x < t_canyon.x_pos_rect + (t_canyon.width_rect/10+20)) && isFalling == false)
    {
        gameChar_y += 15;
        isPlummeting = true;
    }
}

function drawPlatform()
{
    for(var platform_index = 0; platform_index < platform_x.length; platform_index++)
    {
        stroke(0);
        strokeWeight(5);
        fill('grey');
        rect(platform_x[platform_index], platform_y, 100, 20);
    }
}

function checkPlatform()
{
    for(var platform_index = 0; platform_index < platform_x.length; platform_index++)
    {
        if((gameChar_world_x > platform_x[platform_index] - 20/2 && gameChar_y > platform_y - 5/2) && (gameChar_world_x < platform_x[platform_index] + 190/2+20  && gameChar_y < platform_y + 5/2))
        {
            gameChar_y = platform_y;
            isFalling = false;
        }
    }
}

function Enemy(t_enemy_x, t_enemy_y, range){
    this.increValue = 2;
    this.range = 50
    this.t_enemy_x = t_enemy_x;
    this.t_enemy_y = t_enemy_y;
    this.current_location = t_enemy_x;
    
    this.draw = function()
    {
    
    fill('black');
    ellipse(this.current_location, this.t_enemy_y, 30, 30);
    fill('red');
    ellipse(this.current_location + random(-2.5, 2.5), this.t_enemy_y + random(-2.5, 2.5), 12.5, 12.5);
    }
    
    this.update = function()
    {
        this.current_location += this.increValue;
        
        if(this.current_location < this.t_enemy_x)
        {
            this.increValue = 1; 
        }
        else if (this.current_location > this.t_enemy_x + this.range)
        {
            this.increValue -= 1;
        }
    }
    
    this.isContact = function(){
        if(dist(this.t_enemy_x, this.t_enemy_y, gameChar_world_x, gameChar_y) < 40)
        {
            sound_dying.play();
            startGame();
            lives -= 1;
        }
    }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    noStroke();
    fill('gold');
    ellipse(t_collectable.x_pos, t_collectable.y_pos, 30, 30);
    fill(100, 155, 255);
    ellipse(t_collectable.x_pos, t_collectable.y_pos, 20, 20);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    if(dist(t_collectable.x_pos, t_collectable.y_pos, gameChar_world_x, gameChar_y) < 30)
    {
        t_collectable.isFound = true;
    }
}

function calculateGameScore(){
    for(var scoreIndex = 0; scoreIndex < collectables.length; scoreIndex ++){
        if(collectables[scoreIndex].isFound == true && collectables[scoreIndex].isHidden == false){
            gameScore += 10;
            collectables[scoreIndex].isHidden = true;
        };
    };
};

class flagpole {
    constructor(){
        isReached = false;
        x_pos = 3000;
    }
};

function renderFlagpole()
{
    push();
    translate(scrollPos, 0);
    noFill();
    stroke("black");
    line(3500, 333, 3500, 433);
    fill("red");
    rect(3500, 333, 75, 50);
    pop();
}

function drawLives(){
    for(var lives_index = 1; lives_index < lives; lives_index++){
        //drawing lives
        text("Lives: ", 20, 25);
        fill("white");
        beginShape();
        curveVertex(18.75 +(lives_index * 54), 75);// divide 8
        curveVertex(18.75 +(lives_index * 54), 33.75);// divide 8
        curveVertex(3.75  +(lives_index * 54), 18.75);// divide 8
        curveVertex(9.375 +(lives_index * 54), 9.375);// divide 8
        curveVertex(18.75 +(lives_index * 54), 12.5);// divide 8
        curveVertex(18.75 +(lives_index * 54), 37.5);// divide 8
        endShape();

        beginShape();
        curveVertex(18.75 +(lives_index * 54), 37.5);// divide 8
        curveVertex(18.75 +(lives_index * 54), 12.5);// divide 8
        curveVertex(28.125 +(lives_index * 54), 9.375);// divide 8
        curveVertex(33.75 +(lives_index * 54), 18.75);// divide 8
        curveVertex(18.75 +(lives_index * 54), 33.75);// divide 8
        curveVertex(18.75 +(lives_index * 54), 75);// divide 8
        endShape();
    }
}

function startGame()
{
    // Boolean variables to control the movement of the game character.
    var isLeft = false;
    var isRight = false;
    var isFalling = false;
    var isPlummeting = false;
    var isFound = false;
    //Setting up the coordinates of the Character.
    // Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
    floorPos_y = height * 3/4;
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
    //Creating the flagpole objects 
    class flagpole {
        //This function will creates the flagpole 
        renderFlagpole(){
            noFill();
            stroke("black");
            line(flagpole.x_pos, 333, 50, 433);
            fill("red");
            rect(flagpole.x_pos, 333, 75, 50);
        }
    };
    //The list here are the locations on the clouds, trees, mountains, platforms, enemies, canyons and collectables. 
    trees_x = [-1100, -850, -650, -450, -300, -150, -50, 50, 250, 450, 600, 800, 1000, 1150, 1300, 1450, 1600, 2200, 2400, 2600, 2750, 2900, 3100, 3300];
	treePos_y = floorPos_y - 143;
    
    platform_x = [40, 650, 1400, 1900, 2500];
    
    platform_y = floorPos_y - 70;
    
    enemyAction_list = [];
    
                        enemyAction_list.push(new Enemy(-150, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(1000, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(700, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(1500, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(400, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(2000, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(2500, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(2800, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(3200, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(-10, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(300, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(1300, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(2200, floorPos_y - 25))
                        enemyAction_list.push(new Enemy(1800, floorPos_y - 25))

	clouds = [
                {x_pos: -1300+ 85, y_pos: 120+ 44, x_pos_1: -1300 +27, y_pos_1: 120+40, x_pos_2: -1300+40, y_pos_2: 120+55, x_pos_3: -1300+35, y_pos_3: 120+30, x_pos_4: -1300+50, y_pos_4: 120+25, x_pos_5: -1300+70, y_pos_5: 120+20, x_pos_6: -1300+90, y_pos_6: 120+20, x_pos_7: -1300+110, y_pos_7: 120+20, x_pos_8: -1300+130, y_pos_8: 120+25, x_pos_9: -1300+140, y_pos_9: 120+35, x_pos_10: -1300+137, y_pos_10: 120+53, x_pos_11: -1300+120, y_pos_11: 120+65, x_pos_12: -1300+98, y_pos_12: 120+68, x_pos_13: -1300+75, y_pos_13: 120+67, x_pos_14: -1300+60, y_pos_14: 120+63},        
                {x_pos: -1100+ 85, y_pos: 90+ 44, x_pos_1: -1100 +27, y_pos_1: 90+40, x_pos_2: -1100+40, y_pos_2: 90+55, x_pos_3: -1100+35, y_pos_3: 90+30, x_pos_4: -1100+50, y_pos_4: 90+25, x_pos_5: -1100+70, y_pos_5: 90+20, x_pos_6: -1100+90, y_pos_6: 90+20, x_pos_7: -1100+110, y_pos_7: 90+20, x_pos_8: -1100+130, y_pos_8: 90+25, x_pos_9: -1100+140, y_pos_9: 90+35, x_pos_10: -1100+137, y_pos_10: 90+53, x_pos_11: -1100+120, y_pos_11: 90+65, x_pos_12: -1100+98, y_pos_12: 90+68, x_pos_13: -1100+75, y_pos_13: 90+67, x_pos_14: -1100+60, y_pos_14: 90+63},
                {x_pos: -950+ 85, y_pos: 50+ 44, x_pos_1: -950 +27, y_pos_1: 50+40, x_pos_2: -950+40, y_pos_2: 50+55, x_pos_3: -950+35, y_pos_3: 50+30, x_pos_4: -950+50, y_pos_4: 50+25, x_pos_5: -950+70, y_pos_5: 50+20, x_pos_6: -950+90, y_pos_6: 50+20, x_pos_7: -950+110, y_pos_7: 50+20, x_pos_8: -950+130, y_pos_8: 50+25, x_pos_9: -950+140, y_pos_9: 50+35, x_pos_10: -950+137, y_pos_10: 50+53, x_pos_11: -950+120, y_pos_11: 50+65, x_pos_12: -950+98, y_pos_12: 50+68, x_pos_13: -950+75, y_pos_13: 50+67, x_pos_14: -950+60, y_pos_14: 50+63},
                {x_pos: -800+ 85, y_pos: 100+ 44, x_pos_1: -800 +27, y_pos_1: 100+40, x_pos_2: -800+40, y_pos_2: 100+55, x_pos_3: -800+35, y_pos_3: 100+30, x_pos_4: -800+50, y_pos_4: 100+25, x_pos_5: -800+70, y_pos_5: 100+20, x_pos_6: -800+90, y_pos_6: 100+20, x_pos_7: -800+110, y_pos_7: 100+20, x_pos_8: -800+130, y_pos_8: 100+25, x_pos_9: -800+140, y_pos_9: 100+35, x_pos_10: -800+137, y_pos_10: 100+53, x_pos_11: -800+120, y_pos_11: 100+65, x_pos_12: -800+98, y_pos_12: 100+68, x_pos_13: -800+75, y_pos_13: 100+67, x_pos_14: -800+60, y_pos_14: 100+63},
                {x_pos: -700+ 85, y_pos: 60+ 44, x_pos_1: -700 +27, y_pos_1: 60+40, x_pos_2: -700+40, y_pos_2: 60+55, x_pos_3: -700+35, y_pos_3: 60+30, x_pos_4: -700+50, y_pos_4: 60+25, x_pos_5: -700+70, y_pos_5: 60+20, x_pos_6: -700+90, y_pos_6: 60+20, x_pos_7: -700+110, y_pos_7: 60+20, x_pos_8: -700+130, y_pos_8: 60+25, x_pos_9: -700+140, y_pos_9: 60+35, x_pos_10: -700+137, y_pos_10: 60+53, x_pos_11: -700+120, y_pos_11: 60+65, x_pos_12: -700+98, y_pos_12: 60+68, x_pos_13: -700+75, y_pos_13: 60+67, x_pos_14: -700+60, y_pos_14: 60+63},        
                {x_pos: -600+ 85, y_pos: 80+ 44, x_pos_1: -600 +27, y_pos_1: 80+40, x_pos_2: -600+40, y_pos_2: 80+55, x_pos_3: -600+35, y_pos_3: 80+30, x_pos_4: -600+50, y_pos_4: 80+25, x_pos_5: -600+70, y_pos_5: 80+20, x_pos_6: -600+90, y_pos_6: 80+20, x_pos_7: -600+110, y_pos_7: 80+20, x_pos_8: -600+130, y_pos_8: 80+25, x_pos_9: -600+140, y_pos_9: 80+35, x_pos_10: -600+137, y_pos_10: 80+53, x_pos_11: -600+120, y_pos_11: 80+65, x_pos_12: -600+98, y_pos_12: 80+68, x_pos_13: -600+75, y_pos_13: 80+67, x_pos_14: -600+60, y_pos_14: 80+63},
                {x_pos: -500+ 85, y_pos: 80+ 44, x_pos_1: -500 +27, y_pos_1: 80+40, x_pos_2: -500+40, y_pos_2: 80+55, x_pos_3: -500+35, y_pos_3: 80+30, x_pos_4: -500+50, y_pos_4: 80+25, x_pos_5: -500+70, y_pos_5: 80+20, x_pos_6: -500+90, y_pos_6: 80+20, x_pos_7: -500+110, y_pos_7: 80+20, x_pos_8: -500+130, y_pos_8: 80+25, x_pos_9: -500+140, y_pos_9: 80+35, x_pos_10: -500+137, y_pos_10: 80+53, x_pos_11: -500+120, y_pos_11: 80+65, x_pos_12: -500+98, y_pos_12: 80+68, x_pos_13: -500+75, y_pos_13: 80+67, x_pos_14: -500+60, y_pos_14: 80+63},
                {x_pos: -300+ 85, y_pos: 80+ 44, x_pos_1: -300 +27, y_pos_1: 80+40, x_pos_2: -300+40, y_pos_2: 80+55, x_pos_3: -300+35, y_pos_3: 80+30, x_pos_4: -300+50, y_pos_4: 80+25, x_pos_5: -300+70, y_pos_5: 80+20, x_pos_6: -300+90, y_pos_6: 80+20, x_pos_7: -300+110, y_pos_7: 80+20, x_pos_8: -300+130, y_pos_8: 80+25, x_pos_9: -300+140, y_pos_9: 80+35, x_pos_10: -300+137, y_pos_10: 80+53, x_pos_11: -300+120, y_pos_11: 80+65, x_pos_12: -300+98, y_pos_12: 80+68, x_pos_13: -300+75, y_pos_13: 80+67, x_pos_14: -300+60, y_pos_14: 80+63},
                {x_pos: -250+ 85, y_pos: 100+ 44, x_pos_1: -250 +27, y_pos_1: 100+40, x_pos_2: -250+40, y_pos_2: 100+55, x_pos_3: -250+35, y_pos_3: 100+30, x_pos_4: -250+50, y_pos_4: 100+25, x_pos_5: -250+70, y_pos_5: 100+20, x_pos_6: -250+90, y_pos_6: 100+20, x_pos_7: -250+110, y_pos_7: 100+20, x_pos_8: -250+130, y_pos_8: 100+25, x_pos_9: -250+140, y_pos_9: 100+35, x_pos_10: -250+137, y_pos_10: 100+53, x_pos_11: -250+120, y_pos_11: 100+65, x_pos_12: -250+98, y_pos_12: 100+68, x_pos_13: -250+75, y_pos_13: 100+67, x_pos_14: -250+60, y_pos_14: 100+63},
                {x_pos: -125+ 85, y_pos: 80+ 44, x_pos_1: -125 +27, y_pos_1: 80+40, x_pos_2: -125+40, y_pos_2: 80+55, x_pos_3: -125+35, y_pos_3: 80+30, x_pos_4: -125+50, y_pos_4: 80+25, x_pos_5: -125+70, y_pos_5: 80+20, x_pos_6: -125+90, y_pos_6: 80+20, x_pos_7: -125+110, y_pos_7: 80+20, x_pos_8: -125+130, y_pos_8: 80+25, x_pos_9: -125+140, y_pos_9: 80+35, x_pos_10: -125+137, y_pos_10: 80+53, x_pos_11: -125+120, y_pos_11: 80+65, x_pos_12: -125+98, y_pos_12: 80+68, x_pos_13: -125+75, y_pos_13: 80+67, x_pos_14: -125+60, y_pos_14: 80+63},
                {x_pos: -150+ 85, y_pos: 100+ 44, x_pos_1: -150+27, y_pos_1: 100+40, x_pos_2: -150+40, y_pos_2: 100+55, x_pos_3: -150+35, y_pos_3: 100+30, x_pos_4: -150+50, y_pos_4: 100+25, x_pos_5: -150+70, y_pos_5: 100+20, x_pos_6: -150+90, y_pos_6: 100+20, x_pos_7: -150+110, y_pos_7: 100+20, x_pos_8: -150+130, y_pos_8: 100+25, x_pos_9: -150+140, y_pos_9: 100+35, x_pos_10: -150+137, y_pos_10: 100+53, x_pos_11: -150+120, y_pos_11: 100+65, x_pos_12: -150+98, y_pos_12: 100+68, x_pos_13: -150+75, y_pos_13: 100+67, x_pos_14: -150+60, y_pos_14: 100+63},
                {x_pos: -100+ 85, y_pos: 150+ 44, x_pos_1: -100+27, y_pos_1: 150+40, x_pos_2: -100+40, y_pos_2: 150+55, x_pos_3: -100+35, y_pos_3: 150+30, x_pos_4: -100+50, y_pos_4: 150+25, x_pos_5: -100+70, y_pos_5: 150+20, x_pos_6: -100+90, y_pos_6: 150+20, x_pos_7: -100+110, y_pos_7: 150+20, x_pos_8: -100+130, y_pos_8: 150+25, x_pos_9: -100+140, y_pos_9: 150+35, x_pos_10: -100+137, y_pos_10: 150+53, x_pos_11: -100+120, y_pos_11: 150+65, x_pos_12: -100+98, y_pos_12: 150+68, x_pos_13: -100+75, y_pos_13: 150+67, x_pos_14: -100+60, y_pos_14: 150+63},
                {x_pos: 100+ 85, y_pos: 200+ 44, x_pos_1: 100+27, y_pos_1: 200+40, x_pos_2: 100+40, y_pos_2: 200+55, x_pos_3: 100+35, y_pos_3: 200+30, x_pos_4: 100+50, y_pos_4: 200+25, x_pos_5: 100+70, y_pos_5: 200+20, x_pos_6: 100+90, y_pos_6: 200+20, x_pos_7: 100+110, y_pos_7: 200+20, x_pos_8: 100+130, y_pos_8: 200+25, x_pos_9: 100+140, y_pos_9: 200+35, x_pos_10: 100+137, y_pos_10: 200+53, x_pos_11: 100+120, y_pos_11: 200+65, x_pos_12: 100+98, y_pos_12: 200+68, x_pos_13: 100+75, y_pos_13: 200+67, x_pos_14: 100+60, y_pos_14: 200+63},
			    {x_pos: 150+ 85, y_pos: 70+ 44, x_pos_1: 150+27, y_pos_1: 70+40, x_pos_2: 150+40, y_pos_2: 70+55, x_pos_3: 150+35, y_pos_3: 70+30, x_pos_4: 150+50, y_pos_4: 70+25, x_pos_5: 150+70, y_pos_5: 70+20, x_pos_6: 150+90, y_pos_6: 70+20, x_pos_7: 150+110, y_pos_7: 70+20, x_pos_8: 150+130, y_pos_8: 70+25, x_pos_9: 150+140, y_pos_9: 70+35, x_pos_10: 150+137, y_pos_10: 70+53, x_pos_11: 150+120, y_pos_11: 70+65, x_pos_12: 150+98, y_pos_12: 70+68, x_pos_13: 150+75, y_pos_13: 70+67, x_pos_14: 150+60, y_pos_14: 70+63},
			    {x_pos: 200+ 85, y_pos: 130+ 44, x_pos_1: 200+27, y_pos_1: 130+40, x_pos_2: 200+40, y_pos_2: 130+55, x_pos_3: 200+35, y_pos_3: 130+30, x_pos_4: 200+50, y_pos_4: 130+25, x_pos_5: 200+70, y_pos_5: 130+20, x_pos_6: 200+90, y_pos_6: 130+20, x_pos_7: 200+110, y_pos_7: 130+20, x_pos_8: 200+130, y_pos_8: 130+25, x_pos_9: 200+140, y_pos_9: 130+35, x_pos_10: 200+137, y_pos_10: 130+53, x_pos_11: 200+120, y_pos_11: 130+65, x_pos_12: 200+98, y_pos_12: 130+68, x_pos_13: 200+75, y_pos_13: 130+67, x_pos_14: 200+60, y_pos_14: 130+63},
                {x_pos: 300+ 85, y_pos: 150+ 44, x_pos_1: 300+27, y_pos_1: 150+40, x_pos_2: 300+40, y_pos_2: 150+55, x_pos_3: 300+35, y_pos_3: 150+30, x_pos_4: 300+50, y_pos_4: 150+25, x_pos_5: 300+70, y_pos_5: 150+20, x_pos_6: 300+90, y_pos_6: 150+20, x_pos_7: 300+110, y_pos_7: 150+20, x_pos_8: 300+130, y_pos_8: 150+25, x_pos_9: 300+140, y_pos_9: 150+35, x_pos_10: 300+137, y_pos_10: 150+53, x_pos_11: 300+120, y_pos_11: 150+65, x_pos_12: 300+98, y_pos_12: 150+68, x_pos_13: 300+75, y_pos_13: 150+67, x_pos_14: 300+60, y_pos_14: 150+63},
                {x_pos: 500+ 85, y_pos: 170+ 44, x_pos_1: 500+27, y_pos_1: 170+40, x_pos_2: 500+40, y_pos_2: 170+55, x_pos_3: 500+35, y_pos_3: 170+30, x_pos_4: 500+50, y_pos_4: 170+25, x_pos_5: 500+70, y_pos_5: 170+20, x_pos_6: 500+90, y_pos_6: 170+20, x_pos_7: 500+110, y_pos_7: 170+20, x_pos_8: 500+130, y_pos_8: 170+25, x_pos_9: 500+140, y_pos_9: 170+35, x_pos_10: 500+137, y_pos_10: 170+53, x_pos_11: 500+120, y_pos_11: 170+65, x_pos_12: 500+98, y_pos_12: 170+68, x_pos_13: 500+75, y_pos_13: 170+67, x_pos_14: 500+60, y_pos_14: 170+63},
                {x_pos: 300+ 85, y_pos: 70+ 44, x_pos_1: 300+27, y_pos_1: 70+40, x_pos_2: 300+40, y_pos_2: 70+55, x_pos_3: 300+35, y_pos_3: 70+30, x_pos_4: 300+50, y_pos_4: 70+25, x_pos_5: 300+70, y_pos_5: 70+20, x_pos_6: 300+90, y_pos_6: 70+20, x_pos_7: 300+110, y_pos_7: 70+20, x_pos_8: 300+130, y_pos_8: 70+25, x_pos_9: 300+140, y_pos_9: 70+35, x_pos_10: 300+137, y_pos_10: 70+53, x_pos_11: 300+120, y_pos_11: 70+65, x_pos_12: 300+98, y_pos_12: 70+68, x_pos_13: 300+75, y_pos_13: 70+67, x_pos_14: 300+60, y_pos_14: 70+63},
                {x_pos: 600+ 85, y_pos: 120+ 44, x_pos_1: 600+27, y_pos_1: 120+40, x_pos_2: 600+40, y_pos_2: 120+55, x_pos_3: 600+35, y_pos_3: 120+30, x_pos_4: 600+50, y_pos_4: 120+25, x_pos_5: 600+70, y_pos_5: 120+20, x_pos_6: 600+90, y_pos_6: 120+20, x_pos_7: 600+110, y_pos_7: 120+20, x_pos_8: 600+130, y_pos_8: 120+25, x_pos_9: 600+140, y_pos_9: 120+35, x_pos_10: 600+137, y_pos_10: 120+53, x_pos_11: 600+120, y_pos_11: 120+65, x_pos_12: 600+98, y_pos_12: 120+68, x_pos_13: 600+75, y_pos_13: 120+67, x_pos_14: 600+60, y_pos_14: 120+63},
                {x_pos: 700+ 85, y_pos: 150+ 44, x_pos_1: 700+27, y_pos_1: 150+40, x_pos_2: 700+40, y_pos_2: 150+55, x_pos_3: 700+35, y_pos_3: 150+30, x_pos_4: 700+50, y_pos_4: 150+25, x_pos_5: 700+70, y_pos_5: 150+20, x_pos_6: 700+90, y_pos_6: 150+20, x_pos_7: 700+110, y_pos_7: 150+20, x_pos_8: 700+130, y_pos_8: 150+25, x_pos_9: 700+140, y_pos_9: 150+35, x_pos_10: 700+137, y_pos_10: 150+53, x_pos_11: 700+120, y_pos_11: 150+65, x_pos_12: 700+98, y_pos_12: 150+68, x_pos_13: 700+75, y_pos_13: 150+67, x_pos_14: 700+60, y_pos_14: 150+63},
                {x_pos: 800+ 85, y_pos: 80+ 44, x_pos_1: 800+27, y_pos_1: 80+40, x_pos_2: 800+40, y_pos_2: 80+55, x_pos_3: 800+35, y_pos_3: 80+30, x_pos_4: 800+50, y_pos_4: 80+25, x_pos_5: 800+70, y_pos_5: 80+20, x_pos_6: 800+90, y_pos_6: 80+20, x_pos_7: 800+110, y_pos_7: 80+20, x_pos_8: 800+130, y_pos_8: 80+25, x_pos_9: 800+140, y_pos_9: 80+35, x_pos_10: 800+137, y_pos_10: 80+53, x_pos_11: 800+120, y_pos_11: 80+65, x_pos_12: 800+98, y_pos_12: 80+68, x_pos_13: 800+75, y_pos_13: 80+67, x_pos_14: 800+60, y_pos_14: 80+63},
                {x_pos: 650+ 85, y_pos: 120+ 44, x_pos_1: 650+27, y_pos_1: 120+40, x_pos_2: 650+40, y_pos_2: 120+55, x_pos_3: 650+35, y_pos_3: 120+30, x_pos_4: 650+50, y_pos_4: 120+25, x_pos_5: 650+70, y_pos_5: 120+20, x_pos_6: 650+90, y_pos_6: 120+20, x_pos_7: 650+110, y_pos_7: 120+20, x_pos_8: 650+130, y_pos_8: 120+25, x_pos_9: 650+140, y_pos_9: 120+35, x_pos_10: 650+137, y_pos_10: 120+53, x_pos_11: 650+120, y_pos_11: 120+65, x_pos_12: 650+98, y_pos_12: 120+68, x_pos_13: 650+75, y_pos_13: 120+67, x_pos_14: 650+60, y_pos_14: 120+63},
                {x_pos: 850+ 85, y_pos: 150+ 44, x_pos_1: 850+27, y_pos_1: 150+40, x_pos_2: 850+40, y_pos_2: 150+55, x_pos_3: 850+35, y_pos_3: 150+30, x_pos_4: 850+50, y_pos_4: 150+25, x_pos_5: 850+70, y_pos_5: 150+20, x_pos_6: 850+90, y_pos_6: 150+20, x_pos_7: 850+110, y_pos_7: 150+20, x_pos_8: 850+130, y_pos_8: 150+25, x_pos_9: 850+140, y_pos_9: 150+35, x_pos_10: 850+137, y_pos_10: 150+53, x_pos_11: 850+120, y_pos_11: 150+65, x_pos_12: 850+98, y_pos_12: 150+68, x_pos_13: 850+75, y_pos_13: 150+67, x_pos_14: 850+60, y_pos_14: 150+63},
                {x_pos: 950+ 85, y_pos: 70+ 44, x_pos_1: 950+27, y_pos_1: 70+40, x_pos_2: 950+40, y_pos_2: 70+55, x_pos_3: 950+35, y_pos_3: 70+30, x_pos_4: 950+50, y_pos_4: 70+25, x_pos_5: 950+70, y_pos_5: 70+20, x_pos_6: 950+90, y_pos_6: 70+20, x_pos_7: 950+110, y_pos_7: 70+20, x_pos_8: 950+130, y_pos_8: 70+25, x_pos_9: 950+140, y_pos_9: 70+35, x_pos_10: 950+137, y_pos_10: 70+53, x_pos_11: 950+120, y_pos_11: 70+65, x_pos_12: 950+98, y_pos_12: 70+68, x_pos_13: 950+75, y_pos_13: 70+67, x_pos_14: 950+60, y_pos_14: 70+63},
                {x_pos: 500+ 85, y_pos: 80+ 44, x_pos_1: 500+27, y_pos_1: 80+40, x_pos_2: 500+40, y_pos_2: 80+55, x_pos_3: 500+35, y_pos_3: 80+30, x_pos_4: 500+50, y_pos_4: 80+25, x_pos_5: 500+70, y_pos_5: 80+20, x_pos_6: 500+90, y_pos_6: 80+20, x_pos_7: 500+110, y_pos_7: 80+20, x_pos_8: 500+130, y_pos_8: 80+25, x_pos_9: 500+140, y_pos_9: 80+35, x_pos_10: 500+137, y_pos_10: 80+53, x_pos_11: 500+120, y_pos_11: 80+65, x_pos_12: 500+98, y_pos_12: 80+68, x_pos_13: 500+75, y_pos_13: 80+67, x_pos_14: 500+60, y_pos_14: 80+63},
                {x_pos: 1000+ 85, y_pos: 100+ 44, x_pos_1: 1000+27, y_pos_1: 100+40, x_pos_2: 1000+40, y_pos_2: 100+55, x_pos_3: 1000+35, y_pos_3: 100+30, x_pos_4: 1000+50, y_pos_4: 100+25, x_pos_5: 1000+70, y_pos_5: 100+20, x_pos_6: 1000+90, y_pos_6: 100+20, x_pos_7: 1000+110, y_pos_7: 100+20, x_pos_8: 1000+130, y_pos_8: 100+25, x_pos_9: 1000+140, y_pos_9: 100+35, x_pos_10: 1000+137, y_pos_10: 100+53, x_pos_11: 1000+120, y_pos_11: 100+65, x_pos_12: 1000+98, y_pos_12: 100+68, x_pos_13: 1000+75, y_pos_13: 100+67, x_pos_14: 1000+60, y_pos_14: 100+63},
                {x_pos: 1200+ 85, y_pos: 80+ 44, x_pos_1: 1200+27, y_pos_1: 80+40, x_pos_2: 1200+40, y_pos_2: 80+55, x_pos_3: 1200+35, y_pos_3: 80+30, x_pos_4: 1200+50, y_pos_4: 80+25, x_pos_5: 1200+70, y_pos_5: 80+20, x_pos_6: 1200+90, y_pos_6: 80+20, x_pos_7: 1200+110, y_pos_7: 80+20, x_pos_8: 1200+130, y_pos_8: 80+25, x_pos_9: 1200+140, y_pos_9: 80+35, x_pos_10: 1200+137, y_pos_10: 80+53, x_pos_11: 1200+120, y_pos_11: 80+65, x_pos_12: 1200+98, y_pos_12: 80+68, x_pos_13: 1200+75, y_pos_13: 80+67, x_pos_14: 1200+60, y_pos_14: 80+63},
                {x_pos: 1250+ 85, y_pos: 100+ 44, x_pos_1: 1250+27, y_pos_1: 100+40, x_pos_2: 1250+40, y_pos_2: 100+55, x_pos_3: 1250+35, y_pos_3: 100+30, x_pos_4: 1250+50, y_pos_4: 100+25, x_pos_5: 1250+70, y_pos_5: 100+20, x_pos_6: 1250+90, y_pos_6: 100+20, x_pos_7: 1250+110, y_pos_7: 100+20, x_pos_8: 1250+130, y_pos_8: 100+25, x_pos_9: 1250+140, y_pos_9: 100+35, x_pos_10: 1250+137, y_pos_10: 100+53, x_pos_11: 1250+120, y_pos_11: 100+65, x_pos_12: 1250+98, y_pos_12: 100+68, x_pos_13: 1250+75, y_pos_13: 100+67, x_pos_14: 1250+60, y_pos_14: 100+63},
                {x_pos: 1500+ 85, y_pos: 120+ 44, x_pos_1: 1500+27, y_pos_1: 120+40, x_pos_2: 1500+40, y_pos_2: 120+55, x_pos_3: 1500+35, y_pos_3: 120+30, x_pos_4: 1500+50, y_pos_4: 120+25, x_pos_5: 1500+70, y_pos_5: 120+20, x_pos_6: 1500+90, y_pos_6: 120+20, x_pos_7: 1500+110, y_pos_7: 120+20, x_pos_8: 1500+130, y_pos_8: 120+25, x_pos_9: 1500+140, y_pos_9: 120+35, x_pos_10: 1500+137, y_pos_10: 120+53, x_pos_11: 1500+120, y_pos_11: 120+65, x_pos_12: 1500+98, y_pos_12: 120+68, x_pos_13: 1500+75, y_pos_13: 120+67, x_pos_14: 1500+60, y_pos_14: 120+63},
                {x_pos: 1600+ 85, y_pos: 150+ 44, x_pos_1: 1600+27, y_pos_1: 150+40, x_pos_2: 1600+40, y_pos_2: 150+55, x_pos_3: 1600+35, y_pos_3: 150+30, x_pos_4: 1600+50, y_pos_4: 150+25, x_pos_5: 1600+70, y_pos_5: 150+20, x_pos_6: 1600+90, y_pos_6: 150+20, x_pos_7: 1600+110, y_pos_7: 150+20, x_pos_8: 1600+130, y_pos_8: 150+25, x_pos_9: 1600+140, y_pos_9: 150+35, x_pos_10: 1600+137, y_pos_10: 150+53, x_pos_11: 1600+120, y_pos_11: 150+65, x_pos_12: 1600+98, y_pos_12: 150+68, x_pos_13: 1600+75, y_pos_13: 150+67, x_pos_14: 1600+60, y_pos_14: 150+63},
                {x_pos: 1750+ 85, y_pos: 100+ 44, x_pos_1: 1750+27, y_pos_1: 100+40, x_pos_2: 1750+40, y_pos_2: 100+55, x_pos_3: 1750+35, y_pos_3: 100+30, x_pos_4: 1750+50, y_pos_4: 100+25, x_pos_5: 1750+70, y_pos_5: 100+20, x_pos_6: 1750+90, y_pos_6: 100+20, x_pos_7: 1750+110, y_pos_7: 100+20, x_pos_8: 1750+130, y_pos_8: 100+25, x_pos_9: 1750+140, y_pos_9: 100+35, x_pos_10: 1750+137, y_pos_10: 100+53, x_pos_11: 1750+120, y_pos_11: 100+65, x_pos_12: 1750+98, y_pos_12: 100+68, x_pos_13: 1750+75, y_pos_13: 100+67, x_pos_14: 1750+60, y_pos_14: 100+63},
                {x_pos: 1900+ 85, y_pos: 120+ 44, x_pos_1: 1900+27, y_pos_1: 120+40, x_pos_2: 1900+40, y_pos_2: 120+55, x_pos_3: 1900+35, y_pos_3: 120+30, x_pos_4: 1900+50, y_pos_4: 120+25, x_pos_5: 1900+70, y_pos_5: 120+20, x_pos_6: 1900+90, y_pos_6: 120+20, x_pos_7: 1900+110, y_pos_7: 120+20, x_pos_8: 1900+130, y_pos_8: 120+25, x_pos_9: 1900+140, y_pos_9: 120+35, x_pos_10: 1900+137, y_pos_10: 120+53, x_pos_11: 1900+120, y_pos_11: 120+65, x_pos_12: 1900+98, y_pos_12: 120+68, x_pos_13: 1900+75, y_pos_13: 120+67, x_pos_14: 1900+60, y_pos_14: 120+63},
                {x_pos: 2000+ 85, y_pos: 90+ 44, x_pos_1: 2000+27, y_pos_1: 90+40, x_pos_2: 2000+40, y_pos_2: 90+55, x_pos_3: 2000+35, y_pos_3: 90+30, x_pos_4: 2000+50, y_pos_4: 90+25, x_pos_5: 2000+70, y_pos_5: 90+20, x_pos_6: 2000+90, y_pos_6: 90+20, x_pos_7: 2000+110, y_pos_7: 90+20, x_pos_8: 2000+130, y_pos_8: 90+25, x_pos_9: 2000+140, y_pos_9: 90+35, x_pos_10: 2000+137, y_pos_10: 90+53, x_pos_11: 2000+120, y_pos_11: 90+65, x_pos_12: 2000+98, y_pos_12: 90+68, x_pos_13: 2000+75, y_pos_13: 90+67, x_pos_14: 2000+60, y_pos_14: 90+63},
                {x_pos: 2100+ 85, y_pos: 140+ 44, x_pos_1: 2100+27, y_pos_1: 140+40, x_pos_2: 2100+40, y_pos_2: 140+55, x_pos_3: 2100+35, y_pos_3: 140+30, x_pos_4: 2100+50, y_pos_4: 140+25, x_pos_5: 2100+70, y_pos_5: 140+20, x_pos_6: 2100+90, y_pos_6: 140+20, x_pos_7: 2100+110, y_pos_7: 140+20, x_pos_8: 2100+130, y_pos_8: 140+25, x_pos_9: 2100+140, y_pos_9: 140+35, x_pos_10: 2100+137, y_pos_10: 140+53, x_pos_11: 2100+120, y_pos_11: 140+65, x_pos_12: 2100+98, y_pos_12: 140+68, x_pos_13: 2100+75, y_pos_13: 140+67, x_pos_14: 2100+60, y_pos_14: 140+63},
                {x_pos: 2200+ 85, y_pos: 130+ 44, x_pos_1: 2200+27, y_pos_1: 130+40, x_pos_2: 2200+40, y_pos_2: 130+55, x_pos_3: 2200+35, y_pos_3: 130+30, x_pos_4: 2200+50, y_pos_4: 130+25, x_pos_5: 2200+70, y_pos_5: 130+20, x_pos_6: 2200+90, y_pos_6: 130+20, x_pos_7: 200+110, y_pos_7: 130+20, x_pos_8: 2200+130, y_pos_8: 130+25, x_pos_9: 2200+140, y_pos_9: 130+35, x_pos_10: 2200+137, y_pos_10: 130+53, x_pos_11: 2200+120, y_pos_11: 130+65, x_pos_12: 2200+98, y_pos_12: 130+68, x_pos_13: 2200+75, y_pos_13: 130+67, x_pos_14: 2200+60, y_pos_14: 130+63},
                {x_pos: 2300+ 85, y_pos: 80+ 44, x_pos_1: 2300+27, y_pos_1: 80+40, x_pos_2: 2300+40, y_pos_2: 80+55, x_pos_3: 2300+35, y_pos_3: 80+30, x_pos_4: 2300+50, y_pos_4: 80+25, x_pos_5: 2300+70, y_pos_5: 80+20, x_pos_6: 2300+90, y_pos_6: 80+20, x_pos_7: 2300+110, y_pos_7: 80+20, x_pos_8: 2300+130, y_pos_8: 80+25, x_pos_9: 2300+140, y_pos_9: 80+35, x_pos_10: 2300+137, y_pos_10: 80+53, x_pos_11: 2300+120, y_pos_11: 80+65, x_pos_12: 2300+98, y_pos_12: 80+68, x_pos_13: 2300+75, y_pos_13: 80+67, x_pos_14: 2300+60, y_pos_14: 80+63},
                {x_pos: 2400+ 85, y_pos: 150+ 44, x_pos_1: 2400+27, y_pos_1: 150+40, x_pos_2: 2400+40, y_pos_2: 150+55, x_pos_3: 2400+35, y_pos_3: 150+30, x_pos_4: 2400+50, y_pos_4: 150+25, x_pos_5: 2400+70, y_pos_5: 150+20, x_pos_6: 2400+90, y_pos_6: 150+20, x_pos_7: 2400+110, y_pos_7: 150+20, x_pos_8: 2400+130, y_pos_8: 150+25, x_pos_9: 2400+140, y_pos_9: 150+35, x_pos_10: 2400+137, y_pos_10: 150+53, x_pos_11: 2400+120, y_pos_11: 150+65, x_pos_12: 2400+98, y_pos_12: 150+68, x_pos_13: 2400+75, y_pos_13: 150+67, x_pos_14: 2400+60, y_pos_14: 150+63}
            ];
    
     mountain = [
                {tri_1 : {x_pos_1: -800 -100, y_pos_1: 300 + 132, x_pos_2: -800 + 25, y_pos_2: 300 - 100, x_pos_3: -800 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: -800 - 100, y_pos_1: 300 + 45, x_pos_2: -800 - 175, y_pos_2: 300 + 135, x_pos_3: -800 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: -800 + 150, y_pos_1: 300 + 45, x_pos_2: -800 + 100, y_pos_2: 300 + 135, x_pos_3: -800 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: -600 - 100, y_pos_1: 300 + 132, x_pos_2: -600 + 25, y_pos_2: 300 - 100, x_pos_3: -600 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: -600 - 100, y_pos_1: 300 + 45, x_pos_2: -600 - 175, y_pos_2: 300 + 135, x_pos_3: -600 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: -600 + 150, y_pos_1: 300 + 45, x_pos_2: -600 + 100, y_pos_2: 300 + 135, x_pos_3: -600 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: -200 - 100, y_pos_1: 300 + 132, x_pos_2: -200 + 25, y_pos_2: 300 - 100, x_pos_3: -200 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: -200 - 100, y_pos_1: 300 + 45, x_pos_2: -200 - 175, y_pos_2: 300 + 135, x_pos_3: -200 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: -200 + 150, y_pos_1: 300 + 45, x_pos_2: -200 + 100, y_pos_2: 300 + 135, x_pos_3: -200 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 325 - 100, y_pos_1: 300 + 132, x_pos_2: 325 + 25, y_pos_2: 300 - 100, x_pos_3: 325 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 325 - 100, y_pos_1: 300 + 45, x_pos_2: 325 - 175, y_pos_2: 300 + 135, x_pos_3: 325 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 325 + 150, y_pos_1: 300 + 45, x_pos_2: 325 + 100, y_pos_2: 300 + 135, x_pos_3: 325 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 750 - 100, y_pos_1: 300 + 132, x_pos_2: 750 + 25, y_pos_2: 300 - 100, x_pos_3: 750 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 750 - 100, y_pos_1: 300 + 45, x_pos_2: 750 - 175, y_pos_2: 300 + 135, x_pos_3: 750 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 750 + 150, y_pos_1: 300 + 45, x_pos_2: 750 + 100, y_pos_2: 300 + 135, x_pos_3: 750 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 1000 - 100, y_pos_1: 300 + 132, x_pos_2: 1000 + 25, y_pos_2: 300 - 100, x_pos_3: 1000 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 1000 - 100, y_pos_1: 300 + 45, x_pos_2: 1000 - 175, y_pos_2: 300 + 135, x_pos_3: 1000 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 1000 + 150, y_pos_1: 300 + 45, x_pos_2: 1000 + 100, y_pos_2: 300 + 135, x_pos_3: 1000 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 1350 - 100, y_pos_1: 300 + 132, x_pos_2: 1350 + 25, y_pos_2: 300 - 100, x_pos_3: 1350 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 1350 - 100, y_pos_1: 300 + 45, x_pos_2: 1350 - 175, y_pos_2: 300 + 135, x_pos_3: 1350 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 1350 + 150, y_pos_1: 300 + 45, x_pos_2: 1350 + 100, y_pos_2: 300 + 135, x_pos_3: 1350 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 1800 - 100, y_pos_1: 300 + 132, x_pos_2: 1800 + 25, y_pos_2: 300 - 100, x_pos_3: 1800 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 1800 - 100, y_pos_1: 300 + 45, x_pos_2: 1800 - 175, y_pos_2: 300 + 135, x_pos_3: 1800 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 1800 + 150, y_pos_1: 300 + 45, x_pos_2: 1800 + 100, y_pos_2: 300 + 135, x_pos_3: 1800 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 2200 - 100, y_pos_1: 300 + 132, x_pos_2: 2200 + 25, y_pos_2: 300 - 100, x_pos_3: 2200 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 2200 - 100, y_pos_1: 300 + 45, x_pos_2: 2200 - 175, y_pos_2: 300 + 135, x_pos_3: 2200 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 2200 + 150, y_pos_1: 300 + 45, x_pos_2: 2200 + 100, y_pos_2: 300 + 135, x_pos_3: 2200 + 200, y_pos_3: 300 + 135}},
                {tri_1 : {x_pos_1: 2550 - 100, y_pos_1: 300 + 132, x_pos_2: 2550 + 25, y_pos_2: 300 - 100, x_pos_3: 2550 + 150, y_pos_3: 300 + 132}, tri_2 : {x_pos_1: 2550 - 100, y_pos_1: 300 + 45, x_pos_2: 2550 - 175, y_pos_2: 300 + 135, x_pos_3: 2550 - 25, y_pos_3: 300 + 135}, tri_3 : {x_pos_1: 2550 + 150, y_pos_1: 300 + 45, x_pos_2: 2550 + 100, y_pos_2: 300 + 135, x_pos_3: 2550 + 200, y_pos_3: 300 + 135}}
              ];
    
    canyon = [
                {x_pos_rect: -700 + 150, width_rect: 100 + 332, x_pos_1_tri_1: -700 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: -700 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: -700 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: -700 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: -700 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: -700 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: -500 + 150, width_rect: 100 + 332, x_pos_1_tri_1: -500 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: -500 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: -500 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: -500 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: -500 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: -500 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: -250 + 150, width_rect: 100 + 332, x_pos_1_tri_1: -250 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: -250 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: -250 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: -250 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: -250 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: -250 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 20 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 20 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 20 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 20 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 20 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 20 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 20 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 690 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 690 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 690 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 690 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 690 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 690 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 690 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 885 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 885 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 885 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 885 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 885 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 885 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 885 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 1500 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 1500 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 1500 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 1500 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 1500 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 1500 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 1500 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 2000 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 2000 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 2000 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 2000 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 2000 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 2000 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 2000 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 2500 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 2500 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 2500 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 2500 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 2500 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 2500 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 2500 + 200, y_pos_3_tri_2: 100 + 330},
                {x_pos_rect: 2800 + 150, width_rect: 100 + 332, x_pos_1_tri_1: 2800 + 125, y_pos_1_tri_1: 100 + 480, 
                x_pos_2_tri_1: 2800 + 150, y_pos_2_tri_1: 100 + 480, x_pos_3_tri_1: 2800 + 150, y_pos_3_tri_1: 100 + 330,
                x_pos_1_tri_2: 2800 + 225, y_pos_1_tri_2: 100 + 480, x_pos_2_tri_2: 2800 + 200, y_pos_2_tri_2: 100 + 480,
                x_pos_3_tri_2: 2800 + 200, y_pos_3_tri_2: 100 + 330}
             ];
    
    collectables = [
                    {x_pos: -100 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 150 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 100 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 200 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 400 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 500 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 750 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 800 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 1000 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 1200 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 1450 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 1700 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -800 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -500 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -600 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 1800 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -700 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -900 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2000 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2100 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2200 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -1000 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: -1200 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2300 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2400 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2500 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 1900 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2700 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 2800 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 3000 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false},
                    {x_pos: 3100 + 150, y_pos: 100 + 315, size: 50, isFound: false, isHidden: false}
                   ];
}

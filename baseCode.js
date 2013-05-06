/*
* Define player behaviour
*/

var utils = {};
utils.getRandomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// A (probably quite slow) generator of a normally distributed number in the range -1 to 1. Three numbers means a maximum deviation of three sigma from mean.
utils.random_standardNormalDist = function () {
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
};

// Generate a number normally distributed about mean with a standards deviation of stdev.
utils.rand_normal = function (mu, sigma) {
    return utils.random_standardNormalDist()*sigma+mu;
};

// Test a match between ascii decimal character codes. If the first key is an upper case letter then test again lower case letters as well.
utils.keyMatch = function (key1, key2) {
	if (key1 === key2) return true;
	if ( key1 > 64 && key1 < 91) {
		if (key1 === (key2 + 32)) return true;
	}
	return false;
};

// The world object.
var world = {};
world.width = false;
world.height = false;

// World map input and processing.
world.rawMap = {};
world.rawMap.map = [
	'"Γ	"	"	"	"	"	"	"	"	"	"	"	@	@	@	@	@	@	@	"	"	"	"	"'		,
	'"|	"	"	"	"	"	"	"	"	"	"	@	@	@	@	@	@	@	"	"	"	"	"	"'		,
	'"|	"	"	"	"	"	"	"	"	"	@	@	@	@	@	@	@	@	"	"	"	"	"	"'		,
	'"|	"	"	"	"	"	"	"	"T	"	@	@	@	@	@	@	@	@	"	"	"	"	"	"'		,
	'"|	"	"	"	"	"	"	"	"|	"	"	@	@	@	@	@	@	"	"	"	"	"	"	"'		,
	'@	"	"	"	"	"౬	"-	"-	"+	"	"-	@-	@-	@-	@┐	@	@	"	"	"	"	"	"	@'		,
	'"|	"	"	"	"	"	"	"	"|	"	"	"	@	@	@|	@	"	"	"	"	"	"	"	@|'		,
	'"|	"	"	"%	"	"	"	"├	"┤	"	"	"	@	@	"|	"	"	"	"	"	"	"	"	"|'		,
	'"|	"	"	"	"	"	"	"	"	"	"	"	"	"	"|	"	"	"	"	"	"	"	"	"|'		,
	'"|	"	"	@	@	"	"	"	"|	"	"	"	"	"	"|	"	"	"	"	"	"	"	"	"|'		,
	'"|	"	"	"	@	@	"	"	"|	"	"	"	"	"	"	"	"	"	"	"	"	"	"	"|'		,
	'"L	"-	"-	"-	@-	@	@	"	"L	"-	"	"-	"-	"-	"┐	"	"	"	"	"	"-	"-	"-	"┘'		,
	'"	"	"	"	"	"	@	"	"	"	"	"	"	"	"|	"	"	"	"	"	"	"	"	"'		,
	'"Γ	"	"	"-	"-	"-	"	"	"	"	"	"	"	"	"|	"	@	@	"	"	"-	"-	"-	"┐'		,
	'"|	"	"	"	"	"	"	"	"	"	"	"	"	"	@	@	@	@	@	"	"	"	"	"|'		,
	'"L	"-	"-	"-	"	"	"	"	"	"	"	"	"	@	@	@	@	@	@	"	"	"	"	"┘'
];


// Process the text map into a series of arrays. For a given set of coordinates, each map array in mapList will try to grab the corresponding character in the str representing each map tile. Where no character exists a value of undefined will be assigned to the coordinate on that map, this will be processed as the default value for that map.
world.rawMap.process = function (raw, mapList) {

	var worldRow_str,
		worldRow_arr,
		rowItr,
		columnItr,
		tile_str,
		numMaps = mapList.length,
		mapItr;

	// Set the world height from the raw map.
	if (!world.height) world.height = raw.length;

	// Iterate over each map
	for (mapItr = 0; mapItr < numMaps; mapItr += 1) {

		// Iterate over the rows of the map.
		for (rowItr = 0; rowItr < world.height; rowItr += 1) {

			worldRow_str = raw[rowItr];
			worldRow_arr = worldRow_str.split(/\s+/);

			// Set the world width from the raw map.
			if (!world.width) world.width = worldRow_arr.length;

			// Create an empty array to hold the row on the target map.
			mapList[mapItr][rowItr] = [];

			// Iterate over the columns within the row.
			for (columnItr=0; columnItr < world.width; columnItr += 1) {

				// Get the set of characters representing each tile in the world.
				tile_str = worldRow_arr[columnItr];

				// Push the characters from the raw map tile string into the maps in order, where no string exists the special value undefined will be set. The first map is the occupation level of each tile.

				// BODGE The proper code is commented out immediately below this comment, the replacement code allows comparisons with characters that javascript converts to sets of other characters, but prevents more maps from being added. The proper solution is to use supported characters, or add support for all UTF-8 characters.
				// mapList[mapItr][rowItr][columnItr] = (mapItr === 0) ? [] : tile_str[mapItr-1];
				if (mapItr === 0) {
					mapList[mapItr][rowItr][columnItr] = [];
				} else if (mapItr === 1) {
					mapList[mapItr][rowItr][columnItr] = tile_str[0];
				} else {
					mapList[mapItr][rowItr][columnItr] = tile_str.substring(1);
				}

			}
		}
	}
};

world.terrain = {};
world.terrain.map = [];
world.terrain.key = {
	'"' : {
			class: 'grass ',
			occupiable: true,
			resource: './resources/graphics/grass/grass.png'
		},

	'@' : {
			class: 'rock ',
			occupiable: true,
			resource: './resources/graphics/ground/ground_1.png'
/*
			resource: [
				'./resources/graphics/ground/ground_1.png',
				'./resources/graphics/ground/ground_2.png',
				'./resources/graphics/ground/ground_3.png',
				'./resources/graphics/ground/ground_4.png',
				'./resources/graphics/ground/ground_5.png',
				'./resources/graphics/ground/ground_6.png',
				'./resources/graphics/ground/ground_7.png',
				'./resources/graphics/ground/ground_8.png',
				'./resources/graphics/ground/ground_9.png',
				'./resources/graphics/ground/ground_10.png',
				'./resources/graphics/ground/ground_11.png',
				'./resources/graphics/ground/ground_12.png'
			]
*/
		},

	'default' : {
			class: 'error1 ',
			occupiable: false
		}
};

world.features = {};
world.features.map = [];
world.features.key = {
	'+' : {
			class: 'wall_cross ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_15.png'
		},

	'|' : {
			class: 'wall_vertical ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_05.png'
		},

	'-' : {
			class: 'wall_horizontal ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_10.png'
		},
	'T' : {
			class: 'wall_T_top ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_14.png'
		},
	'├' : { // INVALID
			class: 'wall_T_left ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_07.png'
		},
	'┴' : { // INVALID
			class: 'wall_T_bottom ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_11.png'
		},
	'┤' : { // INVALID
			class: 'wall_T_right ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_13.png'
		},
	'Γ' : {
			class: 'wall_corner_topLeft ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_06.png'
		},
	'L' : {
			class: 'wall_corner_bottomLeft ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_03.png'
		},
	'┐' : { // INVALID
			class: 'wall_corner_topRight ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_12.png'
		},
	'┘' : { // INVALID
			class: 'wall_corner_bottomRight ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_09.png'
		},
	'౨' : {
			class: 'wall_end_right ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_08.png'
		},
	'౪' : {
			class: 'wall_end_bottom ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_01.png'
		},
	'౧' : {
			class: 'wall_end_top ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_04.png'
		},
	'౬' : {
			class: 'wall_end_left ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_02.png'
		},
	'%' : {
			class: 'wall_stump ',
			occupiable: false,
			resource: './resources/graphics/wall/wall_00.png'
		},
	'*' : {
			class: 'yellow_star ',
			occupiable: true,
			resource: './resources/graphics/yellowstar.png'
		},
	'x' : {
			class: 'red_star ',
			occupiable: true,
			resource: './resources/graphics/redstar.png'
		},
	'default' : {
			class: ' ',
			occupiable: true
		}
};

world.createCSSRules = function () {
	var cssRules = document.styleSheets[0];
	var terrain;
	var terrainResource;
	var terrainClass;
	var feature;
	var featureResource;
	var featureClass;
	var rule;
	for (terrain in world.terrain.key) {
		if (world.terrain.key.hasOwnProperty(terrain)) {
			terrain = world.terrain.key[terrain];
			terrainResource = terrain.resource;
			terrainClass = terrain.class;

			// Terrain only CSS definitions.
			if (terrainResource) {
				rule = '#gameArea .' + terrainClass + '{ background-image:url(\'' + terrainResource + '\'); background-repeat:no-repeat; }';
				cssRules.insertRule(rule,0);
			}
			for (feature in world.features.key) {
				if (world.features.key.hasOwnProperty(feature)) {
					feature = world.features.key[feature];
					featureResource = feature.resource;
					featureClass = feature.class;

					// Terrain and feature CSS definitions.
					if (terrainResource && featureResource) {
						rule = '#gameArea .' + terrainClass.replace(' ','') + '.' + featureClass + '{ background-image:url(\'' + featureResource + '\'), url(\'' + terrainResource + '\'); background-repeat:no-repeat; }';
						cssRules.insertRule(rule,0);
					}
				}
			}
		}
	}
};
world.createCSSRules();

// Map holding the number of occupants of each world tile.
world.occupation = {};
world.occupation.map = [];
world.occupation.inc = function (x, y, uid) {
	world.occupation.map[y][x].push(uid);
};
world.occupation.dec = function (x, y , uid) {
	var index = world.occupation.map[y][x].indexOf(uid);
	if (index !== -1) world.occupation.map[y][x].splice(uid,1);
};
world.occupation.getOccupationLevel = function (x,y) {
	return world.occupation.map[y][x].length;
};

// Add the maps to a list then parse the raw map information into the appropriate parsed map.
world.mapList = [];
world.mapList.push(world.occupation.map, world.terrain.map, world.features.map);
world.rawMap.process(world.rawMap.map, world.mapList);

// Read the map symbols and return objects describing the contents of the map tile.
world.getMapDefinition = function (position, mapType) {
	var symbol,
		definition;

	// Get the map symbol from the specified position on the specified map. The maps are defined by row first, column second.
	// TODO When parsing the maps from an external source change them to be defined in column, row order.
	symbol = world[mapType].map[position.y][position.x];

	// If there was a symbol attempt to read the definition class and return it to the caller.
	if (symbol) {
		definition = world[mapType].key[symbol];
	} else {
		definition = world[mapType].key['default'];
	}

	if (definition) {
		return definition;
	}

	// Default behaviour.
	console.log('Could not match character: ', symbol);
	return {
		class: 'error2',
		occupiable: false
	};
};

// Find the game area element;
world.gameAreaEl = document.getElementById('gameArea');
world.gameAreaStepSize = parseInt(window.getComputedStyle(document.getElementById('sizer')).width ,10);



// Define the transform from tile coordinates to pixel coordinates.
world.transformTileToPixel = function (tilePosition) {
	return tilePosition * world.gameAreaStepSize;
};

// Generate unique ids
world.getUID = (function () {
	var uid = -1;
	return function () {
		uid = uid + 1;
		return ''+uid;
	};
}());

// Implement object movement.
// TODO: have this function work on x and y coordinates only, have the render function handle the conversion to pixel position by calling a method of the world object
// TODO: then can get rid of reference to ground layer.width and no longer expose that
var moveObject = function(o, direction) {
	var changedPositions = [], x, y;

	x = o.x;
	y = o.y;

	// TODO: abstract this list into a function.
	if (direction === 'up') {
		y -= 1;
		if (changedPositions.indexOf('y') === -1) changedPositions.push('y');
	} else if (direction === 'down') {
		y += 1;
		if (changedPositions.indexOf('y') === -1) changedPositions.push('y');
	} else if (direction === 'left') {
		x -= 1;
		if (changedPositions.indexOf('x') === -1) changedPositions.push('x');
	} else if (direction === 'right') {
		x += 1;
		if (changedPositions.indexOf('x') === -1) changedPositions.push('x');
	} else {
		console.log('Oops, it has all gone wrong');
	}

	// Implement periodic boundary conditions.
	// TODO Make these functions, called on key press, otherwise will call them for any key press.
	if (x > (world.width - 1)) x = 0;
	if (x < 0) x = (world.width - 1);

	if (y > (world.height - 1)) y = 0;
	if (y < 0 ) y = (world.height - 1);

	// Update the object position on screen if a position change occurred and if the move if valid (not blocked by a map feature).
	if ( (changedPositions.length !== 0) && (world.getMapDefinition({'x':x, 'y':y},'features').occupiable) && (world.occupation.getOccupationLevel(x ,y) < 1) ) {

		// Update the occupation levels of the old and new tile.
		world.occupation.inc(x, y);
		world.occupation.dec(o.x, o.y);

		// Update the object's recorded position and render the change.
		o.x = x;
		o.y = y;
		o.renderPosition(changedPositions);

		return true;
	} else {
		return false;
	}
};

// Define player object constructor with a starting position.
// TODO figure out what needs to be exposed and what can be kept in the closure, then return an object of interaction functions that have access to the closure variables.
// TODO No longer need to store top and left, just x and y and call the transform when rendering.
var characterList = [],
	characerListNodes;
var Character = function (characterDefinition) {

	// Only actually need to use 'that' inside the function calls, because by the time they are called this will refer to the browser window object (global scope).
	var that = this,
		domdir = {
			x: 'left',
			y: 'top'
		};

	that.class = characterDefinition.class;
	that.x = characterDefinition.startX;
	that.y = characterDefinition.startY;

	that.keys = {};
	if (characterDefinition.keys) that.keys.up = characterDefinition.keys.up;
	if (characterDefinition.keys) that.keys.down = characterDefinition.keys.down;
	if (characterDefinition.keys) that.keys.left = characterDefinition.keys.left;
	if (characterDefinition.keys) that.keys.right = characterDefinition.keys.right;

	if (characterDefinition.brain) that.brain = characterDefinition.brain;

	// Start the character listening for key presses and provide methods to turn it on and off. This is to prevent held keys moving the character repeatedly, and will also be used to ignore key presses during animations.
		that.lastKeyListenedTo = false;
		that.listening = true;
		that.startListening = function () {
			that.listening = true;
		};
		that.stopListening = function () {
			that.listening = false;
		};


	that.id = world.getUID();
	that.stepSize = world.gameAreaStepSize;
	that.element = false;

	that.createCharacterEl = function () {
		world.gameAreaEl.innerHTML += '<div id="' + that.id + '" class=" character ' + that.class + '" style="display:none"></div>';
	};

	that.setElement = function () {
		var numCharacters = characerListNodes.length, chrItr;

		for (chrItr = 0; chrItr < numCharacters; chrItr += 1) {
			if (that.id === characerListNodes[chrItr].id) {
				that.element = characerListNodes[chrItr];
				break;
			}
		}
	};

	// TODO store the object {x: 'left', y: 'top'} then have the renderPosition called with 'x' and 'y' instead of top and left, and update the dom using the reference object we just denied.
	that.renderPosition = function (directions) {

		if (directions.constructor.name === "Array") {
			directions.forEach( function (direction) {
				that.element.style[domdir[direction]] = world.transformTileToPixel(that[direction]) + "px";
			});
		} else {

			// REVIEW:JC:20130329: What is this for? Is direction defined at this point?
			that.element.style[domdir[direction]] = world.transformTileToPixel(that[directions]) + "px";
		}

	};

	that.moveCharacter = function (event) {
		var theOther = that;
		return moveObject(theOther, event);
	};


	// Insert the character into the DOM.
	that.createCharacterEl();

	// initialise, carry out the above functions necessary for initialisation
	that.initialise = function () {
		that.setElement();
		that.element.style.display = "";
		world.occupation.inc(that.x, that.y);
		that.renderPosition(['x','y']);
		if (that.brain) that.brain(that);
	};

};


/*
* Define the ground layer object.
*/
var groundLayer = (function () {
	var
		stepSize = world.gameAreaStepSize,
		gameAreaEl = world.gameAreaEl,
		height = world.height,
		width = world.width,
		tileBackground;

		// function insert the ground layer and its child divs into the game area.
		tileBackground = function () {
			var
				html = gameAreaEl.innerHTML,
				x, y,
				getClass = function (mapType) {

					// TODO: If the returned resource type is an array then assign class <class>_<random 0..length>. This will correspond to dynamic css classes already generated. Allows random usage of terrain variation.
					return world.getMapDefinition({'x':x, 'y':y}, mapType).class;
				},
				transform = world.transformTileToPixel;

			html += '<div id="groundLayer">';
			for (x = 0; x < width; x += 1) {
				for (y = 0; y < height; y += 1) {
					html += '<div data-x="' + x + '" data-y="' + y;
					html += '" class="background ' + getClass('terrain') + getClass('features') + ' " ';
					html += 'style="top:' + transform(y) + 'px ; left:' + transform(x) + 'px ;"></div>';
				}
			}
			html += '</div>';
			gameAreaEl.innerHTML = html;
		};

		return {
			tileBackground: tileBackground
		};

})();

// TODO: Create an array of impassable position indices.
// TODO: Use that array to place wall images. But initialy just change the background class to ground.



/*
*  Character setup.
*/

// Side project: rats could hold a map, in their brains, of which directions are possible for each tile they have visited, which a small chance of trying previously failed directions in order to adapt to changeable environments.
var ratBrain = function (thisRat) {
	var
		directions = ['left', 'right', 'up', 'down'],
		i,
		success,
		thoughtProcess,
		minThoughtTime = 100,
		meanThoughtTime = 800,
		sdThougthTime = 200,
		thisThoughtTime;

	thoughtProcess = function () {
		i = utils.getRandomInt(0,3);
		success = thisRat.moveCharacter(directions[i]);

		// If a move failed try again quickly, else try again after normal interval.
		if (success) {
			thisThoughtTime = Math.round(utils.rand_normal(meanThoughtTime, sdThougthTime));
			setTimeout(thoughtProcess, thisThoughtTime);
		} else {
			setTimeout(thoughtProcess, minThoughtTime);
		}
	};

	// Start thinking…
	thoughtProcess();
};

var ratDefinition = {
	startX: 3,
	startY: 5,
	class: 'rat',
	brain: ratBrain
};

// Create the player div, position it and define the keyboard event handler.
// TODO create a player constructor, give it an initialisation function that inserts the div, then stores the reference to it, rather than doing it here.;
var playerDefinitionList = [];

// Keys are upper case ascii character decimal identifiers (which means the arrow keys aren't useable because they are implemented incosistenly across hardware/OS).
playerDefinitionList.push ({
	startX: 11,
	startY: 7,
	class: 'player',
	keys: {
		up: 87,
		down: 83,
		left: 65,
		right: 68
	},
	brain: false
});

playerDefinitionList.push ({
	startX: 20,
	startY: 6,
	class: 'player',
	keys: {
		up: 73,
		down: 75,
		left: 74,
		right: 76
	},
	brain: false
});


// Define the controller logic for players
controller = {};

// Key press.. move the player then optionally stop listening.
controller.MoveOnKeyMatch = function (event) {

	var
		player,
		playerItr,
		numPlayers = playerList.length,
		keyMatch = utils.keyMatch;

	event.stopPropagation();
	event.preventDefault();

	for (playerItr = 0; playerItr < numPlayers; playerItr += 1) {
		player = playerList[playerItr];

		if (!player.listening) break;

		if ( keyMatch(event.which, player.keys.up) ) {
			player.moveCharacter('up');
			player.lastKeyListenedTo = event.which;
			//player.stopListening();
			break;
		} else if ( keyMatch(event.which, player.keys.down) ) {
			player.moveCharacter('down');
			player.lastKeyListenedTo = event.which;
			//player.stopListening();
			break;
		} else if ( keyMatch(event.which, player.keys.left) ) {
			player.moveCharacter('left');
			player.lastKeyListenedTo = event.which;
			//player.stopListening();
			break;
		} else if ( keyMatch(event.which, player.keys.right) ) {
			player.moveCharacter('right');
			player.lastKeyListenedTo = event.which;
			//player.stopListening();
			break;
		}

	}
};

// If the key up event key matches the key that a player last listened to then start make that player start listening again. ADAPT FOR USE DURING ANIMATION SEQUENCES ON 'ANIMATION END' EVENT FIRING FOR A GIVEN PLAYER.
controller.startListeningOnKeyMatch = function (event) {
	var
		player,
		playerItr,
		numPlayers = playerList.length,
		keyMatch = utils.keyMatch;

	event.stopPropagation();
	event.preventDefault();

	for (playerItr = 0; playerItr < numPlayers; playerItr += 1) {
		player = playerList[playerItr];

		if ( !player.listening ) {
			if( keyMatch(event.which, player.lastKeyListenedTo) ) {
				player.startListening();
				//break;
			}
		}
	}

};


/**
 * The list of players, needed globally.
 */
var playerList = [];


/*
* Game mechanics set up
*/
function init() {


	// Tile the background. Have to do this before any characters are created.
	groundLayer.tileBackground();

	// Create players
	playerDefinitionList.forEach(function (definition) {
		var tmpPlayer = new Character(definition);
		playerList.push(tmpPlayer);
		characterList.push(tmpPlayer);
	});


	// Create rats
	var ratList = [],
		numRats = 4;
	for (var ratItr = 0; ratItr < numRats; ratItr += 1) {
		ratList[ratItr] = new Character(ratDefinition);
		characterList.push(ratList[ratItr]);
	}


	// Populate the DOM node list of characters.
	characerListNodes = document.querySelectorAll('.character');

	// Initialise each character
	characterList.forEach( function(character) {
		character.initialise();
	});

	// Add the key event listeners to the page.

	// This system feels horrible. Something seems to be blocking key listening preferentially for one player over the other.
	/*
	document.addEventListener('keydown', controller.MoveOnKeyMatch, true);
	document.addEventListener('keyup', controller.startListeningOnKeyMatch, true);
	*/
	document.addEventListener('keyup', controller.MoveOnKeyMatch, true);
}

/**
 * Exports
 */

exports.init = init;





main();

function Main () {
	//#VARIABLES DEFINITION
	var gameLogic, stage, gameStatus,assets;



	
	Loading();

	function Loading(){

		gameStatus="loading";
		console.log(gameStatus);
		stage=new createjs.Stage(document.getElementById("game"));

		gameLogic={};
		gameLogic.tick=update;
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addListener(stage);
		createjs.Ticker.addListener(gameLogic);

		window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
		window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);


		
		gameContainer=new createjs.Container();
		

		stage.addChild(gameContainer);


		assets= new createjs.LoadQueue();
		assets.installPlugin(createjs.Sound);
		createjs.MotionGuidePlugin.install();


		assets.onProgress=function(e){

		}

		assets.onComplete=function(e){
			Start();
		}
		assets.onFileLoad=function(e){
			switch(e.item.type)
         	{
            case createjs.LoadQueue.IMAGE:
				
			break;
 
          	case createjs.LoadQueue.SOUND:

         	break;
         	
         	case createjs.LoadQueue.JSON:

         	break;
        	}
		}


		var manifest=[
					 
					 ];

		
		if(manifest.length)
			assets.loadManifest(manifest);
		else
			Start();
	}

	//#############################
	//#########LOGIC UPDATE########
	//#############################

	function update () {

		
	}

	//#############################
	//########GAME CONTROLS########
	//#############################

	keyMap = 
		{
 			 _pressed: {},
 			 busy:false,
  			LEFT: 37,
  			UP: 38,
 			RIGHT: 39,
 			DOWN: 40,
 			w: 87,
  			a: 65,
 			s: 83,
 			d: 68,
 			q: 81,
 			e: 69,
			r: 82,
			t: 84,
			spaceBar:32,
			1: 49,
			2: 50,
			3: 51,
			4: 52,
			5: 53,
			6: 54,
			7: 55,
			8: 56,
			9: 57,
 			
  			isDown: function(keyCode) 
  			{
    			return this._pressed[keyCode];
  			},
  
  			onKeydown: function(event) 
  			{
    			this._pressed[event.keyCode] = true;
  			},
  
  			onKeyup: function(event) 
  			{
    			this._pressed[event.keyCode] = false;
  			}
		};

	//#############################	
	//########GAME ENTITIES########
	//#############################


	//#############################
	//##########GAME SCENES########
	//#############################

	function Start(){
		gameStatus="start";
		console.log(gameStatus);
	}

	function GameOver(){
		
	}
}

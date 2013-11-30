window.addEventListener("load",Main);

function Main () {
	//#VARIABLES DEFINITION
	var gameLogic, stage, titleScreen, gameStatus,assets;

	var leftBandit,rightBandit,sun;

	var timePivot;
	
	var someoneShot=false;

	var nothingNew=false;


	var windSound,bellSound;

	var keyBusy=false;
	Loading();

	function Loading(){

		gameStatus="Loading";
		console.log(gameStatus);
		stage=new createjs.Stage(document.getElementById("game"));
		titleScreen=new createjs.Stage(document.getElementById("title"));
		gameLogic={};
		gameLogic.tick=update;
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addListener(stage);
		createjs.Ticker.addListener(titleScreen);
		createjs.Ticker.addListener(gameLogic);

		window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
		window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);


		
		gameContainer=new createjs.Container();
		cloudsContainer=new createjs.Container();
		propsContainer=new createjs.Container();
		banditsContainer=new createjs.Container();
		uiContainer=new createjs.Container();
		curtain=new createjs.Container();
		stage.addChild(gameContainer,curtain,uiContainer);

		

		assets= new createjs.LoadQueue();
		assets.installPlugin(createjs.Sound);
		createjs.MotionGuidePlugin.install();


		var txt = new createjs.Text("", "18px Geo", "#ffffff");
		txt.textAlign="center";
		txt.x=400;
		txt.y=100;
		var loadingBar=new createjs.Shape();
		loadingBar.x=400;
		loadingBar.y=140;
		loadingBar.regX=100;
		uiContainer.addChild(txt,loadingBar);
		//createjs.Tween.get(txt,{loop:true}).to({y:txt.y+20},1000).to({y:txt.y},1000);
		createjs.Tween.get(loadingBar,{loop:true}).to({y:loadingBar.y+5},1000).to({y:loadingBar.y},1000);

		assets.onProgress=function(e){
			console.log(e);
		}

		assets.onComplete=function(e){
			//InitGame();
			//gameStatus="MenuIntro";
			clear();
			menu();
		}
		assets.onFileLoad=function(e){
			txt.text="Loading\n"+e.item.id;
			loadingBar.graphics.clear().beginFill("white").rect(0,0,200*assets.progress,10);
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
					  {src:"assets/sounds/gunShoot1.ogg", id:"gunShoot1"},
					  {src:"assets/sounds/gunShoot2.ogg", id:"gunShoot2"},
					  {src:"assets/sounds/gunShoot3.ogg", id:"gunShoot3"},
					  {src:"assets/sounds/pullGun.ogg", id:"pullGun"},
					  {src:"assets/sounds/wind.ogg", id:"wind"},
		 			  {src:"assets/title.png", id:"title"},
					  {src:"assets/sprites/background/terrain.png", id:"terrain"},
					  {src:"assets/sprites/background/sun.png", id:"sun"},
					  {src:"assets/sprites/actors/leftBandit.png", id:"leftBanditSS"},
					  {src:"assets/sprites/actors/rightBandit.png", id:"rightBanditSS"},
					  {src:"assets/sprites/actors/leftBandit.json", id:"leftBandit"},
					  {src:"assets/sprites/actors/rightBandit.json", id:"rightBandit"},
					  {src:"assets/sounds/reverseBell.ogg", id:"reverseBell"}
					 ];

		
		if(manifest.length){
			assets.loadManifest(manifest);
		}
		else
			Start();
	}

	//#############################
	//#########LOGIC UPDATE########
	//#############################

	function update () {

		switch(gameStatus){
			case "Loading":
			if(windSound)
				windSound.update();	
			break;
			case "Menu":
				if(keyMap.isDown(keyMap.s))
					flash();
			break;
			case "intro":
			if(sun)
				sun.update();
			break;
			case "waitForStart":
				if(keyMap.isDown(keyMap.s)){
					uiContainer.removeAllChildren();
					timePivot=createjs.Ticker.getTime();
					keyBusy=true;
					gameStatus="10Seconds";
					console.log(gameStatus);
				}
			break;
			case "10Seconds":
			case "bulletHell":
			
			leftBandit.update();
			rightBandit.update();
			if(!keyBusy && !leftBandit.dead && keyMap.isDown(keyMap.s) && !leftBandit.pulledGunOut)
				leftBandit.drawGun();
			else if(!keyMap.isDown(keyMap.s))
				keyBusy=false;
			if(createjs.Ticker.getTime()-timePivot>10000){
				gameStatus="bulletHell";
				timePivot=createjs.Ticker.getTime();
			}
				//console.log(gameStatus);
			
			if(gameStatus=="bulletHell" && !rightBandit.dead && !rightBandit.pulledGunOut && createjs.Ticker.getTime()-timePivot>rightBandit.delay){
					rightBandit.drawGun();
					//leftBandit.drawGun();
				}



			break;
			case "GameOver":
			if(keyMap.isDown(keyMap.s)){
				clear();

				menu();
			}
			break;
			
		}
		
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

	function bandit(side,x,y){
		var bandit=new createjs.BitmapAnimation(new createjs.SpriteSheet(assets.getResult(side+'Bandit')));
		bandit.x=x;
		bandit.y=y;
		bandit.gotoAndPlay("idle");
		

		bandit.pulledGunOut=false;
		bandit.shot=false;
		bandit.dead=false;
		bandit.delay=0;

		bandit.update=function(){

			if(someoneShot && !this.shot && !this.dead){
				this.die();
			}

			if(gameStatus=="GameOver"){
				this.undraw();
			}
		}

		bandit.onAnimationEnd=function(e){
			switch(e.currentAnimation){
				case "draw":
				if(gameStatus=="bulletHell" && Math.abs(rightBandit.delay-leftBandit.delay)<20){
					leftBandit.gotoAndPlay("afterShoot");
					rightBandit.gotoAndPlay("afterShoot");
					gameStatus="draw";
					setTimeout(GameOver,1000);
				}
				else
					bandit.shoot();
				break;
				case "undraw":
				bandit.gotoAndPlay("idle");
				break;
				case "shoot":
				bandit.gotoAndPlay("afterShoot");
				//bandit.stop();
				break;
				case "die":
				bandit.stop();
				setTimeout(GameOver,1000);
				break;

			}

		}

		bandit.drawGun=function(){
			if(this.pulledGunOut) return;
			createjs.Sound.play("pullGun",createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
			bandit.gotoAndPlay("draw");
			console.log("draw");
			if(gameStatus=="bulletHell"){
				bandit.delay=Math.floor(createjs.Ticker.getTime()-timePivot);
				console.log(bandit.delay);
			}
			this.pulledGunOut=true;

		}

		bandit.undrawGun=function(){
			if(!this.dead){
				createjs.Sound.play("pullGun",createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
				this.gotoAndPlay("undraw");
				console.log("undraw");
			}
		}

		bandit.shoot=function(){
			someoneShot=this.shot=true;
			console.log("shoot");
			createjs.Sound.play("gunShoot"+Math.ceil(Math.random()*3),createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
			bandit.gotoAndPlay("shoot");
		}

		bandit.die=function(){
			if(gameStatus!="bulletHell")
				gameStatus="cheater";
			else
				gameStatus="fairGame";
			bandit.gotoAndPlay("die");
			console.log("dead");
			bandit.dead=true;
		}

		

		return bandit;
	}


	//#############################
	//##########GAME SCENES########
	//#############################

	function clear(){
		gameContainer.removeAllChildren();
		gameContainer.y=0;
		uiContainer.removeAllChildren();
		titleScreen.removeAllChildren();
		banditsContainer.removeAllChildren();
		leftBandit=rightBandit=sun=null;
		someoneShot=keyBusy=false;
	}

	function menu(){
		gameStatus="Loading";
		
		if(!windSound){
			windSound=createjs.Sound.play("wind",createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 0, 0);
			windSound.update=function(){
				if(this.getVolume()<0.3){
					this.setVolume(this.getVolume()+0.001);
				}
				else
					this.setVolume(0.3);
			}
		}

		var txt = new createjs.Text("Ludum Dare 27", "30px Geo", "#ffffff");
		txt.x=400;
		txt.y=100;
		txt.textAlign="center";
		txt.alpha=0;
		var title=new createjs.Bitmap(assets.getResult('title'));
		title.alpha=0;
		uiContainer.addChild(txt);
		titleScreen.addChild(title);

		if(nothingNew){
			txt.text="Press S to start";
			createjs.Tween.get(title).to({alpha:1},1000);
			createjs.Tween.get(txt).to({alpha:1},500).call(function(){gameStatus="Menu";console.log(gameStatus);});
			return;
		}

		
		createjs.Tween.get(txt).wait(100).to({alpha:1},500).
		wait(1500).
		to({alpha:0},500).
		wait(1000).
		call(function(){txt.text="WATACOSO presents"}).
		to({alpha:1},500).
		wait(1500).
		to({alpha:0},500).
		wait(1000).call(function(){
			txt.text="Press S to start";
			nothingNew=true;
			createjs.Tween.get(title).to({alpha:1},1000);
			createjs.Tween.get(txt).wait(1000).to({alpha:1},500).call(function(){gameStatus="Menu";console.log(gameStatus);});
			
			
		});
		console.log(gameStatus);
	}

	function flash(){
		var sound=createjs.Sound.play("reverseBell",createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
		var light=new createjs.Shape();
		light.graphics.beginFill("#FFFFFF").rect(0,0,800,600);
		light.alpha=0;
		uiContainer.addChild(light);
		createjs.Tween.get(uiContainer.getChildAt(0)).to({alpha:0},4000);
		createjs.Tween.get(titleScreen.getChildAt(0)).wait(6000).to({alpha:0},1000);
		createjs.Tween.get(light).wait(8000).to({alpha:1},3000).call(function(){
			InitGame();
		}).to({alpha:0},300).call(function(){
			uiContainer.removeAllChildren();
		});
		gameStatus="Flash";
		console.log(gameStatus);
	}


	function InitGame(){
		

		
		var terrain=new createjs.Bitmap(assets.getResult('terrain'));
		sun=new createjs.Bitmap(assets.getResult('sun'));
		sun.x=380;
		sun.y=70;
		sun.regX=sun.regY=60;
		sun.update=function(){
			sun.x+=0.02;
		}
		leftBandit=new bandit("left",100,480);
		rightBandit=new bandit("right",700,480);
		rightBandit.delay=Math.random()*200+200;
		banditsContainer.addChild(leftBandit,rightBandit);
		gameContainer.addChild(terrain,sun,propsContainer,banditsContainer);
		createjs.Tween.get(gameContainer).wait(2000).to({y:-400},10000).call(waitForStart);
		gameStatus="intro";
		console.log(gameStatus);
	}

	function waitForStart(){
		var txt = new createjs.Text("PRESS S", "50px Geo", "#ffffff");
		txt.textAlign="center";
		txt.x=400;
		txt.y=100;
		uiContainer.addChild(txt);
		gameStatus="waitForStart";
		console.log(gameStatus);
	}

	function GameOver(){
		leftBandit.undrawGun();
		rightBandit.undrawGun();
		var message,quote;
		if(gameStatus=="draw"){
			message="The wise";
			quote="Nothing in life is to be feared, it is only to be understood.\n Now is the time to understand more, so that we may fear less.\n Marie Curie";
		}
		else if(leftBandit.dead){
			message="The honorable man";
			quote="'Good men don't become legends', he said quietly.\n'Good men don't need to become legends.' She opened her eyes, looking up at him.\n 'They just do what's right anyway.' \nBrandon Sanderson, The Well of Ascension"
		}
		else if(gameStatus=="cheater"){
			message="The cheater";
			quote="When people cheat in any arena, they diminish themselves,\n they threaten their own self-esteem and\n their relationships with others by undermining \nthe trust they have in their ability to succeed\n and in their ability to be true. \n Cheryl Hughes"
		}
		else{
			message="The honorable winner";
			quote="Give me honorable enemies rather than ambitious ones,\n and I ' ll sleep more easily by night.\n George R.R. Martin, A Game of Thrones";
		}

		var txt = new createjs.Text(message, "30px Geo", "#ffffff");
		txt.textAlign="center";
		txt.x=400;
		txt.y=20;
		txt.alpha=0;
		console.log(quote);
		var dQuote=new createjs.Text(quote, "18px Geo", "#ffffff");
		dQuote.textAlign="center";
		dQuote.x=400;
		dQuote.y=80;
		dQuote.alpha=0;
		var dRetry=new createjs.Text("Restart", "20px Geo", "#ffffff");
		dRetry.textAlign="center";
		dRetry.x=400;
		dRetry.y=180;
		dRetry.alpha=0;
		var blanket=new createjs.Shape();
		blanket.graphics.beginFill("#130B0F").rect(0,0,800,600);
		blanket.alpha=0;
		uiContainer.addChild(blanket,txt,dQuote,dRetry);

		createjs.Tween.get(blanket).wait(1000).to({alpha:1},2000);
		createjs.Tween.get(txt).wait(3000).to({alpha:1},2000);
		createjs.Tween.get(dQuote).wait(3500).to({alpha:1},2000);
		createjs.Tween.get(dRetry).wait(5000).to({alpha:1},500).call(function(){gameStatus="GameOver"});
		createjs.Tween.get(titleScreen.getChildAt(0)).wait(3500).to({alpha:1},4000);
		//console.log(gameStatus);
	}
}

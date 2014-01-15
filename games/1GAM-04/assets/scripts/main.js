window.addEventListener("load",Main);

function Main () {
	//#VARIABLES DEFINITION

	var tempShit;

	var loadingBar,loadingPercentage;

	var assets,stage,gameLogic,gameStatus,keyMap;

	var jsonObjects={};

	var mapContainer,
	entitiesContainer,
	UIContainer,
	gameContainer,
	menuContainer,
	levelSelectContainer,
	transContainer;
	var map=[];

	var player,exitGate,grid,minerals=[];
	var UI;
	var level,unlockedLevels,levelList;

	var musicPlayer,levelIntro;

	//#############################
	//##########GAME INIT##########
	//#############################


	Loading();

	function Loading(){

		status="loading";
		stage=new createjs.Stage(document.getElementById("game"));

		mapContainer=new createjs.Container();
		entitiesContainer=new createjs.Container();
		UIContainer=new createjs.Container();
		gameContainer=new createjs.Container();
		menuContainer=new createjs.Container();
		levelSelectContainer=new createjs.Container();
		transContainer=new createjs.Container();

		stage.addChild(transContainer);

		unlockedLevels=level=0;

		gameLogic={};
		gameLogic.tick=update;
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addListener(stage);
		createjs.Ticker.addListener(gameLogic);

		musicPlayer=new MusicManager();
		levelIntro=new LevelIntroManager();

		window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
		window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);


		assets= new createjs.LoadQueue();
		assets.installPlugin(createjs.Sound);

		assets.onProgress=function(e){
			   	loadingBar.graphics.
				beginFill("white").
				rect(300,230,200*(e.loaded),20);
				loadingPercentage.text=Math.ceil(100*e.loaded)+"%";
				console.log(loadingPercentage.text);

		}
		assets.onComplete=function(e){
			transContainer.removeChild(loadingPercentage,loadingBar);
			gameStatus="Intro";
			Intro();
			//Menu();
		}
		assets.onFileLoad=function(e){
			switch(e.item.type)
         	{
            case createjs.LoadQueue.IMAGE:
			
			break;
 
          	case createjs.LoadQueue.SOUND:

         	break;
         	
         	case createjs.LoadQueue.JSON:
         	eval("jsonObjects['"+e.item.id+"']= "+e.result);
         	break;
        	}
		}


		var manifest=[

			{src:"assets/sprites/backGround.png", id:"BG"},
			{src:"assets/sprites/intro1.png", id:"intro1"},

			{src:"assets/levels/tileSet.png", id:"tileSet"},
			{src:"assets/levels/tileSheet.json", id:"tileSheet"},
			{src:"assets/levels/level.json", id:"level"},

			{src:"assets/sound/music.ogg||assets/sound/music.ogg", id:"music", data:6},
			{src:"assets/sound/wind.ogg||assets/sound/wind.ogg", id:"wind", data:6},
			{src:"assets/sound/button.ogg||assets/sound/button.ogg", id:"button", data:6},
			{src:"assets/sound/openGate.ogg||assets/sound/openGate.ogg", id:"openGate", data:6},
			{src:"assets/sound/closeGate.ogg||assets/sound/closeGate.ogg", id:"closeGate", data:6},
			{src:"assets/sound/stuck.ogg||assets/sound/stuck.ogg", id:"stuck", data:6},
		];

		loadingBar=new createjs.Shape();
		loadingPercentage=new createjs.Text("0%","bold 20px Geo","white");
		loadingPercentage.x=380;
		loadingPercentage.y=210;
		transContainer.addChild(loadingPercentage,loadingBar);

		assets.loadManifest(manifest);
	}


	//#############################
	//#########LOGIC UPDATE########
	//#############################

	function update () {

		if(keyMap.isDown(keyMap.m) && !musicPlayer.busy){
				musicPlayer.busy=true;
				musicPlayer.toggleMute();
			}
			if(!keyMap.isDown(keyMap.m))
				musicPlayer.busy=false;

		switch(gameStatus){

			case "LevelIntro":

			if(keyMap.isDown(keyMap.spaceBar) && levelIntro.move){
				levelIntro.next();
			}
			if(keyMap.isDown(keyMap.n) && levelIntro.move){
				if(levelIntro.end)
					Back();
				else
				flash(levelIntro.startLevel);
			}

			break;


			case "Play":
			if(player)
				player.update();
			if(UI)
				UI.update();

			if(keyMap.isDown(keyMap.r) && !keyMap.busy){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(restart);
				busy=true;
			}

			if(keyMap.isDown(keyMap.t) && level!=0 && !keyMap.busy){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(gotoMenu);
				busy=true;
			}
				if(!keyMap.isDown(keyMap.t)){
					busy=false;
				} 
			break;


			case"Menu":
			if(keyMap.isDown(keyMap.spaceBar)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				stage.removeChild(menuContainer);
				levelIntro.startIntro();
				});
			}
			if(keyMap.isDown(keyMap.s)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				stage.removeChild(menuContainer);
				LevelSelect();
			}
			break;


			case "LevelSelect":
			if(keyMap.isDown(keyMap.w) && levelList.move){
				levelList.select(-1);
				levelList.move=false;
			}
			if(keyMap.isDown(keyMap.s) && levelList.move){
				levelList.select(1);
				levelList.move=false;
			}
			if(!keyMap.isDown(keyMap.s) && !keyMap.isDown(keyMap.w)){
				levelList.move=true;
			}
			if(keyMap.isDown(keyMap.spaceBar)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				levelSelectContainer.removeAllChildren();
				if(jsonObjects.level.levels[level].image)
					levelIntro.startIntro();
				else
					Level(level);
				});
			}
			if(keyMap.isDown(keyMap.t)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				clearStage();
				transContainer.removeAllChildren();
				Menu();
				});
			}
			break;


			case "LostGame":
			if(keyMap.isDown(keyMap.t)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				stage.removeChild(gameContainer);
				transContainer.removeAllChildren();
				Menu();
				});
			}
			if(keyMap.isDown(keyMap.r)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				transContainer.removeAllChildren();
				Level(level);
				});
			}
			break;


			case "WonGame":
			if(keyMap.isDown(keyMap.t)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				stage.removeChild(gameContainer);
				transContainer.removeAllChildren();
				Menu();
				});
			}
			if(keyMap.isDown(keyMap.spaceBar)){
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				flash(function(){
				transContainer.removeAllChildren();
				if(jsonObjects.level.levels[level-1].image)
						levelIntro.startIntro();
					else
					Level(level);	//TODO: Make more levels
				
				});
			}
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
			n: 78,
			r: 82,
			m: 77,
			t: 84,
			spaceBar:32,
 			
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
	//##########GAME SCENES########
	//#############################

	function Menu(){
		if(menuContainer.getNumChildren()==0){

			var t1,t2,t3;

				t1=new createjs.Text("SOLITUDE","bold 65px Geo","white");
				t2=new createjs.Text("SPACE: New Game","bold 30px Geo","white");
				t3=new createjs.Text("S: Select Level","bold 30px Geo","white");

			t1.x=t2.x=t3.x=20;
			t1.y=40;
			t2.y=110;
			t3.y=140;

			menuContainer.addChild(t1,t2,t3);
		}
		stage.addChildAt(menuContainer,0);
		level=1;
		gameStatus="Menu";
	}

	function LevelSelect () {
		//musicPlayer.mute(true);
		unlockedLevels=7;
		if(levelSelectContainer.getNumChildren()==0){
			var t1;

				t1=new createjs.Text("SOLITUDE","bold 65px Geo","white");

			t1.x=20;
			t1.y=40;
			var data=jsonObjects.level;
			levelList=new createjs.Container();
			level=unlockedLevels-1;
			levelList.move=true;

			var token= new createjs.Text("#","bold 45px Geo","red");
			token.x=120;

			for(var i=0;i<data.levels.length-1;i++)
			{
				var t=new createjs.Text("TASK "+(i+1),"bold 20px Geo","#536188");
				t.x=40;
				t.y=115+i*40;
				levelList.addChild(t);
			}

			for(var i=0;i<unlockedLevels;i++)
			{
				levelList.getChildAt(i).color="white";
			}
			levelList.getChildAt(unlockedLevels-1).color="red";
			token.y=110+(unlockedLevels-1)*40;
			levelList.addChild(token);

			levelList.select=function(direction){
				if(level ==1 && direction==-1 || level ==(unlockedLevels) && direction==1)
					return;
				musicPlayer.addSound("button",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.6);
				levelList.getChildAt(level-1).color="white";
				level+=direction;
				console.log(level);
				levelList.getChildAt(level-1).color="red";
				token.y=110+(level-1)*40;
			}

			levelSelectContainer.addChild(t1,levelList);
		}
		stage.addChildAt(levelSelectContainer,0);
		gameStatus="LevelSelect";
	}



	function flash (fun) {
		var flash=new createjs.Shape();

		flash.graphics.beginFill("white").rect(0,0,800,520);
		stage.addChild(flash);

		fun();

		createjs.Tween.get(flash).to({alpha:0},500).call(function(){stage.removeChild(flash)});
	}

	function Intro(){


			musicPlayer.addSound("wind",[createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 1, 0],0.06,true,"wind");
			musicPlayer.list["wind"].setVolume(0.1);

				var mess= new createjs.Text("SYSTEM INITIALIZED","bold 40px Geo","white");
				
				var	blackBox=new createjs.Shape();
				blackBox.graphics.beginFill("#0C060E").rect(0,0,800,520);
				blackBox.alpha=1;

				transContainer.addChild(blackBox,mess);
				mess.x=400;
				mess.y=250;
				mess.alpha=0;
				mess.textAlign="center";


						createjs.Tween.get(mess).wait(1500).to({alpha:1},0).wait(1500).to({alpha:0},0).call(function () {
						mess.text="TODAY IS <ERROR><ERROR><ERR..>";
						createjs.Tween.get(mess).wait(1500).to({alpha:1},0).wait(1500).to({alpha:0},0).call(function () {
						mess.text="COMMENCING GATHERING PROCEDURE";
						createjs.Tween.get(mess).wait(1500).to({alpha:1},0).wait(1500).to({alpha:0},0).call(function () {
						mess.text="WATAGAMING PRESENTS";
						createjs.Tween.get(mess).wait(1500).to({alpha:1},330).wait(1500).to({alpha:0},330).call(function () {
						Level(0);
						createjs.Tween.get(blackBox).wait(2000).to({alpha:0},1000).call(function(){gameStatus="Play"});
								});
							});
						});
					});

	}

	function Level(l){
		
		generateLevel(l);

		stage.addChildAt(gameContainer,0);

			if(l)
		gameStatus="Play";
	}


	function GameOver(esit){

		gameStatus="GameOver";

		if(esit){

			function moveToPortal () {

					for(var i=player.tail.length-1;i>=0;i--){
						var newPos;
						if(!i){
							newPos={x:player.position.x-player.tail[0].position.x,y:player.position.y-player.tail[0].position.y};
						}
						else{
							newPos={x:player.tail[i-1].position.x-player.tail[i].position.x,y:player.tail[i-1].position.y-player.tail[i].position.y};
						}

						//console.log(i+" "+newPos.x+" "+newPos.y);
						move(player.tail[i],newPos);	
						
					}
				


					function move(element,newPos){

						createjs.Tween.get(element.model).
						to({x:element.model.x+newPos.x*40,y:element.model.y+newPos.y*40},150).wait(150).
						call(function(){
						element.position.x+=newPos.x;
						element.position.y+=newPos.y;
						//if(map[player.tail[player.tail.length-1].position.y][player.tail[player.tail.length-1].position.x]!="E"){
							//console.log(player.tail[player.tail.length-1].position);
						//	moveToPortal();
						if(element==player.tail[player.tail.length-1])
							if(map[element.position.y][element.position.x]!="E")
								moveToPortal();
							else
							{
								exitGate.close();
							
								if(level==jsonObjects.level.levels.length-1)
									EndGame();
								else{
									level++;
									unlockedLevels=level;
									fadeAway();
								}
									
							}
							
						});
					}
			}

			moveToPortal();
		}
		else{
			createjs.Tween.get(player.model).wait(50).
			to({x:player.model.x+1},50).
			to({x:player.model.x-2},50).
			to({x:player.model.x+2},50).
			to({x:player.model.x-2},50).
			to({x:player.model.x+2},50).
			to({x:player.model.x-2},50).
			to({x:player.model.x+2},50).
			to({x:player.model.x-2},50).
			to({x:player.model.x+2},50).
			to({x:player.model.x-1},50).
			wait(300).
			call(function(){
				if(level==0)
					flash(restart);
				else fadeAway();
			});

			musicPlayer.addSound("stuck",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.5,false,"stuck");
		}

		function fadeAway(){

			var t1,t2,t3,blackBox,label;
			if(esit){
				if(level==1){
				musicPlayer.addSound("music",[createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 1, 0],0.5,true,"music");
				t1=new createjs.Text("SOLITUDE","bold 45px Geo","white");
				}
				else
				t1=new createjs.Text("TASK COMPLETED","bold 45px Geo","white");
				t2=new createjs.Text("T: Menu","bold 20px Geo","white");
				t3=new createjs.Text("SPACE: next","bold 20px Geo","white");
				label="WonGame";
			}
			else{
				t1=new createjs.Text("TASK FAILED","bold 45px Geo","white");
				t2=new createjs.Text("T: Menu","bold 20px Geo","white");
				t3=new createjs.Text("R: Retry","bold 20px Geo","white");
				label="LostGame";
			}
			t1.x=t2.x=t3.x=20;
			t1.y=40;
			t2.y=90;
			t3.y=120;

			t1.alpha=t2.alpha=t3.alpha=0;

			blackBox=new createjs.Shape();
			blackBox.graphics.beginFill("#0C060E").rect(0,0,800,520);
			blackBox.alpha=0;

			transContainer.addChild(blackBox,t1,t2,t3);

			if(level!=1){
			createjs.Tween.get(t1).wait(300).to({alpha:1},1500);
			createjs.Tween.get(blackBox).wait(800).to({alpha:1},1000);
			createjs.Tween.get(t2).wait(1800).to({alpha:1},200);
			createjs.Tween.get(t3).wait(1800).to({alpha:1},200).
			call(function(){clearStage(label);});
			}
			else{
			createjs.Tween.get(t1).wait(1000).to({alpha:1},3500);
			createjs.Tween.get(blackBox).wait(5000).to({alpha:1},1000);
			createjs.Tween.get(t2).wait(7000).to({alpha:1},200);
			createjs.Tween.get(t3).wait(7000).to({alpha:1},200).
			call(function(){clearStage(label);});
			}
		}
	}

	function EndGame(){

		var blackBox=new createjs.Shape();
			blackBox.graphics.beginFill("#0C060E").rect(0,0,800,520);
			blackBox.alpha=0;

		stage.addChild(blackBox);
		createjs.Tween.get(blackBox).wait(800).to({alpha:1},3000).call(function(){
			clearStage();
			levelIntro.startIntro(true);
			createjs.Tween.get(blackBox).wait(800).to({alpha:0},3000)
		//transContainer.removeAllChildren();
		});
		
		
	}

	function Back () {
		var blackBox=new createjs.Shape();
			blackBox.graphics.beginFill("#0C060E").rect(0,0,800,520);
			blackBox.alpha=0;

		stage.addChild(blackBox);
		createjs.Tween.get(blackBox).wait(800).to({alpha:1},3000).call(function(){
			
			clearStage();
			transContainer.removeAllChildren();
			Menu();
			//gameStatus="temp";
			levelIntro.end=false;
			createjs.Tween.get(blackBox).wait(800).to({alpha:0},3000).call(function(){stage.removeChild(blackBox);});
		//transContainer.removeAllChildren();
		});
	
	}

	function clearStage(label){
				UIContainer.removeAllChildren();
				entitiesContainer.removeAllChildren();
				mapContainer.removeAllChildren();
				gameContainer.removeAllChildren();
				minerals=[];
				gameStatus=label;
	}

	function restart () {
		clearStage();
		Level(level);
		gameStatus="Play";
	}

	function gotoMenu () {
		clearStage();
		Menu();
	}

	function muteGame () {
		clearStage();
		Menu();
	}

	//#############################
	//########GAME ELEMENTS########
	//#############################

	function Player(xPos,yPos){

		var that=this;
		//this.model=new createjs.Shape();
		//this.model.graphics.beginFill("#4E5211").beginStroke("#075341").rect(xPos*40,yPos*40,40,40);
		//stage.addChild(this.model);

		this.model=new createjs.BitmapAnimation(new createjs.SpriteSheet(jsonObjects.tileSheet));
		this.model.gotoAndPlay("t29");
		this.model.x=xPos*40;
		this.model.y=yPos*40;
		entitiesContainer.addChild(this.model);

		

		var mobile=true;
		var stopInterval=16;
		var lastMov;
		this.position={x:xPos,y:yPos};
		map[yPos][xPos]="P";
		this.tail=[];

		this.limit=100;
		this.limitDisplay=new createjs.Text(this.limit,"bold 25px Geo","white");
		this.limitDisplay.x=50;
		this.limitDisplay.y=485;


		this.update=function(){

			if(!mobile){
				var t=createjs.Ticker.getTicks();
				if(t-lastMov>=stopInterval)
					mobile=true;

			}
			else{

				if(keyMap.isDown(keyMap.w)){
					move("up");
				}
				else
				if(keyMap.isDown(keyMap.a)){
					move("left");
				}
				else
				if(keyMap.isDown(keyMap.s)){
					move("down");
				}
				else
				if(keyMap.isDown(keyMap.d)){
					move("right");
				}

				//debugMapping();
				

			}
		}

		function move(direction){	//VALUES: up, down, left, right
			
			//if(gameStatus=="GameOver")
			//	return;
			


			var dir={
				up:{x:0,y:-1},
				left:{x:-1,y:0},
				down:{x:0,y:1},
				right:{x:1,y:0}
			}

			var t=createjs.Ticker.getTicks();

			

			if(that.position.x+dir[direction].x <0 || that.position.x+dir[direction].x >19)
				return;
			if(that.position.y+dir[direction].y <0 || that.position.y+dir[direction].y >11)
				return;
			
			if(map[that.position.y+dir[direction].y][that.position.x+dir[direction].x]!=0 && map[that.position.y+dir[direction].y][that.position.x+dir[direction].x]!="E" )
				return;

			musicPlayer.addSound("move",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.5,false,"move");

			if(that.tail.length)
			for(var i=that.tail.length-1;i>=0;i--){
				var newPos;
				if(!i){
					newPos={x:that.position.x-that.tail[0].position.x,y:that.position.y-that.tail[0].position.y};
				}
				else{
					newPos={x:that.tail[i-1].position.x-that.tail[i].position.x,y:that.tail[i-1].position.y-that.tail[i].position.y};
				}
					if(i==that.tail.length-1)
						that.tail[i].move(newPos.x,newPos.y,true);
					else
						that.tail[i].move(newPos.x,newPos.y,false);
			}
				
				if(that.tail.length==0)
				map[that.position.y][that.position.x]=0;
				that.position.x+=dir[direction].x;
				that.position.y+=dir[direction].y;
				if(map[that.position.y][that.position.x]!="E")
				map[that.position.y][that.position.x]="P";
			
			createjs.Tween.get(that.model).
			to({x:that.model.x+dir[direction].x*40,y:that.model.y+dir[direction].y*40},200).
			call(function(){

					that.limit--;
					that.limitDisplay.text=that.limit;
					if(!that.limit)
						createjs.Tween.get(that.model).wait(100).call(function(){GameOver(false);});
				

				entangle();
				if(map[that.position.y][that.position.x]=="E")
					createjs.Tween.get(that.model).wait(100).call(function(){GameOver(true);});
					
				else
				if (isStuck())
					createjs.Tween.get(that.model).wait(100).call(function(){GameOver(false);});
				//debugMapping();

				

			});
			//this.model.y-=40;
			lastMov=t;
			mobile=false;





		}

		function isStuck(){
			if(map[that.position.y+1][that.position.x]==0 || map[that.position.y+1][that.position.x]=="E")
				return false;		
			if(map[that.position.y-1][that.position.x]==0 || map[that.position.y-1][that.position.x]=="E")
				return false;
			if(map[that.position.y][that.position.x+1]==0 || map[that.position.y][that.position.x+1]=="E")
				return false;
			if(map[that.position.y][that.position.x-1]==0 || map[that.position.y][that.position.x-1]=="E")
				return false;
			return true;

		}

		function entangle(){
			var entangler;

			if(that.tail.length==0)
				entangler=that;
			else
				entangler=that.tail[that.tail.length-1];

			var found=false;
			for(var i=0;i<4 && !found;i++){
				switch (i){
					case 0:
					if(entangler.position.x-1>=0 && map[entangler.position.y][entangler.position.x-1]=="M" ){
						addItem(entangler.position.y,entangler.position.x-1);
						entangle();
					}
					break;
					case 1:
					if(entangler.position.y-1>=0 && map[entangler.position.y-1][entangler.position.x]=="M"){
						addItem(entangler.position.y-1,entangler.position.x);
						entangle();
					}
					break;
					case 2:
					if(entangler.position.x+1<20 && map[entangler.position.y][entangler.position.x+1]=="M"){
						addItem(entangler.position.y,entangler.position.x+1);
						entangle();
					}
					break;
					case 3:
					if(entangler.position.y+1<12 && map[entangler.position.y+1][entangler.position.x]=="M"){
						addItem(entangler.position.y+1,entangler.position.x);
						entangle();
					}
					break;
				}

			}

			if(that.tail.length==minerals.length)exitGate.open();

			function addItem (y,x) {
				for(var i in minerals){
					if (minerals[i].position.x==x && minerals[i].position.y==y) {
						minerals[i].label="P";
						minerals[i].model.gotoAndPlay("bCrystal");
						map[y][x]="P";
						var t=minerals[i];
						that.tail.push(t);
						found=true;

					}
				}
			}

		}
	}

	function Mineral(xPos,yPos){
		this.model=new createjs.BitmapAnimation(new createjs.SpriteSheet(jsonObjects.tileSheet));
		this.model.gotoAndPlay("t33");
		this.model.x=xPos*40;
		this.model.y=yPos*40;
		var that=this
		this.label="M";
		entitiesContainer.addChild(this.model);

		this.position={x:xPos,y:yPos};
		map[yPos][xPos]=this.label;

		this.move=function(dX,dY,last){

			if(last)
					map[that.position.y][that.position.x]=0;
				that.position.x+=dX;
				that.position.y+=dY;

			createjs.Tween.get(this.model).
			to({x:this.model.x+dX*40,y:this.model.y+dY*40},200).
			call(function(){
				//map[that.position.y][that.position.x]=that.label;
			});

		}
	}

	function ExitGate(xPos,yPos){
		this.model=new createjs.BitmapAnimation(new createjs.SpriteSheet(jsonObjects.tileSheet));
		this.model.gotoAndPlay("t31");
		this.model.x=xPos*40;
		this.model.y=yPos*40;
		var that=this
		this.label="X";
		UIContainer.addChild(this.model);

		this.position={x:xPos,y:yPos};
		map[yPos][xPos]=this.label;

		this.open=function(){
			if(this.label=="E")
				return;
			this.label="E";
			musicPlayer.addSound("openGate",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.2,false,"openGate");
			map[yPos][xPos]=this.label;
			this.model.gotoAndPlay("openGate");
		}

		this.close=function() {
			musicPlayer.addSound("closeGate",[createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0],0.2,false,"closeGate");
			this.model.gotoAndPlay("closeGate");
		}
	}

	function UserInterface () {
		var strip=new createjs.Shape();
		strip.graphics.beginStroke("#536188").beginFill("black").rect(0,480,800,40);



		this.cIcon=new createjs.BitmapAnimation(new createjs.SpriteSheet(jsonObjects.tileSheet));
		this.cIcon.gotoAndPlay("cIcon");
		this.cIcon.x=750;
		this.cIcon.y=480;

		this.crDisplay=new createjs.Text("0 / "+minerals.length,"bold 25px Geo","white");
		this.crDisplay.x=710;
		this.crDisplay.y=485;


		
		UIContainer.addChild(strip,this.crDisplay,this.cIcon,player.limitDisplay);


		this.update=function(){
			this.crDisplay.text=player.tail.length+" / "+minerals.length;
		}
	}

	//#############################
	//########GAME SCRIPTS#########
	//#############################

	function generateLevel (lvl) {

		var backGround=new createjs.Bitmap(assets.getResult("BG"));
		backGround.x=backGround.y=-50;
		var timeLine=new createjs.Timeline ([createjs.Tween.get(backGround).
			to({x:-20,y:-50},15000,createjs.Ease.backInOut).
			to({x:-50,y:-30},15000,createjs.Ease.backInOut).
			to({x:-40,y:-70},15000,createjs.Ease.backInOut).
			to({x:-50,y:-50},15000,createjs.Ease.backInOut)]
			);

		grid=new createjs.Shape();
		grid.graphics.setStrokeStyle(1);

		for(var i=0;i<40;i++){
			grid.graphics.moveTo(i*40,0).beginStroke("#B95B6F").lineTo(i*40,480).endStroke();
		}

		for(var i=0;i<40;i++){
			grid.graphics.moveTo(0,i*40).beginStroke("#B95B6F").lineTo(800,i*40).endStroke();
		}

		//gameContainer.addChild(grid);

		var mapSpriteSheet=new createjs.SpriteSheet(jsonObjects.tileSheet);
		//console.log(jsonObjects.level.levels[lvl]);
		var levelData=jsonObjects.level.levels[lvl];
		var levelMatrix=levelData.matrix;

		for(var i=0;i<12;i++)
		{
			map[i]=[];
			for(var j=0;j<20;j++){

				switch (levelMatrix[i*20+j]){
					case 0:
					map[i][j]=0;
					break;
					case 29:
					player=new Player(j,i);
					break;
					case 33:
					minerals.push(new Mineral(j,i));
					break;
					case 31:
					exitGate=new ExitGate(j,i);
					break;
					default:
					map[i][j]="W";
					var cell=new createjs.BitmapAnimation(mapSpriteSheet);
					cell.gotoAndPlay("t"+levelMatrix[i*20+j]);
					cell.x=j*40;
					cell.y=i*40;
					mapContainer.addChild(cell);
					break;
				}	

			}
		}

		UI=new UserInterface();

		gameContainer.addChild(backGround/*,grid*/,mapContainer,entitiesContainer,UIContainer);

		debugMapping();
	}



	function MusicManager(){

		this.busy=false;
		this.muted=false;

		this.list={};

		this.addSound=function(s,props,volume,persistent,name){
			
			var sound=createjs.Sound.play(s,props[0],props[1],props[2],props[3],props[4],props[5]);
			sound.setVolume(volume);
			if(this.muted)
				sound.setVolume(0);

				if(persistent)
					this.list[name]=sound;
			}

			this.toggleMute=function(){
				this.muted=!this.muted;
			for(var i in this.list)
				this.list[i].mute(this.muted)
			
		}
	}


	function LevelIntroManager(){
		var that=this;
		this.end=false;
		this.startIntro=function(v){
			this.move=false;
			if(v){
				this.levelData=jsonObjects.level.end;
				this.end=true;
				}

			else
				this.levelData=jsonObjects.level.levels[level];
			this.slideImage=new createjs.Bitmap(this.levelData.image);
			this.textArray=this.levelData.text;

			this.index=0;
			this.subTitle=new createjs.Text(this.textArray[this.index],"bold 30px Geo","white");
			this.subTitle.textAlign="center";
			this.subTitle.x=400;
			this.subTitle.y=470;
			this.subTitle.alpha=0;


			transContainer.addChild(this.slideImage,this.subTitle);
			createjs.Tween.get(this.slideImage).to({x:-100},30000);
			createjs.Tween.get(this.subTitle).wait(1200).to({alpha:1},1000).call(function(){that.move=true;

				var n=new createjs.Text("Press SPACE","bold 30px Geo","white");
				n.x=50;
				n.y=50;
				transContainer.addChild(n);
			});
			
			gameStatus="LevelIntro";
		}

		this.next=function(){
			this.move=false;
			if(this.index<this.textArray.length-1){
				this.index++;
				createjs.Tween.get(this.subTitle).to({alpha:0},500).wait(1200).
				call(function(){
					that.subTitle.text=that.textArray[that.index];
					createjs.Tween.get(that.subTitle).to({alpha:1},1000).wait(200).call(function(){that.move=true;});
				});
			}
			else 
				if(this.end)
					Back();
				else
					this.startLevel();
		}

		this.startLevel=function() {
			flash(function(){
				transContainer.removeAllChildren();
				Level(level);
			});
		}
	}


	function debugMapping(){
			var debugMap;

				for(var i=0;i<12;i++)
				{
					debugMap="";
					for(var j=0;j<20;j++){
						if(map[i][j]!=0)
							debugMap+=map[i][j];
						else
							debugMap+="O";			
					}
					//console.log(debugMap);
				}

				//console.log (" ");
			}
	}
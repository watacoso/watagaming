window.addEventListener("load",Main);

function Main () {
	//#VARIABLES DEFINITION

	var loadingBar,loadingPercentage;

	var assets,stage,gameLogic,gameStatus,keyMap;

	var player,gem;			

	var jsonObjects={};

	var bottomContainer,
		gameContainer,
		entitiesContainer,
		blocksContainer,
		againstPlayerContainer,
		playerBulletsContainer,
		enemyBulletsContainer,
		UIContainer,
		topContainer;

	var factory;
	var UIObject;


	//#############################
	//##########GAME INIT##########
	//#############################


	Loading();

	function Loading(){

		status="loading";
		stage=new createjs.Stage(document.getElementById("game"));


		bottomContainer=new createjs.Container();
		menuContainer=new createjs.Container();
		gameContainer=new createjs.Container();
		entitiesContainer=new createjs.Container();
		blocksContainer=new createjs.Container();
		againstPlayerContainer=new createjs.Container();
		playerBulletsContainer=new createjs.Container();
		enemyBulletsContainer=new createjs.Container();
		UIContainer=new createjs.Container();
		topContainer=new createjs.Container();


		//entitiesContainer.addChild(againstPlayerContainer,playerBulletsContainer);
		gameContainer.addChild(entitiesContainer,UIContainer);

		stage.addChild(bottomContainer,topContainer);


		gameLogic={};
		gameLogic.tick=update;
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addListener(stage);
		createjs.Ticker.addListener(gameLogic);


		window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
		window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);


		assets= new createjs.LoadQueue();
		assets.installPlugin(createjs.Sound);

		

		var firstScene=StartGame;

		assets.onProgress=function(e){

			   	loadingBar.graphics.
				beginFill("white").
				rect(300,230,200*(e.loaded),20);
				loadingPercentage.text=Math.ceil(100*e.loaded)+"%";
				console.log(loadingPercentage.text);

		}
		assets.onComplete=function(e){
			topContainer.removeChild(loadingPercentage,loadingBar);
			//gameStatus="Play";
			firstScene();
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

		];

		

		//console.log(manifest.length);

		if(manifest.length)
		{
			loadingBar=new createjs.Shape();
			loadingPercentage=new createjs.Text("0%","bold 20px Geo","white");
			loadingPercentage.x=380;
			loadingPercentage.y=210;
			topContainer.addChild(loadingPercentage,loadingBar);
			assets.loadManifest(manifest);
		}
		else
			firstScene();
	}


	//#############################
	//#########LOGIC UPDATE########
	//#############################

	function update () {


		switch (gameStatus){
			case "Play":
			player.update();
			UIObject.update();
			factory.update();
			for(var i=0;i<againstPlayerContainer.getNumChildren();i++){
				if(againstPlayerContainer.getChildAt(i).update)
					againstPlayerContainer.getChildAt(i).update();
			}
			for(var i=0;i<playerBulletsContainer.getNumChildren();i++){
				if(playerBulletsContainer.getChildAt(i).update)
					playerBulletsContainer.getChildAt(i).update();
			}
			break;
			case "Limbo":
			player.update();
			UIObject.update();
			for(var i=0;i<playerBulletsContainer.getNumChildren();i++){
				if(playerBulletsContainer.getChildAt(i).update)
					playerBulletsContainer.getChildAt(i).update();
			}
			if(keyMap.isDown(keyMap.spaceBar)){	
				factory.levelGenerator();
				UIObject.clearMessages();
				UIObject.writeMainMessage("STAGE "+factory.score.level,function(){});
				factory.active=true;
				
				gameStatus="Play";
			}
			break;

			case "GameOver":
			if(keyMap.isDown(keyMap.spaceBar)){	
				UIContainer.removeAllChildren();
				entitiesContainer.removeAllChildren();
				againstPlayerContainer.removeAllChildren();
				StartGame();
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
 			d: 68,

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


		function StartGame(){

			player=new Player(800,600);

			var grid=new createjs.Shape();
			grid.graphics.setStrokeStyle(30);

			for(var i=0;i<5;i++){
			grid.graphics.moveTo(i*400,0).beginStroke("#00301d").lineTo(i*400,1200).endStroke();
				}

			for(var i=0;i<4;i++){
				grid.graphics.moveTo(0,i*400).beginStroke("#00301d").lineTo(1600,i*400).endStroke();
			}

			var bg=new createjs.Shape();
			bg.graphics.beginFill("#0b6140").rect(0,0,1600,1200);
			entitiesContainer.addChild(bg,grid,blocksContainer,againstPlayerContainer,enemyBulletsContainer,playerBulletsContainer);
			entitiesContainer.x=-400;
			entitiesContainer.y=-350;

			UIObject=new UI();

			factory=new Factory();
			factory.active=false;
		
			bottomContainer.addChild(gameContainer);
			stage.onPress=player.mouseHandler;
			gameStatus="Limbo";

			UIObject.writeMainMessage("SHMUP ON LSD",function(){
					UIObject.writeSubMessage("press SPACE to START",function(){});
				});
		}

		function Win(x,y){
			factory.score.points+=factory.score.level*2000;
			factory.score.level++;
			player.life=player.maxLife;

			gem.die(function(){
				UIObject.writeMainMessage("STAGE CLEARED",function(){
					UIObject.writeSubMessage("press SPACE to CONTINUE",function(){
						gameStatus="Limbo";
					});
				});
			});
			factory.active=false;
			for(var i=0;i<againstPlayerContainer.getNumChildren();i++)
				if(againstPlayerContainer.getChildAt(i).name && againstPlayerContainer.getChildAt(i).name!="boom"){
					againstPlayerContainer.getChildAt(i).die(true);
				}

			for(var i=0;i<blocksContainer.getNumChildren();i++)
				if(blocksContainer.getChildAt(i))
					blocksContainer.getChildAt(i).die(true);
				
			
			
			
		}


		function Lose(){
			player.die(function(){
				UIObject.writeMainMessage("GAME OVER",function(){
					UIObject.writeSubMessage("press SPACE to RESTART",function(){
						gameStatus="GameOver";
					});
				});
			});
			factory.active=false;
			for(var i=0;i<againstPlayerContainer.getNumChildren();i++)
				if(againstPlayerContainer.getChildAt(i).name && againstPlayerContainer.getChildAt(i).name!="boom" && againstPlayerContainer.getChildAt(i).name!="gem")
					againstPlayerContainer.getChildAt(i).die(false);

			for(var i=0;i<blocksContainer.getNumChildren();i++)
					blocksContainer.getChildAt(i).die(false);
		}


		////////////////////////////////////
		///////////GAME ELEMENTS////////////
		////////////////////////////////////

		function Player(x,y){

			this.model=new createjs.Shape();
			this.model.graphics.beginFill("#a4e0df").drawCircle(0,0,20)
			.moveTo(0,-20).lineTo(30,-10).lineTo(35,-5).lineTo(35,5).lineTo(30,10).lineTo(0,20)
			.beginFill("#69afad").moveTo(0,-15).lineTo(15,-5).lineTo(15,5).lineTo(0,15);
			this.model.x=400;
			this.model.y=250;
			this.x=x;
			this.y=y;
			this.radius=10;
			this.model.name="player";
			UIContainer.addChild(this.model);

			var that=this;


			this.life=15;
			this.maxLife=15;
			
			var vx=0,vy=0;
			var thrust=0.4;
			var maxV=18;

			var shootRate=6;
			var timer=0;

			var fire,bulletData;
			var gunBlocked=false;

			this.dead=false

			this.mouseHandler=function(e)
			{
				e.onMouseUp=function(ev){
					fire=false;
					bulletData=ev;
				}
					fire=true;
					bulletData=e;

				e.onMouseMove=function(ev){
					fire=true;
					bulletData=ev;
				}
			}

			this.update=function(){

				if(this.dead)
					return;
				//text.text=life+"/"+maxLife;

				//Direction

				if(keyMap.isDown(keyMap.a)){
					this.model.rotation-=7;
					if(this.model.rotation==0)
						this.model.rotation=360;
					//console.log(this.model.rotation);
				}

				if(keyMap.isDown(keyMap.d)){
					this.model.rotation+=7;
					if(this.model.rotation==360)
						this.model.rotation=0;
					//console.log(this.model.rotation);
				}

				var angle=Math.PI*this.model.rotation/180;

				//Module

				if(keyMap.isDown(keyMap.w)){

						
					if(Math.sqrt(vx*vx+vy*vy)<maxV){
						vx+=thrust*Math.cos(angle);
						vy+=thrust*Math.sin(angle);
					}
					else
						{
							vx*=0.9;
							vy*=0.9;
						}

				}
				else{
					vx*=0.98;
					vy*=0.98;
				
				}

				//Boundaries collision
				
				if(entitiesContainer.x>400){
					vx=Math.abs(vx);
				}

				if(entitiesContainer.x<-1200){
					vx=-Math.abs(vx);
				}

				if(entitiesContainer.y>250){
					vy=Math.abs(vy);
				}
				if(entitiesContainer.y<-950){
					vy=-Math.abs(vy);
				}

				//entityCollision
				//
				gunBlocked=false;
				
				for(var i=0;i<againstPlayerContainer.getNumChildren();i++){
					//console.log(againstPlayerContainer.getChildAt(i).radius)
					if(againstPlayerContainer.getChildAt(i).radius)
						if(circlesIntersect(this,againstPlayerContainer.getChildAt(i)))
							switch(againstPlayerContainer.getChildAt(i).name){
								case "pawn":
								
								if(that.life){
									if(!againstPlayerContainer.getChildAt(i).dead)
										that.life--;
								}
								else
								{
									Lose();
								}
								againstPlayerContainer.getChildAt(i).die();
								break;
								case "hearth":
								againstPlayerContainer.removeChildAt(i);
								if(that.maxLife-that.life>5)
								that.life+=2;
								else
								that.life=that.maxLife;
								break;
								case "gem":
								gunBlocked=true;
								break;
							}		
				}

				for(var i=0;i<enemyBulletsContainer.getNumChildren();i++){
						if(circlesIntersect(this,enemyBulletsContainer.getChildAt(i))){
								enemyBulletsContainer.removeChildAt(i);
							if(that.life){	
									that.life--;
								}
								else
									Lose();
								

							}
				}

				for(var i=0;i<blocksContainer.getNumChildren();i++){
						if(circlesIntersect(this,blocksContainer.getChildAt(i))){
							gunBlocked=true;
						}
				}
				//Movement
				
				this.x+=vx;
				this.y+=vy;	

				entitiesContainer.x-=vx;
				entitiesContainer.y-=vy;

				//shooting
				//
				//
				
				
				if(fire && !gunBlocked){
					if(timer>=shootRate){
						var l=Math.sqrt((bulletData.stageX-that.model.x)*(bulletData.stageX-that.model.x)+(bulletData.stageY-that.model.y)*(bulletData.stageY-that.model.y));
						var b=new Bullet("playerBullet",that.x,that.y,15*(bulletData.stageX-that.model.x)/l,15*(bulletData.stageY-that.model.y)/l);
						timer=0;
					}
					timer++;
				}
				else
					timer=0;
				


			}

			this.die=function(callback){
				this.dead=true;
				var boom=new createjs.Shape();
				boom.graphics.beginFill("white").drawCircle(0,0,1);
				boom.x=this.model.x;
				boom.y=this.model.y;
				boom.alpha=0;
				UIContainer.addChild(boom);

				createjs.Tween.get(this.model).to({x:402},0).wait(50).to({x:400},0).wait(50).
											   to({x:402},0).wait(50).to({x:400},0).wait(50).
											   to({x:402},0).wait(50).to({x:400},0).wait(50).
											   to({x:402},0).wait(50).to({x:400},0).wait(50).
											   to({x:402},0).wait(50).to({x:400},0).wait(150).call(function(){boom.alpha=1});

				createjs.Tween.get(boom).wait(600).to({scaleX:70,scaleY:70},500).call(function(){

					UIContainer.removeChildAt(0);

					createjs.Tween.get(boom).to({scaleX:1/70,scaleY:1/70},500).call(function(){
						UIContainer.removeChild(boom);
						callback();
					});
				});	
			}
		}

		function Bullet(type,x,y,vx,vy){

			this.model=new createjs.Shape();
			this.model.graphics.beginFill(type=="playerBullet"?"#FFFFFF":"#0C060E").drawCircle(0,0,1);
			this.model.regX=this.model.regY=1;
			this.model.x=x;
			this.model.y=y;
			this.model.radius=4;

			this.model.name=type;
			if(type=="playerBullet")
			playerBulletsContainer.addChild(this.model);
			else{
				console.log(type);
			enemyBulletsContainer.addChild(this.model);
			}
			createjs.Tween.get(this.model).to({scaleX:5,scaleY:5},100);

			var that=this;

			var lifeTime=300;

			this.model.update=function(){
				that.model.x+=vx;
				that.model.y+=vy;

			
				if(lifeTime<0){
					playerBulletsContainer.removeChild(that.model);
					return;
				}
				lifeTime--;
				

				
				if(type=="playerBullet"){

				for(var i=0;i<againstPlayerContainer.getNumChildren();i++){
					//console.log(againstPlayerContainer.getChildAt(i).radius)
					if(againstPlayerContainer.getChildAt(i).radius)
						if(circlesIntersect(this,againstPlayerContainer.getChildAt(i)))
						{	

							switch(againstPlayerContainer.getChildAt(i).name){

								case "pawn":
								factory.score.points+=factory.score.level*100;
								againstPlayerContainer.getChildAt(i).life--;
								if(!againstPlayerContainer.getChildAt(i).life)
									againstPlayerContainer.getChildAt(i).die(true);
								playerBulletsContainer.removeChild(that.model);
								break;
								case "gem":
								factory.score.points+=factory.score.level*200;
								playerBulletsContainer.removeChild(that.model);
								againstPlayerContainer.getChildAt(i).hurt();
								break;
								case "turret":
								againstPlayerContainer.getChildAt(i).life--;
								if(!againstPlayerContainer.getChildAt(i).life)
									againstPlayerContainer.getChildAt(i).die(true);
								playerBulletsContainer.removeChild(that.model);
								break;
							}
							return;
						}

						
					}
							for(var i=0;i<blocksContainer.getNumChildren();i++){
							if(circlesIntersect(this,blocksContainer.getChildAt(i))){
								blocksContainer.getChildAt(i).life--;
								if(!blocksContainer.getChildAt(i).life)
									blocksContainer.getChildAt(i).die(true);
								playerBulletsContainer.removeChild(that.model);
							
								}
							}
				}

			}

		}

		function Block(x,y){
			this.model=new createjs.Shape();
			this.model.graphics.beginFill("black").rect(0,0,2,2);
			this.model.regX=this.model.regY=1;
			this.model.rotation=45;
			this.model.x=x;
			this.model.y=y;
			this.model.radius=10;
			this.model.name="block";
			blocksContainer.addChild(this.model);
			createjs.Tween.get(this.model).to({scaleX:15,scaleY:15},400);

			var that=this;

			this.model.life=1;


			this.model.die=function(value){
				factory.score.points+=factory.score.level*50;
				var boom=new createjs.Shape();
				boom.graphics.beginFill("white").drawCircle(0,0,1);
				boom.x=that.model.x;
				boom.y=that.model.y;
				boom.name="boom";
				blocksContainer.addChild(boom);

				createjs.Tween.get(boom).to({scaleX:20,scaleY:20},200).call(function(){

					blocksContainer.removeChild(that.model);

					createjs.Tween.get(boom).to({scaleX:1/20,scaleY:1/20},200).call(function(){
						blocksContainer.removeChild(boom);
					});
				});	
			}

		}

		

		function Gem(x,y){
	
			this.model=new createjs.Shape();
			this.model.graphics.beginFill("#black").rect(0,0,2,2);
			this.model.regX=this.model.regY=1;
			this.model.rotation=45;
			this.model.x=x;
			this.model.y=y;
			this.model.radius=30;
			this.model.name="gem";
			//this.model.scaleX=this.model.scaleY=0.2;
			createjs.Tween.get(this.model).to({scaleX:25,scaleY:25},400);

			var that=this;
			this.dead=false;
			var damage=1;
			var goal=60;

			var seed=new createjs.Shape();
			seed.graphics.beginFill("white").rect(0,0,50,50);
			seed.regX=seed.regY=25;
			seed.rotation=45;
			seed.x=x;
			seed.y=y;
			seed.scaleX=seed.scaleY=1/goal;
			seed.alpha=0;

			againstPlayerContainer.addChild(this.model,seed);

			this.model.hurt=function(){
				if(damage<goal){
				damage++;
				seed.alpha=1;
				seed.scaleX=seed.scaleY=damage/(goal+30);
			
				}
				else
					if(!that.dead)
					Win();
			}

			this.die=function(callback){
				//alert(this.model);
				if(this.dead) return;
				this.dead=true;
				var boom=new createjs.Shape();
				boom.graphics.setStrokeStyle(1);
				boom.graphics.beginStroke("white").drawCircle(0,0,5);
				boom.x=x;
				boom.y=y;
				entitiesContainer.addChild(boom);

				againstPlayerContainer.removeChild(that.model,seed);
				createjs.Tween.get(boom).to({scaleX:300,scaleY:300},1000).call(function(){

						entitiesContainer.removeChild(boom);
						if(callback)
						callback();
					
				});	
			}


		}

		function Pawn(x,y){
			this.model=new createjs.Shape();
			this.model.graphics.beginFill("#0C060E").drawCircle(0,0,20).drawCircle(30,0,30).drawCircle(60,0,40).
								beginFill("#AA0467").drawCircle(20,0,7).drawCircle(45,0,9).drawCircle(70,0,12);
			this.model.x=x;
			this.model.y=y;
			this.model.regX=50;
			this.model.regY=0;
			this.model.scaleX=this.model.scaleY=0.35;
			this.model.radius=25;
			this.model.name="pawn";
			this.hearthRate=5;
			var move=true;
			this.model.dead=false;
			againstPlayerContainer.addChild(this.model);


			var that=this;

			var vx=0,vy=0;
			var thrust=Math.random()*0.8+0.8;
			var maxV=Math.random()*8+11;

			this.model.life=1;




			this.model.update=function(){
				if(!move)return;
				if(player.x-that.model.x>=0)
					that.model.rotation=0;
				else
					that.model.rotation=180;


				that.model.rotation+=180*(Math.atan((player.y-that.model.y)/(player.x-that.model.x)))/Math.PI;


				var angle=Math.PI*that.model.rotation/180;

				if(Math.sqrt(vx*vx+vy*vy)<maxV){
						vx+=thrust*Math.cos(angle);
						vy+=thrust*Math.sin(angle);
					}
					else
						{
							vx*=0.9;
							vy*=0.9;
						}

				that.model.x+=vx;
				that.model.y+=vy;

			}

			this.model.die=function(kill){
				if(!move)
					return;

				move=false;
				that.model.dead=true;

				var boom=new createjs.Shape();
				boom.graphics.beginFill(kill?"white":"#0C060E").drawCircle(0,0,1);
				boom.x=that.model.x;
				boom.y=that.model.y;
				againstPlayerContainer.addChild(boom);

				createjs.Tween.get(boom).to({scaleX:30,scaleY:30},300).call(function(){
					var r=Math.random()*100;
					if(that.hearthRate>r && kill){
						//againstPlayerContainer.removeChild(that.model);
						that.model.graphics.clear().beginFill("#cbf861").drawCircle(0,0,30);
						maxV=25;
						thrust=10;
						that.model.name="hearth";
					}
					else
						againstPlayerContainer.removeChild(that.model);

					factory.nPawns--;

					createjs.Tween.get(boom).to({scaleX:1/30,scaleY:1/30},300).wait(200).call(function(){
						if(that.model.name=="hearth"){
							move=true;
						}
						againstPlayerContainer.removeChild(boom);
					});
				});

				
			}

			

		}

		function Turret(x,y){
			this.model=new createjs.Shape()
			this.model.graphics.beginFill("#0C060E").
			drawCircle(0,0,20).beginFill("#AA0467").drawCircle(0,0,5);
			this.model.x=x;
			this.model.y=y;
			this.model.radius=20;
			this.model.name="turret";
			this.model.scaleX=this.model.scaleY=1/20;
			againstPlayerContainer.addChild(this.model);
			createjs.Tween.get(this.model).to({scaleX:1,scaleY:1},400);

			var that=this;
			this.model.life=10;
			var timer=0;
			var shootRate=20;
			var dead=false;

			this.model.update=function(){

					if(timer>=shootRate && !dead){
						var l=Math.sqrt((player.x-that.model.x)*(player.x-that.model.x)+(player.y-that.model.y)*(player.y-that.model.y));
						var b=new Bullet("enemyBullet",that.x,that.y,15*(player.x-that.model.x)/l,15*(player.y-that.model.y)/l);
						timer=0;
					}
					timer++;
			}

			this.model.hurt=function(){
				life--;
				if(!life)
					that.model.die(true);
			}

			this.model.die=function(kill){
				if(dead)
					return;

				dead=true;

				var boom=new createjs.Shape();
				boom.graphics.beginFill(kill?"white":"#0C060E").drawCircle(0,0,1);
				boom.x=that.model.x;
				boom.y=that.model.y;
				againstPlayerContainer.addChild(boom);

				createjs.Tween.get(boom).to({scaleX:30,scaleY:30},300).call(function(){

						againstPlayerContainer.removeChild(that.model);
					factory.nTurrets--;

					createjs.Tween.get(boom).to({scaleX:1/30,scaleY:1/30},300).wait(200).call(function(){
						againstPlayerContainer.removeChild(boom);
					});
				});

				
			}

		}

		function UI(){
			var b=new createjs.Shape();

			
			var mainMessage=new createjs.Text("","bold 60px Geo","white");
			mainMessage.x=20;
			mainMessage.y=10;
			var subMessage=new createjs.Text("","bold 20px Geo","white");
			subMessage.textAlign="right";
			subMessage.x=780;
			subMessage.y=475;
			var scoreDisplay=new createjs.Text("0","bold 30px Geo","white");
			scoreDisplay.textAlign="right";
			scoreDisplay.x=780;
			scoreDisplay.y=20;

			UIContainer.addChild(b,mainMessage,subMessage,scoreDisplay);

			this.writeMainMessage=function(text,callback){
				createjs.Tween.removeTweens(mainMessage);
				mainMessage.alpha=0;
				mainMessage.text=text;
				createjs.Tween.get(mainMessage).to({alpha:1},500).wait(1000).to({alpha:0},500).call(callback);
			}
			this.writeSubMessage=function(text,callback){
				createjs.Tween.removeTweens(subMessage);
				subMessage.alpha=0;
				subMessage.text=text;
				createjs.Tween.get(subMessage).to({alpha:1},100).call(callback);
			}

			this.clearMessages=function(){
				mainMessage.text="";
				subMessage.text="";
			}


			this.update=function(){

				b.graphics.clear().beginFill(player.life>5?"white":"red").rect(10,480,player.life*10,15);
				scoreDisplay.text=factory.score.points;
			}


			this.score=function(){

			}

			this.pause=function(){

			}


		}


			//////////////////////////////////////////
			//////////////////////////////////////////
			//////////////////////////////////////////

		function circlesIntersect(c1,c2){
    		var distanceX = c2.x - c1.x;
    		var distanceY = c2.y - c1.y;
 			
    		var magnitude = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    		return magnitude < c1.radius + c2.radius;
		}


		function Factory(){

			var pawnF;
			var turretF;
			var maxPawns;
			var maxTurrets;
			this.nPawns=0;
			this.nTurrets=0;
			var busyP=false;
			var busyT=false;
			this.active=true;

			var that=this;

			this.score={
				nEnemies:0,
				nBlocks:0,
				level:1,
				points:0
			}

			this.update=function(){
				if(!this.active) return;
				var t=createjs.Ticker.getTicks();

				if(!busyP && this.nPawns<maxPawns && t%pawnF==0 && t)
				{
					var r=Math.floor(Math.random()*800)+500;
					var a=Math.floor(Math.random()*8);

					var p=new Pawn(player.x+Math.cos(a*45)*r,player.y+Math.sin(a*45)*r);
					this.nPawns++;
				}
				else if(busyP && t%pawnF!=0){
					busyP=false;
				}

				/*if(!busyT && this.nTurrets<maxTurrets && t%turretF==0 && t)
				{
					var x=Math.random()*1000+200;
					var y=Math.random()*900+200;

					circleGroup(x,y,30,5);
					var tr=new Turret(x,y);
					
					this.nTurrets++;
				}
				else if(busyT && t%turretF!=0){
					busyT=false;
				}*/
			}

			this.levelGenerator=function(){

				var lvl=(this.score.level<=10?this.score.level:20)
				pawnF=33-lvl*3;
				maxPawns=lvl*5;

				console.log(pawnF+" "+maxPawns);

				

				var x=Math.random()*800+400;
				var y=Math.random()*500+400;
				
				
				//circleGroup(x,y,50,50);
				circleGroup(x,y,100+lvl,200+lvl*5);
				//rectGroup(10,10,1590,1190,lvl*200/20);
				gem=new Gem(x,y);

				for(var i=0;i<Math.floor((lvl-1)/2);i++){
					x=Math.random()*800+400;
					y=Math.random()*500+400;

					circleGroup(x,y,100+lvl,200+lvl*5);

				}
				
			}

			function rectGroup(x,y,w,h,n){
					for(var i=0;i<n;i++){
						var b=new Block(Math.random()*w+x,Math.random()*h+y)
					}
				}

				function circleGroup(x,y,r,n){
					for(var i=0;i<n;i++){
						var b=new Block(Math.random()*r*Math.cos(Math.random()*2*Math.PI)+x,Math.random()*r*Math.sin(Math.random()*2*Math.PI)+y)
					}
				}

		}

	}
window.addEventListener("load",game);
	//VARIABLE SET//
function game()
{

		var canvas;
		var stage;
		var factory;
		var keyMap;
		
		var gameLevel=0;
		var bGround;
		var road;
		
		var preloader;
		var loadingBar,loadingPercentage;
		var assets;
		var tkr;
		var totalLoaded=0;
		var roadContainer;
		var UIContainer;
		var entitiesContainer;
		var gameContainer;
		var upperContainer;
		var elements;
		var roadSpeed;
		var stack;
		var candyCash=0;
		var stackLength=0;
		var IDfactory=0;
		var UIG;
		var curtains;
		var music,musicBt;
		var gameStatus="loading";
		//INITIALIZATION//
	
		function init() 
		{
			elements={};
			tkr=new Object();
			
			canvas =document.getElementById("goblinRampage");
			stage=new createjs.Stage(canvas);
			
			//factory.setLevel(0);
			stage.rect=new createjs.Rectangle(0,0,canvas.attributes["width"].value,canvas.attributes["height"].value);
			stage.mouseEventsEnabled = true;
			

			
			roadContainer=new createjs.Container();
			UIContainer=new createjs.Container();
			entitiesContainer=new createjs.Container();
			gameContainer= new createjs.Container();
			upperContainer= new createjs.Container();
			gameContainer.addChild(roadContainer,entitiesContainer,UIContainer);

			stage.addChild(upperContainer);

			window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
			window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);
			
			assets=
			[			
				{src:"assets/sprites/buttons.png",id:"buttonsSheet"},
				{src:"assets/sprites/buttons.json",id:"buttons"},
				{src:"assets/sprites/road.png",id:"roadSheet"},
				{src:"assets/sprites/road.json",id:"road"},
				{src:"assets/sprites/player.png",id:"playerSheet"},
				{src:"assets/sprites/player.json",id:"player"},
				{src:"assets/sprites/normalCop.png",id:"normalCopSheet"},
				{src:"assets/sprites/normalCop.json",id:"normalCop"},
				{src:"assets/sprites/rugbyCop.png",id:"rugbyCopSheet"},
				{src:"assets/sprites/rugbyCop.json",id:"rugbyCop"},
				{src:"assets/sprites/items.png",id:"itemSheet"},
				{src:"assets/sprites/items.json",id:"item"},
				{src:"assets/sprites/menuBackground.png",id:"mbg"},
				{src:"assets/sprites/bossBackground.png",id:"bbg"},


				{src:"assets/sound/mainTheme.ogg|assets/sound/mainTheme.mp3",id:"mainTheme"},
				{src:"assets/sound/bossTheme.ogg|assets/sound/bossTheme.mp3",id:"bossTheme"},

				{src:"assets/sound/button.ogg|assets/sound/button.mp3",id:"button",data:20},
				{src:"assets/sound/candy.ogg|assets/sound/candy.mp3",id:"candy",data:20},
				{src:"assets/sound/playerShoot.ogg|assets/sound/playerShoot.mp3",id:"playerShoot",data:20},
				{src:"assets/sound/enemyShoot.ogg|assets/sound/enemyShoot.mp3",id:"enemyShoot",data:20},
				{src:"assets/sound/enemyDamage.ogg|assets/sound/enemyDamage.mp3",id:"enemyDamage",data:20},
				{src:"assets/sound/enemyDeath.ogg|assets/sound/enemyDeath.mp3",id:"enemyDeath",data:20},
				{src:"assets/sound/levelUp.ogg|assets/sound/levelUp.mp3",id:"levelUp",data:20},
				{src:"assets/sound/life.ogg|assets/sound/life.mp3",id:"life",data:20},
				{src:"assets/sound/playerDamage.ogg|assets/sound/playerDamage.mp3",id:"playerDamage",data:20},
				{src:"assets/sound/playerDeath.ogg|assets/sound/playerDeath.mp3",id:"playerDeath",data:20},
				{src:"assets/sound/rugbyTouch.ogg|assets/sound/rugbyTouch.mp3",id:"rugbyTouch",data:20}				
			];
			



			curtains=new Curtains();
			createjs.Ticker.addListener(curtains);
			createjs.Ticker.addListener(stage);
			tkr.tick=updateLogic;
			createjs.Ticker.addListener(tkr);
			
			loadingBar=new createjs.Shape();
			loadingPercentage=new createjs.Text("0%","bold 20px Geo","white");
			loadingPercentage.x=380;
			loadingPercentage.y=210;
			upperContainer.addChild(loadingBar,loadingPercentage);
			
			createjs.Ticker.setFPS(60);
			
			preloader= new createjs.PreloadJS();
			preloader.installPlugin(createjs.SoundJS);
			
			preloader.onProgress=handleProgress;
			preloader.onComplete=handleComplete;
			preloader.onFileLoad=handleFileLoad;
			preloader.loadManifest(assets);
			
		}
		
		//ALL GAME ISTANCES//
		
		function intro(){

			    var mess= new createjs.Text("WataCoso Presents","bold 40px Geo","white");
				stage.removeChild(gameContainer);
				upperContainer.addChild(mess);
				mess.x=50;
				mess.y=100;
				mess.alpha=0;
				createjs.Tween.get(mess).wait(1000).to({alpha:1},200).wait(2000).
				to({alpha:0},200).wait(1000).call(function(){
					mess.x=300;
					mess.y=200;
					mess.text="a WATAGAMING production";
				createjs.Tween.get(mess).to({alpha:1},200).wait(2000).
					to({alpha:0},200).wait(1000).call(function(){
						upperContainer.removeChild(mess);
						menu();
					});
				});
		}


		function menu()
		{
			curtains.open(function() {

				if(!music){
					music=createjs.SoundJS.play("mainTheme",createjs.SoundJS.INTERRUPT_ANY, 0, 0, -1, 1, 0);
					music.setVolume(0.05);
				}
				

				if(!musicBt){
					musicBt=new createjs.BitmapAnimation(elements.buttons);
					musicBt.gotoAndStop("sOn");
					musicBt.onClick=function(){
						if(musicBt.currentAnimation=="sOn"){
							musicBt.gotoAndStop("sOff");
							createjs.SoundJS.setMute(1);
						}
						else{
							musicBt.gotoAndStop("sOn");
							createjs.SoundJS.setMute(0);
						}
					};
				}
				
				var c=new createjs.Container();

				var title= new createjs.BitmapAnimation(elements.buttons);
				title.gotoAndStop("title");
				title.x=310;
				title.y=100;

				var playBt=new createjs.BitmapAnimation(elements.buttons);
					playBt.gotoAndStop("play");
					playBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						curtains.close(function(){
							stage.removeChild(c);
							gameIstance(0);
						});
					}

				

				playBt.x=400;
				playBt.y=250;

				musicBt.x=30;
				musicBt.y=450;

				bGround=new createjs.Bitmap("assets/sprites/menuBackground.png");
				bGround.y=-400;

				var c1= new createjs.Text("art and code: WataCoso ","bold 15px Geo","white");
				var c2= new createjs.Text("music: Orka - Edward Shallow ","bold 15px Geo","white");

				c1.x=c2.x=550;
				c1.y=450;
				c2.y=470;


				createjs.Tween.get(bGround).to({y:0},50000);
				if(c.getNumChildren()==0)
				c.addChild(bGround,title,playBt,musicBt,c1,c2);
				console.log(c.getChildAt(0));
				stage.addChildAt(c,0);
				
				});	
		}	

		function gameIstance(lvl)
		{
			var mess= new createjs.Text("STAGE "+(gameLevel+1),"bold 60px Geo","white");
				stage.removeChild(gameContainer);
				upperContainer.addChild(mess);
				mess.x=-300;
				mess.y=200;
				createjs.Tween.get(mess).to({x:200},200).
				to({x:300},2000).
				to({x:900},200,createjs.Ease.QuadIn).call(function(){
			curtains.open(function() {
			factory=new eFactory();
			factory.setLevel(lvl);	
			road=new Road(lvl,700,-70);
			UIG = new UIGroup();
			var p=new Player(200,400);

			addToStack(p,"PLAYER");

			if(gameContainer.getNumChildren()<4)
			gameContainer.addChild(musicBt);
			musicBt.x=760;
			musicBt.y=430;
			stage.onPress=stack.PLAYER.mouseHandler;

			
			
			stage.addChildAt(gameContainer,0);
			stage.update();
			gameStatus="game";
			});});
		}


		function levelCleared(){
			UIG.drawer=null;
			curtains.close(function(){
				gameStatus="stageCleared";

				entitiesContainer.removeAllChildren();
				roadContainer.removeAllChildren();
				UIContainer.removeAllChildren();

				stack={};
				var mess= new createjs.Text("STAGE CLEARED","bold 60px Geo","white");
				stage.removeChild(gameContainer);
				upperContainer.addChild(mess);
				mess.x=-300;
				mess.y=200;
				createjs.Tween.get(mess).to({x:200},200).
				to({x:300},2000).
				to({x:900},200,createjs.Ease.QuadIn).call(function(){
					
					
					//upperContainer.removeChild(mess);	
					/*console.log("AFTER MESSAGE DELETION");	
					console.log(upperContainer.getChildAt(0));
					console.log(upperContainer.getChildAt(1));
					console.log(upperContainer.getChildAt(2));*/
					stage.onPress=null;
					var restartBt=new createjs.BitmapAnimation(elements.buttons);
					restartBt.gotoAndStop("restart");
					restartBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						removeThings(upperContainer,function(){
							upperContainer.removeChild(menuBt,mess);
							/*console.log("AFTER REMOVETHINGS");	
							console.log(upperContainer.getChildAt(0));
							console.log(upperContainer.getChildAt(1));
							console.log(upperContainer.getChildAt(2));*/
							gameIstance(gameLevel);});
					}
					var nextBt=new createjs.BitmapAnimation(elements.buttons);
					nextBt.gotoAndStop("nextStage");
					nextBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						removeThings(upperContainer,function(){upperContainer.removeChild(menuBt,mess);if(gameLevel<3)gameIstance(++gameLevel);else bossLevel();});
					}
					var menuBt=new createjs.BitmapAnimation(elements.buttons);
					menuBt.gotoAndStop("menu");
					menuBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						removeThings(upperContainer,function(){upperContainer.removeChild(menuBt,mess);menu();});
					}
					
					restartBt.y=nextBt.y=menuBt.y=-200;
					restartBt.x=200;
					nextBt.x=400;
					menuBt.x=600;

					mess= new createjs.Text("GOOD JOB!","bold 60px Geo","white");
					stage.removeChild(gameContainer);
					//upperContainer.addChild(mess);
					mess.regX=30;
					mess.x=315;
					mess.y=300;
					mess.alpha=0;
					createjs.Tween.get(mess).to({alpha:1},1000);

		
					upperContainer.addChild(restartBt,nextBt,menuBt,mess);

					/*console.log("AFTER BUTTONS");	
					console.log(upperContainer.getChildAt(0));
					console.log(upperContainer.getChildAt(1));
					console.log(upperContainer.getChildAt(2));*/

					createjs.Tween.get(restartBt).wait(100).to({y:250},1200,createjs.Ease.bounceOut).call(function(){restartBt.enabled=true;});
					createjs.Tween.get(nextBt).wait(200).to({y:200},1200,createjs.Ease.bounceOut).call(function(){nextBt.enabled=true;});
					createjs.Tween.get(menuBt).to({y:250},1200,createjs.Ease.bounceOut).call(function(){menuBt.enabled=true;});
				});
			});
		}

		function gameOver()
		{
			
			UIG.drawer=null;
			curtains.close(function(){
				gameStatus="gameOVer";

				entitiesContainer.removeAllChildren();
				roadContainer.removeAllChildren();
				UIContainer.removeAllChildren();


				stack={};
				var mess= new createjs.Text("GAME OVER","bold 60px Geo","white");
				stage.removeChild(gameContainer);
				upperContainer.addChild(mess);
				mess.x=-300;
				mess.y=200;
				createjs.Tween.get(mess).to({x:200},200).
				to({x:300},2000).
				to({x:900},200,createjs.Ease.QuadIn).call(function(){
					
					//upperContainer.removeChild(mess);				
					stage.onPress=null;
					var restartBt=new createjs.BitmapAnimation(elements.buttons);
					restartBt.gotoAndPlay("restart");
					restartBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						removeThings(upperContainer,function(){upperContainer.removeChild(menuBt,mess);gameIstance(gameLevel);});
						
					}

					var menuBt=new createjs.BitmapAnimation(elements.buttons);
					menuBt.gotoAndPlay("menu");
					menuBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						removeThings(upperContainer,function(){upperContainer.removeChild(menuBt,mess);menu();});
						
					}
					
					restartBt.y=menuBt.y=-200;
					restartBt.x=300;
					menuBt.x=500;

					mess= new createjs.Text("YOU SUCK!","bold 60px Geo","white");
					stage.removeChild(gameContainer);
					//upperContainer.addChild(mess);
					mess.regX=30;
					mess.x=315;
					mess.y=300;
					mess.alpha=0;
					createjs.Tween.get(mess).to({alpha:1},1000);
		
					upperContainer.addChild(restartBt,menuBt,mess);

					createjs.Tween.get(restartBt).wait(100).to({y:250},1200,createjs.Ease.bounceOut).call(function(){restartBt.enabled=true;});
					createjs.Tween.get(menuBt).to({y:250},1200,createjs.Ease.bounceOut).call(function(){menuBt.enabled=true;});
				});
			});
		}
		
		function bossLevel()
		{

			var mess= new createjs.Text("FINAL BOSS!","bold 60px Geo","white");
				stage.removeChild(gameContainer);
				upperContainer.addChild(mess);
				mess.x=-300;
				mess.y=200;
				createjs.Tween.get(mess).to({x:200},200).
				to({x:300},2000).
				to({x:900},200,createjs.Ease.QuadIn).call(function(){curtains.open(function(){
					music.stop();
					var c=new createjs.Container();
					var menuBt=new createjs.BitmapAnimation(elements.buttons);
					menuBt.gotoAndStop("menu");

					menuBt.onClick=function(){
						var s=createjs.SoundJS.play("button");
						curtains.close(function(){
							stage.removeChild(c);
							music.play("mainTheme");
							menu();
						});
					}

				

				menuBt.x=400;
				menuBt.y=450;

				bGround=new createjs.Bitmap("assets/sprites/bossBackground.png");
				c.addChild(bGround,menuBt);
				stage.addChildAt(c,0);
				});

			});
		}
				
		//GAME LOGIC//
		function updateLogic()
		{
			switch (gameStatus){
				case "game":
				road.update();
				UIG.update();				
				for(var i in stack)
				{	
					if(stack[i].alive)
						stack[i].update();
					else
					{
					 removeFromStack(i);
					}
					factory.update();
				}
				entitiesContainer.sortChildren(compare);
				break;
				case "paused":
				break;
			}			
		}
		
		
		
		
		keyMap = 
		{
 			 _pressed: {},

  			LEFT: 37,
  			UP: 38,
 			RIGHT: 39,
 			DOWN: 40,
 			w: 87,
  			a: 65,
 			s: 83,
 			d: 68,
			g: 71,
 			
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
		
		function UIGroup(){
			
			var tmp=this.prototype;

			this.levelDisplay= new createjs.Text("0","bold 40px Geo","gray");
			this.levelDisplay.x=560;
			this.levelDisplay.y=12;
			this.levelDisplay.regX=15;
			this.levelDisplay.regY=15;
			this.color="gray";
			var bg=new createjs.Shape();

			bg.graphics.
			beginFill("#0C060E").
			rect(0,0,800,40).
			rect(0,460,800,40);

			var bars=new createjs.Shape();

			UIContainer.addChild(bg,this.levelDisplay,bars);

			this.update=function(){
				//this.color=stack.PLAYER.levelBonds[stack.PLAYER.level].c;
				UIContainer.removeChildAt(2);
				bars=new createjs.Shape();

				bars.graphics.
				beginFill("#99000D").
				rect(10,10,200*(stack.PLAYER.health/stack.PLAYER.maxHealth),20).
				beginFill(this.color).
				rect(580,10,200*(stack.PLAYER.wackoCount/stack.PLAYER.levelBonds[stack.PLAYER.level].t),20);
				UIContainer.addChild(bars);

				this.levelDisplay.text=stack.PLAYER.level;
			}

		}

		function Curtains(){

			var tmp=this.prototype;

			var status={
				index:250,
				closed:true,
				animate:false
			};

			tmp=new createjs.Shape();

			tmp.graphics.setStrokeStyle(1).beginStroke("#0C060E").beginFill("#0C060E").
			rect(0,0,800,status.index).
			rect(0,500-status.index,800,status.index).endFill().endStroke();

			upperContainer.addChildAt(tmp,0);

			function endAnim(){
				status.animate=false;
			}


			this.close=function(callback){
					if(!status.closed){
						console.log("close");
						status.animate=true;

						createjs.Tween.
						get(status).
						to({index:250},1000,createjs.Ease.bounceOut).wait(200).call(endAnim).
						call(callback);

						//status.animate=false;
						status.closed=true;
					}
				}

			this.open=function(callforward){
					if(status.closed){
						console.log("open");
						callforward();

						status.animate=true;

						createjs.Tween.
						get(status).to({index:0},400,createjs.Ease.QuadIn).wait(200).call(endAnim);

						//status.animate=false;
						status.closed=false;
					}
				}

			this.tick=function(){

				if(status.animate || status.closed){
					upperContainer.removeChild(tmp);
					//if(gameStatus=="game")
					tmp=new createjs.Shape();

					tmp.graphics.setStrokeStyle(1).beginStroke("#0C060E").beginFill("#0C060E").
					rect(0,0,800,status.index).
					rect(0,500-status.index,800,status.index).endFill().endStroke();
					upperContainer.addChildAt(tmp,0);
				}
			}
		}
		
		//GAME SPAWNER MANAGER//
		
		function eFactory()
		{
			this.currentLevel=1;
			this.addSwarmReady=true;
			
			var budget,swarmsLeft;
			this.state="safe";						//safe : no new enemies, just loots on the ground and fat kids
													//danger: pretty explanatory, i guess. 
			this.timeIndex=createjs.Ticker.getTicks();
			
			
			this.levels=
			[
				{nSwarms: 1 , safeTime: 300 , roadSpeed: 2 , enemySpeed: [1.5,2] , fireSpeed: [100,150], newEnemies:  50 , ncandyCash: 10 , budget: [ 1, 5]},
				{nSwarms: 2 , safeTime: 500 , roadSpeed: 2 , enemySpeed: [1.5,2] , fireSpeed: [100,150], newEnemies:  40 , ncandyCash: 20 , budget: [ 5,10]}, 
				{nSwarms: 3 , safeTime: 400 , roadSpeed: 2 , enemySpeed: [1.5,2] , fireSpeed: [150,200], newEnemies:  40 , ncandyCash: 30 , budget: [10,15]},
				{nSwarms: 4 , safeTime: 350 , roadSpeed: 2 , enemySpeed: [1.5,2] , fireSpeed: [200,300], newEnemies:  40 , ncandyCash: 40 , budget: [15,20]}
			];
			
			this.enemies=
			{
				NormalCop:{cost: 1},
				RugbyCop :{cost: 3}
			};
			
			
			this.itemFrequency=
			{
				painKiller:{freq:40,maxFreq:170,add:true},
				candy0:    {freq:100,maxFreq:190,add:true},
				candy1:    {freq:90,maxFreq:230,add:true},
				candy2:    {freq:70,maxFreq:310,add:true},
				candy3:    {freq:60,maxFreq:330,add:true},
				candy4:    {freq:50,maxFreq:370,add:true},
				candy5:    {freq:40,maxFreq:390,add:true}
			};

			this.setLevel=function(lvl){
				this.currentLevel=lvl;
				var tmp=this.levels[lvl];
				budget=tmp.budget[0];
				swarmsLeft=tmp.nSwarms;
				roadSpeed=tmp.roadSpeed;
			}
			
			this.addSwarm=function()
			{//alert("e");
				var t=this.levels[this.currentLevel];
				var b=Math.ceil(budget/(t.nSwarms*2));
				if(budget<t.budget[1])
					budget+=1/t.nSwarms;
				//alert(b);
				while(b>0)
								{
									var tmp=Math.ceil(Math.random()*2);
									
									switch(tmp)
									{
										case 1:
										if(b>=this.enemies.NormalCop.cost)
										{
											addToStack(new NormalCop(Math.ceil(Math.random()*200+50),Math.ceil(Math.random()*200)));
											b-=this.enemies.NormalCop.cost;
										}
										break;
										
										case 2:
										if(b>=this.enemies.RugbyCop.cost)
										{
											addToStack(new RugbyCop(Math.random()*(t.enemySpeed[1]-t.enemySpeed[0])+t.enemySpeed[0],Math.ceil(Math.random()*200)));
											b-=this.enemies.RugbyCop.cost;
										}
										break;
									}
								}
			}
			
			this.istanceSwarm=function()
			{
				
			}
			
			this.update=function()
			{
				var t=createjs.Ticker.getTicks();
				//alert(this.itemFrequency);
				for(var i in this.itemFrequency)
					{//alert(this.itemFrequency[i].add);
						if(t % this.itemFrequency[i].maxFreq==0 && this.itemFrequency[i].add && t)
						{//alert("e");
							if(Math.random()*100<=this.itemFrequency[i].freq)
								{
									addToStack(new Item(i,-10,650-Math.random()*200,4,-2,7));
								}
								this.itemFrequency[i].add=false;
						}
						else if(t % this.itemFrequency[i].maxFreq!=0)
							this.itemFrequency[i].add=true;
					}
					
					switch(this.state)
					{
						case "danger":
						if(!this.swarmsLeft && countEnemies()<30)
						{
							this.state="safe";
							this.timeIndex=t;
						}
					if(t % this.levels[this.currentLevel].newEnemies==0 && this.addSwarmReady && t &&this.swarmsLeft )
						{
							
							this.addSwarm();
							this.swarmsLeft--;
							this.addSwarmReady=false;
						}
					else if(t % this.levels[this.currentLevel].newEnemies!=0)
							this.addSwarmReady=true;
						break;
						case "safe":
						if(!this.swarmsLeft)
						this.swarmsLeft=this.levels[this.currentLevel].nSwarms;
						if(t-this.timeIndex>this.levels[this.currentLevel].safeTime)
						this.state="danger";
						break;
					}
			}
			
		}
		
		
		
		//GAME ELEMENTS//
		
		
		function Road(type,x,y)
		{
			var tmp=Road.prototype;
			//tmp.roadContainer=new createjs.Container();
			tmp.Sx=x;
			tmp.Sy=y;
			tmp.type=type;
			this.speed=roadSpeed;
			//stage.addChildAt(roadContainer,0);
			
			tmp.changeType=function(newType)
			{
				tmp.type=newType;
			}
			
			tmp.addSegment=function(x,y)
			{
				var roadSegment=new createjs.BitmapAnimation(elements.road);
				//var roadSegment=elements.SSroads.clone();
				roadSegment.gotoAndPlay("road"+type);
				roadSegment.x=x;
				roadSegment.y=y;
				roadSegment.height=92;
				roadSegment.width=100;
				roadContainer.addChild(roadSegment);
			}
			
			for(var i=0;i<30;i++)
				tmp.addSegment(tmp.Sx-40*i,20*i+tmp.Sy);
			
			
			this.update=function()
			{
				if(roadContainer.getChildAt(0).x>800)
					{		
						roadContainer.removeChildAt(0);	
						tmp.addSegment
									(	
										roadContainer.getChildAt(roadContainer.getNumChildren()-1).x-40,
										roadContainer.getChildAt(roadContainer.getNumChildren()-1).y+20
							  		);
					}
	
				for(var i =0;i<roadContainer.getNumChildren();i++)
					{
						roadContainer.getChildAt(i).x+=this.speed*2;
						roadContainer.getChildAt(i).y-=this.speed;
					}
			}
			
		}
		

		function Player(x,y)
		{
			var p=this.prototype;
			
			p= new createjs.BitmapAnimation(elements.player);
			p.x=x;
			p.y=y;
			this.x=x;
			this.y=y;
			this.isoBox=new isoRect(x,y+30,10);
			this.alive=true;
			p.bulletReady=true;
			p.fire=false;
			p.bulletData;
			this.time=0;
			this.health=50;
			this.wackyness=0;
			this.wackoTime=0;
			this.wackoCount=0;
			this.level=0;
			var pressG=0;
			var m=new createjs.Text("CHARGING","bold 20px Geo","#0C060E");
			m.x=650;
			m.y=10;

			this.levelBonds=[
			{t:3000,c:"gray"},
			{t:4000,c:"#437B98"},
			{t:5000,c:"#614BC3"},
			{t:6000,c:"#C34B87"},
			{t:7000,c:"#AFD14D"},
			{t:100,c: "#FFFFFF"}
			];

			UIG.color=this.levelBonds[this.level].c;
			UIG.levelDisplay.color=this.levelBonds[this.level].c;

			this.maxHealth=50;
			this.bombs=0;
			this.bulletSpeed=20;
			this.speed=2;
			p.gotoAndPlay("walk");
			this.box=new createjs.Rectangle(p.x-35,p.y-35,70,70);
			entitiesContainer.addChild(p);
			
			this.mouseHandler=function(e)
			{
				e.onMouseUp=function(ev){
				p.fire=false;
				p.bulletData=ev;
				}
				p.fire=true;
				p.bulletData=e;
				e.onMouseMove=function(ev){
				p.fire=true;
				p.bulletData=ev;
				}
			}
			

			
			this.update= function ()
			{
				//this.isoBox.debugDraw();
				var collisions=SATCollision(this);
				
				for(var i in collisions)
					{
						switch (stack[collisions[i]].constructor.name)
						{
						case "RugbyCop":
							if(stack[collisions[i]].state!=1 && stack[collisions[i]].state!=2)
							{
									var s=createjs.SoundJS.play("rugbyTouch");
									stack[collisions[i]].state=1;
									if(this.health>5)
									this.health-=5;
									else this.health=0;
									//this.energy-=5;
							}
							break;
						case "NormalCop":
							if(stack[collisions[i]].state!=4)
							{
									var s=createjs.SoundJS.play("playerDamage");
									stack[collisions[i]].time=0;
									stack[collisions[i]].state=4;
									if(this.health>10)
									this.health-=10;
									else this.health=0;
							}
							break;
						case "Candy":
						if(stack[collisions[i]].state!=1)
							{
									stack[collisions[i]].state=1;
							}
							break;
						case "Item":
							switch(stack[collisions[i]].type)
								{
									case "enemyBullet":
									var s=createjs.SoundJS.play("playerDamage");
									if(this.health>5)
									this.health-=5;
									else this.health=0;
									stack[collisions[i]].die();
									break;
									
									case "painKiller":
									var s=createjs.SoundJS.play("life");
									this.health+=20;
									points(stack.PLAYER.x-50,stack.PLAYER.y,"ph");
									if(this.health>this.maxHealth)
										this.health=this.maxHealth;
									stack[collisions[i]].die();
									break;
									
									case "candy0":
									var s=createjs.SoundJS.play("candy");
									candyCash+=100;
									points(stack.PLAYER.x,stack.PLAYER.y-40,"c0");
									this.wackyness+=100;
									stack[collisions[i]].die();
									break;

									case "candy1":
									var s=createjs.SoundJS.play("candy");
									candyCash+=200;
									points(stack.PLAYER.x,stack.PLAYER.y-40,"c1");
									this.wackyness+=200;
									stack[collisions[i]].die();
									break;

									case "candy2":
									var s=createjs.SoundJS.play("candy");
									candyCash+=400;
									points(stack.PLAYER.x,stack.PLAYER.y-40,"c2");
									this.wackyness+=400;
									stack[collisions[i]].die();
									break;

									case "candy3":
									var s=createjs.SoundJS.play("candy");
									candyCash+=800;
									points(stack.PLAYER.x,stack.PLAYER.y-40,"c3");
									this.wackyness+=800;
									stack[collisions[i]].die();
									break;

									case "candy4":
									var s=createjs.SoundJS.play("candy");
									candyCash+=1400;
									points(stack.PLAYER.x,stack.PLAYER.y-40,"c4");
									this.wackyness+=1400;
									stack[collisions[i]].die();
									break;

									case "candy5":
									var s=createjs.SoundJS.play("candy");
									candyCash+=3000;
									points(stack.PLAYER.x,stack.PLAYER.y-40,"c5");
									this.wackyness+=3000;
									stack[collisions[i]].die();
									break;
								}
								
							break;
						}
					}
					

					//TMP SNIPPET///
					//
					//
					/*if(keyMap.isDown(keyMap.g)){
								stage.removeChild(m);
								levelCleared();
							}*/
					//


					//LEVEL UP BLOCK
					
					
					
					if(this.level!=5){
						if(this.wackyness>=this.levelBonds[this.level].t){
							points(stack.PLAYER.x+50,stack.PLAYER.y,"lu");
							
							
							this.wackyness-=this.levelBonds[this.level].t;
							UIG.color=this.levelBonds[this.level].c;
							this.level++;
							UIG.levelDisplay.scaleX=1.5;
							UIG.levelDisplay.scaleY=1.5;
							createjs.Tween.get(UIG.levelDisplay).to({scaleX:1,scaleY:1},500);
							
							var s=createjs.SoundJS.play("levelUp");
						}
						this.wackoCount=this.wackyness;
					}
					else{
						if(pressG!=1){
							pressG=1;
							//UIContainer.addChild(m);
						}
						if(this.wackoTime<this.levelBonds[this.level].t)
						this.wackoTime+=0.1;
						else {
							this.wackoTime=this.levelBonds[this.level].t;
							if(pressG!=2)
							{
								pressG=2;
								m.text="PRESS G!";
								m.color="red";
								UIContainer.addChild(m);
								
								function t(){
									createjs.Tween.get(UIG).to({color:"#FDD14D"},10).wait(200).to({color:"white"},10).wait(200).call(t);
								}
								t();
							}
							if(keyMap.isDown(keyMap.g)){
								UIContainer.removeChildAt(stage.getNumChildren()-1);
								levelCleared();
							}
						}
						
						this.wackoCount=this.wackoTime;
					}

					UIG.levelDisplay.color=this.levelBonds[this.level].c;

					
  				
  				if(this.time>=50){this.energy-=2; this.time=0;}
  				
  				if(this.health<=0){
  					UIContainer.removeChild(m);
  					var s=createjs.SoundJS.play("playerDeath");
  					gameOver();
  				}
  				
  				if(this.isoBox.points.bottomV.x<=800-this.isoBox.points.bottomV.y*2+550)
  				{
  					if (keyMap.isDown(keyMap.s) && this.box.y+this.box.height<=stage.rect.height) this.y+=this.speed;
  					if (keyMap.isDown(keyMap.d) && this.box.x+this.box.width<=stage.rect.width) this.x+=this.speed*2;
  				}
  			
  				if(this.isoBox.points.topV.x>=800-this.isoBox.points.topV.y*2-140)
  				{
  					if (keyMap.isDown(keyMap.w) && this.box.y>=0) this.y-=2;
  					if (keyMap.isDown(keyMap.a) && this.box.x>=0) this.x-=4;
  				} 
  				

  				if(p.bulletReady && p.fire)
					{
					var e=p.bulletData;	
					this.l=Math.sqrt((e.stageX-p.x)*(e.stageX-p.x)+(e.stageY-p.y)*(e.stageY-p.y));
					addToStack(new Item("playerBullet",p.x+(e.stageX-p.x)/this.l*32,p.y+(e.stageY-p.y)/this.l*32,(e.stageX-p.x)/this.l*8,(e.stageY-p.y)/this.l*8));
					p.bulletReady=false;
					var s=createjs.SoundJS.play("playerShoot");
					}

  				if(this.time>=this.bulletSpeed)
  					{
  						p.bulletReady=true;
  						this.time=0;
  					}
  				
  				p.x=this.x;
				p.y=this.y;
				this.time++;
  				moveRectTo(this.box,this.x-35,this.y-35); 		
  				this.isoBox.moveTo(this.x,this.y+30);
  				
  					
			}	
			
			this.die=function()
			{
				entitiesContainer.removeChild(p);
			}
			
			
		}
		
		
		function RugbyCop(speed,roadStart)
		{
			var p=this.prototype;
			
			p= new createjs.BitmapAnimation(elements.rugbyCop);
			this.speed=speed;
			this.idleSpeed=0;
			this.x=stage.rect.width;
			this.y=roadStart;
			p.x=this.x;
			p.y=this.y;
			this.isoBox=new isoRect(this.x,this.y+30,15);
			this.state=0;	
			this.health=12;								//0: walk , 1:idle ,2:attack, 3: die
			this.alive=true;
			this.time=0;
			p.gotoAndPlay("walk");
			entitiesContainer.addChild(p);
			
			
			
			this.update=function()
			{
				//this.isoBox.debugDraw();
				var collisions=SATCollision(this);
				for(var i in collisions)
					{
						if(stack[collisions[i]].constructor.name=="Item" && stack[collisions[i]].type=="playerBullet")
							{
								var s=createjs.SoundJS.play("enemyDamage");
								this.health-=1;
								if(this.health<=0){
									var s=createjs.SoundJS.play("enemyDeath");
									this.time=0;
									this.state=2;
									}
								stack[collisions[i]].die();
							}
					}
				
				switch(this.state)
				{
				case 0:
				
				this.l=Math.sqrt((stack.PLAYER.x-this.x)*(stack.PLAYER.x-this.x)+(stack.PLAYER.y+30-this.y)*(stack.PLAYER.y+30-this.y));
				this.x-=this.speed*(this.x-stack.PLAYER.x)/this.l;
				this.y+=this.speed*(stack.PLAYER.y+30-this.y)/this.l;
					break;
				case 1:
				if(p.currentAnimation!="idle")
				p.gotoAndPlay("idle");
				if(this.idleSpeed==0)
					this.idleSpeed=-2;
				this.x-=this.idleSpeed*2;
				this.y+=this.idleSpeed;
				this.idleSpeed +=0.03;
				if(this.idleSpeed>=0)
					{
					this.idleSpeed=0;
					p.gotoAndPlay("walk");
					this.state=0;
					this.time=0;
					}
					
				break;
				case 2:							//DIE
				this.x+=2;
				this.y-=1;
				if(p.currentAnimation!="die")
				p.gotoAndPlay("die");
				if(this.time>=10)
						this.die();				
				break;
				}
				p.x=this.x;
				p.y=this.y;
				this.isoBox.moveTo(p.x,p.y+30);
				this.time++;
			}		
			
			this.die=function()
			{
				this.alive=false;
				entitiesContainer.removeChild(p);
			}
		}
		
		function NormalCop(length,roadStart)
		{
			var p=this.prototype;
			p= new createjs.BitmapAnimation(elements.normalCop);
			p.x=stage.rect.width;
			p.y=roadStart;
			this.fX=stage.rect.width-length;
			this.fY=roadStart+length/2;
			this.shootDelay=50;
			this.isoBox=new isoRect(p.x,p.y+25,10);
			this.health=3;
			this.state=0;									//0: run , 1:wals, 2:aim ,3:shoot
			this.time=0;
			
			
			this.speed=1;
			this.bulletReady=true;
			this.alive=true;
			this.direction="Left";
			this.shoot=function(vx,vy)
			{
				switch(this.direction)
				{
					case "Left":
				addToStack(new Item("enemyBullet",p.x-10,p.y+5,vx,vy));
				break;
					case "Right":
				addToStack(new Item("enemyBullet",p.x+10,p.y-5,vx,vy));
				break;
					case "Top":
				addToStack(new Item("enemyBullet",p.x-10,p.y-5,vx,vy));
				break;
					case "Bottom":
				addToStack(new Item("enemyBullet",p.x+10,p.y+5,vx,vy));
				break
				}
				var s=createjs.SoundJS.play("enemyShoot");
			}
			p.gotoAndPlay("run");
			entitiesContainer.addChild(p);
			
			
			this.update=function()
			{
				//this.isoBox.debugDraw();
				var collisions=SATCollision(this);
				for(var i in collisions)
					{
						if(stack[collisions[i]].constructor.name=="Item" && stack[collisions[i]].type=="playerBullet")
							{
								this.health-=1;
								if(this.health<=0) {this.state=4;
									this.time=0;
									var s=createjs.SoundJS.play("enemyDeath");}
									else
										var s=createjs.SoundJS.play("enemyDamage");
								stack[collisions[i]].die();
								var s=createjs.SoundJS.play("enemyDamage");
								
							}
					}
				
				
				switch (this.state)
				{
				case 0:							//RUN TO DESIGNED POSITION
					if(p.x>=this.fX)
					{
						this.speed=1;
					}
					else 
					{
						this.time=0;
						this.state=1;
						p.gotoAndPlay("walk");
					}
						

					
					break;						//STAY ON DESIGNED POSITION
				case 1:
					this.speed=0;
					if(this.time==this.shootDelay)
					{
						this.state=2;
						this.time=0;
						this.speed=-roadSpeed;
					}	
					break;
				case 2:							//AIM STANCE
					
					
					
					if(this.time>=5)
					{
						this.state=3;
						this.time=0;
						this.bulletReady=true;
					}
					else
					{
						if(stack.PLAYER.x>p.x)
							if(stack.PLAYER.y>p.y)
								this.direction="Bottom";
							else
								this.direction="Right";
						else
							if(stack.PLAYER.y>p.y)
								this.direction="Left";
							else
								this.direction="Top";
					p.gotoAndStop("shoot"+this.direction);
					}
					break;
					
				case 3:							//SHOOT
					p.play();
					if(this.bulletReady)
					{
					var l=Math.sqrt((stack.PLAYER.x-p.x)*(stack.PLAYER.x-p.x)+(stack.PLAYER.y+30-p.y)*(stack.PLAYER.y+30-p.y));
					this.shoot((stack.PLAYER.x-p.x)/l*8,(stack.PLAYER.y+30-p.y)/l*8);
					this.bulletReady=false;
					}
					if(this.time>15)
					{
						this.time=0;
						this.state=0;
						p.gotoAndPlay("run");
					}

					break;
					
				case 4:							//DIE
				this.speed=-roadSpeed;
				if(p.currentAnimation!="die"){
				var s=createjs.SoundJS.play("enemyDie");
				p.gotoAndPlay("die");
				}
				if(this.time>10)
						this.die();				
					break;
				
				}
				p.y+=this.speed;
				p.x-=this.speed*2;	
				this.isoBox.moveTo(p.x,p.y+25);
				this.time++;
							
			}
			
			this.die=function()
			{
				this.alive=false;
				entitiesContainer.removeChild(p);
			}	
		}
	
		function Item(type,x,y,vx,vy,dim)
		{
			var p=this.prototype;
			
			p= new createjs.BitmapAnimation(elements.item);
			p.x=x;
			p.y=y;
			this.vx=vx;
			this.vy=vy;
			this.x=x;
			this.y=y;
			this.type=type;
			if(dim)
			this.isoBox=new isoRect(x,y+5,dim);
			else
			this.isoBox=new isoRect(x,y+5,2);
			this.alive=true;
			
			p.gotoAndPlay(type);
			entitiesContainer.addChild(p);
			
			this.update=function()
			{
				if(isOutsideCanvas(this,-100))
				{
					this.die();
				}
				
				//this.isoBox.debugDraw();
				switch(this.type)
								{
									case "enemyBullet":
										
									break;
									
									case "soda":
									
									break;
									
									case "painKiller":
								
									break;
									
									case "ammo":
									
									break;
									
									case "bomb":
									
									break;
									
									case "candy":
									
									break;
								}
				
				this.x+=this.vx;
				this.y+=this.vy;
				p.x=this.x; p.y=this.y;
				this.isoBox.moveTo(p.x,p.y+5);
			}		
			
			this.die=function()
			{
				this.alive=false;
				entitiesContainer.removeChild(p);
			}
		}
		
		function points (x,y,value) {
			var p= new createjs.BitmapAnimation(elements.buttons);
			p.x=x;
			p.y=y;
			p.gotoAndStop(value);
			UIContainer.addChild(p);
			createjs.Tween.get(p).to({y:p.y-80},3000).wait(100).call(function(){UIContainer.removeChild(p)});

		}

		
		//PRELOADER HANDLING//
		
		
		function handleProgress(event)
		{
    		//use event.loaded to get the percentage of the loading
		}
 
		function handleComplete(event) 
		{
        	 //triggered when all loading is complete
		}
 
		function handleFileLoad(event) 
		{
         //triggered when an individual file completes loading
             
         switch(event.type)
         	{
            case createjs.PreloadJS.IMAGE:
            //image loaded	
			var img = new Image();
            img.src = event.src;
            img.onload = handleLoadComplete;
			elements[event.id] = new createjs.Bitmap(img);
			
			break;
 
          	case createjs.PreloadJS.SOUND:
          	event.result.data=20;
          	handleLoadComplete();
         	break;
         	
         	case createjs.PreloadJS.JSON:
         	eval("elements['"+event.id+"']= new createjs.SpriteSheet("+event.result+")");
         	
         	handleLoadComplete();
         	break;
        	}
		}
		
		function handleLoadComplete(event) 
			{
 
   				totalLoaded++;
   				

   				loadingBar.graphics.
				beginFill("white").
				rect(300,230,200*(totalLoaded/assets.length),20);
    		
				loadingPercentage.text=Math.ceil(100*totalLoaded/assets.length)+"%";

   				if(assets.length==totalLoaded)
   				{
   					upperContainer.removeChild(loadingPercentage,loadingBar);
   					intro();
 				}
			}
			
			
		//TAILORED FUNCTIONS//
		
		function moveRectTo(rect,x,y){
			rect.x=x;
			rect.y=y;
		}	
		
		function collideRects(rect1,rect2){
			
			if(rect1.x >rect2.x+rect2.width || rect1.x+rect1.width <rect2.x || rect1.y >rect2.y+rect2.height || rect1.y +rect1.height <rect2.y)
				return false;	
			return true;
		}
		

		function removeThings (container,callback) {
			var direction=1;
			for(var i=container.getNumChildren()-1;i>0;i--){
				var k=container.getChildAt(i);
				createjs.Tween.get(k).to({y:(direction==1?600:-200)},300).call(function(){container.removeChildAt(i);if(container.getNumChildren()==1)callback();});
				direction*=-1;
			}
		}

		
		//COLLISION SYSTEM
		
		function isoRect(x,y,r)
		{
			
			this.x=x;
			this.y=y;
			this.radius=r;
			
			this.points=
			{
				leftV: new createjs.Point(this.x-this.radius*2,this.y),
				bottomV: new createjs.Point(this.x,this.y+this.radius),	
				topV: new createjs.Point(this.x,this.y-this.radius),	
				rightV: new createjs.Point(this.x+this.radius*2,this.y)		
			}
			
			this.move=function(x,y)
			{
				this.points.leftV.x+=x;				this.points.leftV.y+=y;
				this.points.bottomV.x+=x;    		this.points.bottomV.y+=y;
				this.points.topV.x+=x;	    		this.points.topV.y+=y;
				this.points.rightV.x+=x;			this.points.rightV.y+=y;
			}
			
			this.moveTo=function(x,y)
			{
				this.points.leftV.x=x-this.radius*2;			this.points.leftV.y=y;
				this.points.bottomV.x=x;     				this.points.bottomV.y=y+this.radius;
				this.points.topV.x=x;	   					this.points.topV.y=y-this.radius;
				this.points.rightV.x=x+this.radius*2;			this.points.rightV.y=y;
			}
			
			this.debugDraw=function()
			{
				 var g = new createjs.Graphics();
   				 g.setStrokeStyle(1);
   				 g.moveTo(this.points.leftV.x,this.points.leftV.y);
    		     g.beginStroke(createjs.Graphics.getRGB(255,0,0));
    		     g.lineTo(this.points.bottomV.x,this.points.bottomV.y);
    		     g.lineTo(this.points.rightV.x,this.points.rightV.y);
    		     g.lineTo(this.points.topV.x,this.points.topV.y);
    		     g.closePath();

    		     var ctx=stage.canvas.getContext("2d");
    		  
    		     g.draw(ctx);
			}
		}
		
		//working only on isometric boxes
		
		function SATCollision(target){
			var result=[];
			var index=0;
			var tester;
			var vx1, vx2, vy1, vy2;
			var P={x:2,y:-1};
			var Q={x:-2,y:-1};
			for(var i in stack)
			{	
				tester=stack[i];
				if(target!=tester)
				{
					
					
					if(target.isoBox.points.topV.x==Math.min(tester.isoBox.points.topV.x,target.isoBox.points.topV.x))
						{
							vx1=target.isoBox.points.topV;
							vx2=tester.isoBox.points.leftV;
						}
					else
						{
							vx1=tester.isoBox.points.topV;
							vx2=target.isoBox.points.leftV;
						}
					
					if(target.isoBox.points.leftV.y==Math.max(tester.isoBox.points.leftV.y,target.isoBox.points.leftV.y))
						{
							vy1=target.isoBox.points.leftV;
							vy2=tester.isoBox.points.bottomV;
						}
					else
						{
							vy1=tester.isoBox.points.leftV;
							vy2=target.isoBox.points.bottomV;
						}
					
						
					if(dotProduct(vx1,P)>=dotProduct(vx2,P) && dotProduct(vy1,Q)>=dotProduct(vy2,Q))
						result[index++]=i;
				}
						
			}
			
			return result;
		}
		
		
		
		dotProduct=function(p1,p2){
			return p1.x*p2.x+p1.y*p2.y;
		}
		
		//ORDER COMPARISION
		
		function compare(elem1,elem2){
			if(elem1.y>elem2.y)	return  1;
			if(elem1.y<elem2.y) return -1;
								return  0;
		}
		
		//STACK MANAGEMENT
		
		stack={};
			
		function addToStack(element,ID){	
			//alert(IDfactory);
			//element.name="obj"+IDfactory;
			if(ID!=undefined)
			stack[ID]=element;	
			else
			{
			stack["obj"+IDfactory]=element;	
			IDfactory++;
			}
			stackLength++;
		}
		
		function removeFromStack(ID){
			delete stack[ID];
			stackLength--;
		}
		
		function countEnemies(){
			var r=0;
			for(var i in stack){
				if(stack[i].constructor.name=="NormalCop" || stack[i].constructor.name=="RugbyCop")
					r++;
					
			}
			return r;
		}	
		//VISIBLE ON CANVAS CONTRO	
		function isOutsideCanvas(element,dim){
			if(element.x<=dim|| element.x>=stage.rect.width-dim ||element.y<=dim || element.y>=stage.rect.height-dim)
				return true;
				else
			return false;
		}
		//START//	
		init();
}		
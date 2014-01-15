window.addEventListener("load",Main);

function Main () {
	//#VARIABLES DEFINITION
	var gameLogic, stage, gameStatus,assets;



	var menuContainer,
		gameContainer,
		worldContainer,
		backgroundContainer,
		entitiesContainer,
		effectsContainer,
		UIContainer,
		infContainer,
		supContainer;

	var camera,player,elder,talkButton;
	var foesNumber=0;
	var uimanager,storyline;
	var dbg;


	
	Loading();

	function Loading(){

		gameStatus="loading";
		stage=new createjs.Stage(document.getElementById("game"));

		gameLogic={};
		gameLogic.tick=update;
		createjs.Ticker.setFPS(60);
		createjs.Ticker.addListener(stage);
		createjs.Ticker.addListener(gameLogic);

		window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
		window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);


		menuContainer=new createjs.Container();
		gameContainer=new createjs.Container();
		worldContainer=new createjs.Container();
		backgroundContainer=new createjs.Container();
		entitiesContainer=new createjs.Container();
		effectsContainer=new createjs.Container();
		UIContainer=new createjs.Container();
		infContainer=new createjs.Container();
		supContainer=new createjs.Container();

		stage.addChild(infContainer,supContainer);
		gameContainer.addChild(worldContainer,UIContainer);
		worldContainer.addChild(backgroundContainer,entitiesContainer,effectsContainer);


		assets= new createjs.LoadQueue();
		assets.installPlugin(createjs.Sound);
		createjs.MotionGuidePlugin.install();


		assets.onProgress=function(e){

		}
		assets.onComplete=function(e){
			

			NewGame();
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

         	break;
        	}
		}


		var manifest=[
					  {src:"assets/gameRules.json", id:"gameRules"},
					  {src:"assets/sprites/common/talkButton.png", id:"talkButton"},
					  {src:"assets/sprites/common/dialogBox.png", id:"dialogBox"},
					  {src:"assets/sprites/player/player.png", id:"playerImg"},
					  {src:"assets/sprites/player/player.json", id:"player"},
					  {src:"assets/sprites/actors/minion/minion.png", id:"minionImg"},
					  {src:"assets/sprites/actors/minion/minion.json", id:"minion"},
					  {src:"assets/sprites/actors/prisoner/prisoner.png", id:"prisonerImg"},
					  {src:"assets/sprites/actors/prisoner/prisoner.json", id:"prisoner"},
					  {src:"assets/sprites/actors/elder/elder.png", id:"elderImg"},
					  {src:"assets/sprites/actors/elder/elder.json", id:"elder"},
					  {src:"assets/sprites/weapons/weapons.png", id:"weaponsImg"},
					  {src:"assets/sprites/weapons/weapons.json", id:"weapons"},
					  {src:"assets/sprites/common/gameBackground.png", id:"backgroundImg"}
					 ];


		assets.loadManifest(manifest);
		//Play();	
	}


	//#############################
	//#########LOGIC UPDATE########
	//#############################

	function update () {

		entitiesContainer.sortChildren(sorter);

		if(camera)
			camera.moveTo(player.x,player.y);
		for(var i=0;i<entitiesContainer.getNumChildren();i++)
			if(entitiesContainer.getChildAt(i).update)
				entitiesContainer.getChildAt(i).update();

		for(var i=0;i<effectsContainer.getNumChildren();i++)
			if(effectsContainer.getChildAt(i).update)
				effectsContainer.getChildAt(i).update();

			

		switch(gameStatus){
			case "Play":
			uimanager.update();
			storyline.update();
			if(storyline.plotStatus=="calm" && Math.abs(player.x-elder.x)<100 && Math.abs(player.y-elder.y)<150){
				talkButton.alpha=1;
				if(keyMap.isDown(keyMap.t) && storyline.plotStatus!="talking"){
					storyline.talk({"dialog":"m"+storyline.level});
					storyline.tKeyPressed=true;
				}
			}
			else
				talkButton.alpha=0;
			break;
			case "GameOver":
			if(keyMap.isDown(keyMap.r))
			NewGame();
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
	
	function Camera(target,fx,fy,boundaries){

		this.focusX=fx;
		this.focusY=fy;

		
		this.moveTo=function(x,y){
			if(x-boundaries.x>400 && boundaries.x+boundaries.width-x>400){
				this.x=x;
				target.x=-x+this.focusX;
			}
			if(boundaries.y+boundaries.height-y>100){
				this.y=y;
				target.y=-y+this.focusY;
			}

		}
	}



	function Entity(x,y,w,h,notColliding){

		var entity;																	//  Base game elements. It manages collisions

		entity=new createjs.Container();

		entity.x=x;
		entity.y=y;

		entity.colliding=!notColliding;

		entity.width=w;
		entity.height=h;

		entity.boxCollision=function(target,endAtFirst){
			var cList=[];
			for(var i=0;i<target.getNumChildren();i++)
			{
				if(!target.getChildAt(i).colliding || this==target.getChildAt(i) ) continue;

				var obj=target.getChildAt(i);

				if(this.x - this.width/2 <= obj.x + obj.width/2 &&
				   this.x + this.width/2 >= obj.x - obj.width/2 && 
				   this.y >= obj.y - obj.height &&
				   this.y - this.height<=obj.y  ){
					cList.push(obj);
					if(endAtFirst)
						return cList;
				}

			}
			return cList;
		}


		entity.boundsCollision=function(gameBoundaries){
			if(this.x-this.width/2<gameBoundaries.x) return "left";
			if(this.x+this.width/2>gameBoundaries.x+gameBoundaries.width) return "right";
			if(this.y-this.height/2<gameBoundaries.y) return "top";
			if(this.y+this.height/2>gameBoundaries.y+gameBoundaries.height) return "bottom";
			return false;
		}

		entity.debugRect=function(){
			var g=new createjs.Graphics();
			g.setStrokeStyle(3);
			g.beginStroke("#FF0000").rect(entity.x-entity.width/2+worldContainer.x,
										  entity.y-entity.height+worldContainer.y,
										  entity.width,entity.height);
			g.draw(stage.canvas.getContext("2d"));
		}

		return entity;
	}

	function Elder(){
		var elder=new Entity(1150,618,35,20,true);

		elder.body=new createjs.BitmapAnimation(new createjs.SpriteSheet(assets.getResult("elder")));
		elder.body.gotoAndPlay("idle");
		elder.addChild(elder.body);

		return elder;
	}

	function Player(x,y){
		var player=new Entity(x,y,35,20);

		player.body=new createjs.BitmapAnimation(new createjs.SpriteSheet(assets.getResult("player")));
		player.body.gotoAndPlay("idle_left");
		player.face="left";
		player.air=false;
		player.weaponList=[
			new Pistol(player),
			new Shotgun(player),
			new Uzi(player),
			new Flamethrower(player),
			new Bazooka(player)
		];

		player.weapon=player.weaponList[0];
		var ammoBar=new Statbar(-10,-70,30,5,player.weapon.ammo,player.weapon.max,"orange","#0C060E");
		player.addChild(player.body,player.weapon,ammoBar);

		

		player.health=100;
		var hurt=false;
		var stun=false;

		player.speedVector=[0,0];
		player.accelerationVector=[0,0];
		player.maxSpeed=10;

		player.colliding=false;

		
		var direction=[0,0];
		var goalSpeedVector=[0,0];

		player.fire=false;
		var mouseData;



		player.update=function(){




			ammoBar.value=this.weapon.ammo;
			ammoBar.max=this.weapon.max;
			if(this.weapon!=this.weaponList[0])
				ammoBar.update();
			else
				ammoBar.clear();


			if(!stun && storyline.plotStatus!="talking"){
			direction[0]=(keyMap.isDown(keyMap.d)?1:0)-(keyMap.isDown(keyMap.a)?1:0);
			direction[1]=(keyMap.isDown(keyMap.s)?1:0)-(keyMap.isDown(keyMap.w)?1:0);
			}
			else
				direction=[0,0];

			if(!direction[0] && !direction[1])
			{
				if(this.body.currentAnimation!="idle_"+this.face)
					this.body.gotoAndPlay("idle_"+this.face);

				if(!stun){
					this.speedVector[0]*=0.8;
					this.speedVector[1]*=0.8;
				}
				else{
					this.speedVector[0]*=0.93;
					this.speedVector[1]*=0.93;
				}

			}
			else{
				//this.face=!direction[0]?this.face:direction[0]>0?"right":"left";
				if(this.body.currentAnimation!="walk_"+this.face)
					this.body.gotoAndPlay("walk_"+this.face);
				
				goalSpeedVector[0]=player.maxSpeed*(direction[1]?direction[0]*0.9:direction[0]);
				goalSpeedVector[1]=player.maxSpeed*(direction[0]?direction[1]*0.8:direction[1]*0.9);


				this.speedVector[0]+=(goalSpeedVector[0]-this.speedVector[0])/20;
				this.speedVector[1]+=(goalSpeedVector[1]-this.speedVector[1])/20;
				
			}
			for(var i=0;i<5;i++){
				if(keyMap.isDown(keyMap[i+1])){
					
					this.removeChild(this.weapon);
					this.addChild(this.weaponList[i]);
					this.weapon=this.weaponList[i];

				}
			}


			this.weapon.update();

			if(keyMap.isDown(keyMap.spaceBar) && !this.air){
				this.air=true;
				this.collisionEnabled=false;

				createjs.Tween.get(this.body).to({y:this.body.y-100},300,createjs.Ease.quadOut).to({y:this.body.y},300,createjs.Ease.quadIn).call(function(){player.collisionEnabled=true}).wait(100).call(function(){player.air=false});
				createjs.Tween.get(this.weapon).to({y:this.weapon.y-100},300,createjs.Ease.quadOut).to({y:this.weapon.y},300,createjs.Ease.quadIn);
			}


			if(this.fire && !this.air && !hurt){

				this.weapon.shoot((this.face=="left"?this.x-10:this.x+10),this.y-20);

			}
				

			this.colliding=false;
			var cList=this.boxCollision(entitiesContainer,true);

			if(cList.length){
				this.colliding=cList.length;
				for(var i=0;i<cList.length;i++){
					if(cList[i].name!="prisoner" && cList[i].name!="enemyBullet" ) continue;
						
					if(!hurt){
						this.health-=cList[i].damage;
						hurt=true;
						//this.damagesfx();
						setTimeout(function(){hurt=false;stun=false;},500);
						

						if(cList[i].name=="enemyBullet")
							entitiesContainer.removeChild(cList[i]);
						else{
							stun=true;
							var l=Math.sqrt((this.x-cList[i].x)*(this.x-cList[i].x)+(this.y-cList[i].y)*(this.y-cList[i].y));
							this.speedVector[0]=10*(this.x-cList[i].x)/l;
							this.speedVector[1]=10*(this.y-cList[i].y)/l;
						}
							
						if(this.health<=0){
							entitiesContainer.removeChild(this);
							setTimeout(GameOver,1000);
							return;
						}
					}
				}
			}


			var BC=this.boundsCollision(backgroundContainer.boundaries);
			
			if(BC){
				switch(BC){
					case "left":
					this.speedVector[0]=5;
					break;
					case "right":
					this.speedVector[0]=-5;
					break;
					case "top":
					this.speedVector[1]=5;
					break;
					case "bottom":
					this.speedVector[1]=-5;
					break;

				}
			}

			this.x+=this.speedVector[0];
			this.y+=this.speedVector[1];

			//this.debugRect();
		}

		player.setFace=function(e){
			player.face=(e.stageX-worldContainer.x<=player.x?"left":"right");
		}

		player.mouseHandler=function(e)
			{
				e.onMouseUp=function(ev){
					player.fire=false;
					mouseData=ev;
				}
					player.fire=true;
					mouseData=e;
				e.onMouseMove=function(ev){
					player.fire=true;
					mouseData=ev;
				}
			}

		return player;
	}

	function Enemy(x,y,w,h,life){
		var enemy=new Entity(x,y,w,h,false);
		enemy.life=life;
		var hurt=false;


		enemy.update=function(){
			var cList=this.boxCollision(entitiesContainer,false);
			if(cList.length)

			
				if(cList.length)
					for(var i=0;i<cList.length;i++){
						if(cList[i].name=="playerBullet"){
							if(!hurt){
							this.life-=cList[i].damage;
							hurt=true;
							this.damagesfx();
							setTimeout(function(){hurt=false},1);
							}

							if(cList[i].shine)
								cList[i].shine();
							else
								entitiesContainer.removeChild(cList[i]);
							
						}
						if(this.life<=0){
							entitiesContainer.removeChild(this);
							foesNumber--;
							return;
						}
					}

			if(this.life>0)
				this.AI();
		}

		enemy.damagesfx=function(){
			var bubble=new createjs.Shape();
			bubble.graphics.beginFill("white").drawCircle(0,0,2);
			bubble.x=this.x-this.width/2+Math.random()*this.width;
			bubble.y=this.y-Math.random()*this.height;
			effectsContainer.addChild(bubble);

			createjs.Tween.get(bubble).to({scaleX:4,scaleY:4},200).to({scaleX:1/4,scaleY:1/4},200).call(function(){effectsContainer.removeChild(bubble)});
		}



		return enemy;
	}

	function Prisoner(x,y){
		var prisoner=new Enemy(x,y,90,100,200);

		prisoner.body=new createjs.BitmapAnimation(new createjs.SpriteSheet(assets.getResult("prisoner")));
		prisoner.body.gotoAndPlay("idle_left");
		var lifeBar=new Statbar(-40,-150,70,8,200,200,"#6CAB21","#0C060E");
		prisoner.addChild(prisoner.body,lifeBar);
		prisoner.name="prisoner";
		prisoner.speedVector=[0,0];
		prisoner.speed=3;

		prisoner.status="free"; 	//free: needs a destination; moving: GOING to destination; idle: stays in position
		prisoner.target=player;		//false if targetless
		prisoner.ranging=200;

		prisoner.idleTime=0;
		var boundaries=backgroundContainer.boundaries;
		var destination=[];
		var timer;

		prisoner.damage=10;

		prisoner.AI=function(){

			lifeBar.value=this.life;
			if(this.life<50)
				lifeBar.statColor="red";
			if(this.life<160)
				lifeBar.update();
			this.face=this.x<=player.x?"right":"left";

			switch (this.status){
				case "free":
				var x,y,a,b;
				a=this.target.x-this.ranging>boundaries.x?this.target.x-this.ranging:boundaries.x;
				b=this.target.x+this.ranging<boundaries.x+boundaries.width?this.target.x+this.ranging:boundaries.x+boundaries.width;
				x=Math.random()*(b-a)+a;
				a=this.target.y-this.ranging>boundaries.y?this.target.y-this.ranging:boundaries.y;
				b=this.target.y+this.ranging<boundaries.y+boundaries.height?this.target.y+this.ranging:boundaries.y+boundaries.height;
				y=Math.random()*(b-a)+a;
			
				setDestination(x,y,1);

				break;
				case "moving":
				if(this.body.currentAnimation!="walk_"+this.face)
				this.body.gotoAndPlay("walk_"+this.face);
				this.x+=this.speedVector[0];
				this.y+=this.speedVector[1];
				if(Math.abs(this.x-destination[0])<10 && Math.abs(this.y-destination[1])<10){
				this.status="idle";
				timer=createjs.Ticker.getTicks()+this.idleTime;
				this.speedVector=[0,0];
				}
				break;
				case "idle":
				if(this.body.currentAnimation!="idle_"+this.face)
					this.body.gotoAndPlay("idle_"+this.face);
				if(timer<createjs.Ticker.getTicks())
					this.status="free";
				break;
			}

			//this.debugRect();

		}

		function setDestination(x,y,time){
			var l=Math.sqrt((x-prisoner.x)*(x-prisoner.x)+(y-prisoner.y)*(y-prisoner.y));
			prisoner.speedVector=[prisoner.speed*(x-prisoner.x)/l,prisoner.speed*(y-prisoner.y)/l];
			prisoner.idleTime=time;
			destination=[x,y];
			prisoner.status="moving";
		}


		return prisoner;
	}

	function Minion(x,y){

		var minion=new Enemy(x,y,35,30,50);

		minion.body=new createjs.BitmapAnimation(new createjs.SpriteSheet(assets.getResult("minion")));
		minion.body.gotoAndPlay("idle_left");
		var lifeBar=new Statbar(0,-100,30,5,50,50,"#6CAB21","#0C060E");
		minion.addChild(minion.body,lifeBar);

		minion.speedVector=[0,0];
		minion.speed=6;
		minion.damage=1;
		minion.status="free"; 	//free: needs a destination; moving: GOING to destination; idle: stays in position
		minion.target=player;		//false if targetless
		minion.ranging=400;
		minion.weapon=new Weapon(minion,10000000,400);
		minion.idleTime=0;
		var boundaries=backgroundContainer.boundaries;
		var destination=[];
		var timer;
		//var firefrequency=Math.random()*50+100;
		minion.AI=function(){

			lifeBar.value=this.life;
			if(this.life<25)
				lifeBar.statColor="red";
			if(this.life<30)
				lifeBar.update();
			this.face=this.x<=player.x?"right":"left";

			switch (this.status){
				case "free":
				var x,y,a,b;
				a=this.target.x-this.ranging>boundaries.x?this.target.x-this.ranging:boundaries.x;
				b=this.target.x+this.ranging<boundaries.x+boundaries.width?this.target.x+this.ranging:boundaries.x+boundaries.width;
				x=Math.random()*(b-a)+a;
				a=this.target.y-this.ranging>boundaries.y?this.target.y-this.ranging:boundaries.y;
				b=this.target.y+this.ranging<boundaries.y+boundaries.height?this.target.y+this.ranging:boundaries.y+boundaries.height;
				y=Math.random()*(b-a)+a;
			
				setDestination(x,y,60);

				break;
				case "moving":
				if(this.body.currentAnimation!="walk_"+this.face)
				this.body.gotoAndPlay("walk_"+this.face);
				this.x+=this.speedVector[0];
				this.y+=this.speedVector[1];
				if(Math.abs(this.x-destination[0])<10 && Math.abs(this.y-destination[1])<10){
				this.status="idle";
				timer=createjs.Ticker.getTicks()+this.idleTime;
				this.speedVector=[0,0];
				}
				break;
				case "idle":
				if(this.body.currentAnimation!="idle_"+this.face)
					this.body.gotoAndPlay("idle_"+this.face);
				if(timer<createjs.Ticker.getTicks()){
					this.status="free";
					this.weapon.shoot(minion.target.x,minion.target.y);
				}
				break;
			}

			//this.debugRect();

		}

		function setDestination(x,y,time){
			var l=Math.sqrt((x-minion.x)*(x-minion.x)+(y-minion.y)*(y-minion.y));
			minion.speedVector=[minion.speed*(x-minion.x)/l,minion.speed*(y-minion.y)/l];
			minion.idleTime=time;
			destination=[x,y];
			minion.status="moving";
		}

		minion.weapon.sendPresent=function(dir){
			var bullet=new Entity(minion.x+dir[0]*25,minion.y-20+dir[1]*25 +Math.random()*10,10,10);

			bullet.body=new createjs.Shape();
			bullet.speed=10;

			bullet.life=createjs.Ticker.getTicks()+50;
			bullet.body.graphics.beginFill("#0C060E").drawCircle(0,-bullet.height/2,5);
			bullet.addChild(bullet.body);
			bullet.name="enemyBullet";
			bullet.damage=3;

			entitiesContainer.addChild(bullet);

			bullet.update=function(){
				if(this.life<createjs.Ticker.getTicks()){
					entitiesContainer.removeChild(this);
					return;
				}
				//this.debugRect();
				this.x+=this.speed*dir[0];
				this.y+=this.speed*dir[1];

			}
		}




		return minion;
	}

	function Pistol(owner){
		var pistol=new Weapon(owner,10000000,10000000,400,"pistol");		//lazy way to say infinite bullets


		pistol.sendPresent=function(dir){
			
			var bullet=new Entity(owner.x+dir[0]*25,owner.y-20+dir[1]*25 +Math.random()*10,10,10);

			bullet.body=new createjs.Shape();
			bullet.speed=15+Math.abs(owner.speedVector[0]*dir[0]>0?owner.speedVector[0]:0);

			bullet.life=createjs.Ticker.getTicks()+50;
			bullet.body.graphics.beginFill("white").drawCircle(0,-bullet.height/2,Math.random()*3+3);
			bullet.addChild(bullet.body);
			bullet.name="playerBullet";
			bullet.damage=1;

			entitiesContainer.addChild(bullet);

			bullet.update=function(){
				if(this.life<createjs.Ticker.getTicks()){
					entitiesContainer.removeChild(this);
					return;
				}
				//this.debugRect();
				this.x+=this.speed*dir[0];
				this.y+=this.speed*dir[1];

				

			}

		}

		return pistol;
	}

	function Shotgun(owner){
		var shotgun=new Weapon(owner,200,200,800,"shotgun");

		shotgun.sendPresent=function(dir){
			
			for(var i=0;i<80;i++){
				var bullet=new Entity(owner.x+dir[0]*(13),owner.y-10,5,5);
				//var dy=dir[1] + i*0.2-9.8;
				bullet.dy=-2+i*0.04;
				bullet.body=new createjs.Shape();
				bullet.speed=6+Math.random()*5+Math.abs(owner.speedVector[0]*dir[0]>0?owner.speedVector[0]:0);
				bullet.life=createjs.Ticker.getTicks()+22;
				bullet.body.graphics.beginFill("white").drawCircle(0,-bullet.height/2,Math.random()*3+10);
				createjs.Tween.get(bullet).wait(100).to({scaleX:1/4,scaleY:1/4},250);
				bullet.addChild(bullet.body);
				entitiesContainer.addChild(bullet);
				bullet.name="playerBullet";
				bullet.damage=5;

				bullet.update=function(){

					if(this.life<createjs.Ticker.getTicks()){
						entitiesContainer.removeChild(this);
						return;
					}
					//this.debugRect();
					this.x+=this.speed*dir[0];
					this.y+=this.dy;
					this.speed*=0.95;
				}
			}

		}

		return shotgun;
	}

	function Uzi(owner){
		var uzi=new Weapon(owner,2000,2000,5,"uzi");

		uzi.sendPresent=function(dir){
			
			var bullet=new Entity(owner.x+dir[0]*25,owner.y-20+dir[1]*25 +Math.random()*10,10,10);

			bullet.body=new createjs.Shape();
			bullet.speed=15+Math.abs(owner.speedVector[0]*dir[0]>0?owner.speedVector[0]:0);
			bullet.life=createjs.Ticker.getTicks()+20;
			bullet.body.graphics.beginFill("white").drawCircle(0,-bullet.height/2,Math.random()*3+3);
			bullet.addChild(bullet.body);
			bullet.name="playerBullet";
			bullet.damage=1;

			entitiesContainer.addChild(bullet);

			bullet.update=function(){

				if(this.life<createjs.Ticker.getTicks()){
					entitiesContainer.removeChild(this);
					return;
				}
				//this.debugRect();
				this.x+=this.speed*dir[0];
				this.y+=this.speed*dir[1];

				

			}

		}

		return uzi;
	}

	function Flamethrower(owner){
		var flamethrower=new Weapon(owner,1000,1000,5,"flamethrower");

		flamethrower.sendPresent=function(dir){
			
			var bullet=new Entity(owner.x+dir[0]*25,owner.y-26	+dir[1]*25 +Math.random()*26,10,10);
			var d=dir[1]+Math.random()*0.5-0.25;
			bullet.body=new createjs.Shape();
			bullet.speed=14+Math.abs(owner.speedVector[0]*dir[0]>0?owner.speedVector[0]:0);
			bullet.life=createjs.Ticker.getTicks()+15;
			bullet.body.graphics.beginFill("white").drawCircle(0,-bullet.height/2,Math.random()*2+5);
			createjs.Tween.get(bullet).to({scaleX:3,scaleY:3},100).to({scaleX:1/3,scaleY:1/3},200);
			bullet.addChild(bullet.body);
			bullet.name="playerBullet";
			//"hsl("+(Math.random()*50)+",100%,"+(Math.random()*40+40)+"%)"
			bullet.damage=2;


			entitiesContainer.addChild(bullet);

			bullet.update=function(){

				if(this.life<createjs.Ticker.getTicks()){
					entitiesContainer.removeChild(this);
					return;
				}
				//this.debugRect();
				this.x+=this.speed*dir[0];
				this.y+=this.speed*d;
			}

			

		}

		return flamethrower;
	}

	function Bazooka(owner){
		var bazooka=new Weapon(owner,80,80,800,"bazooka");

		bazooka.sendPresent=function(dir){
			
			var bullet=new Entity(owner.x+dir[0]*45,owner.y-5+dir[1]*25,30,30);

			bullet.body=new createjs.Shape();
			bullet.speed=20+Math.abs(owner.speedVector[0]*dir[0]>0?owner.speedVector[0]:0);
			bullet.exploding=false;
			bullet.life=createjs.Ticker.getTicks()+100;
			bullet.body.graphics.beginFill("white").drawCircle(0,-bullet.height/2,10);
			bullet.addChild(bullet.body);
			bullet.name="playerBullet";
			bullet.damage=20;
			bullet.trailSpawn=setInterval(function(){bubble(entitiesContainer,3,2,0,0,10,200)},5);


			entitiesContainer.addChild(bullet);

			bullet.shine=function(){
				if(this.exploding) return;
				this.speed=0;
				clearInterval(this.trailSpawn);
				for(var i=0;i<20;i++){
					bubble(effectsContainer,3,10,Math.random()*30-15,Math.random()*30-15,30,600);
				}
				this.exploding=true;
				
				bullet.damage=5;
				this.width*=8;
				this.height*=4;
				this.body.regY=-10;
				createjs.Tween.get(this.body).
				//call(function(){bullet.colliding=true}).
				wait(30).
				call(function(){bullet.colliding=false}).
				to({scaleX:3,scaleY:3},200).
				to({scaleX:1/10,scaleY:1/10},300).
				call(function(){entitiesContainer.removeChild(bullet)});
			}

			bullet.update=function(){

				if(this.life<createjs.Ticker.getTicks()){
					entitiesContainer.removeChild(this);
					clearInterval(bullet.trailSpawn);
					return;
				}
				//this.debugRect();
				this.x+=this.speed*dir[0];
				this.y+=this.speed*dir[1];

			}

			function bubble(container,base,variation,speedX,speedY,life,fading){

				var bubble=new Entity(bullet.x,bullet.y-20+Math.random()*10,1,1,true);
				bubble.body=new createjs.Shape();
				bubble.speed=[speedX,speedY];
				bubble.life=createjs.Ticker.getTicks()+life;
				bubble.body.graphics.beginFill("white").drawCircle(0,-bubble.height/2,Math.random()*variation+base);
				bubble.addChild(bubble.body);

				createjs.Tween.get(bubble).to({scaleX:1/20,scaleY:1/20},fading);

				container.addChild(bubble);

				bubble.update=function(){
					if(this.life<createjs.Ticker.getTicks()){
					container.removeChild(this);
					return;
					}

					if(this.speed[0]||this.speed[1]){
						this.x+=this.speed[0];
						this.y+=this.speed[1];
						this.speed=[this.speed[0]*0.8,this.speed[1]*0.8];
					}
				}
			}

		}

		return bazooka;
	}
	
	function Weapon(owner,ammo,max,frequency,name){

		//DEFINES GENERAL FEATURES OF A PLAYER AND/OR ENEMY WEAPON
		//ALSO DEFINES HIT AREA , SHAPE , SIZE AND MOVEMENT
		
		var weapon;
		if(name)
			weapon=new createjs.BitmapAnimation(new createjs.SpriteSheet(assets.getResult("weapons")));
		else
			weapon={};


		weapon.y=-15;
		weapon.name=name;
		weapon.ammo=ammo;
		weapon.max=max;
		weapon.ready=true;



		weapon.shoot=function(x,y){
			if(!weapon.ready || this.ammo<=0) return;
			var f=owner.face=="left"?1:-1;
			createjs.Tween.get(this).to({x:this.x+10*f},frequency/6).to({x:this.x},frequency/6);
			var l=Math.sqrt((x-owner.x)*(x-owner.x)+(y+20-owner.y)*(y+20-owner.y));

			this.sendPresent([(x-owner.x)/l,(y+20-owner.y)/l]);
			weapon.ready=false;
			this.ammo--;
			setTimeout(function(){weapon.ready=true},frequency)
		}

		weapon.update=function(){
			if(this.currentAnimation!=this.name+"_"+owner.face)
				this.gotoAndPlay(this.name+"_"+owner.face);
		}

		return weapon;						
	}

	function sorter(child1,child2){
		if(child1.y>child2.y)
			return 1;
		if(child1.y<child2.y)
			return -1;
		return 0;
	}

	function Statbar(x,y,w,h,max,value,stColor,bgColor,borderWidth){
		var barContainer=new createjs.Container();
		barContainer.backgroundColor=bgColor;
		barContainer.statColor=stColor;
		barContainer.borderWidth=borderWidth;
		barContainer.max=max;
		barContainer.value=value;
		var stat=new createjs.Shape();
		var background=new createjs.Shape();

		barContainer.addChild(background,stat);
		
		barContainer.clear=function(){
			background.graphics.clear();
			stat.graphics.clear();
		}

		barContainer.update=function(){

			if(this.value<0)this.value=0;

			background.graphics.clear().beginFill(this.backgroundColor).rect(0,0,w,h);
			background.x=x;
			background.y=y;
			
			stat.graphics.clear().beginFill(this.statColor).rect(0,0,w*this.value/this.max,h);
			stat.x=x;
			stat.y=y;
		}
		//barContainer.update();
		return barContainer;
	}

	function UIManager(){

		var uimanager=new createjs.Container();
		var currentWeapon=new createjs.Text("","20px arial","white");
		currentWeapon.x=790;
		currentWeapon.y=470;
		currentWeapon.textAlign="right";
		var score=new createjs.Text("0","20px arial","white");
		score.x=790;
		score.y=10;
		score.textAlign="right";
		var level=new createjs.Text("0","20px arial","white");
		level.x=10;
		level.y=10;
		var healthBar=new Statbar(40,450,200,20,100,100,"green","black");
		UIContainer.addChild(score,level,currentWeapon,healthBar);

		uimanager.update=function(){
			healthBar.value=player.health;
			healthBar.update();
			currentWeapon.text=player.weapon.name;
			level.text=foesNumber;
			score.text=storyline.plotStatus;

		}

		return uimanager;
	}

	function Storyline(){
		var storyline={};
		var status="paused";
		var plot;
		var index=0;
		var timeIndex=0;
		storyline.plotStatus="calm";		//calm, hostile , stopSpawn,  bonus , boss
		storyline.level=1;
		var dialogs;
		var currentDialog,dialogIndex;
		var dialogBox=new createjs.Bitmap(assets.getResult('dialogBox'));
		dialogBox.x=320;
		dialogBox.y=10;
		var currentText=new createjs.Text("","bold 12px arial","black");
		currentText.x=350;
		currentText.y=25;
		currentText.lineWidth=330;


		this.tKeyPressed;
		storyline.play=function(){
			//index++;
			timeIndex=createjs.Ticker.getTicks()+(plot[index].time|| 0);
			status="play";
		}

		storyline.next=function(){
			//index++;
			console.log(index);
			timeIndex=createjs.Ticker.getTicks()+(plot[index].time|| 0);
			status="next";
		}

		storyline.wait=function(){
			status="paused";
		}

		storyline.startLevel=function(param){
			storyline.plotStatus="hostile";
			
			this.play();
		}

		storyline.endLevel=function(){
			storyline.plotStatus="stopSpawn";
			this.wait();
		}

		storyline.spawn=function(param){

			for(var i in param){
				
				for(var j=0;j<param[i];j++){
					foesNumber++;
					if(i=="minion")
						entitiesContainer.addChild(new Minion(Math.random()*2350+50,Math.random()*780+720));
					if(i=="prisoner")
						entitiesContainer.addChild(new Prisoner(Math.random()*2350+50,Math.random()*780+720));
				}
			}
		}

		storyline.talk=function(param){
			currentDialog=dialogs[param.dialog];
			dialogIndex=0;
			currentText.text=currentDialog[dialogIndex].speaker+" :\n "+currentDialog[dialogIndex].text;
			UIContainer.addChild(dialogBox,currentText);
			this.plotStatus="talking";
		}


		storyline.getPlot=function(p){
			plot=p.timeline;
			dialogs=p.dialogs;
		//	console.log(dialogs);
		}

		storyline.setPlotStatus=function(param){
			this.plotStatus=param.val;
		}

		storyline.update=function(){

			if(this.plotStatus!="calm" && this.plotStatus=="stopSpawn" && !foesNumber ){
				this.plotStatus="calm";
				this.level++;
			}

			if(this.plotStatus=="talking"){
				if(keyMap.isDown(keyMap.t) && !this.tKeyPressed){
					this.tKeyPressed=true;
					dialogIndex++;
					//console.log(dialogIndex);
					if(dialogIndex>=currentDialog.length){
						UIContainer.removeChild(dialogBox,currentText);
						this.next();
						return;
					}
					else
						currentText.text=currentDialog[dialogIndex].speaker+" :\n "+currentDialog[dialogIndex].text;
				}
				if(!keyMap.isDown(keyMap.t) && this.tKeyPressed){
					this.tKeyPressed=false;
				}
			}

			if(status=="paused"|| index>=plot.length) return;


			if(createjs.Ticker.getTicks()>=timeIndex){
				
				var p=plot[index];
				console.log(p.action);
				this[p.action](p.parameters||null);
				//console.log(index);
				

				if(status!="play"){
					status="pause";
					return;
				}
				index++;
				timeIndex=createjs.Ticker.getTicks()+(plot[index].time|| 0);
				
			}
		}

		return storyline;
	}

	//#############################
	//##########GAME SCENES########
	//#############################

	function Play(){

		backgroundContainer.addChild(new createjs.Bitmap(assets.getResult('backgroundImg')));
		backgroundContainer.boundaries=new createjs.Rectangle(0,700,2400,800);

		player=new Player(1400,720);
		elder=new Elder();
		talkButton=new createjs.Bitmap(assets.getResult('talkButton'));
		talkButton.x=50;
		talkButton.y=-50;
		elder.addChild(talkButton);

		entitiesContainer.addChild(player,elder);

		stage.onPress=player.mouseHandler;
		stage.onMouseMove=player.setFace;


		camera=new Camera(worldContainer,400,400,backgroundContainer.boundaries);

		infContainer.addChild(gameContainer);

		storyline=new Storyline();
		
		storyline.getPlot(assets.getResult("gameRules"));
		storyline.play();

		uimanager=new UIManager();
		gameStatus="Play";
		//setTimeout(GameOver,1000);
	}

	function GameOver(){
		var mainText=new createjs.Text("GAME OVER","40px arial","white");
		mainText.textAlign="center";
		mainText.x=400;
		mainText.y=250;
		var subText=new createjs.Text("press R to restart","20px arial","white");
		subText.textAlign="center";
		subText.x=400;
		subText.y=290;
		UIContainer.addChild(mainText,subText);
		gameStatus="GameOver";

	}

	function NewGame(){
		var curtain=new createjs.Shape();
		curtain.graphics.beginFill("#0C060E").rect(0,0,800,500);
		curtain.alpha=0;
		supContainer.addChild(curtain);
		createjs.Tween.get(curtain).to({alpha:1},500).
		call(function(){
			entitiesContainer.removeAllChildren();
			backgroundContainer.removeAllChildren();
			UIContainer.removeAllChildren();
			effectsContainer.removeAllChildren();
			Play();
		}).wait(500).
		to({alpha:0},500).
		call(function(){
			supContainer.removeChild(curtain);	
		});
	}
}

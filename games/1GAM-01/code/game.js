//GAME CODED BY KANNAS ( ALIAS WATACOSO) DURING LUDUM DARE 25


jaws.onload=function()				//LOAD ASSETS;	START GAME 
{
	var info=document.getElementById("info");
	
	jaws.assets.add(["assets/sprites/p1.png","assets/sprites/p2.png","assets/sprites/p3.png","assets/sprites/p4.png","assets/sprites/p5.png"]);
	jaws.assets.add("assets/sprites/goblinT.png");
	jaws.assets.add("assets/sprites/kidT.png");
	jaws.assets.add("assets/sprites/copT.png");
	jaws.assets.add("assets/sprites/goat.png");
	jaws.assets.add("assets/sprites/superCandyT.png","assets/sprites/bullet.png");
	jaws.assets.add("assets/sprites/candies.png");
	jaws.assets.add("assets/sprites/lifes.png");
	
	jaws.assets.add("assets/sprites/startPage.png");
	jaws.assets.add("assets/sprites/win.png");
	jaws.assets.add("assets/sprites/lose.png");
	
	jaws.start(intro);
};

function game()
{
	var landscape;						//PARALLAX						
	var entities  ;						//SPRITELIST
	
	//GAME DEFINITION
	
	
	var ready=true;
	var counter=0;
	var score;
	var lifeBar;
	
	var kid_ready=true;
	var cop_ready=true;
	var goat_ready=true;
	var throw_ready=true;
	var nCandies=0;
	var nHearts=20;
				
						//GOAL
	
	this.setup=function()
	{
		landscape=new jaws.Parallax({repeat_x:true});
		landscape.addLayer({image:"assets/sprites/p5.png",damping:20});
		landscape.addLayer({image:"assets/sprites/p4.png",damping:10});
		landscape.addLayer({image:"assets/sprites/p3.png",damping:6});
		landscape.addLayer({image:"assets/sprites/p2.png",damping:4});
		landscape.addLayer({image:"assets/sprites/p1.png",damping:2});
		

        entities  = jaws.SpriteList();		//SPRITELIST
        score= new jaws.Sprite({image:"assets/sprites/candies.png", x:500,y:10,anchor:"top_left"});
        lifeBar= new jaws.Sprite({image:"assets/sprites/lifes.png", x:0,y:10,anchor:"top_left"});
        
     	entities.push(new Goblin(60,370));
       // entities.push(new Kid(590,370));
		
		
	}
	

	this.update= function()
	{
		if(nCandies>=50)
			{	
				jaws.switchGameState(win);
			}
			
		if(nHearts==0)
			{
				jaws.switchGameState(lose);
			}
		//VIEW//
		landscape.camera_x += 5;
		
		
	
		
		timer();
 	
 	if(counter!=0)
 	{
 		if(counter%3==0 && kid_ready)
 		{
 			kid_ready=false;
 			entities.push(new Kid(590,Math.random()*128+306));
 			setTimeout(function(){kid_ready=true},1000);
 		}
 			
 		if(counter%10==0 && cop_ready )
 		{
 			cop_ready=false;
 			entities.push(new Cop(Math.random()/2+(counter/100 <6?counter/100:6),Math.random()*500/counter+ 200));
 			setTimeout(function(){cop_ready=true},1000);
 		}
 		
 		if(counter%(Math.round(Math.random())*50+50)==0 && goat_ready )
 		{
 			goat_ready=false;
 			entities.push(new Goat(590,Math.random()*128+306));
 			setTimeout(function(){goat_ready=true},1000);
 		}
	}
 
 		//COLLISIONS MANAGEMENT//
 		
 		
 		
		//ENTITIES MANAGEMENT//
		
		
		
		
		entities.sort(function(a,b){return a.sprite.y - b.sprite.y});
		entities.update();
		
		entities.removeIf(destroyedOrOutsideCanvas);

	
	}
	
	this.draw=function()
	{
		landscape.draw();
		score.draw();
		lifeBar.draw();
		jaws.context.font="bold 10px sans-serif";
		jaws.context.fillText(nCandies+"/50",555,40);
		jaws.context.fillText(nHearts,60,40);
		
		entities.draw();
	}
	
	
	//ENTITIES DEFINITION//
	
	
	
	
	function Goblin(x,y)
	{
		this.sprite= new jaws.Sprite({image:"assets/sprites/goblinT.png", x:x, y:y, anchor:"center_bottom",flipped: true});
		this.core=jaws.Rect(this.sprite.x-this.sprite.width/2,this.sprite.y,this.sprite.width,-this.sprite.height/4);
		this.life=50;
		this.update= function()
		{
			
			
			 for(var el=0; el<entities.length; el++)
				if(jaws.collideOneWithOne(this.sprite,entities.at(el).sprite) )
				if(entities.at(el).constructor.name=="Cop" || entities.at(el).constructor.name=="Goat" || entities.at(el).constructor.name=="Bullet" )
				{
					entities.at(el).destroy=true;
					nHearts--;
					
				}
				else if(entities.at(el).constructor.name=="Kid" && !entities.at(el).robbed)
				{
					nCandies++;
					entities.at(el).robbed=true;
				}

		
			
			if(jaws.pressed("w")){this.sprite.y -= 3;}
			if(jaws.pressed("s")){this.sprite.y += 3;}
			if(jaws.pressed("d")){this.sprite.x += 2;}
			if(jaws.pressed("a")){this.sprite.x -= 2;}
			
			//jaws.on_keydown("space",this.throwSuperCandy);
			
			if(jaws.pressed("space")){this.throwSuperCandy();}
			if(jaws.mouse_x>this.sprite.x) 
				 this.sprite.flipped= false;
			else
				 this.sprite.flipped=  true;
				 
				 this.core.moveTo(this.sprite.x-this.sprite.width/2,this.sprite.y);	
	
			forceInsideRoad(this.sprite);
			
			
		
		}
		
		this.draw= function()
		{
			this.sprite.draw();
			//this.core.draw();
		}
		

		
		this.throwSuperCandy= function()
		{
				if(nCandies>=5 && throw_ready)
				{
					entities.push(new Candy(this.sprite.x ,this.sprite.y- this.sprite.height/2, this.sprite.flipped));
					throw_ready=false;
					nCandies-=5;
					setTimeout(function(){throw_ready=true},2000);
				}
		}
	}
	
	
	function Kid(x,y)
	{
		this.sprite= new jaws.Sprite({image:"assets/sprites/kidT.png",x:x,y:y,anchor:"center_bottom"})
		this.core=new jaws.Rect(this.sprite.x-this.sprite.width/2,this.sprite.y,this.sprite.width,-this.sprite.height/4);
		this.robbed=false;
		this.update= function()
		{
			
			
			if(this.robbed)
			{
			//this.sprite.image="assets/sprites/kidT.png"
			this.sprite.x -= 4;
			this.core.move(-4,0);
			}
			else
			{
			this.sprite.x -= 2;
			this.core.move(-2,0);
			}
			
		}
		
		this.draw= function()
		{
			
			this.sprite.draw();
			//this.core.draw();
		}
	}
	
	
	function Candy(x,y,forward)
	{
		this.sprite= new jaws.Sprite({image:"assets/sprites/superCandyT.png",x:x,y:y,anchor:"center"})
		this.core=new jaws.Rect(this.sprite.x-this.sprite.width/2,this.sprite.y+this.sprite.height/2,this.sprite.width,-this.sprite.height/4);
		this.sprite.flipped= forward;
		this.speed=6;
		this.destroy=false;
		this.update= function()
		{
			
			for(var el=0; el<entities.length; el++)
				if(jaws.collideOneWithOne(this.sprite,entities.at(el).sprite) )
				if(entities.at(el).constructor.name=="Cop" || entities.at(el).constructor.name=="Goat" || entities.at(el).constructor.name=="Bullet" )
				{
					entities.at(el).destroy=true;
					//this.destroy=true;
				}
			
			if(this.sprite.flipped)
			{
			this.sprite.x -= this.speed;
			this.core.move(-this.speed,0);
			}
			else
			{
			this.sprite.x += this.speed;
			this.core.move(this.speed,0);
			}
			
		    
			
		}
		
		this.draw= function()
		{
			
			this.sprite.draw();
		//	this.core.draw();
			
		}
		

	}
	

	function  Cop(speed,fireRate)
	{

		this.sprite= new jaws.Sprite({image:"assets/sprites/copT.png",x:10,y:370,anchor:"center_bottom"})
		this.core=jaws.Rect(this.sprite.x-this.sprite.width/2,this.sprite.y,this.sprite.width,-this.sprite.height/4);
		this.speed=speed;
		this.fireRate=fireRate;
		this.shoot_ready=0;
		this.fv=0;
		this.destroy=false;
		this.update= function()
		{
			if(this.shoot_ready>=this.fireRate)
				this.shoot();
			
				this.shoot_ready++;
				
			
			this.sprite.x += 1/30;
			this.fv +=speed/10;
			this.sprite.y=64*Math.sin(this.fv)+370;
			
			
			

		    this.core.moveTo(this.sprite.x-this.sprite.width/2,this.sprite.y);
		    
			this.shoot= function()
			{
					entities.push(new Bullet(this.sprite.x,this.sprite.y- this.sprite.height/2));
					this.shoot_ready=0;
			}
			
		}
		
		this.draw= function()
		{
			
			this.sprite.draw();
		//	this.core.draw();
		}
	}
	
	function Bullet(x,y)
	{
		this.sprite=jaws.Sprite({image:"assets/sprites/bullet.png",x:x,y:y,anchor:"bottom_center"})
		this.core=jaws.Rect(this.sprite.x-this.sprite.width/2,this.sprite.y,this.sprite.width,-this.sprite.height/4);
		this.destroy=false;
		this.update= function()
		{

			this.sprite.x += 4;
			
		   this.core.move(4,0);
			
		}
		
		this.draw= function()
		{
			
			this.sprite.draw();
		//	this.core.draw();
			
		}
	}
	
	function Goat(x,y)
	{
		this.sprite= new jaws.Sprite({image:"assets/sprites/goat.png",x:x,y:y,anchor:"bottom_center"})
		this.core=jaws.Rect(this.sprite.x-this.sprite.width/2,this.sprite.y,this.sprite.width,-this.sprite.height/4);
		this.destroy=false;
		this.update= function()
		{
		   this.sprite.x -= 7;
		   this.core.move(-7,0);	
		}
		
		this.draw= function()
		{
			
			this.sprite.draw();
		//	this.core.draw();
			
		}
	}
	


	function forceInsideRoad (item)
		{	
			if(item.y>434)item.y=434;
			if(item.y<306)item.y=306;
			if(item.x<item.width/2) item.x=item.width/2;
			if(item.x>jaws.width -item.width/2) item.x=jaws.width -item.width/2;
		}
		
    function destroyedOrOutsideCanvas(item) 
	 	{  
	 		 return (item.sprite.x < 0 || item.sprite.y < 0 || item.sprite.x > jaws.width || item.sprite.y > jaws.height || item.destroy==true) 
	 	}
	 	
	function timer()
	 	{
	 		if(ready)
		{
			counter++;
			ready=false;
			setTimeout(function(){ready=true},1000);
			
		}
	 	}

	
}










function intro()
{
	var bg;
	this.setup=function()
	{
		//jaws.on_keydown("space",function(){jaws.switchGameState(game)});
		bg=jaws.Sprite({image:"assets/sprites/startPage.png",x:0,y:0,anchor:"top_left"})
	}
	
	this.update=function()
	{
		if(jaws.pressed("space"))
			jaws.switchGameState(game);
	}
	
	this.draw=function()
	{	 bg.draw();
	}
}

function lose()
{
var bg;
	this.setup=function()
	{
			bg=jaws.Sprite({image:"assets/sprites/lose.png",x:0,y:0,anchor:"top_left"})
	}
	this.draw=function()
	{	 bg.draw();

	}
}

function win()
{
	var bg;
	this.setup=function()
	{
			bg=jaws.Sprite({image:"assets/sprites/win.png",x:0,y:0,anchor:"top_left"})
	}
	

	
	this.draw=function()
	{	 bg.draw();

	}
}





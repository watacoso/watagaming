main();

function main(){
    //some parameters//
    var stage,assets,status,scale=1;
    var keyMap,keyBusy;
    var gameC;
    var cloudsContainer,
        propsContainer,
        banditsContainer,
        uiContainer,
        curtain;

    var leftBandit,rightBandit,sun;

    var timePivot;

    var someoneShot=false;

    var nothingNew=false;


    var windSound;

    var background;

    //core functions//
    init();

    function init(){

        stage=new createjs.Stage("GAME");
        resizeWindow();
        createjs.Touch.enable(stage);
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", update);

        gameC=new createjs.Container();
        cloudsContainer=new createjs.Container();
        propsContainer=new createjs.Container();
        banditsContainer=new createjs.Container();
        uiContainer=new createjs.Container();
        curtain=new createjs.Container();
        stage.addChild(gameC,curtain,uiContainer);

        //background=new createjs.Shape();
        //background.graphics.beginFill("#0C060E").drawRect(0,0,stage.getBounds().width,stage.getBounds().height);
        //stage.addChild(background);

        window.addEventListener('keyup', function(event) { keyMap.onKeyup(event); }, false);
        window.addEventListener('keydown', function(event) { keyMap.onKeydown(event); }, false);

        window.addEventListener('resize', resizeWindow, false);
        //window.addEventListener('orientationchange', resizeGame, false);

        window.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

        assets= new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        createjs.MotionGuidePlugin.install();

        var manifest=[
            {src:"assets/sounds/reverseBell.ogg", id:"reverseBell"},
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
            {src:"assets/sprites/actors/rightBandit.json", id:"rightBandit"}

        ];
        stage.on("mousedown",handleClick);


        load(manifest,menu);
    }



    function load(manifest,handleLoadingComplete){
        status="loading";
        assets.off("complete",function(){load(manifest,menu);},false);
        var txt=new createjs.Text("Loading","14px Geo","white");
        txt.align="center";
        txt.x=stage.getBounds().width/2;
        txt.y=stage.getBounds().height/2;
        txt.regX=txt.getBounds().width/2;
        txt.regY=txt.getBounds().height/2;


        createjs.Tween.get(txt,{loop:true}).to({x:txt.x+2},500).to({x:txt.x-4},1000).to({x:txt.x},500);

        var loadingBar=new createjs.Shape();
        loadingBar.x=stage.getBounds().width/2;
        loadingBar.y=stage.getBounds().height/2+20;
        loadingBar.regX=100;


        uiContainer.addChild(txt,loadingBar);

        assets.on("fileload", handleFileLoad);
        assets.on("complete", handleComplete);
        assets.on("progress", handleProgress);

        function handleProgress(e){

            //console.log(e);
        }

        function handleComplete(){
            uiContainer.removeChild(txt,loadingBar);
            clear();
            handleLoadingComplete();
        }
        function handleFileLoad(){
            loadingBar.graphics.clear().beginFill("white").rect(0,0,200*assets.progress,10);
        }

        if (manifest.length) {
            assets.loadManifest(manifest);
        } else {
            handleLoadingComplete();
        }
    }

    function resizeWindow() {
        var gameArea = document.getElementById('gameArea');

        var ow=800;
        var oh=200;
        var widthToHeight = ow / oh;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;

        if (newWidthToHeight > widthToHeight)
            newWidth = newHeight * widthToHeight;
        else
            newHeight = newWidth / widthToHeight;

        scale = Math.min(newWidth / ow, newHeight / oh);

        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';

        gameArea.style.marginTop = (-newHeight / 2) + 'px';
        gameArea.style.marginLeft = (-newWidth / 2) + 'px';

        stage.canvas.width = newWidth;
        stage.canvas.height = newHeight;
        stage.scaleX=stage.scaleY=scale;
        stage.setBounds(0,0,ow,oh);

    }

    keyMap = {
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


    function update () {

        switch(status){
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
                    status="10Seconds";
                    console.log(status);
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
                    status="bulletHell";
                    timePivot=createjs.Ticker.getTime();
                }
                //console.log(status);

                if(status=="bulletHell" && !rightBandit.dead && !rightBandit.pulledGunOut && createjs.Ticker.getTime()-timePivot>rightBandit.delay){
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
        stage.update();
    }

    function handleClick(){
        switch(status){
            case "Menu":
                flash();
                break;
            case "waitForStart":
                uiContainer.removeAllChildren();
                timePivot=createjs.Ticker.getTime();
                keyBusy=true;
                status="10Seconds";
                console.log(status);
                break;
            case "10Seconds":
            case "bulletHell":
                if(!keyBusy && !leftBandit.dead  && !leftBandit.pulledGunOut)
                    leftBandit.drawGun();
                else if(!keyMap.isDown(keyMap.s))
                    keyBusy=false;
                if(createjs.Ticker.getTime()-timePivot>10000){
                    status="bulletHell";
                    timePivot=createjs.Ticker.getTime();
                }
                break;
            case "GameOver":
                clear();
                menu();
                break;
        }
    }

    function clearC(container,recursive){
        if(recursive)
            for(var i=0;i<container.getNumChildren();i++){
                if(container.getChildAt(i).constructor.name=="Container")
                    clearC(container.getChildAt(i),true);
            }
        container.removeAllChildren();
    }

    function clear(){
        gameC.removeAllChildren();
        gameC.y=0;
        uiContainer.removeAllChildren();
        //uiContainer.removeAllChildren();
        banditsContainer.removeAllChildren();
        leftBandit=rightBandit=sun=null;
        someoneShot=keyBusy=false;
    }

    //ACTORS//

    function Bandit(side,x,y){
        var bandit=new createjs.Sprite(new createjs.SpriteSheet(assets.getResult(side+'Bandit')),"idle");
        bandit.x=x;
        bandit.y=y;
        bandit.framerate=10;


        bandit.pulledGunOut=false;
        bandit.shot=false;
        bandit.dead=false;
        bandit.delay=0;

        bandit.update=function(){

            if(someoneShot && !this.shot && !this.dead){
                this.die();
            }

            if(status=="GameOver"){
                this.undrawGun();
            }
        };


        bandit.on("animationend",function(e){

            switch(e.name){
                case "draw":
                    if(status=="bulletHell" && Math.abs(rightBandit.delay-leftBandit.delay)<20){
                        leftBandit.gotoAndPlay("afterShoot");
                        rightBandit.gotoAndPlay("afterShoot");
                        status="draw";
                        setTimeout(GameOver,1000);
                    }
                    else{
                        bandit.shoot();
                    }
                    break;
                case "undraw":
                    bandit.gotoAndPlay("idle");
                    break;
                case "shoot":
                    bandit.gotoAndPlay("afterShoot");
                    break;
                case "die":
                    bandit.stop();
                    setTimeout(GameOver,1000);
                    break;

            }

        });

        bandit.drawGun=function(){
            if(this.pulledGunOut) return;
            createjs.Sound.play("pullGun",createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
            bandit.gotoAndPlay("draw");
            console.log("draw");
            if(status=="bulletHell"){
                bandit.delay=Math.floor(createjs.Ticker.getTime()-timePivot);
                console.log(bandit.delay);
            }
            this.pulledGunOut=true;

        };

        bandit.undrawGun=function(){
            if(!this.dead){
                createjs.Sound.play("pullGun",createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
                this.gotoAndPlay("undraw");
                console.log("undraw");
            }
        };

        bandit.shoot=function(){
            someoneShot=this.shot=true;
            console.log("shoot");
            createjs.Sound.play("gunShoot"+Math.ceil(Math.random()*3),createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
            bandit.gotoAndPlay("shoot");
        };

        bandit.die=function(){
            if(status!="bulletHell")
                status="cheater";
            else
                status="fairGame";
            bandit.gotoAndPlay("die");
            console.log("dead");
            bandit.dead=true;
        };



        return bandit;
    }


    //SCENARIOS//

    function menu(){
        status="Loading";

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
        txt.x=stage.getBounds().width/2;
        txt.y=stage.getBounds().height/2;
        txt.textAlign="center";
        txt.alpha=0;
        var title=new createjs.Bitmap(assets.getResult('title'));
        title.alpha=0;
        title.regX=title.regY=title.getBounds().width/2;
        title.x=stage.getBounds().width/2;
        title.y=stage.getBounds().height/2;
        uiContainer.addChild(txt);
        uiContainer.addChild(title);

        if(nothingNew){
            txt.font="15px Geo";
            txt.y+=70;
            txt.text="Touch Title to Start";
            createjs.Tween.get(title).to({alpha:1},1000);
            createjs.Tween.get(txt).to({alpha:1},500).call(function(){status="Menu";console.log(status);});
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
                txt.font="15px Geo";
                txt.y+=70;
                txt.text="Touch Screen to Start";
                nothingNew=true;
                createjs.Tween.get(title).to({alpha:1},1000);
                createjs.Tween.get(txt).wait(1000).to({alpha:1},500).call(function(){status="Menu";console.log(status);});

            });
        console.log(status);
    }

    function flash(){
        createjs.Sound.play("reverseBell",createjs.Sound.INTERRUPT_ANY, 0, 0, 0, 1, 0);
        var light=new createjs.Shape();
        light.graphics.beginFill("#FFFFFF").rect(0,0,800,600);
        light.alpha=0;
        uiContainer.addChild(light);
        createjs.Tween.get(uiContainer.getChildAt(0)).to({alpha:0},4000);
        createjs.Tween.get(uiContainer.getChildAt(1)).wait(6000).to({alpha:0},1000);
        createjs.Tween.get(light).wait(8000).to({alpha:1},3000).call(function(){
            InitGame();
        }).to({alpha:0},300).call(function(){
                uiContainer.removeAllChildren();
            });
        status="Flash";
        console.log(status);
    }

    function InitGame(){

        var terrain=new createjs.Bitmap(assets.getResult('terrain'));
        sun=new createjs.Bitmap(assets.getResult('sun'));
        sun.x=380;
        sun.y=70;
        sun.regX=sun.regY=60;
        sun.update=function(){
            sun.x+=0.1;
        };
        leftBandit=Bandit("left",100,480);
        rightBandit=Bandit("right",700,480);
        rightBandit.delay=Math.random()*500+500;
        banditsContainer.addChild(leftBandit,rightBandit);
        gameC.addChild(terrain,sun,propsContainer,banditsContainer);
        createjs.Tween.get(gameC).wait(2000).to({y:-400},10000).call(waitForStart);
        status="intro";
        console.log(status);
    }

    function waitForStart(){
        var txt = new createjs.Text("Touch Screen", "50px Geo", "#ffffff");
        txt.textAlign="center";
        txt.x=400;
        txt.y=100;
        uiContainer.addChild(txt);
        status="waitForStart";
        console.log(status);
    }

    function GameOver(){
        leftBandit.undrawGun();
        rightBandit.undrawGun();
        var message,quote;
        if(status=="draw"){
            message="The wise";
            quote="Nothing in life is to be feared, it is only to be understood.\n Now is the time to understand more, so that we may fear less.\n Marie Curie";
        }
        else if(leftBandit.dead){
            message="The honorable man";
            quote="'Good men don't become legends', he said quietly.\n'Good men don't need to become legends.' She opened her eyes, looking up at him.\n 'They just do what's right anyway.' \nBrandon Sanderson, The Well of Ascension"
        }
        else if(status=="cheater"){
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
        dQuote.y=70;
        dQuote.alpha=0;
        var dRetry=new createjs.Text("Touch to restart", "15px Geo", "#ffffff");
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
        createjs.Tween.get(dRetry).wait(5000).to({alpha:1},500).call(function(){status="GameOver"});
        //createjs.Tween.get(uiContainer.getChildAt(0)).wait(3500).to({alpha:1},4000);

    }

    /*
    function startGame(){
        background=new createjs.Shape();
        background.graphics.beginFill("#0C060E").drawRect(0,0,stage.getBounds().width,stage.getBounds().height);
        cog=new createjs.Bitmap(assets.getResult("cog"));
        cog.x=stage.getBounds().width/2;
        cog.y=stage.getBounds().height/2;
        cog.regX=cog.getBounds().width/2;
        cog.regY=cog.getBounds().height/2;
        createjs.Tween.get(cog,{loop:true}).to({rotation:360},6000);
        //stage.on("click",moveCog);
        gameC.addChild(background,cog);
        status="level";

        function moveCog(e){
           // cog.x= e.stageX/scale;
           // cog.y= e.stageY/scale;
            console.log(e.stageX+" "+ e.stageY);
            createjs.Tween.removeTweens(cog);
            createjs.Tween.get(cog,{loop:true}).to({rotation:cog.rotation+360},6000);
            createjs.Tween.get(cog).to({x: e.stageX/scale,y: e.stageY/scale},1000,createjs.Ease.cubicInOut);
        }
    }
    */
}
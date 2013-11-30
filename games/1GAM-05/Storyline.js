function Storyline(){
	var storyline;
	var status="paused";
	var plot;
	var index=0;
	var timeIndex=0;

	var play=function(){
		status="play";
	}

	this.wait=function(){
		status="pause";
	}

	storyline.spawn=function(param){
		for(var i in param){
			for(var i=0;i<param[i];i++)
			if(i=="minion")
				entitiesContainer.addChild(new Minion())
		}
	}


	storyline.getPlot=function(p){
		plot=p.timeLine;
	}

	storyline.update=function(){
		if(status="paused"|| index>=plot.length) return;

		if(createjs.Ticker.getTicks()>=timeIndex){
			var p=plot[index];
			this[p.action](p.parameters||null);
			timeIndex=createjs.Ticker.getTicks()+p.time;
			index++;
		}
	}
}
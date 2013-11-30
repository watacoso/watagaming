
//various utilities

	function Parallax(rectX,rectY,rectW,rectH,horizzontal){
		var C=new createjs.Container();

		var H=horizzontal;
		var masterSpeed=1;

		C.isHorizzontal=function(){
			return H;
		}

		C.setMasterSpeed=function(s){
			masterSpeed=s;
		}

		C.addLayer=function(img,offset,speed){
			var layer=new createjs.Container();
			img=new createjs.Bitmap(img);
			img.scaleX=img.scaleY=4;
			layer.speed=speed;
			img.x=offset;
			img.y=offset;

			layer.addChild(img);
			
			if(H){
				img.x=rectX;
				layer.imgWidth=img.image.width*4;
			

				var indexImg=img;
				while(indexImg.x+layer.imgWidth<rectX+rectW){
					indexImg=indexImg.clone();
					indexImg.x+=layer.imgWidth;
					layer.addChild(indexImg);
					
				}
			}
			else{
				img.y=rectY;
				layer.imgHeight=img.image.height;

				var indexImg=img;

				while(indexImg.y+layer.imgHeight-rectY<rectH){
					
					indexImg=indexImg.clone();
					indexImg.y+=layer.imgHeight;
					layer.addChild(indexImg);
					
				}
			}

			C.addChild(layer);
		}

		C.setLayerSpeed=function(layerIndex,speed){
			C.getChildAt(layerIndex).speed=speed;
		}

		C.update=function(){
			for(var i=0;i<C.getNumChildren();i++){
				var layer=C.getChildAt(i);
				for(var j=0;j<layer.getNumChildren();j++){
				var k=layer.speed*masterSpeed>0?layer.getNumChildren()-j-1:j;
					var e=layer.getChildAt(k);
					if(H){
						e.x+=layer.speed*masterSpeed;
						if(layer.speed*masterSpeed>0){
							if(k==0 && e.x>rectX-20){
								var newImg=e.clone();
								newImg.x-=layer.imgWidth;
								layer.addChildAt(newImg,0);
							}
							if(k==layer.getNumChildren()-1 && e.x>rectX+rectW+20){
								layer.removeChildAt(k);
								console.log(layer.getNumChildren());
							}
						}
						else if(layer.speed*masterSpeed<0){
							if(k==0 && e.x+layer.imgWidth<rectX-20){
								layer.removeChildAt(0);	
							}
							if(k==layer.getNumChildren()-1 && e.x+layer.imgWidth<rectX+rectW+20){
								var newImg=e.clone();
								newImg.x+=layer.imgWidth+3*layer.speed;
								layer.addChild(newImg);
							}
						}			
					}
					else{
						e.y+=layer.speed*masterSpeed;

						if(layer.speed*masterSpeed>0){
							if(k==0 && e.y>rectY-20){
								var newImg=e.clone();
								newImg.y-=layer.imgHeight;
								layer.addChildAt(newImg,0);

							}
							if(k==layer.getNumChildren()-1 && e.y>rectY+rectH+20){
								layer.removeChildAt(k);
								console.log(layer.getNumChildren());
							}
						}
						else if(layer.speed*masterSpeed<0){
							if(k==0 && e.y+layer.imgHeight<rectY-20){
								layer.removeChildAt(0);	
							}
							if(k==layer.getNumChildren()-1 && e.y+layer.imgHeight<rectY+rectH+20){
								var newImg=e.clone();
								newImg.y+=layer.imgHeight+3*layer.speed;
								layer.addChild(newImg);
							}
						}
					}
				}
			}
		}
		return C;
	}	




function Shape(ctx){
    this.id = undefined;
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.middlePos = {x: undefined,y: undefined};
    this.color = undefined;
    this.selectedFlag = false;
    Object.defineProperties(this,{
        ctx:{value:ctx},
    });
}

Shape.prototype.set = function(stx,sty,edx,edy,color = this.color){
    this.startPos.x=stx;
    this.startPos.y=sty;
    this.endPos.x=edx;
    this.endPos.y=edy;
    this.color = color;
}
Shape.prototype.draw = function(){
    if(this.notComplete())return;
    this.ctx.strokeStyle = this.color;
    this.calcDimensions();
    this.drawShape();
    if(this.selectedFlag)
        this.selected();
}
Shape.prototype.drawShape = function(){
    throw new Error("Generic shape does not have drawShape");
}
Shape.prototype.getCode = function(){
    throw new Error("Generic shape does not have getCode");
}
Shape.prototype.notComplete = function(){
    return ( this.startPos.x == undefined ||
        this.startPos.y == undefined ||
        this.endPos.x == undefined ||
        this.endPos.y == undefined);
}
Shape.prototype.mouseDist = function(){
    let dist = [{x:0 ,y:0},{x:0 ,y:0},{x:0 ,y:0}];
    dist[0].x = Math.abs(this.startPos.x - mousePos.x);
    dist[0].y = Math.abs(this.startPos.y - mousePos.y);
    dist[1].x = Math.abs(this.endPos.x - mousePos.x);
    dist[1].y = Math.abs(this.endPos.y - mousePos.y);
    dist[2].x = Math.abs(this.middlePos.x - mousePos.x);
    dist[2].y = Math.abs(this.middlePos.y - mousePos.y);

    dist.sort((a,b) => (a.x + a.y) - (b.x + b.y));
    return Math.sqrt(dist[0].x**2 + dist[0].y**2);
}
Shape.prototype.hover = function(){ //needs some work
    let s = gridCell/5;
    if(s<4)s=4;
    let dist = this.mouseDist();
    if(dist < s){
        let p = new Rectangle(this.ctx);
        p.set(this.startPos.x -s,this.startPos.y -s,this.endPos.x+s,this.endPos.y+s,"blue")
        p.draw();
        p = new Rectangle(this.ctx);
        p.set(this.startPos.x -s,this.startPos.y -s,this.startPos.x +s,this.startPos.y +s,"blue");
        p.draw();
        p = new Rectangle(this.ctx);
        p.set(this.endPos.x -s,this.endPos.y -s,this.endPos.x +s,this.endPos.y +s,"blue");
        p.draw();
        p = new Rectangle(this.ctx);
        p.set(this.startPos.x -s,this.endPos.y -s,this.startPos.x +s,this.endPos.y +s,"blue");
        p.draw();
        p = new Rectangle(this.ctx);
        p.set(this.endPos.x -s,this.startPos.y -s,this.endPos.x +s,this.startPos.y +s,"blue");
        p.draw();
        p = new Rectangle(this.ctx);
        p.set(this.middlePos.x -s,this.middlePos.y -s,this.middlePos.x +s,this.middlePos.y +s,"blue");
        p.draw();
    }
    if(dist < s)
        return true;
    return false;
}
Shape.prototype.selected = function(){
    let s = gridCell/5;
    if(s<4)s=4;
    let p = new Rectangle(this.ctx);
    p.set(this.startPos.x -s,this.startPos.y -s,this.endPos.x+s,this.endPos.y+s,"red")
    p.draw();
    p = new Rectangle(this.ctx);
    p.set(this.startPos.x -s,this.startPos.y -s,this.startPos.x +s,this.startPos.y +s,"red");
    p.draw();
    p = new Rectangle(this.ctx);
    p.set(this.endPos.x -s,this.endPos.y -s,this.endPos.x +s,this.endPos.y +s,"red");
    p.draw();
    p = new Rectangle(this.ctx);
    p.set(this.startPos.x -s,this.endPos.y -s,this.startPos.x +s,this.endPos.y +s,"red");
    p.draw();
    p = new Rectangle(this.ctx);
    p.set(this.endPos.x -s,this.startPos.y -s,this.endPos.x +s,this.startPos.y +s,"red");
    p.draw();
    p = new Rectangle(this.ctx);
    p.set(this.middlePos.x -s,this.middlePos.y -s,this.middlePos.x +s,this.middlePos.y +s,"red");
    p.draw();
}
Shape.prototype.calcDimensions = function(){
    this.middlePos.x = (this.startPos.x+this.endPos.x)/2;
    this.middlePos.y = (this.startPos.y+this.endPos.y)/2;
}

function Line(ctx){
    Shape.call(this,ctx);
}
Line.prototype = Object.create(Shape.prototype,{
    drawShape:{
        value(){
                this.ctx.beginPath();
                this.ctx.moveTo(this.startPos.x, this.startPos.y);
                this.ctx.lineTo(this.endPos.x, this.endPos.y);
                this.ctx.stroke();
        }
    },
    getCode:{
        value(){
            if(this.notComplete())return "";
            return '//Line:\nctx.strokeStyle = "'+this.color+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.moveTo('+this.startPos.x+', '+this.startPos.y+');\n'+
                'ctx.lineTo('+this.endPos.x+', '+this.endPos.y+');\n'+
                'ctx.stroke();\n';
        }
    },
    mouseDist:{
        value(){
            let deltax = this.startPos.x - this.endPos.x;
            let deltay = this.startPos.y - this.endPos.y;
            //inside the surrounding rectangle
            let dist1x = Math.abs(mousePos.x-this.middlePos.x ) - Math.abs(deltax)/2;
            let dist1y = Math.abs(mousePos.y-this.middlePos.y ) - Math.abs(deltay)/2;
            let dist1 = Math.max(dist1x,dist1y);
            //on the line itself (satisfy the line equation)
            let dist2 = Math.abs(deltax * (this.startPos.y - mousePos.y) - 
                deltay * (this.startPos.x - mousePos.x)) /Math.sqrt(deltax**2+deltay**2);
            return Math.max(dist2,dist1);
            }
    },
    constructor:{
        value: Line
    }
});

function Rectangle(ctx){
    Shape.call(this,ctx);
}
Rectangle.prototype = Object.create(Shape.prototype,{
    drawShape:{
        value(){
            let dim = this.calcDimensions();
            this.ctx.strokeStyle = this.color;
            this.ctx.beginPath();
            this.ctx.rect(dim.x,dim.y,dim.w,dim.h);
            this.ctx.stroke();
        }
    },
    getCode:{
        value(){
            if(this.notComplete())return "";
            let dim = this.calcDimensions();
            return '//Rectangle:\nctx.strokeStyle = "'+this.color+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.rect('+dim.x+','+dim.y+','+dim.w+','+dim.h+');\n'+
                'ctx.stroke();\n';
        }
    },
    calcDimensions:{
        value(){
            Shape.prototype.calcDimensions.call(this);
            let x = Math.min(this.startPos.x,this.endPos.x);
            let y = Math.min(this.startPos.y,this.endPos.y);
            let w = Math.max(this.startPos.x,this.endPos.x) - x;
            let h = Math.max(this.startPos.y,this.endPos.y) - y;
            return {x,y,w,h};
        }
    },
    mouseDist:{
        value(){
            let distx=0,disty=0;
            distx = Math.abs(mousePos.x-this.middlePos.x ) - Math.abs(this.startPos.x-this.endPos.x)/2;
            disty = Math.abs(mousePos.y-this.middlePos.y ) - Math.abs(this.startPos.y-this.endPos.y)/2;
            return Math.abs(Math.max(distx,disty));
        }
    },
    constructor:{
        value: Rectangle
    }
});

function Circle(ctx){
    Shape.call(this,ctx);
}
Circle.prototype = Object.create(Shape.prototype,{
    drawShape:{
        value(){
            let dim = this.calcDimensions();
            this.ctx.beginPath();
            this.ctx.arc(dim.x, dim.y, dim.r, 0, 2*Math.PI);
            this.ctx.stroke();
        }
    },
    getCode:{
        value(){
            if(this.notComplete())return "";
            let dim = this.calcDimensions();
            return '//Circle:\nctx.strokeStyle = "'+this.color+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.arc('+dim.x+','+dim.y+','+dim.r+', 0, 2*Math.PI);\n'+
                'ctx.stroke();\n';
        }
    },
    calcDimensions:{
        value(){
            Shape.prototype.calcDimensions.call(this);
            let x = this.middlePos.x;
            let y = this.middlePos.y;
            let r = Math.sqrt((x - this.endPos.x)**2 + (y - this.endPos.y)**2);
            return {x,y,r};
        }
    },
    mouseDist:{
        value(){
            let dx = this.middlePos.x - mousePos.x;
            let dy = this.middlePos.y - mousePos.y;
            return Math.abs(Math.sqrt(dx**2 + dy**2) - this.calcDimensions().r);
        }
    },
    constructor:{
        value: Circle
    }
});
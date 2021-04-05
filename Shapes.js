


function Shape(ctx){
    this.id = undefined;
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.color = undefined;
    this.selectedFlag = false;
    Object.defineProperties(this,{
        ctx:{value:ctx}
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
    let dist = {x:0 ,y:0};
    dist.x = Math.abs(this.startPos.x - mousePos.x);
    dist.y = Math.abs(this.startPos.y - mousePos.y);
    let dist2 = {x:0 ,y:0};
    dist2.x = Math.abs(this.endPos.x - mousePos.x);
    dist2.y = Math.abs(this.endPos.y - mousePos.y);
    if(dist.x+dist.y<dist2.x+dist2.y)
        return dist;
    return dist2;
}
Shape.prototype.hover = function(){
    let s = gridCell/5;
    if(s<4)s=4;
    let dist = this.mouseDist();
    if(dist.x < s*2 && dist.y < s*2){
        let p = new Rectangle(this.ctx);
        p.set(this.startPos.x -s,this.startPos.y -s,this.startPos.x +s,this.startPos.y +s,"blue");
        p.draw();
        p = new Rectangle(this.ctx);
        p.set(this.endPos.x -s,this.endPos.y -s,this.endPos.x +s,this.endPos.y +s,"blue");
        p.draw();
    }
    if(dist.x < s && dist.y < s)
        return true;
    return false;
}
Shape.prototype.selected = function(){
    let s = gridCell/5;
    if(s<4)s=4;
    let p = new Rectangle(this.ctx);
    p.set(this.startPos.x -s,this.startPos.y -s,this.startPos.x +s,this.startPos.y +s,"red");
    p.draw();
    p = new Rectangle(this.ctx);
    p.set(this.endPos.x -s,this.endPos.y -s,this.endPos.x +s,this.endPos.y +s,"red");
    p.draw();
}

function Line(ctx){
    Shape.call(this,ctx);
}
Line.prototype = Object.create(Shape.prototype,{
    drawShape:{
        value: function(){
                this.ctx.beginPath();
                this.ctx.moveTo(this.startPos.x, this.startPos.y);
                this.ctx.lineTo(this.endPos.x, this.endPos.y);
                this.ctx.stroke();
        }
    },
    getCode:{
        value: function(){
            if(this.notComplete())return "";
            return '//Line:\nctx.strokeStyle = "'+this.color+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.moveTo('+this.startPos.x+', '+this.startPos.y+');\n'+
                'ctx.lineTo('+this.endPos.x+', '+this.endPos.y+');\n'+
                'ctx.stroke();\n';
        }
    },
    constructor:{
        value: Line
    }
});
//Line.prototype.constructor = Line;

function Rectangle(ctx){
    Shape.call(this,ctx);
}
Rectangle.prototype = Object.create(Shape.prototype,{
    drawShape:{
        value: function(){
            let dim = this.calcDimensions();
            this.ctx.strokeStyle = this.color;
            this.ctx.beginPath();
            this.ctx.rect(dim.x,dim.y,dim.w,dim.h);
            this.ctx.stroke();
        }
    },
    getCode:{
        value: function(){
            if(this.notComplete())return "";
            let dim = this.calcDimensions();
            return '//Rectangle:\nctx.strokeStyle = "'+this.color+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.rect('+dim.x+','+dim.y+','+dim.w+','+dim.h+');\n'+
                'ctx.stroke();\n';
        }
    },
    calcDimensions:{
        value: function(){
            let x = Math.min(this.startPos.x,this.endPos.x);
            let y = Math.min(this.startPos.y,this.endPos.y);
            let w = Math.max(this.startPos.x,this.endPos.x) - x;
            let h = Math.max(this.startPos.y,this.endPos.y) - y;
            return {x,y,w,h};
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
        value: function(){
            let dim = this.calcDimensions();
            this.ctx.beginPath();
            this.ctx.arc(dim.x, dim.y, dim.r, 0, 2*Math.PI);
            this.ctx.stroke();
        }
    },
    getCode:{
        value: function(){
            if(this.notComplete())return "";
            let dim = this.calcDimensions();
            return '//Circle:\nctx.strokeStyle = "'+this.color+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.arc('+dim.x+','+dim.y+','+dim.r+', 0, 2*Math.PI);\n'+
                'ctx.stroke();\n';
        }
    },
    calcDimensions:{
        value: function(){
            let x = this.startPos.x;
            let y = this.startPos.y;
            let r = Math.sqrt((x - this.endPos.x)**2 + (y - this.endPos.y)**2);
            return {x,y,r};
        }
    },
    constructor:{
        value: Circle
    }
});
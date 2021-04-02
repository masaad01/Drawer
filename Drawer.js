let count=0;
let mousePos = {x:0 , y:0};
let gridCell = 30;
let gridFlag = true;
Object.defineProperties(mousePos,{
    xGrid:{
        get: function(v){
            if(gridCell <= 0 || !gridFlag)
                return this.x;
            return Math.round(this.x/gridCell)*gridCell;
        }
    },
    yGrid:{
        get: function(v){
            if(gridCell <= 0 || !gridFlag)
                return this.y;
            return Math.round(this.y/gridCell)*gridCell;
        }
    }
});

function Line(ctx){
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.draw = function(){
        if( this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined
            )return;
        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.endPos.x, this.endPos.y);
        ctx.stroke();
    }
}
function Rectangle(ctx){
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};

    const calcDimensions = function(){
        let x = Math.min(this.startPos.x,this.endPos.x);
        let y = Math.min(this.startPos.y,this.endPos.y);
        let w = Math.max(this.startPos.x,this.endPos.x) - x;
        let h = Math.max(this.startPos.y,this.endPos.y) - y;
        return {x,y,w,h};
    }
    this.draw = function(){
        if( this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined
            )return;
            let dim = calcDimensions.bind(this)();
            ctx.beginPath();
            ctx.rect(dim.x,dim.y,dim.w,dim.h);
            ctx.stroke();
    }
}
function Circle(ctx){
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};

    const calcDimensions = function(){
        let x = this.startPos.x;
        let y = this.startPos.y;
        let r = Math.sqrt((x - this.endPos.x)**2 + (y - this.endPos.y)**2);
        return {x,y,r};
    }
    this.draw = function(){
        if( this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined
            )return;
            let dim = calcDimensions.bind(this)();
            ctx.beginPath();
            ctx.arc(dim.x, dim.y, dim.r, 0, 2*Math.PI);
            ctx.stroke();
    }
}
function Drawer(ctx){
    let shapes = [];
    let deleted = [];
    this.demoStartP = undefined;
    this.type = undefined;
    const typeConstructor = {
        Line: () => new Line(ctx),
        Rectangle: () => new Rectangle(ctx),
        Circle: () => new Circle(ctx)
    }
    
    Object.defineProperties(this,{
        shapes: {get: () => shapes}
    })

    this.penDown = function(startP){
        shapes.push(typeConstructor[this.type]()); 
        
        let l = shapes.length;       
        shapes[l-1].startPos = startP;
    }
    this.penUp = function(endP){
        let l = shapes.length;
        shapes[l-1].endPos = endP;
        shapes[l-1].draw();
    }
    this.demo = function(startP,endP = mousePos){
        let shape = typeConstructor[this.type]();
        
        shape.startPos = startP;
        shape.endPos = endP;
        shape.draw();   
    }
    this.undo = function(){
        if(shapes.length > 0)
            deleted.push(shapes.pop());
    }
    this.redo = function(){
        if(deleted.length > 0)
            shapes.push(deleted.pop());
    }
    this.reset = function(){
        shapes = [];
        deleted = [];
        this.demoStartP = undefined;
        this.type = undefined;
    }
}
function DrawerGUI(){
    //private vars
    let canvas , mainSection,ctx;
    const input = {
        type: undefined, undo: undefined , redo: undefined, 
        reset: undefined, grid:{size: undefined, flag: undefined}
    };
    //public vars
    this.app = "";
    //private methods
    const creatElements = function(){
        let body = document.body;
        body.innerHTML = "";

        let container = htmlCreator("div",body,"container","");
        mainSection = htmlCreator("div",container,"mainSec","view");
        let scoreSection = htmlCreator("div",container,"scoreSec","view");
        let controlsSection = htmlCreator("div",container,"controlsSec","view");

        htmlCreator("label",controlsSection,"","gridSpan6","click and drag to draw");

        htmlCreator("label",controlsSection,"","gridSpan2","Shape: ");
        input.type = htmlCreator("select",controlsSection,"","inputList gridSpan4")
        htmlCreator("option",input.type,"","","Line");
        htmlCreator("option",input.type,"","","Rectangle");
        htmlCreator("option",input.type,"","","Circle");
        
        htmlCreator("label", controlsSection, "", "gridSpan2", "Snap: ").title = "snap pen to grid";
        input.grid.flag = htmlCreator("input", controlsSection, "","inputCheckbox ");
        input.grid.flag.type = "checkbox";
        input.grid.flag.checked = gridFlag;
        input.grid.size = htmlCreator("input", controlsSection, "","inputNumber gridSpan2");
        input.grid.size.type = "number";    
        input.grid.size.min = "10";
        input.grid.size.max = "100";
        input.grid.size.value = gridCell;
        htmlCreator("label", controlsSection, "", "", "px");

        input.undo = htmlCreator("button",controlsSection,"","button gridSpan3","Undo");
        input.redo = htmlCreator("button",controlsSection,"","button gridSpan3","Redo");
        input.reset = htmlCreator("button",controlsSection,"","button gridSpan6","Clear All");

        canvas = htmlCreator("canvas" ,mainSection);
        canvas.height = mainSection.offsetHeight ;
        canvas.width = mainSection.offsetWidth;

    }
    const addEvents = function(){
        let self = this;

        window.addEventListener("mousemove",function(event){
            mousePos.x = event.x;
            mousePos.y = event.y;
            if(self.app.demoStartP != undefined){
                self.display(0);
                self.app.demo(self.app.demoStartP,{x:mousePos.xGrid,y:mousePos.yGrid});
            }
        });
        canvas.addEventListener("mousedown", function(event){
            if(event.button == 0){   //left mouse button
                self.app.penDown({x:mousePos.xGrid,y:mousePos.yGrid});
                self.app.demoStartP = {x:mousePos.xGrid,y:mousePos.yGrid};
            }
        });
        window.addEventListener("mouseup", function(event){
            if(self.app.demoStartP != undefined && event.button == 0){
                self.app.penUp({x:mousePos.xGrid,y:mousePos.yGrid});
                self.app.demoStartP = undefined;
            }
        });
        window.addEventListener("resize",function(){
            canvas.height = mainSection.offsetHeight ;
            canvas.width = mainSection.offsetWidth;
            self.display(0);
        });
        input.type.addEventListener("change",function(){self.app.type = this.value;})
        input.undo.addEventListener("click", function(){self.app.undo();self.display.bind(self)(0);});
        input.redo.addEventListener("click", function(){self.app.redo();self.display.bind(self)(0);});
        input.reset.addEventListener("click", function(){self.reset();});
        input.grid.size.addEventListener("change",function(){gridCell = this.value;self.display.bind(self)(0);})
        input.grid.flag.addEventListener("change",function(){gridFlag = this.checked;self.display.bind(self)(0);})
    }
    const clearCanvas = function(){
        let size = {x: canvas.width/gridCell , y: canvas.height/gridCell};
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        ctx.globalAlpha = 0.2;
        for(let i=0;i<size.y+1;i++){
            ctx.beginPath();
            ctx.moveTo(0, i * gridCell);
            ctx.lineTo(gridCell * size.x, i * gridCell);
            ctx.stroke();
        }
        for(let i=0;i<size.x+1;i++){
            ctx.beginPath();
            ctx.moveTo(i * gridCell, 0);
            ctx.lineTo(i * gridCell, gridCell * size.y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    //public methods
    this.start = function(){
        creatElements.bind(this)();
        ctx = canvas.getContext("2d");

        
        this.app = new Drawer(ctx);
        clearCanvas.bind(this)();
        addEvents.bind(this)();
        this.reset();
    }
    this.display = function(){
        clearCanvas.bind(this)();
        for(let i=0,l=this.app.shapes.length;i<l;i++)
            this.app.shapes[i].draw();        
    }
    this.reset = function(){
        this.app.reset();
        this.app.type = input.type.value;
        this.display(0);
    }
}

function Array2d(x,y,value = undefined){
    let arr = [];
    for(let i=0;i<x;i++){
        arr[i] = [];
        for(let j=0;j<y;j++)
            arr[i][j]=value;
    }
    return arr;
}
function htmlCreator(tag,parent,id="",clss="",inHTML=""){
    let t = document.createElement(tag);
    parent.appendChild(t);
    t.id = id;
    t.className = clss;
    t.innerHTML = inHTML;

    return t;
}
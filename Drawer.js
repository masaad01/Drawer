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
    this.id = undefined;
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.color = undefined;

    this.draw = function(){
        if(this.notComplete())return;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.startPos.x, this.startPos.y);
        ctx.lineTo(this.endPos.x, this.endPos.y);
        ctx.stroke();
    }
    this.getCode = function(){
        if(this.notComplete())return "";
        return `//Line:\nctx.strokeStyle = "${this.color}";
ctx.beginPath();
ctx.moveTo(${this.startPos.x}, ${this.startPos.y});
ctx.lineTo(${this.endPos.x}, ${this.endPos.y});
ctx.stroke();\n`;
    }
    this.notComplete = function(){
        return ( this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined);
    }
    this.mouseDist = function(){
        let dist = {x:0 ,y:0};
        dist.x = Math.abs(this.startPos.x - mousePos.x);
        dist.y = Math.abs(this.startPos.y - mousePos.y);
        return dist;
    }
}
function Rectangle(ctx){
    this.id = undefined;
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.color = undefined;

    const calcDimensions = function(){
        let x = Math.min(this.startPos.x,this.endPos.x);
        let y = Math.min(this.startPos.y,this.endPos.y);
        let w = Math.max(this.startPos.x,this.endPos.x) - x;
        let h = Math.max(this.startPos.y,this.endPos.y) - y;
        return {x,y,w,h};
    }
    this.draw = function(){
        if(this.notComplete())return;
            let dim = calcDimensions.bind(this)();
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.rect(dim.x,dim.y,dim.w,dim.h);
            ctx.stroke();
    }
    this.getCode = function(){
        if(this.notComplete())return "";
        let dim = calcDimensions.bind(this)();
        return `//Rectangle:\nctx.strokeStyle = "${this.color}";
ctx.beginPath();
ctx.rect(${dim.x},${dim.y},${dim.w},${dim.h});
ctx.stroke();\n`;
    }
    this.notComplete = function(){
        return ( this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined);
    }
    this.mouseDist = function(){
        let dist = {x:0 ,y:0};
        dist.x = Math.abs(this.startPos.x - mousePos.x);
        dist.y = Math.abs(this.startPos.y - mousePos.y);
        return dist;
    }
}
function Circle(ctx){
    this.id = undefined;
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.color = undefined;

    const calcDimensions = function(){
        let x = this.startPos.x;
        let y = this.startPos.y;
        let r = Math.sqrt((x - this.endPos.x)**2 + (y - this.endPos.y)**2);
        return {x,y,r};
    }
    this.draw = function(){
        if(this.notComplete())return;
            let dim = calcDimensions.bind(this)();
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(dim.x, dim.y, dim.r, 0, 2*Math.PI);
            ctx.stroke();
    }
    this.getCode = function(){
        if(this.notComplete())return "";
        let dim = calcDimensions.bind(this)();
        return `//Circle:\nctx.strokeStyle = "${this.color}";
ctx.beginPath();
ctx.arc(${dim.x}, ${dim.y}, ${dim.r}, 0, 2*Math.PI);
ctx.stroke();\n`;
    }
    this.notComplete = function(){
        return ( this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined);
    }
    this.mouseDist = function(){
        let dist = {x:0 ,y:0};
        dist.x = Math.abs(this.startPos.x - mousePos.x);
        dist.y = Math.abs(this.startPos.y - mousePos.y);
        return dist;
    }
}
function Drawer(ctx){
    let shapes = [];
    let deleted = [];
    this.demoStartP = undefined;
    this.type = undefined;
    this.color = undefined;
    this.nearest = undefined;
    this.selected = undefined;
    const typeConstructor = {
        Line: () => new Line(ctx),
        Rectangle: () => new Rectangle(ctx),
        Circle: () => new Circle(ctx)
    }
    
    Object.defineProperties(this,{
        shapes: {get: () => shapes}
    });

    this.penDown = function(startP){
        deleted.splice(0);
        shapes.push(typeConstructor[this.type]()); 
        
        let l = shapes.length;
        shapes[l-1].id = l-1;
        shapes[l-1].color = this.color;
        shapes[l-1].startPos = startP;
        return shapes[l-1];
    }
    this.penUp = function(endP){
        let l = shapes.length;
        shapes[l-1].endPos = endP;
        shapes[l-1].draw();
        if(shapes[l-1].endPos.x == shapes[l-1].startPos.x &&
            shapes[l-1].endPos.y == shapes[l-1].startPos.y)
            shapes.pop();
    }
    this.demo = function(startP,endP = mousePos){
        let shape = typeConstructor[this.type]();
        
        shape.color = this.color;
        shape.startPos = startP;
        shape.endPos = endP;
        shape.draw();   
    }
    this.hover = function(){
        let c=0;
        let s = gridCell/5;
        if(s<4)s=4;
        for(i in shapes){
            let dist = shapes[i].mouseDist();
            if(dist.x < s*2 && dist.y < s*2){
                let p = new Rectangle(ctx);
                p.color = "#0F54C2";
                p.startPos.x = shapes[i].startPos.x -s;
                p.startPos.y = shapes[i].startPos.y -s;
                p.endPos.x = shapes[i].startPos.x +s
                p.endPos.y = shapes[i].startPos.y +s;
                p.draw();
                if(dist.x < s && dist.y < s){
                    this.nearest = shapes[i];
                    c++;
                }
            }
        }
        if(c==0)
            this.nearest = undefined;
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
        this.color = "#000000";
        this.nearest = undefined;
        this.selected = undefined;
    }
    this.deleteSelected = function(){
        if(this.selected != undefined){
            deleted.push(shapes[this.selected.id]);
            shapes.splice(this.selected.id,1);
        }
        this.selected = undefined;
    }
}
function DrawerGUI(){
    //private vars
    let canvas , mainSection, ctx, outputCode;
    const input = {
        type: undefined, undo: undefined , redo: undefined, 
        clearAll: undefined, grid:{size: undefined, flag: undefined},
        color: undefined, 
        selected:{stX: undefined , stY: undefined , edX: undefined , edY: undefined},
        delete: undefined
    };
    //public vars
    this.app = "";
    //private methods
    const creatElements = function(){
        let body = document.body;
        body.innerHTML = "";

        let container = htmlCreator("div",body,"container","");
        mainSection = htmlCreator("div",container,"mainSec","view");
        let outputSection = htmlCreator("div",container,"outputSec","view");
        let controlsSection = htmlCreator("div",container,"controlsSec","view");
        
        let codeTitle = htmlCreator("div", outputSection);
        codeTitle.style.display = "flex";
        htmlCreator("h2",codeTitle,"","","Your Code: ");
        htmlCreator("p",codeTitle,"","","Copy inside empty html").style.margin = "auto";
        outputCode = htmlCreator("textarea",outputSection,"outCode");

        htmlCreator("label",controlsSection,"","gridSpan12","click and drag to draw");

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
        input.grid.size.min = "2";
        input.grid.size.max = "100";
        input.grid.size.value = gridCell;
        htmlCreator("label", controlsSection, "", "", "px");

        htmlCreator("label", controlsSection, "", "gridSpan2", "Color: ");
        input.color = htmlCreator("input", controlsSection, "", "inputColor gridSpan3")
        input.color.type = "color";
        input.color.value = "#000000";

        input.selected = htmlCreator("div", controlsSection, "selectedItem","gridSpan12");
        htmlCreator("label", input.selected, "", "", "start: ");
        input.selected.stX = htmlCreator("input", input.selected, "", "inputNumber ");
        input.selected.stX.type = "number";
        input.selected.stY = htmlCreator("input", input.selected, "", "inputNumber ");
        input.selected.stY.type = "number";
        htmlCreator("label", input.selected, "", "", "end: ");
        input.selected.edX = htmlCreator("input", input.selected, "", "inputNumber ");
        input.selected.edX.type = "number";
        input.selected.edY = htmlCreator("input", input.selected, "", "inputNumber ");
        input.selected.edY.type = "number";

        input.undo = htmlCreator("button",controlsSection,"","button gridSpan4","Undo");
        input.redo = htmlCreator("button",controlsSection,"","button gridSpan4","Redo");
        input.delete = htmlCreator("button",controlsSection,"","button gridSpan4","Delete");
        input.clearAll = htmlCreator("button",controlsSection,"","button gridSpan6","Clear All");

        canvas = htmlCreator("canvas" ,mainSection);
        canvas.height = mainSection.offsetHeight ;
        canvas.width = mainSection.offsetWidth;

    }
    const addEvents = function(){
        let self = this;

        window.addEventListener("mousemove",function(event){
            mousePos.x = event.x;
            mousePos.y = event.y;
            self.display(0);
            self.app.hover();
            if(self.app.demoStartP != undefined){
                self.app.demo(self.app.demoStartP,{x:mousePos.xGrid,y:mousePos.yGrid});
                input.selected.edX.value = mousePos.xGrid;
                input.selected.edY.value = mousePos.yGrid;
            }
        });
        canvas.addEventListener("mousedown", function(event){
            if(event.button == 0){   //left mouse button
                self.app.selected = self.app.penDown({x:mousePos.xGrid,y:mousePos.yGrid});
                self.app.demoStartP = {x:mousePos.xGrid,y:mousePos.yGrid};
                
                input.selected.stX.value = self.app.selected.startPos.x;
                input.selected.stY.value = self.app.selected.startPos.y;
                input.selected.edX.value = self.app.selected.startPos.x;
                input.selected.edY.value = self.app.selected.startPos.y;
            }
            else if(event.button == 1){
                self.app.selected = self.app.nearest;
                console.log(self.app.selected);
                
                if(self.app.selected != undefined){
                    input.selected.stX.value = self.app.selected.startPos.x;
                    input.selected.stY.value = self.app.selected.startPos.y;
                    input.selected.edX.value = self.app.selected.endPos.x;
                    input.selected.edY.value = self.app.selected.endPos.y;
                }
            }
        });
        window.addEventListener("mouseup", function(event){
            if(self.app.demoStartP != undefined && event.button == 0){
                self.app.penUp({x:mousePos.xGrid,y:mousePos.yGrid});
                self.app.demoStartP = undefined;
                self.generateCode();
            }
        });
        window.addEventListener("resize",function(){
            canvas.height = mainSection.offsetHeight ;
            canvas.width = mainSection.offsetWidth;
            self.display(0);
        });
        
        {   //adding input events
            input.type.addEventListener("change",function(){self.app.type = this.value;})
            input.undo.addEventListener("click", function(){self.app.undo();self.display.bind(self)(0);self.generateCode();});
            input.redo.addEventListener("click", function(){self.app.redo();self.display.bind(self)(0);self.generateCode();});
            input.delete.addEventListener("click", function(){self.app.deleteSelected();self.display.bind(self)(0);self.generateCode();});
            input.clearAll.addEventListener("click", function(){self.reset();});
            input.grid.flag.addEventListener("change",function(){gridFlag = this.checked;self.display.bind(self)(0);})
            input.grid.size.addEventListener("change",function(){
                if(this.value<2.5)this.value=2.5;
                else if(this.value>100)this.value=100;
                gridCell = parseFloat(this.value);
                self.display.bind(self)(0);
            });
            input.color.addEventListener("change",function(){
                if(self.app.selected != undefined)
                    self.app.selected.color = this.value;
                self.app.color = this.value;
                self.display.bind(self)(0);
            });
        }
        {   //change selected dimensions
            input.selected.stX.addEventListener("change", function(){
                if(self.app.selected != undefined)
                    self.app.selected.startPos.x = parseFloat(this.value);
                self.display.bind(self)(0);
            });
            input.selected.stY.addEventListener("change", function(){
                if(self.app.selected != undefined)
                    self.app.selected.startPos.y = parseFloat(this.value);
                self.display.bind(self)(0);
            });
            input.selected.edX.addEventListener("change", function(){
                if(self.app.selected != undefined)
                    self.app.selected.endPos.x = parseFloat(this.value);
                self.display.bind(self)(0);
            });
            input.selected.edY.addEventListener("change", function(){
                if(self.app.selected != undefined)
                    self.app.selected.endPos.y = parseFloat(this.value);
                self.display.bind(self)(0);
            });
        }
    }
    const clearCanvas = function(){
        let size = {x: canvas.width/gridCell , y: canvas.height/gridCell};
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = "#000000";
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
        for(let i=0,l=this.app.shapes.length;i<l;i++){
            this.app.shapes[i].draw();
        }
    }
    this.generateCode = function(){
        outputCode.innerHTML = `<body><script>//creat canvas:\nlet canvas = document.body.appendChild(document.createElement("canvas"));
canvas.height = window.innerHeight ;
canvas.width = window.innerWidth;
let ctx = canvas.getContext("2d");\n`;
        for(let i=0,l=this.app.shapes.length;i<l;i++){
            outputCode.innerHTML += this.app.shapes[i].getCode();
        }
        outputCode.innerHTML += "</script></body>";
    }
    this.reset = function(){
        this.app.reset();
        this.app.type = input.type.value;
        this.app.color = input.color.value;
        outputCode.innerHTML = "";
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
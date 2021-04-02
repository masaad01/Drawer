let count=0;
let mousePos = {x: 0, y: 0};

function Line(ctx){
    this.startPos = {x: undefined,y: undefined};
    this.endPos = {x: undefined,y: undefined};
    this.drawLine = function(){
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
function Drawer(ctx){
    this.shapes = [];
    this.demoStartP = undefined;
    this.type = undefined;
    this.penDown = function(startP){
        this.shapes.push(new Line(ctx)); 
        let l = this.shapes.length;       
        this.shapes[l-1].startPos = startP;
    }
    this.penUp = function(endP){
        let l = this.shapes.length;
        this.shapes[l-1].endPos = endP;
        this.shapes[l-1].drawLine();
    }
    this.demo = function(startP,endP = mousePos){
        let shape = new Line(ctx);
        shape.startPos = startP;
        shape.endPos = endP;
        shape.drawLine();
    }
}

function DrawerGUI(){
    //private vars
    const input = {type: undefined};
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

        htmlCreator("label",controlsSection,"","","Shape: ");
        input.type = htmlCreator("select",controlsSection,"","inputList")
        htmlCreator("option",input.type,"","","Line");
        htmlCreator("option",input.type,"","","Rectangle");

        canvas = htmlCreator("canvas" ,mainSection);
        canvas.height = mainSection.offsetHeight ;
        canvas.width = mainSection.offsetWidth;

    }
    const addEvents = function(){
        let self = this;

        canvas.addEventListener("mousemove",function(event){
            mousePos.x = event.x;
            mousePos.y = event.y;
            if(self.app.demoStartP != undefined){
                self.display(0);
                self.app.demo(self.app.demoStartP,{x:event.x,y:event.y});
            }
        });
        canvas.addEventListener("mousedown", function(event){
            if(event.button == 0){   //left mouse button
                self.app.penDown({x:event.x,y:event.y});
                self.app.demoStartP = {x:event.x,y:event.y};
            }
        });
        canvas.addEventListener("mouseup", function(event){
            if(self.app.demoStartP != undefined && event.button == 0){
                self.app.penUp({x:event.x,y:event.y});
                self.app.demoStartP = undefined;
            }
        });
        canvas.addEventListener("mouseout", function(event){
            if(self.app.demoStartP != undefined){
                self.app.penUp({x:event.x,y:event.y});
                self.app.demoStartP = undefined;
            }
        });
        input.type.addEventListener("change",function(){self.app.type = this.value;})
    }
    const clearCanvas = function(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
                
        

    }
    //public methods
    this.start = function(){
        creatElements.bind(this)();
        ctx = canvas.getContext("2d");

        
        this.app = new Drawer(ctx);
        this.app.type = input.type.value;
        clearCanvas.bind(this)();
        addEvents.bind(this)();
        this.reset();
    }
    this.display = function(){
        clearCanvas.bind(this)();
        for(let i=0,l=this.app.shapes.length;i<l;i++)
            this.app.shapes[i].drawLine();

        
    }
    this.reset = function(){
        //this.app.initialize();

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
function fun(c=""){
    alert(c +"\n"+ count++);
}
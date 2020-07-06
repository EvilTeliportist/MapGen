
// ------- Declarations --------
noise.seed(Math.random());
var max = 255;
var min = -255;
var move = 30;
var mouse_holding = false;
hold_loc = [0,0]
var xoff = 0;
var yoff = 0;



function submit(){


    c.clearRect(0, 0, w-200, h)

    var edge = parseInt($("#edge").val());
    var breaking = parseInt($("#break").val());
    var vig = parseInt($("#vig").val());
    var seaoff = parseInt($("#seaoff").val());
    var size = parseInt($("#size").val());


    map = new Map(10 - breaking, edge, 3, vig, seaoff - 100, size)
    map.make_heightmap()
    map.make_biomes()
    map.offx = xoff;
    map.offy = yoff;
    map.draw()

}

submit();

$("#submit").click(submit);

$("#seed").click(function() {
    noise.seed(Math.random());
    submit();
});



// ------- Dynamics --------
document.onkeydown = function(e) {
    if (e.keyCode == '37'){
        map.offx += -move;
        map.draw()
    }

    if (e.keyCode == '38'){
        map.offy += -move;
        map.draw();
    }

    if (e.keyCode == '39'){
        map.offx += move;
        map.draw();
    }

    if (e.keyCode == '40'){
        map.offy += move;
        map.draw();
    }
}

document.onmousedown = function(e){
    mouse_holding = true;
    hold_loc = [e.clientX, e.clientY]
}

document.onmouseup = function(){
    mouse_holding = false;
}

document.onmousemove = function(e){
    if (mouse_holding){
        var dx = hold_loc[0] - e.clientX;
        var dy = hold_loc[1] - e.clientY;
        hold_loc = [e.clientX, e.clientY]

        if (map.offx - (w * (map.map_multi - 1)) + dx >= -5){
            map.offx = w * (map.map_multi - 1)
        } else if (map.offx + dx < 0){
            map.offx = 0;
        } else {
            map.offx += dx;
        }

        if (map.offy - (h * (map.map_multi - 1)) + dy >= -5){
            map.offy = h * (map.map_multi - 1)
        } else if (map.offy + dy < 0){
            map.offy = 0;
        } else {
            map.offy += dy;
        }

        xoff = map.offx;
        yoff = map.offy;

        map.draw()
    }
}

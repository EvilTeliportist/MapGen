
// ------- Declarations --------
noise.seed(Math.random());
var max = 255;
var min = -255;
var move = 30;
var mouse_holding = false;
hold_loc = [0,0]
var xoff = 0;
var yoff = 0;
var adding_city = false;
var cities = []

// -------- Generation ---------
function set_colors(){
    var deep = hexToRGB($("#deep").val());
    var sea = hexToRGB($("#sea").val());
    var shallow = hexToRGB($("#shallow").val());
    var sand = hexToRGB($("#sand").val());
    var grass = hexToRGB($("#grass").val());
    var desert = hexToRGB($("#desert").val());

    map.changeColors(deep, sea, shallow, sand, grass, desert);
    map.make_biomes()
    map.draw()
}

function reset_colors(){
    $("#deep").val("#001763")
    $("#sea").val("#1948e3")
    $("#shallow").val("#2499d4")
    $("#sand").val("#e3ceaf")
    $("#grass").val("#789c70")
    $("#desert").val("#dba269")

    var deep = hexToRGB($("#deep").val());
    var sea = hexToRGB($("#sea").val());
    var shallow = hexToRGB($("#shallow").val());
    var sand = hexToRGB($("#sand").val());
    var grass = hexToRGB($("#grass").val());
    var desert = hexToRGB($("#desert").val());

    map.changeColors(deep, sea, shallow, sand, grass, desert);
    map.make_biomes()
    map.draw()
}

function generate(){

    $("#canvas").hide();
    $("#loader").show();

    c.clearRect(0, 0, w-200, h)

    var edge = parseInt($("#edge").val());
    var breaking = parseInt($("#break").val());
    var vig = parseInt($("#vig").val());
    var seaoff = parseInt($("#seaoff").val());
    var size = parseInt($("#size").val());

    map = new Map(10 - breaking, edge, 3, vig, seaoff - 100, size)

    map.make_heightmap()
    set_colors()
    map.make_biomes()
    map.offx = xoff;
    map.offy = yoff;
    map.draw()

    $("#canvas").show();
    $("#loader").hide();

}

generate();


// -------- Click Functions ---------
$("#submit").click(generate);

$("#seed").click(function() {
    noise.seed(Math.random());
    generate();
});

$(".colors_label").click(function() {
    $("#controls").hide();
    $("#colors").show();
});

$(".control_label").click(function() {
    $("#colors").hide();
    $("#controls").show();
});

$(".color_selector").on('change', set_colors)

$("#colors").hide();

$("#reset").click(reset_colors)

$("#add").click(function() {
    if (adding_city){
        adding_city = false;
        $("#canvas").css('cursor', 'default');
    } else {
        adding_city = true;
        $("#canvas").css('cursor', 'cell');
    }
})

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

    if (e.keyCode == '187'){
        // +
    }

    if (e.keyCode == '189'){
        // -
    }

    if (e.keyCode == '27'){
        adding_city = false;
        $("#canvas").css('cursor', 'default');
    }
}

document.onmousedown = function(e){
    if (adding_city){
        city = new City('none', e.clientX + map.offx, e.clientY + map.offy);
        map.add_city(city);
        adding_city = false;
        $("#canvas").css('cursor', 'default');
        map.draw();
    } else {
        var res = map.check_city_hover(e.clientX,  e.clientY)
        if (res != null){
            console.log(res)
        } else {
            mouse_holding = true;
            hold_loc = [e.clientX, e.clientY]
        }
    }
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

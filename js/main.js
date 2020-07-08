
// ------- Declarations --------
var seed = Math.random()
noise.seed(seed);
var max = 255;
var min = -255;
var move = 30;
var mouse_holding = false;
hold_loc = [0,0]
var xoff = 0;
var yoff = 0;
var adding_city = false;
var city_selected = false;
var current_city;

// -------- Generation ---------
function set_colors(){
    var deep = hexToRGB($("#deep").val());
    var sea = hexToRGB($("#sea").val());
    var shallow = hexToRGB($("#shallow").val());
    var sand = hexToRGB($("#sand").val());
    var grass = hexToRGB($("#grass").val());
    var desert = hexToRGB($("#desert").val());
    var forest = hexToRGB($("#forest").val());

    map.changeColors(deep, sea, shallow, sand, grass, desert, forest);
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

function spawn_city_info(e, res){
    var details = "<div class='city_details'><div class='cityname' contenteditable='true'>"+res.name+"</div><div class='population' contenteditable='true'>"+res.pop+"</div><div class='citydescription' contenteditable='true'>"+res.desc+"</div></div>"
    $("body").append(details)
    $(".city_details").css({
        'display':'none',
        'position': 'absolute',
        'top':(e.clientY).toString() + 'px',
        'left':(e.clientX + 10).toString() + 'px',
        'background-color': 'white',
        'border-radius': '20px',
        'font-size': '18px',
        'padding': '10px',
        'border': '2px solid #888888',
        'min-width': '200px',
        'max-width': '400px',
        'max-height': '400px'
    })
    $(".city_details").fadeIn();
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

    map = new Map(10 - breaking, edge, 3, vig, seaoff - 100, size, seed)

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
        $("#add").css('background-color', 'white');
    } else {
        adding_city = true;
        $("#canvas").css('cursor', 'cell');
        $("#add").css('background-color', '#a6f3ff');
    }
})

$(".exit").click(function(){
    $("#controls").hide();
    $("#colors").hide();
})

$("#gear").click(function() {
    $("#controls").show();
})

// ------- Dynamics --------
document.onkeydown = function(e) {

    if (e.keyCode == '27'){
        adding_city = false;
        $("#canvas").css('cursor', 'default');
        city_selected = false;
        var name = $(".cityname").text();
        var pop = $(".population").text();
        var desc = $(".citydescription").text();
        map.editCity(name, pop, desc)
        $(".city_details").fadeOut(function(){
            $(".city_details").remove();
        });
        map.deselectCities()
        $("#add").css('background-color', 'white');
    }
}

document.onmousedown = function(e){
    current_city = map.check_city_hover(e.clientX, e.clientY);

    if (adding_city){
        city = new City(e.clientX + map.offx, e.clientY + map.offy);
        map.add_city(city);
        adding_city = false;
        $("#add").css('background-color', 'white');
        $("#canvas").css('cursor', 'default');
        map.draw();
    } else if (current_city != null) {
        map.selectCity(current_city);
        spawn_city_info(e, current_city)
        city_selected = true;
        $(".city_details").css({'contenteditable':'true'});
    } else {
        mouse_holding = true;
        hold_loc = [e.clientX, e.clientY]
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

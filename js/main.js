
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
var is_changing_height = false;
var is_changing_biomes = false;


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
    $("#forest").val("#336e26")

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

function spawn_city_info(e, res){
    var details = "<div class='city_details'><div class='cityname' contenteditable='true' spellcheck='false'>"+res.name+"</div><div class='population' contenteditable='true'>"+res.pop+"</div><div class='citydescription' contenteditable='true'>"+res.desc+"</div></div>"
    $("body").append(details)
    $(".city_details").css({
        'display':'none',
        'position': 'absolute',
        'top': '10px',
        'right':'10px',
        'background-color': 'white',
        'border-radius': '20px',
        'font-size': '18px',
        'padding': '10px',
        'border': '2px solid #888888',
        'min-width': '400px',
        'max-width': '400px',
        'height': '95%'
    })
    $(".city_details").fadeIn();
}

function escape(){
    adding_city = false;
    city_selected = false;
    is_changing_height = false;
    is_changing_biomes = false;

    $("#canvas").css('cursor', 'default');
    var name = $(".cityname").text();
    var pop = $(".population").text();
    var desc = $(".citydescription").text();
    map.editCity(name, pop, desc)

    // Fade Outs
    $(".city_details").fadeOut(function(){
        $(".city_details").remove();
    });
    $("#controls").fadeOut();
    $("#colors").fadeOut();
    $("#color").fadeOut();
    $("#elev_controls").fadeOut();
    $("#biome_controls").fadeOut();

    // Deselect Icons and City
    map.deselectCities()
    $("#gear").css('background-color', 'white');
    $("#color-icon").css('background-color', 'white');
    $("#add").css('background-color', 'white');
    $("#hill").css('background-color', 'white');
    $("#biome").css('background-color', 'white')
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
    map.offx = xoff;
    map.offy = yoff;
    map.draw()

    $("#canvas").show();
    $("#loader").hide();

}

function clickingUI(e){
    return e.clientX < w - 250 && e.clientX > 60;
}

generate();


// -------- Click Functions ---------
$("#submit").click(generate);

$("#seed").click(function() {
    noise.seed(Math.random());
    generate();
});

$(".color_selector").on('change', set_colors)

$("#reset").click(reset_colors)

$(".tool").click(escape);

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
    escape();
})

$("#color-icon").click(function() {
    if ($("#colors").is(":visible")){
        $("#colors").fadeOut()
        $("#color-icon").css('background-color', 'white')
    } else {
        $("#colors").fadeIn();
        $("#color-icon").css('background-color', '#a6f3ff')
    }
})

$("#gear").click(function() {
    if ($("#controls").is(":visible")){
        $("#controls").fadeOut()
        $("#gear").css('background-color', 'white')
    } else {
        $("#controls").fadeIn();
        $("#gear").css('background-color', '#a6f3ff')
    }
})

$("#hill").click(function() {
    if (is_changing_height){
        $("#canvas").css('cursor', 'default');
        $("#hill").css('background-color', 'white')
        is_changing_height = false;
        $("#elev_controls").fadeOut();
    } else {
        $("#canvas").css('cursor', 'crosshair');
        $("#hill").css('background-color', '#a6f3ff')
        is_changing_height = true;
        $("#elev_controls").fadeIn();
    }
})

$("#biome").click(function() {
    if (is_changing_biomes){
        $("#canvas").css('cursor', 'default');
        $("#biome").css('background-color', 'white')
        is_changing_biomes = false;
        $("#biome_controls").fadeOut();
    } else {
        $("#canvas").css('cursor', 'crosshair');
        $("#biome").css('background-color', '#a6f3ff')
        is_changing_biomes = true;
        $("#biome_controls").fadeIn();
    }
})

$("#save").click(function() {
    console.log("save")
    map.saveImage()
})

// ------- Dynamics --------
document.onkeydown = function(e) {

    if (e.keyCode == '27'){
        escape();
    }
}

document.onmousedown = function(e){
    current_city = map.check_city_hover(e.clientX, e.clientY);

    if (adding_city && e.clientX > 60){
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
    } else if (city_selected && e.clientX < (w - 410) && e.clientX > 60){
        escape();
        mouse_holding = true;
        hold_loc = [e.clientX, e.clientY]
    } else if (is_changing_height && clickingUI(e)){
        map.elevate(e.clientX, e.clientY, parseInt($("#elev_brush_strength").val()), parseInt($("#elev_brush_radius").val()))
    } else if (is_changing_biomes && clickingUI(e)){
        map.change_biomes(e.clientX, e.clientY, parseInt($("#biome_brush_strength").val()), parseInt($("#biome_brush_radius").val()))
    } else {
        mouse_holding = true;
        hold_loc = [e.clientX, e.clientY]
    }
}

document.onmouseup = function(){
    mouse_holding = false;
}

document.onmousemove = function(e){

    if (mouse_holding && !is_changing_height){
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

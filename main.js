noise.seed(Math.random());
var max = 255;
var min = -255;
map = new Map(7, 10, 3, 0)
var move = 30;


function submit(){


    c.clearRect(0,0,w-200,h)

    var edge = parseInt($("#edge").val());
    var breaking = parseInt($("#break").val());
    var vig = parseInt($("#vig").val());
    var seaoff = parseInt($("#seaoff").val());
    var zoom = parseInt($("#zoom").val());
    zoom = 200 - zoom;
    zoom /= 50;

    map.changeValues(10 - breaking, edge, 3, vig, seaoff - 100, zoom)
    map.make_heightmap()
    map.make_biomes()
    map.draw()
    c.putImageData(pixels, 0, 0)

}

submit()

$("#submit").click(submit)

document.onkeydown = function(e) {
    if (e.keyCode == '37'){
        map.offx += -move;
    }

    if (e.keyCode == '38'){
        map.offy += -move;
    }

    if (e.keyCode == '39'){
        map.offx += move;
    }

    if (e.keyCode == '40'){
        map.offy += move;
    }

    if (e.keyCode == '187'){
        map.scale /= 1.2;
    }

    if (e.keyCode == '189'){
        map.scale *= 1.2;
    }

    map.make_heightmap()
    map.make_biomes()
    map.draw()
    c.putImageData(pixels, 0, 0)
}

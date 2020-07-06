noise.seed(Math.random());
var max = 255;
var min = -255;

function sumOctave(num_iterations, x, y, persistence, scale){
    var maxAmp = 0;
    var amp = 1;
    var freq = scale;
    var value = 0;

    for(i = 0; i < num_iterations; ++i){
        value += noise.simplex2(x * freq, y * freq) * amp;
        maxAmp += amp;
        amp *= persistence;
        freq *= 2;
    }

    value /= maxAmp;

    return value;
}

function vignette(x, y, harshness){
    x += 100;
    temp = (x * y) / ((w / 2) * (h / 2));
    temp *= ((w - x) * (h - y)) / ((w / 2) * (h / 2));
    return temp**harshness
}

function make_noise_base(resolution, octaves, power, vig){

    var scale = .007;
    for(x = 0; x < w; x++){
        for(y = 0; y < h; y++){
            col = [0,0,0];
            var v = sumOctave(octaves, x, y, .5, scale / resolution);
            v *= 255;
            v *= vignette(x, y, vig)
            min = Math.min(min, v)
            v = Math.max(-255, v);

            var deep = [0, 39, 171];
            var sea = [25, 72, 227];
            var shallow = [66, 135, 245];
            var sand = [227, 206, 175];
            var grass = [120, 156, 112];
            var desert = [219, 162, 105];

            var sea_start = -100;
            var shallow_start = 0;
            var sand_start = 10;
            var grass_start = 30;
            var desert_start = 110;

            if (v >= min && v < sea_start){
                col = blend(deep, sea, min, sea_start, v)
            } else if (v >= sea_start && v < shallow_start){
                col = blend(sea, shallow, sea_start, shallow_start, v)
            } else if (v >= shallow_start && v < sand_start){
                col = blend(shallow, sand, shallow_start, sand_start, v)
            } else if (v >= sand_start && v < grass_start){
                col = blend(sand, grass, sand_start, grass_start, v)
            } else if (v >= grass_start && v < desert_start){
                col = blend(grass, desert, grass_start, desert_start, v)
            } else if (v >= desert_start){
                col = desert;
            }

            pixel(x, y, col);
        }
    }
}

function make_biomes(resolution, octaves){
    scale = .007;
    for(x = 0; x < w; x++){
        for(y = 0; y < h; y++){
            if(pixelcolor(x,y).toString() == [189, 167, 132, 255].toString()){{
                var v = sumOctave(octaves, x, y, .5, scale / resolution) * 255;
                v = v**2;
                pixel(x, y, [v,v,v])
            }}
        }
    }
}

function submit(){


    c.clearRect(0,0,w-200,h)

    var edge = parseInt($("#edge").val());
    var breaking = parseInt($("#break").val());
    var vig = parseInt($("#vig").val());


    make_noise_base(10 - breaking, edge, 3, vig)
    c.putImageData(pixels, 0, 0)

    console.log(min)
}

submit()

$("#submit").click(submit)

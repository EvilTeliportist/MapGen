class Map {

    constructor(res, octaves, power, vig, seaoff, size){
        this.res = res;
        this.octaves = octaves;
        this.power = power;
        this.vig = vig;
        this.scale = .007;
        this.BW = [];
        this.COLOR = [];
        this.offx = 500;
        this.offy = 500;
        this.seaoff = seaoff;
        this.map_multi = size;
    }

    make_heightmap(){

        this.COLOR = [];
        this.BW = [];

        for(var x = this.offx; x < w * this.map_multi + this.offx; x++){
            for(var y = this.offy; y < h * this.map_multi + this.offy; y++){

                var v = this.sumOctave(this.octaves, x, y, .5, this.scale / this.res);
                v *= -255;
                //v -= (255 * this.vignette(x, y, this.vig))
                v = Math.max(-255, v);

                this.BW.push([x,y,[v,v,v]])

            }
        }
    }

    sumOctave(num_iterations, x, y, persistence, scale){
        var maxAmp = 0;
        var amp = 1;
        var freq = scale;
        var value = 0;

        for(var i = 0; i < num_iterations; ++i){
            value += noise.simplex2(x * freq, y * freq) * amp;
            maxAmp += amp;
            amp *= persistence;
            freq *= 2;
        }

        value /= maxAmp;

        return value;
    }

    vignette(x, y, harshness){
        var dist = ((w / 2) - x)**2 + ((h / 2) - y)**2;
        dist = Math.sqrt(dist);
        var max = (w / 2)**2 + (h / 2)**2;
        max = Math.sqrt(max)

        return (dist / max) ** (1/harshness);
    }

    draw(){
        c.clearRect(0,0,w-200,h)

        for (var x = this.offx; x < w + this.offx; x++){
            for (var y = this.offy; y < h + this.offy; y++){
                var index = (this.map_multi * h * x) + y;
                var p = this.COLOR[index]
                pixel(p[0] - this.offx, p[1] - this.offy, p[2]);
            }
        }

        c.putImageData(pixels, 0, 0)
    }

    make_biomes(){

        var deep = [0, 39, 171, 255];
        var sea = [25, 72, 227, 255];
        var shallow = [66, 135, 245, 255];
        var sand = [227, 206, 175, 255];
        var grass = [120, 156, 112, 255];
        var desert = [219, 162, 105, 255];

        var sea_start = -30 + this.seaoff;
        var shallow_start = 0 + this.seaoff;
        var sand_start = 4 + this.seaoff;
        var grass_start = 20 + this.seaoff;
        var desert_start = 110 + this.seaoff;

        for(var x = 0; x < w * this.map_multi; x++){
            for(var y = 0; y < h * this.map_multi; y++){

                var v = this.BW[(x * h * this.map_multi) + y][2][0];
                var col = [0,0,0]

                if (v >= -255 && v < sea_start){
                    col = blend(deep, sea, min, sea_start, v)
                } else if (v >= sea_start && v < shallow_start){
                    col = blend(sea, shallow, sea_start, shallow_start, v)
                } else if (v >= shallow_start && v < sand_start){
                    col = blend(shallow, sand, shallow_start, sand_start, v)
                } else if (v >= sand_start && v < grass_start){
                    col = blend(sand, grass, sand_start, grass_start, v)
                } else if (v >= grass_start && v < desert_start){
                    col = blend(grass, desert, grass_start, desert_start, v);
                } else {
                    col = desert;
                }


                this.COLOR.push([x, y, col]);
            }
        }
    }
}

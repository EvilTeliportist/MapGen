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

        this.deep = [0, 23, 99, 255];
        this.sea = [25, 72, 227, 255];
        this.shallow = [36, 153, 212, 255];
        this.sand = [227, 206, 175, 255];
        this.grass = [120, 156, 112, 255];
        this.desert = [219, 162, 105, 255];
    }

    make_heightmap(){

        this.BW = [];

        for(var x = 0; x < w * this.map_multi; x++){
            for(var y = 0; y < h * this.map_multi; y++){

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

    changeColors(deep, sea, shallow, sand, grass, desert){
        this.deep = deep;
        this.sea = sea;
        this.shallow = shallow;
        this.sand = sand;
        this.grass = grass;
        this.desert = desert;
    }

    make_biomes(){

        this.COLOR = []

        var sea_start = 40 + this.seaoff;
        var shallow_start = 48 + this.seaoff;
        var sand_start = 50 + this.seaoff;
        var grass_start = 60 + this.seaoff;
        var desert_start = 110 + this.seaoff;

        for(var x = 0; x < w * this.map_multi; x++){
            for(var y = 0; y < h * this.map_multi; y++){

                var v = this.BW[(x * h * this.map_multi) + y][2][0];
                var col = [0,0,0]

                if (v >= -255 && v < sea_start){
                    col = blend(this.deep, this.sea, min, sea_start, v)
                } else if (v >= sea_start && v < shallow_start){
                    col = blend(this.sea, this.shallow, sea_start, shallow_start, v)
                } else if (v >= shallow_start && v < sand_start){
                    col = blend(this.shallow, this.sand, shallow_start, sand_start, v)
                } else if (v >= sand_start && v < grass_start){
                    col = blend(this.sand, this.grass, sand_start, grass_start, v)
                } else if (v >= grass_start && v < desert_start){
                    col = blend(this.grass, this.desert, grass_start, desert_start, v);
                } else {
                    col = this.desert;
                }


                this.COLOR.push([x, y, col]);
            }
        }
    }
}

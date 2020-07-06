class Map {

    constructor(res, octaves, power, vig){
        this.res = res;
        this.octaves = octaves;
        this.power = power;
        this.vig = vig;
        this.scale = .007;
        this.BW = [];
        this.COLOR = [];
        this.MOUNTAINS = [];
        this.mountain_thresh = 50;
        this.offx = 0;
        this.offy = 0;
        this.seaoff = 0;
    }

    make_heightmap(){

        this.COLOR = [];
        this.BW = [];
        this.MOUNTAINS = [];

        for(var x = this.offx; x < w + this.offx; x++){
            for(var y = this.offy; y < h + this.offy; y++){

                var v = this.sumOctave(this.octaves, x, y, .5, this.scale / this.res);
                v *= 255;
                v *= this.vignette(x, y, this.vig)
                v = Math.max(-255, v);

                this.BW.push([x,y,[v,v,v]])

                var m = this.sumOctave(6, x, y, .3, .05 / this.res);
                m *= 255;
                m *= this.vignette(x, y, this.vig)
                m = Math.max(-255, m);

                if (m < this.mountain_thresh){
                    m = 0;
                }

                this.MOUNTAINS.push([x,y,[m,m,m]])
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
        x += 100;
        var temp = (x * y) / ((w / 2) * (h / 2));
        temp *= ((w - x) * (h - y)) / ((w / 2) * (h / 2));
        return temp**harshness
    }

    draw(color){

        if (color == 'BW'){
            for (var i = 0; i < this.BW.length; i++){
                pixel(this.BW[i][0], this.BW[i][1], this.BW[i][2]);
            }
        } else if (color == 'MOUNTAINS'){
            for (var i = 0; i < this.MOUNTAINS.length; i++){
                pixel(this.MOUNTAINS[i][0], this.MOUNTAINS[i][1], this.MOUNTAINS[i][2]);
            }
        } else {
            for (var i = 0; i < this.COLOR.length; i++){
                pixel(this.COLOR[i][0], this.COLOR[i][1], this.COLOR[i][2]);
            }
        }
    }

    make_biomes(){

        var deep = [0, 39, 171, 255];
        var sea = [25, 72, 227, 255];
        var shallow = [66, 135, 245, 255];
        var sand = [227, 206, 175, 255];
        var grass = [120, 156, 112, 255];
        var desert = [219, 162, 105, 255];
        var mountain = [255, 255, 255]

        var sea_start = -100 + this.seaoff;
        var shallow_start = 0 + this.seaoff;
        var sand_start = 10 + this.seaoff;
        var grass_start = 30 + this.seaoff;
        var desert_start = 110 + this.seaoff;

        for(var x = 0; x < w; x++){
            for(var y = 0; y < h; y++){

                var v = this.BW[(x * h) + y][2][0];
                var m = this.MOUNTAINS[(x * h) + y][2][0]
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

    changeValues(res, octaves, power, vig, seaoff, zoom){
        this.res = res;
        this.octaves = octaves;
        this.power = power;
        this.vig = vig;
        this.seaoff = seaoff;
        this.scale = .007 * zoom;
    }
}

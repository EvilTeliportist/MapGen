class Map {

    constructor(res, octaves, power, vig, seaoff, size, seed){
        this.res = res;
        this.octaves = octaves;
        this.power = power;
        this.vig = vig;
        this.scale = .007;
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
        this.forest = [51, 110, 38, 255]

        this.cities = []


        this.BW = [];
        this.COLOR = [];
        this.BIOME = []
        this.RIVERS = []
    }

    make_heightmap(){

        this.BW = [];
        for(var x = 0; x < w * this.map_multi; x++){
            for(var y = 0; y < h * this.map_multi; y++){


                //RIVER MAP
                var r = this.sumOctave(2, x, y, .5, .02 / this.res)
                r = Math.abs(r);
                r = Math.min(1, r)
                r = 1 - r;
                if (r > .995){
                    r = 1;
                } else {
                    r = 0;
                }

                this.RIVERS.push([x,y,[r,r,r]])

                // BASE HEIGHTMAP
                var v = this.sumOctave(this.octaves, x, y, .5, this.scale / this.res);
                v *= -255;
                v = Math.max(-255, v);

                this.BW.push([x,y,[v,v,v]])


                // BIOME MAP
                var m = this.sumOctave(7, x, y, .5, .01 / this.res);
                var m1 = this.sumOctave(6, x, y, .3, .005 / this.res)
                m += 1;
                m1 += 1;
                var m2 = (m + m1) / 4;
                m2 = m2**4;
                m2 *= (1 + m2)**8;

                this.BIOME.push([x,y,[m2,m2,m2]])

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

    draw(){
        c.clearRect(0,0,w-200,h)

        // Draw Terrain
        for (var x = this.offx; x < w + this.offx; x++){
            for (var y = this.offy; y < h + this.offy; y++){
                var index = (this.map_multi * h * x) + y;
                var p = this.COLOR[index]
                pixel(p[0] - this.offx, p[1] - this.offy, p[2]);
            }
        }

        c.putImageData(pixels, 0, 0)

        // Draw Cities
        for (var i = 0; i < this.cities.length; i++){
            x = this.cities[i].x;
            y = this.cities[i].y;
            if (x >= this.offx && x <= (w + this.offx) && y >= this.offy && y <= (h + this.offy)){
                circle(x - this.offx, y - this.offy, 8, this.cities[i].color, "#666666", 5);
            }
        }

    }

    changeColors(deep, sea, shallow, sand, grass, desert, forest){
        this.deep = deep;
        this.sea = sea;
        this.shallow = shallow;
        this.sand = sand;
        this.grass = grass;
        this.desert = desert;
        this.forest = forest;
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
                var m = this.BIOME[(x * h * this.map_multi) + y][2][0];
                var r = this.RIVERS[(x * h * this.map_multi) + y][2][0];
                var col = [0,0,0]

                if (v >= -255 && v < sea_start){
                    col = blend(this.deep, this.sea, min, sea_start, v)
                } else if (v >= sea_start && v < shallow_start){
                    col = blend(this.sea, this.shallow, sea_start, shallow_start, v)
                } else if (v >= shallow_start && v < sand_start){
                    col = blend(this.shallow, this.sand, shallow_start, sand_start, v)
                } else if (v >= sand_start && v < grass_start){
                    v = Math.abs(v)
                    col = blend(this.sand, this.grass, sand_start, grass_start, v)
                } else if (v >= grass_start){
                    v = Math.abs(v)
                    var b = blend(this.forest, this.desert, 0, 1, m)
                    col = blend(this.grass, b, grass_start, desert_start, v)
                }


                this.COLOR.push([x, y, col]);
            }
        }
    }

    add_city(city){
        this.cities.push(city)
        this.cities[this.cities.length - 1].id = this.cities.length - 1;
    }

    check_city_hover(x, y){
        for (var i = 0; i < this.cities.length; i++){
            var dx = x - this.cities[i].x + this.offx;
            var dy = y - this.cities[i].y + this.offy;


            if (Math.sqrt(dx**2 + dy**2) <= 10){
                return this.cities[i];
            }
        }

        return null;
    }

    selectCity(city){
        for (var i = 0; i < this.cities.length; i++){
            if (city == this.cities[i]){
                this.cities[i].color = '#f55a42'
            }
        }

        this.draw()
    }

    deselectCities(){
        for (var i = 0; i < this.cities.length; i++){
            this.cities[i].color = '#FFFFFF'
        }

        this.draw()
    }

    editCity(name, pop, desc){
        for (var i = 0; i < this.cities.length; i++){
            if (this.cities[i].color == '#f55a42'){
                this.cities[i].name = name;
                this.cities[i].pop = pop;
                this.cities[i].desc = desc;
            }
        }
    }
}

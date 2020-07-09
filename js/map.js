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
                var r = this.sumOctave(6, x, y, .5, .01 / this.res)
                r = Math.abs(r);
                r = 1 - r;
                r = r**200;
                r = 1 - r;

                this.RIVERS.push([x,y,r])

                // BASE HEIGHTMAP
                var v = this.sumOctave(this.octaves, x, y, .5, this.scale / this.res);
                v *= -255;
                v = Math.max(-255, v);

                this.BW.push([x,y,v])


                // BIOME MAP
                var m = this.sumOctave(6, x, y, .5, .008 / this.res);
                m += 1;
                m = m ** 7;
                m /= 2;

                this.BIOME.push([x,y,m])

                this.COLOR = []

                var sea_start = 40 + this.seaoff;
                var shallow_start = 48 + this.seaoff;
                var sand_start = 50 + this.seaoff;
                var grass_start = 60 + this.seaoff;
                var desert_start = 110 + this.seaoff;


                if (v > shallow_start){
                    v *= r;
                    v = Math.max(shallow_start, v)
                }

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

    draw(x, y, v){
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
                text(this.cities[i].name, x - this.offx + 10, y - this.offy - 10);
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

                var v = this.BW[(x * h * this.map_multi) + y][2];
                var m = this.BIOME[(x * h * this.map_multi) + y][2];

                var r = this.RIVERS[(x * h * this.map_multi) + y][2];
                if (v > shallow_start){
                    v *= r;
                    v = Math.max(shallow_start, v)
                }

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

            if (distance(x + this.offx, y + this.offy, this.cities[i].x, this.cities[i].y) <= 10){
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

    elevate(x, y, h, radius){
        for (var i = 0; i < this.BW.length; i++){
            var d = distance(x, y, this.BW[i][0] - this.offx, this.BW[i][1] - this.offy);
            if(d <= radius){
                this.BW[i][2] += (1 - (d / radius)) * h;
            }
        }

        map.make_biomes();
        map.draw();
    }

    change_biomes(x, y, h, radius){
        for (var i = 0; i < this.BIOME.length; i++){
            var d = distance(x, y, this.BIOME[i][0] - this.offx, this.BIOME[i][1] - this.offy);
            if(d <= radius){
                this.BIOME[i][2] += (1 - (d / radius)) * (h / 100);
            }
        }

        map.make_biomes();
        map.draw();
    }

    saveImage(){

        canvas.width = w * this.map_multi;
        canvas.height = h * this.map_multi;

        pixels = c.createImageData(w * this.map_multi, h * this.map_multi);

        for (var i = 0; i < this.COLOR.length; i++){
            var p = this.COLOR[i]
            var index = ((p[1] * w * this.map_multi) + p[0]) * 4;
            pixels.data[index] = p[2][0]; // R value
            pixels.data[index + 1] = p[2][1]; // G value
            pixels.data[index + 2] = p[2][2]; // B Value
            pixels.data[index + 3] = 255; // A value
        }

        c.putImageData(pixels, 0, 0);

        for (var i = 0; i < this.cities.length; i++){
            var x = this.cities[i].x;
            var y = this.cities[i].y;
            circle(x, y, 8, this.cities[i].color, "#666666", 5);
            text(this.cities[i].name, x + 10, y - 10, 48)
        }


        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', 'CanvasAsImage.png');
        let dataURL = canvas.toDataURL('image/png');
        let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
        downloadLink.setAttribute('href', url);
        downloadLink.click();

        canvas.width = w;
        canvas.height = h;

        pixels = c.createImageData(w, h);

        this.draw();
    }
}

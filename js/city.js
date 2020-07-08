class City {
    constructor(x, y, id){
        this.name = 'Unnamed Settlement';
        this.id = -1;
        this.x = x;
        this.y = y;
        this.color = '#FFFFFF'
        this.pop = 'Population: 0';
        this.desc = 'Description';
    }

    set(name, pop, desc){
        this.name = name;
        this.pop = pop;
        this.desc = desc;
    }
}

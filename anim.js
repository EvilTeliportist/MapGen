
// Actual Gameloop
const loop = setInterval(update, 1000 / 60);
function update(){
    c.clearRect(0, 0, canvas.width, canvas.height);
    draw();

}

// Program Inits
var canvas = document.querySelector('canvas');
var w = document.documentElement.clientWidth;
var h = document.documentElement.clientHeight;
canvas.width = w;
canvas.height = h;
var c = canvas.getContext("2d");


// Util Vars
var deg = Math.PI / 180;
var pixels = c.createImageData(w, h);


// Util functions
function hex(){
  return "#" + Math.random().toString(16).slice(2, 8);
}

// Drawing Functions
function circle(x, y, radius, color, border_color, lineWidth){
  c.strokeStyle = border_color || color || "#000000";
  c.fillStyle = color || "#000000";
  c.lineWidth = lineWidth || 3;
  c.beginPath();
  c.arc(x, y, radius, 0, 2 * Math.PI);
  c.stroke();
  c.fill();
  c.fillStyle = "#000000"
  c.strokeStyle = "#000000"
}

function line(x, y, x1, y1, width, color){
    c.strokeStyle = color || "#000000";
    c.lineWidth = width || 1;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x1, y1);
    c.stroke();
    c.lineWidth = 1;
    c.strokeStyle = "#000000";
}

function pixel(x, y, color){
    var index = ((y * w) + x) * 4;
    pixels.data[index] = color[0]; // R value
    pixels.data[index + 1] = color[1]; // G value
    pixels.data[index + 2] = color[2]; // B Value
    pixels.data[index + 3] = color[3] || 255; // A value
}

function pixelcolor(x, y){
    var index = ((y * w) + x) * 4
    var r = pixels.data[index]
    var g = pixels.data[index + 1]
    var b = pixels.data[index + 2]
    var a = pixels.data[index + 3]
    return [r,g,b,a];
}

function blend(color2, color1, min, max, value){
    var percentage = (value - min) / (max - min);
    percentage = Math.min(percentage, 1)
    percentage = Math.max(0, percentage)
    var r = (color1[0] * percentage) + (color2[0] * (1-percentage))
    var g = (color1[1] * percentage) + (color2[1] * (1-percentage))
    var b = (color1[2] * percentage) + (color2[2] * (1-percentage))
    return [r,g,b]
}

function hexToRGB(hex){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    return [r,g,b];
}

function scaleImageData(imageData, scale){
    var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
    var subLine = ctx.createImageData(scale, 1).data
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = imageData.data.subarray(
                (row * imageData.width + col) * 4,
                (row * imageData.width + col) * 4 + 4
            );
            for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                var destCol = col * scale;
                scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
            }
        }
    }

    return scaled;
}

let canvas = document.getElementById('my_Canvas');
let gl = canvas.getContext('experimental-webgl');
const  translation = [-0.3, 0.7, 0];
let verticesStroke;
let verticesTriangles;

gl.viewport(0,0,canvas.width,canvas.height);

 fetch('data.json')
     .then(response => response.body)
     .then(stream => {
         const reader = stream.getReader();
         let data = '';

         reader.read().then(function processText({ done, value }) {
             if (done) {
                 goNext(JSON.parse(data))
                 return;
             }

             const chunk = new TextDecoder('utf-8').decode(value)
             data += chunk
             return reader.read().then(processText)
         });
     })

 function goNext(data) {
      verticesStroke = data.verticesStroke; //путь к файлу
      verticesTriangles = data.verticesTriangles;
     drawFigure(verticesTriangles,"filling", 3, 27);
     drawFigure(verticesStroke,"stroke", 2, 25);

 }

function drawFigure(vertices, type, axes, numberFig) {
    /*======= Defining and storing the geometry ======*/

    createBufferObject(vertices);
    var vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    /*=================== Shaders ====================*/

    const[v, f] = shaders(type);
    var shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, v);

    gl.attachShader(shaderProgram, f);

    gl.linkProgram(shaderProgram);

    let translationLocation = gl.getUniformLocation(shaderProgram, 'u_translation');
    gl.useProgram(shaderProgram);

    gl.uniform3fv(translationLocation, translation);

    /*======= Associating shaders to buffer objects ======*/

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");

    gl.vertexAttribPointer(coord, axes, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(coord);

    /*============ Drawing the triangle =============*/

    //gl.enable(gl.DEPTH_TEST);

    if(type === "stroke") {
        gl.drawArrays(gl.LINE_STRIP, 0, numberFig);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, numberFig);
    }

}

function createBufferObject (vertices) {
    var vertex_buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function shaders (type) {
    var vertCode =
        'attribute vec3 coordinates;' +
        'uniform vec3 u_translation;' +
        'void main(void) {' +
        'gl_Position = vec4(coordinates + u_translation, 1.);'+
        //' gl_Position = vec4(coordinates, 1.75);' +
        '}';

    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertShader, vertCode);

    gl.compileShader(vertShader);

    if(type === "stroke") {
        var fragCode =
            'void main(void) {' +
            'gl_FragColor = vec4(0, 0, 0, 1);' +
            '}';
    } else {
        var fragCode =
            'void main(void) {' +
            'gl_FragColor = vec4(0.7, 0.5, 0.0, 0.5);' +
            '}';
    }

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragShader, fragCode);

    gl.compileShader(fragShader);

    return[vertShader, fragShader];
}

document.onkeydown = handleButtonClick;

function handleButtonClick(e) {
    let changed = false
    switch (e.code) {
        case 'KeyW':
            translation[1] += 0.1
            translation[0] += 0.05
            changed = true
            break
        case 'KeyS':
            translation[1] -= 0.1
            translation[0] -= 0.05
            changed = true
            break
        case 'KeyA':
            translation[1] -= 0.1
            translation[0] -= 0.05
            changed = true
            break
        case 'KeyD':
            translation[1] += 0.1
            translation[0] += 0.05
            changed = true
            break
    }

    if (changed) {
        drawFigure(verticesStroke,"stroke", 2, 25);
        drawFigure(verticesTriangles,"filling", 3, 27);
    }
}

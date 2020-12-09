//--------------------- webGL set up
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl');
if (!gl) {
    throw new Error('WebGL not supported');
}

// ---------------------- UI CODE

// UI state
var displayBrains = true; // if false do voltage stream mode
//constants for local simulated voltage stream1
const defaultDuration = 1
const defaultSamplerate = 125;
const defaultChannels = 8;
// mysterious garrett constants
const DIST_BETWEEN_WAVES = .5;
const MAX_AMPLITUDE = 2*DIST_BETWEEN_WAVES;
var vertexData = brainpoints;
function generateVoltageStream(channels, duration, samplerate) {
    // returns a 2D list with channels amt of voltage signal lists that have length duration x sample rate
    let len = duration; // seconds
    let base_freq = document.getElementById("freqRange").value;
    signal = new Array(channels);
    for (let channel =0; channel < channels; channel++) {
        signal[channel] = bci.generateSignal([(MAX_AMPLITUDE/2)/(2*channels)], [base_freq], samplerate, len);
    }
    return signal;
}
function createSimulatedBCIData() {
    // simulates a JSON packet from server
    //right now it's one object, but eventually this will be several brains
    return {
        timestamp: Date.now(),
        samplerate: defaultSamplerate,
        duration: defaultDuration,
        voltages: generateVoltageStream(defaultChannels, defaultDuration, defaultSamplerate),
        synchrony: Math.random() * 2 - .5
    }
}






const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 brain;
attribute vec3 locations;
attribute vec3 current;
varying vec3 vColor;
uniform mat4 matrix;


void main() {
    vColor = vec3(brain.xy, 1);
    gl_PointSize = 1.0;

    gl_Position = mix(matrix * vec4(brain + current,1.0), matrix * vec4(brain + locations,1.0), 1.0);
    current = mix(current,locations,.02);

}
`);
// gl.compileShader(vertexShader);
//
// const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 color;
void main() {
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
}
`);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const brainBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, brainBuffer);
gl.bufferData(gl.ARRAY_BUFFER, brainpoints, gl.STATIC_DRAW);
const brainLocation = gl.getAttribLocation(program, `brain`);
gl.enableVertexAttribArray(brainLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, brainBuffer);
gl.vertexAttribPointer(brainLocation, 3, gl.FLOAT, false, 0, 0);




gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);




const uniformLocations = {
    brain: gl.getAttribLocation(program, `brain`),
    matrix: gl.getUniformLocation(program, `matrix`)
};


// model view projection on the entire thing
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

mat4.rotateX(modelMatrix,modelMatrix, Math.PI / 2);
mat4.rotateY(modelMatrix,modelMatrix, Math.PI / 2);
mat4.invert(modelMatrix,modelMatrix);




mat4.perspective(projectionMatrix,
    75 * Math.PI/180, // vertical field-of-view (angle, radians)
    canvas.width/canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);
const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();
mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
mat4.invert(viewMatrix, viewMatrix);
mat4.rotateX(modelMatrix, modelMatrix, 3);


var locations = new Float32Array(brainpoints.length);
const locationsBuffer = gl.createBuffer();
const locationsLocation = gl.getAttribLocation(program, `locations`);
gl.enableVertexAttribArray(locationsLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, locationsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, locations, gl.DYNAMIC_DRAW);
gl.vertexAttribPointer(locationsLocation, 3, gl.FLOAT, false, 0, 0);

var current = new Float32Array(brainpoints.length);
const currentBuffer = gl.createBuffer();
const currentLocation = gl.getAttribLocation(program, `current`);
gl.enableVertexAttribArray(currentLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, currentBuffer);
gl.bufferData(gl.ARRAY_BUFFER, current, gl.DYNAMIC_DRAW);
gl.vertexAttribPointer(currentLocation, 3, gl.FLOAT, false, 0, 0);


// gl.vertexAttribPointer(brainLocation, 3, gl.FLOAT, false, 0, 0);
// gl.vertexAttribPointer(locationsLocation, 3, gl.FLOAT, false, 0, 0);


// animate loo
canvas.onmousedown = function(event){
    locations.forEach(function(e,i){
        if(i % 2 == 0){
            locations[i] = Math.random();
        }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, locationsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, locations, gl.DYNAMIC_DRAW);

};

function animate() {
    requestAnimationFrame(animate);


    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

    //edit locations
    // locations.forEach(function(e,i){
    //     if(i % 2 == 0){
    //         locations[i] = 1.0;
    //     }
    // });
    //
    // gl.bindBuffer(gl.ARRAY_BUFFER, locationsBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, locations, gl.DYNAMIC_DRAW);


    gl.drawArrays(gl.POINTS, 0, vertexData.length/3);
}

animate();


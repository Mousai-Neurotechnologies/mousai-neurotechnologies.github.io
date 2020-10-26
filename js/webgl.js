// The models in this code are by Anderson Winkler and are
// licensed under a Creative Commons Attribution-ShareAlike 3.0
// Unported License. The original work can be found at
// https://brainder.org/brain-for-blender.

async function particleBrain() {

    const canvas = document.getElementById('webgl')
    const gl = canvas.getContext('webgl')
    let vertexHome;
    let vertexCurr;
    let temp;
    let shape_array = ['brain',shapes.sphereShell,shapes.sphereShell2, shapes.boxShell, shapes.circularHyperboloid]


    if (!gl) {
        throw new Error('WebGL not supported')
    }

    let resolution = 1e5;
    let shape = 0;
    let key_events = [37,38,39,40];
    let damping = .2;


    temp = await createPointCloud('brain'); // or shapes.[shape]
    const brainVertices = await reducePointCount(temp,resolution)

    // Generate Point Clouds (defined in point-functions.js)
    if (shape_array[shape] != 'brain') {
        vertexHome =  await createPointCloud(shape_array[shape],resolution);
    } else {
        vertexHome = [...brainVertices];
    }
    vertexCurr = vertexHome;

// createbuffer
// load vertexData into buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCurr), gl.DYNAMIC_DRAW);

    // let forceData = [];
    // for (let ind = 0; ind < vertexData.length/3; ind++){
    //     forceData = [...forceData,[0.5,0.5,0.5]]
    // }
    // const forceBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, forceBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(forceData), gl.STATIC_DRAW);

// create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;

varying vec3 vColor;

uniform mat4 matrix;
uniform vec3 force;
uniform float u_time;
uniform float u_noiseCoeff;

vec3 this_noise;


//Classic Perlin 3D Noise 
//by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
    float x = position.x;
     float y = position.y;
     float z = position.z;
     this_noise = vec3(0,0,u_noiseCoeff) * cnoise(vec3(x + u_time, y + u_time,z + u_time));
     vColor = vec3(1,1,1);
    gl_Position = matrix * vec4(position+force+this_noise,1);
    gl_PointSize = 1.0;
}`);
    gl.compileShader(vertexShader);

// create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor,1.0);
}
`);
    gl.compileShader(fragmentShader);

// create program
    const program = gl.createProgram();

// attach shaders to program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program)

// enable vertex attributes
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// const colorLocation = gl.getAttribLocation(program,`color`);
// gl.enableVertexAttribArray(colorLocation);
// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
// gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0,0);


// draw
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

// matrix code
    const uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`),
        force: gl.getUniformLocation(program, `force`),
        time: gl.getUniformLocation(program, `u_time`),
        noiseCoeff: gl.getUniformLocation(program, `u_noiseCoeff`),
    };

    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
        75 * Math.PI / 180, // vertical field-of-view (angle, radians)
        canvas.width / canvas.height, // aspect W/H
        1e-4, // near cull distance
        1e4, // far cull distance
    );

    const mvMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    // mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
    // mat4.rotateY(modelMatrix, modelMatrix, -Math.PI / 2);
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, 2]);
    mat4.invert(viewMatrix, viewMatrix);


    // Enable events on mousehold in WebGL
    let holdStatus;
    let mouseEv;
    let moveStatus;
    let x;
    let y;
    let prev_x;
    let prev_y;
    let diff_x = 0;
    let diff_y = 0;
    let scroll;
    let t = 0;
    let diff = [];
    let timeFlag = false;
    let tIter = 1;

    canvas.onmousedown = function(ev){
        holdStatus = true;
        mouseEv = ev;
        x = ev.clientX;
        prev_x = x;
        y = ev.clientY;
        prev_y = y;
    };

    canvas.onmouseup = function(ev){
        holdStatus = false;
    };
    canvas.onmousemove = function(ev){
        mouseEv = ev;
        moveStatus = true;
        x = ev.clientX;
        y = ev.clientY;
    };

    canvas.onwheel = function(ev){
        scroll = ev.deltaY;
        mat4.translate(viewMatrix, viewMatrix, [scroll/100,0,0]);
    };

    document.onkeydown = function(ev){
        if (key_events.includes(ev.keyCode)){
            if (ev.keyCode == '38') {
                timeFlag = true;
                t = 0;
                tIter = 1;
            } else if (ev.keyCode == '40') {
                tIter =+ damping*(-t);
            } else if (ev.keyCode == '37') {
                if (shape > 0) {
                    shape -= 1
                    if (shape_array[shape] != 'brain') {
                        vertexHome = createPointCloud(shape_array[shape], resolution); //.1e5); // or shapes.[shape]
                    } else {
                        vertexHome = brainVertices;
                    }
                }
            } else if (ev.keyCode == '39') {
                if (shape < 4) {
                    shape += 1
                    if (shape_array[shape] != 'brain') {
                        vertexHome = createPointCloud(shape_array[shape], resolution); //.1e5); // or shapes.[shape]
                    } else {
                        vertexHome = brainVertices;
                    }                }
            }
        }
    };

    function mouseState() {
        if (holdStatus && moveStatus) {
            diff_x = (x-prev_x);
            diff_y = (y-prev_y)
            prev_x = x;
            prev_y = y;
            // gl.uniform3fv(uniformLocations.force, new Float32Array([0, 50*x, 50*y]))
        }
    }

    function animate() {
        requestAnimationFrame(animate)
        mouseState()

        // Ease points around
        if (vertexHome != vertexCurr){
            for (let ind in vertexHome){
                diff = vertexHome[ind] - vertexCurr[ind]
                if (diff <= Math.abs(.01)){
                    vertexCurr[ind] = vertexHome[ind];
                } else {
                    vertexCurr[ind] += damping * diff;
                }
            }
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCurr), gl.DYNAMIC_DRAW);
            console.log('always animating...')
        }

        gl.drawArrays(gl.POINTS, 0, vertexCurr.length / 3);
        mat4.rotateY(modelMatrix, modelMatrix, diff_y*2*Math.PI/canvas.height);
        mat4.rotateZ(modelMatrix, modelMatrix, diff_x*2*Math.PI/canvas.width);
        mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
        gl.uniform1f(uniformLocations.noiseCoeff,t/10);
        gl.uniform1f(uniformLocations.time, t/1000);
        moveStatus = false;
        diff_x *= (1-damping);
        diff_y *= (1-damping);
        if (timeFlag) {
            if (Math.sign(tIter) == -1){
                tIter =+ damping*(-t)
            }
            if (t >= 0){
                t += tIter;
            }
        }
    };
    animate()
}

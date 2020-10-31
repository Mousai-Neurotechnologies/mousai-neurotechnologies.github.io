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
    // let shape_array = ['brain', 'voltage', shapes.sphereShell, shapes.sphereShell2, shapes.boxShell, shapes.circularHyperboloid]
    // let render_array = [gl.POINTS, gl.LINES, gl.POINTS, gl.POINTS, gl.POINTS, gl.POINTS]
    let shape_array = ['brain', 'voltage',shapes.sphereShell2]
    let render_array = [gl.POINTS, gl.LINE_STRIP,gl.POINTS]


    // ------------------------------------- P5 Ported Controls ------------------------------------ //
    // Initialize Channel Controls
    const selectElement = document.getElementById('channels');

    selectElement.addEventListener('change', (event) => {
        channels = parseFloat(event.target.value);

        [vertexHome, channel_start_indices] = getVoltages([],resolution,2);

        signal = new Array(channels);
        other_signal = new Array(channels);

        for (let chan = 0; chan < channels; chan++) {
            signal[chan] = new Array(reduce_point_display_factor).fill(0);
            other_signal[chan] = new Array(reduce_point_display_factor).fill(0);
        }

        displacement = resetDisplacement();
        other_displacement = resetDisplacement();
        disp_flat = [...displacement.flat()]
        other_disp_flat = [...other_displacement.flat()]
        signal_sustain = (Math.round(resolution/channels))/reduce_point_display_factor;

    });

    // Initialize Socket Data Passing
    socket.on('bci', passSignal);

    function passSignal(data) {
        other_signal = data.signal
        console.log('Signal passed')
    }


    // ------------------------------------- P5 Ported Variables ------------------------------------ //
    let first_sig = true;
    let in_min
    let in_max
    let out_min
    let out_max
    let t_inner
    let y1
    let basetime_package
    let signal_package
    let time_package
    let y_package
    let label_package = ['me', 'other'];
    // let color_package = [p5.color('#7373FF'), p5.color('#76BEFF')]
    // let band_color = [p5.color('#7373FF'), p5.color('#76BEFF')];
    let this_band_color;

    if (!gl) {
        throw new Error('WebGL not supported')
    }

    let shape = 0;
    let key_events = [37, 38, 39, 40];
    let damping = .2;
    let z_off = 2;


    if (typeof brainVertices === 'undefined') {
        temp = await createPointCloud('brain'); // or shapes.[shape]
        brainVertices = await reducePointCount(temp, desired_resolution)
        // brainMesh = await convertToMesh(brainVertices)
        // meanX = every_nth(brainVertices,0, 3).reduce(sum, 0)/(brainVertices.length/3)
        // meanY = every_nth(brainVertices,1, 3).reduce(sum, 0)/(brainVertices.length/3)
        // meanZ = every_nth(brainVertices,2, 3).reduce(sum, 0)/(brainVertices.length/3)
        resolution = brainVertices.length / 3;
    }

    if (shape_array[shape] == 'brain') {
        vertexHome = [...brainVertices];
    } else {
        vertexHome = createPointCloud(shape_array[shape], resolution);
    }

    vertexCurr = vertexHome;

    displacement = resetDisplacement();
    other_displacement = resetDisplacement();
    disp_flat = [...displacement.flat()]
    other_disp_flat = [...other_displacement.flat()]

    signal_sustain = (Math.round(resolution/channels))/reduce_point_display_factor;


// createbuffer
// load vertexData into buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCurr), gl.DYNAMIC_DRAW);

    const dispBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disp_flat), gl.DYNAMIC_DRAW);

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
attribute float z_displacement;

varying vec3 vColor;

uniform mat4 matrix;
uniform vec3 force;
uniform float u_distortion;
uniform float u_noiseCoeff;
uniform float synchrony;

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
     this_noise = vec3(0,0,u_noiseCoeff) * cnoise(vec3(x + u_distortion, y + u_distortion,z + u_distortion));
     vColor = vec3(.5-synchrony,.5,synchrony + .5);
    gl_Position = matrix * vec4((position.x+force.x+this_noise.x),(position.y+force.y+this_noise.y),(position.z+force.z+this_noise.z+z_displacement),1);
    gl_PointSize = 2.0;
}`);
    gl.compileShader(vertexShader);

// create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor,0.5);
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

    const dispLocation = gl.getAttribLocation(program, `z_displacement`);
    gl.enableVertexAttribArray(dispLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
    gl.vertexAttribPointer(dispLocation, 1, gl.FLOAT, false, 0, 0);

// draw
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// matrix code
    const uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`),
        force: gl.getUniformLocation(program, `force`),
        distortion: gl.getUniformLocation(program, `u_distortion`),
        noiseCoeff: gl.getUniformLocation(program, `u_noiseCoeff`),
        synchrony: gl.getUniformLocation(program, `synchrony`),
    };

    const modelMatrix = mat4.create();

    let viewMatrix = mat4.create();
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, z_off]);
    mat4.invert(viewMatrix, viewMatrix);

    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
        75 * Math.PI / 180, // vertical field-of-view (angle, radians)
        canvas.width / canvas.height, // aspect W/H
        1e-4, // near cull distance
        1e4, // far cull distance
    );

    const mvMatrix = mat4.create();
    const mvpMatrix = mat4.create();


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
    let distortion = 0;
    let diff = [];
    let distortFlag = false;
    let distortIter = 1;
    let ease = true;
    let rotation = true;

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
        mat4.invert(viewMatrix, viewMatrix);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -z_off]);
        mat4.translate(viewMatrix, viewMatrix, [0,0,scroll/100]);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, z_off]);
        mat4.invert(viewMatrix, viewMatrix);
        z_off += scroll/100;
    };

    document.onkeydown = function(ev){
        if (key_events.includes(ev.keyCode)){
            if (ev.keyCode == '38') {
                distortFlag = true;
                distortion = 0;
                distortIter = 1;
            } else if (ev.keyCode == '40') {
                distortIter =+ damping*(-distortion);
            } else if (ev.keyCode == '39' || ev.keyCode == '37') {

                    // reset displacement if leaving voltage visualization
                    if (shape_array[shape] == 'voltage') {
                        displacement = resetDisplacement();
                        other_displacement = resetDisplacement();
                        disp_flat = [...displacement.flat()];
                        other_disp_flat = [...other_displacement.flat()]
                        gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disp_flat), gl.DYNAMIC_DRAW);
                    }

                    if (ev.keyCode == '39' && shape < (shape_array.length-1))
                    {
                        shape += 1
                    }
                    else if (ev.keyCode == '37' && shape > 0) {
                        shape -= 1
                    }

                    if (shape_array[shape] == 'brain'){
                        vertexHome = [...brainVertices];
                        ease = true;
                        rotation = true
                    } else if (shape_array[shape] == 'voltage'){
                        // Reset View Matrix
                        viewMatrix = mat4.create();
                        mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
                        mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
                        mat4.translate(viewMatrix, viewMatrix, [0, 0, z_off]);
                        mat4.invert(viewMatrix, viewMatrix);

                        // Create signal dashboard
                        vertexHome = createPointCloud(shape_array[shape], resolution);
                        ease = true;
                        rotation = false
                    }
                    else {
                        vertexHome = createPointCloud(shape_array[shape], resolution);
                        ease = true;
                        rotation = true
                    }
            }
        }
    };

    function mouseState() {
        if (holdStatus && moveStatus) {
            if (rotation){
                diff_x = (x - prev_x);
                diff_y = (y - prev_y)
            }
            prev_x = x;
            prev_y = y;
            // gl.uniform3fv(uniformLocations.force, new Float32Array([0, 50*x, 50*y]))
        }
    }

    function animate() {
        requestAnimationFrame(animate)
        mouseState()

        // Generate signal if specified
        if (generate) {
            if (count == generate_interval-1){
                sendSignal(channels)
                count = 0;
            } else {
                count += 1
            }}


        // Append voltage stream to array
        displacement = updateDisplacement(displacement,signal)
        disp_flat = [...displacement.flat()]
        other_displacement = updateDisplacement(other_displacement,other_signal)
        other_disp_flat = [...other_displacement.flat()]

        // Push voltage stream to displacement buffer
        if (shape_array[shape] == 'voltage') {
            gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disp_flat), gl.DYNAMIC_DRAW);
        }

        // Get synchrony
        if (shape_array[shape] != 'brain' && shape_array[shape] != 'voltage') {
            synchrony = getPearsonCorrelation(disp_flat, other_disp_flat);
            if (isNaN(synchrony)) {
                synchrony = 0;
            }
        } else {
            synchrony = 0;
        }
        gl.uniform1f(uniformLocations.synchrony, synchrony);



        // Ease points around
        if (ease){
            for (let ind in vertexHome){
                diff = vertexHome[ind] - vertexCurr[ind]
                if (diff <= Math.abs(.01)){
                    vertexCurr[ind] = vertexHome[ind];
                } else {
                    vertexCurr[ind] += damping * diff;
                }
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCurr), gl.DYNAMIC_DRAW);
        }

        // Update rotation speeds
        moveStatus = false;
        diff_x *= (1-damping);
        diff_y *= (1-damping);

        // Modify Distortion
        if (distortFlag) {
            if (Math.sign(distortIter) == -1){
                distortIter =+ damping*(-distortion)
            }
            if (distortion >= 0){
                distortion += distortIter;
            }
        }

        // Modify view matrix
        mat4.invert(viewMatrix, viewMatrix);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, -z_off]);
        mat4.rotateY(viewMatrix, viewMatrix, -diff_x*2*Math.PI/canvas.height);
        mat4.rotateX(viewMatrix, viewMatrix, -diff_y*2*Math.PI/canvas.width);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, z_off]);
        mat4.invert(viewMatrix, viewMatrix);
        // mat4.rotateZ(viewMatrix, viewMatrix, -0.01);

        // Create container matrix for WebGL
        mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)

        // Update Uniforms
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
        gl.uniform1f(uniformLocations.noiseCoeff,distortion/10);
        gl.uniform1f(uniformLocations.distortion, distortion/1000);

        // Draw
        gl.drawArrays(render_array[shape], 0, vertexCurr.length / 3);

        if (synchrony != 1 && !isNaN(synchrony)) {
            if (synchrony > 0) {
                document.getElementById('sync-dot').style.backgroundColor = 'rgb(118, 190, 255)';
            } else {
                document.getElementById('sync-dot').style.backgroundColor = 'rgb(255, 118, 233)';
            }
            document.getElementById('sync-dot').style.width = (Math.abs(synchrony) * 50).toString() + 'px';
            document.getElementById('sync-dot').style.height = (Math.abs(synchrony) * 50).toString() + 'px';
        } else{
            document.getElementById('sync-dot').style.height = '0px';
            document.getElementById('sync-dot').style.width = '0px';

        }




    };
    animate()
}

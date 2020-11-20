//constants for local simulated voltage stream1
const defaultDuration = 1
const defaultSamplerate = 125;
const defaultChannels = 8;
// state would go here. consider storing a global variable for the 'slide' between states here
// mysterious garrett constants
const VOLTAGE_Z_OFFSET = .5;
const INNER_Z = 2*VOLTAGE_Z_OFFSET;

// TODO: [C] make this align closely with back end
function generateVoltageStream(channels, duration, samplerate) {
    // returns a 2D list with channels amt of voltage signal lists that have length duration x sample rate

    let len = duration // seconds
    let base_freq = document.getElementById("freqRange").value

    signal = new Array(channels);
    for (let channel =0; channel < channels; channel++) {
        signal[channel] = bci.generateSignal([(INNER_Z/2)/(2*channels)], [base_freq], samplerate, len);
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



class Brain {
    constructor(){
        this.simulated = true; //will be set to false if it's livestream data? idk wanted to have this record here.
        //TODO: [A] Make this a point cloud
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_points_dynamic.html
        // also see https://threejs.org/docs/#api/en/materials/PointsMaterial
        // may have to use let/var instead of const
        // CURRENTLY this is a cube.
        // consider storing two sets of geometries here, one for brain, one for voltage lines
        // point cloud seems to have a built in morph function, but must study it more
        // Alternatively, use vertex shader + fragment shader here.
        this.geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
        //TODO [A] https://threejs.org/docs/#api/en/materials/PointsMaterial.morphTargets
        this.material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );

    }
    update(brainData) {
        this.timestamp = brainData.timestamp;
        this.samplerate = brainData.samplerate;
        this.synchrony = brainData.synchrony;
        this.voltages = brainData.voltages;
        // TODO: [A] manipulate points here
    }


}




//
let camera, scene, renderer;
let mesh;

let brains = [];


init();
animate();

function resizeAmtBrains(amt){
  for(let i = 0; i < amt; i++){
      brains.push(new Brain());
  }
  //TODO: [D] take this snippet of code and make it a function somewhere outside, expose the parameters to account for variable window width,
    // perhaps do something other than arranging them side by side.
  brains.forEach(function(e,i){
      let x = THREE.Math.mapLinear(i,0,amt,-200,200);
      e.mesh.position.x = THREE.Math.mapLinear(i,0,4,-600,600);
  });

};


function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 900;

    scene = new THREE.Scene();

    //clunky, will change depending on how backend will go
    resizeAmtBrains(3);
    brains.forEach(function(e){
       scene.add(e.mesh);
    });

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    document.onmousemove = function(e){
        //TODO: [B] mouse based camera controls here

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    // TODO: (discuss)  Brains .update() according to new data potentially here, unless we manage databinding.
    requestAnimationFrame( animate );



    renderer.render( scene, camera );

}



/*
Samir's notes.

# Socket -> Pre-processing -> Attributes/Uniforms on shader

Data coming in:
    Voltage Stream  = Channels x Range of Time

For the lines = CPU must manage the buffer (smoothly slide)

For the brain = CPU calculates synchrony with voltage streams from all brains
    passes in a Synchrony floating point/Vec1 per connection



 ask garrett how:
 - Camera needs to be moved when multiple brains
    brain always rotates according mousedrag

 - How does the brain deform
    synchrony messes with the vertex shader

 - Lines - differentiated by color


- draw lines according to


Socket code

 UI elements
 - Autoplay signal presses send signal over and over again
 - modify frequnecy and channels


getVoltages segmented the same as signal
signal

WebSocket Code
    # either invidiual sockets on front end or backend
    - JSON wraps data that contains 2D list of channels x range of Time
    - Provisions to receive code from other clients
    - Instantiate brains per connection
    - deinstantiate brains per connection

deinstantiate and instantiate method to add brain to brains list that updates position. up to 9
(use your brain as reference point, center + rings)

 Graphics Code
- per Brain
    - render PointCloud of brain from that dude's JSON + deformation (deformation is just xyz noise related to center)
    - render PointCloud of line voltages from webPacket
    - be able to update origin position

 - Mouse interaction
    - orbit brain in brain-mode

 - loop
    - update each brain's data (shader)
    - set line or brain mode and deal with easing

 UI Code
 - Set brain or line mode (global state)
 - Send sample signals
 - Mess with synchrony

 ///
 if it was all on shader
 - brain points
 - list of positions of lines
 - 0-1 ease
 - synchrony
 - voltage whatever






 Brain is going to brain-mode, line-mode

 //be able to draw full polygon

 list of brains















 */
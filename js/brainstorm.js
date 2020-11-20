//constants for local simulated voltage stream1
const defaultDuration = 1
const defaultSamplerate = 125;
const defaultChannels = 8;
// state would go here. consider storing a global variable for the 'slide' between states here
// mysterious garrett constants
const DIST_BETWEEN_WAVES = .5;
const MAX_AMPLITUDE = 2*DIST_BETWEEN_WAVES;

// TODO: [C] make this align closely with back end
function generateVoltageStream(channels, duration, samplerate) {
    // returns a 2D list with channels amt of voltage signal lists that have length duration x sample rate
    let len = duration // seconds
    let base_freq = document.getElementById("freqRange").value
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



class Brain {
    constructor(positions){
        this.simulated = true; //will be set to false if it's livestream data? idk wanted to have this record here.
        //TODO: [A] Make this a point cloud
        // consider storing two sets of geometries here, one for brain, one for voltage lines
        // interim points can be generated as a function with an input of 0.0 to 1.0 that 'mixes' the position of the two
        // point cloud seems to have a built in morph function, but must study it more
        // Alternatively, use vertex shader + fragment shader here.
        this.mesh = createMesh( positions, scene, 1.0, 0, 0, 600, Math.random() * 0xffffff );
    }
    update(brainData) {
        this.timestamp = brainData.timestamp;
        this.samplerate = brainData.samplerate;
        this.synchrony = brainData.synchrony;
        this.voltages = brainData.voltages;
        // TODO: [A] manipulate points here
        // potentially?  https://threejs.org/docs/#api/en/materials/PointsMaterial.morphTargets

    }


}




//
let camera, scene, renderer;
let mesh;
let parent;

let brainVertices = [];
let DESIRED_POINTS = 1e5/2; // 80000
let POINT_SIZE = 1;
let NUM_BRAINS = 3;


let brains = [];
const loader = new THREE.OBJLoader().setPath( 'assets/models/' );
let objArray = ['lh.pial','rh.pial']

init();
animate();

function resizeAmtBrains(positions,amt){
  for(let i = 0; i < amt; i++){
      brains.push(new Brain(positions));
  }
  //TODO: [D] take this snippet of code and make it a function somewhere outside, expose the parameters to account for variable window width,
    // perhaps do something other than arranging them side by side.
  brains.forEach(function(e,i){
      let x = THREE.Math.mapLinear(i,-1,amt,-250,250);
      e.mesh.position.x = x;
  });

};

function combineBuffer( model, bufferName ) {

    let count = 0;

    model.traverse( function ( child ) {

        if ( child.isMesh ) {

            const buffer = child.geometry.attributes[ bufferName ];

            count += buffer.array.length;

        }

    } );

    const combined = new Float32Array( count );

    let offset = 0;

    model.traverse( function ( child ) {

        if ( child.isMesh ) {

            const buffer = child.geometry.attributes[ bufferName ];

            combined.set( buffer.array, offset );
            offset += buffer.array.length;

        }

    } );

    return new THREE.BufferAttribute( combined, 3 );

}

function createMesh( positions, scene, scale, x, y, z, color ) {

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', positions.clone() );
    geometry.setAttribute( 'initialPosition', positions.clone() );

    geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

        mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: POINT_SIZE, color: color } ) );
        mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;

        parent.add( mesh );

    return mesh
}


function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 900;

    scene = new THREE.Scene();
    parent = new THREE.Object3D();
    scene.add( parent );

    let positions;
    let _temp;

    //clunky, will change depending on how backend will go
    loader.load( objArray[0] + '.obj', function (object) {
        positions = combineBuffer( object, 'position' );
        _temp = reducePointCount(positions.array, DESIRED_POINTS);
        positions.array = new Float32Array(_temp.length)
        positions.array.set(_temp)
        positions.count = positions.array.length/3
        resolution = positions.count;
        resizeAmtBrains(positions,NUM_BRAINS);
    });


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    document.onmousemove = function(e){
        //TODO: [B] rotate brains, something like this
        // brains.forEach(function(e){
        //     e.mesh.rotate.x = something
        // })

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

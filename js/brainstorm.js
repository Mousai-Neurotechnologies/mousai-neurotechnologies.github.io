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

class ParticleCloud{
    constructor() {
        //TODO: [A] Make this a point cloud
        // Alternatively, use vertex shader + fragment shader here.
        this.mesh = new THREE.Object3D();
        this.streams = []
    }

    initializeMesh(numPoints){
        const points = new Float32Array( numPoints+1);
        points.set(Array.from({length: numPoints+1}, () => Math.floor(50*Math.random() - 25)));
        const positions = new THREE.BufferAttribute(points, 3 );
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', positions.clone());
        geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        geometry.morphAttributes.position = [];
        geometry.morphTargetsRelative = true;
         let _tempMesh = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: POINT_SIZE,
             // map: new THREE.TextureLoader().load( 'assets/sprites/circle.png' ),
             color: 0xffffff,
            opacity: 0.4,
            transparent: true,
             morphTargets: true
        }));

        _tempMesh.scale.x = _tempMesh.scale.y = _tempMesh.scale.z = 1.0;
        _tempMesh.position.x = 0;
        _tempMesh.position.y = 0;
        _tempMesh.position.z = 0;
        this.mesh = _tempMesh;
    }

    addMorphTarget(name, positions,fullSize,offset){

        let targetAttribute = this.mesh.geometry.morphAttributes.position
        console.log('offset: ' + offset/3)
        console.log('max: ' + fullSize)


        if (name in this.mesh.morphTargetDictionary){
            targetAttribute[this.mesh.morphTargetDictionary[name]].array.set(positions,offset)
            targetAttribute[this.mesh.morphTargetDictionary[name]].count = targetAttribute[this.mesh.morphTargetDictionary[name]].array.length
            offset += positions.length;
        } else {
            let loc = Object.keys(this.mesh.morphTargetDictionary).length
            this.mesh.morphTargetDictionary[name] = loc
            let fillerArray = new Array(fullSize*3).fill(0)
            targetAttribute[loc] = new THREE.Float32BufferAttribute(fillerArray, 3);
            targetAttribute[loc].set(positions,0)
            offset = positions.length
        }

        return offset
    }

    addBrainComponents(regions){

        let objPositions;
        let downsampledPositions = [];
        let offset;
        let self = this;
        for (let i = 0; i < regions.length; i++) {
            loader.load(regions[i] + '.obj', function (object) {
                objPositions = combineBuffer(object, 'position');
                downsampledPositions = reducePointCount(objPositions.array, Math.floor((self.mesh.geometry.attributes.position.count*3)/regions.length));
                // brains[0].addMeshToGroup('position',positions,4.0, 0, 350, 0, 0xffffff, 0.5)
                offset = self.addMorphTarget('brain',downsampledPositions,self.mesh.geometry.attributes.position.count*3,offset)
            });
        }
    }

    addStream(object) {
        this.streams.push(object);
        console.log('not implemented')
    }
}

// class Brain {
//     constructor() {
//         this.simulated = true; //will be set to false if it's livestream data? idk wanted to have this record here.
//         this.group = new THREE.Group();
//     }
//
//     update(brainData) {
//         this.timestamp = brainData.timestamp;
//         this.samplerate = brainData.samplerate;
//         this.synchrony = brainData.synchrony;
//         this.voltages = brainData.voltages;
//         // TODO: [A] manipulate points here
//     }
//
//     addMeshToGroup(name, positions, scale, x, y, z, color, opacity) {
//         let _tempMesh
//         let _tempGeometry = new THREE.BufferGeometry();
//
//         _tempGeometry.setAttribute(name, positions.clone());
//         _tempGeometry.attributes[name].setUsage(THREE.DynamicDrawUsage);
//
//         if (opacity < 1.0) {
//             _tempMesh = new THREE.Points(_tempGeometry, new THREE.PointsMaterial({
//                 size: POINT_SIZE,
//                 color: color,
//                 opacity: opacity,
//                 transparent: true
//             }));
//         } else {
//             _tempMesh = new THREE.Points(_tempGeometry, new THREE.PointsMaterial({
//                 size: POINT_SIZE,
//                 color: color
//             }));
//         }
//
//         _tempMesh.scale.x = _tempMesh.scale.y = _tempMesh.scale.z = scale;
//         _tempMesh.position.x = x;
//         _tempMesh.position.y = y;
//         _tempMesh.position.z = z;
//
//         this.group.add(_tempMesh);
//     }
// }

//
let camera, scene, renderer, clock;
let mesh;

let brainVertices = [];
const DESIRED_POINTS = 1e5/2; // 80000
const POINT_SIZE = 1;
let NUM_BRAINS = 1;
let STATES = ['box','brain']
let KEY_EVENTS = [37, 38, 39, 40];
let DAMPING = 0.2;
let EPSILON = 0.001


const SPEED = 0.5;
let sign = 1;
let state = 0;


let particleCloud = new ParticleCloud();
let brains = [];
const loader = new THREE.OBJLoader().setPath( 'assets/models/' );
let objArray = ['lh.pial','rh.pial'] // ['Left-Hippocampus','Right-Hippocampus'] //

init();
animate();

function init() {

    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.2, 100 );
    // camera.position.set( 0, 5, 5 );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 300;
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    particleCloud.initializeMesh(DESIRED_POINTS);

    particleCloud.addBrainComponents(objArray)

    // particleCloud.mesh.rotateZ(-Math.PI/2)
    scene.add(particleCloud.mesh)

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild( renderer.domElement );

    //

    // const controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.minDistance = 1;
    // controls.maxDistance = 1000;

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'visibilitychange', onVisibilityChange );
    // document.onmousemove = function(e){
    //     //TODO: [B] rotate brains, something like this
    //     // brains.forEach(function(e){
    //     //     e.mesh.rotate.x = something
    //     // })
    //
    // }

}

// function resizeAmtBrains(meshes,amt){
//     brains = [];
//     for(let i = 0; i < amt; i++){
//       brains.push(new Brain());
//         meshes.forEach(function(e){
//             console.log('Clone: ' + e.clone())
//             brains[brains.length - 1].mesh.add(e.clone())
//         });
//   }
//     console.log(brains)
//
//     //TODO: [D] take this snippet of code and make it a function somewhere outside, expose the parameters to account for variable window width,
//     // perhaps do something other than arranging them side by side.
//     brains.forEach(function(e,i){
//       let x = THREE.Math.mapLinear(i,-1,amt,-250,250);
//         e.mesh.position.x = x;
//       scene.add(e.mesh)
//   });
//
// };

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onVisibilityChange() {

    if ( document.hidden === true ) {

        clock.stop();

    } else {

        clock.start();

    }

}

function animate() {

    // TODO: (discuss)  Brains .update() according to new data potentially here, unless we manage databinding.
    requestAnimationFrame( animate );
    const delta = clock.getDelta();
    const step = delta * SPEED;

    particleCloud.mesh.rotation.y += step;

    if (isNaN(particleCloud.mesh.morphTargetInfluences[ 0 ])){
        particleCloud.mesh.morphTargetInfluences[ 0 ] = 0;
    }

    if (particleCloud.mesh.morphTargetInfluences[ 0 ] != 0 || particleCloud.mesh.morphTargetInfluences[ 0 ] != 1) {
        if (state == 0) {
            particleCloud.mesh.morphTargetInfluences[0] -= (particleCloud.mesh.morphTargetInfluences[0]) * DAMPING;
            if (particleCloud.mesh.morphTargetInfluences[0] < EPSILON) {
                particleCloud.mesh.morphTargetInfluences[0] = 0;
            }
        } else {
            particleCloud.mesh.morphTargetInfluences[0] += (1-particleCloud.mesh.morphTargetInfluences[0]) * DAMPING;
            if ((1-particleCloud.mesh.morphTargetInfluences[0]) < EPSILON) {
                particleCloud.mesh.morphTargetInfluences[0] = 1;
            }
        }
    }


    // particleCloud.mesh.morphTargetInfluences[ 0 ] = particleCloud.mesh.morphTargetInfluences[ 0 ] + step * sign;
    //
    // if ( particleCloud.mesh.morphTargetInfluences[ 0 ] <= 0 || particleCloud.mesh.morphTargetInfluences[ 0 ] >= 1 ) {
    //     sign *= - 1;
    // }

    renderer.render( scene, camera );

}

// Object Loading Utilities
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

// User Interactions
document.onkeydown = function(ev){
    if (KEY_EVENTS.includes(ev.keyCode)){
        if (ev.keyCode == '38') {
            // distortFlag = true;
            // if (distortIter == -1) {
            //     distortion = 0;
            // }
            // distortIter = 1;
        } else if (ev.keyCode == '40') {
            // distortIter =+ ease_array[state][animState]*(-distortion);
        } else if (ev.keyCode == '39' || ev.keyCode == '37') {

            if (ev.keyCode == '39' && state < (STATES.length-1))
            {
                state += 1
            }
            else if (ev.keyCode == '37' && state > 0) {
                state -= 1
            }
        }
    }
};



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

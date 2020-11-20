
    // WebSocket Setup
    let messages = []
    let url = 'https://brainsatplay.azurewebsites.net/'
    let socket = io.connect((url))

    let numUsers = 4; // Currently hardcoded; derive dynamically from server later


    // WebGL Setup
    let canvas = document.getElementById('webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let gl = canvas.getContext('webgl')
    // shape_array = ['brain', 'voltage', shapes.sphereShell, shapes.sphereShell2, shapes.boxShell, shapes.circularHyperboloid]
    // render_array = [gl.POINTS, gl.POINTS, gl.POINTS, gl.POINTS, gl.POINTS, gl.POINTS]
    let shape_array = [[shapes.sphereShells,'brains'], ['brain'], ['voltage']]
    let anim_array = [[5.0,3.0],[false],[false]] // In seconds; false has no animation
    let render_array = [[gl.POINTS, gl.POINTS],[gl.POINTS], [gl.LINES]];
    let message_array = [[numUsers + ' users online. scanning brains...', 'welcome to the brainstorm'], [''], ['']];
    let ease_array = [[.1, .1],[.1], [.1]];

    let state = 0;
    let prevState = 0;
    let animState = 0;
    let animStart = Date.now();

    // WebGL Containers
    let brainVertices;
    let brainMesh;
    let vertexHome;
    let vertexCurr;
    let vertexVel;

    let viewMatrix;

    let positionBuffer;
    let dispBuffer;

    // WebGL Variables
    let DESIRED_POINTS = 1e5/2; // 80000
    let REDUCE_POINT_DISPLAY_FACTOR = 300;
    let signal_sustain;
    let resolution;
    let INITIAL_Z_OFFSET = 1.7;

    let AUTO_ROTATION_X = 0.0; //0.2;


    let displacement = [];
    let disp_flat = [];
    SYNCHRONY_BUFFER_SIZE = 100;
    let synchrony = new Array(SYNCHRONY_BUFFER_SIZE).fill(0);

    // Camera
    let cameraHome = INITIAL_Z_OFFSET;
    let cameraCurr = INITIAL_Z_OFFSET;

    // Point Movement
    let DAMPING = .1;
    let epsilon = .001;
    let t = 0.0;
    let diff_x = 0;
    let diff_y = 0;

    let ease = true;
    let rotation = true;
    let zoom = true;

    // Signal Generation Variables
    let channels = 1;
    let generate = false;
    let duration = 1 // seconds
    let samplerate = 125; // This is almost definitely wrong
    let generate_interval = Math.round(duration*samplerate); // seconds
    let count = 0;

    // Distortion Variables
    let distort = false;
    let distortion = 0;
    let distortFlag = false;
    let distortIter = 1;

    // Signal Setup
    let signal = new Array(channels);
    let other_signal = new Array(channels);
    for (let chan = 0; chan < channels; chan++){
    signal[chan] = new Array(REDUCE_POINT_DISPLAY_FACTOR).fill(0);
    other_signal[chan] = new Array(REDUCE_POINT_DISPLAY_FACTOR).fill(0);
    }
    let passed_signal = []

    $(function () {
    $('form').submit(function(e) {
            e.preventDefault(); // prevents page reloading
            socket.emit('chat message', $('#message').val());
            $('#message').val('');
            return false;
        });
    });

    function initialize() {

        $('#canvas-message').animate({'opacity': 0}, 100, function(){
            $(this).html('loading...').animate({'opacity': 1}, 0);
        });

        socket.on('chat message', (data) => {
            messages = [...messages, data];
            // you can also do this.messages.push(data)
        });

        socket.on('chat message', function (msg) {
            $('#messages').append($('<li>').text(msg));
    });

    socket.on('bci', passSignal);


    generate = generateSignal(generate,channels)
    particleBrain()
    }

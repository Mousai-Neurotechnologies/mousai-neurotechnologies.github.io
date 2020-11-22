/* -------------------------- Utility Functions -------------------------- */

// function filterSignal(data){
//     let firCalculator = new fili.FirCoeffs();
//     let coeffs = firCalculator.bandpass({order: filterOrder, Fs: samplerate, F1: this.minFilter, F2: this.maxFilter});
//     let filter = new fili.FirFilter(coeffs);
//     let features = bci.windowApply(data, trial => {
//         // Bandpass filter the trial
//         let channels = bci.transpose(trial);
//         console.log(channels)
//         channels = channels.map(sig => filter.simulate(sig).slice(filterOrder));
//         console.log(channels)
//         trial = bci.transpose(channels);
//         console.log(trial)
//         return trial
//     }, data.length, data.length);
//     console.log([].concat(...features))
//     console.log('filtering')
//     return data
// }

function sum(a,b){
    return a + b
}


function closeTutorial() {
    setTimeout(() => {
        document.getElementById("tutorial").style.opacity = '0';
        document.getElementById("tutorial").style.pointerEvents = 'none';
    }, this.animationDelay + 10);
}

function openTutorial(){
    setTimeout(() => {
        document.getElementById("tutorial").style.opacity = '.9';
        document.getElementById("tutorial").style.pointerEvents = 'auto';
    }, this.animationDelay + 10);
}

//
// Synchrony Calculation
// Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
//

function getPearsonCorrelation(x, y) {
    var shortestArrayLength = 0;

    if (x.length == y.length) {
        shortestArrayLength = x.length;
    } else if (x.length > y.length) {
        shortestArrayLength = y.length;
        // console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        // console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for (var i = 0; i < shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }

    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;

    return answer;
}


//
// Two Way Data Binding
//

var elements = document.querySelectorAll('[data-tw-bind]'),
    scope = {};
elements.forEach(function(element) {
    //execute scope setter
    if(element.type === 'text'|| element.type === 'textarea' || element.type === 'range'){
        var propToBind = element.getAttribute('data-tw-bind');
        addScopeProp(propToBind);
        element.oninput = function(){
            scope[propToBind] = element.value;
        }

        //bind prop to elements
        function addScopeProp(prop){
            //add property if needed
            if(!scope.hasOwnProperty(prop)){
                //value to populate with newvalue
                var value;
                Object.defineProperty(scope, prop, {
                    set: function (newValue) {
                        value = newValue;
                        elements.forEach(function(element){
                            //change value to binded elements
                            if(element.getAttribute('data-tw-bind') === prop){
                                if(element.type && (element.type === 'text' ||
                                    element.type === 'textarea'||
                                    element.type === 'range')){
                                    element.value = newValue;
                                }
                                else if(!element.type){
                                    element.innerHTML = newValue;
                                }
                            }
                        });
                    },
                    get: function(){
                        return value;
                    },
                    enumerable: true
                });
            }
        }
    }});

function passSignal(msg) {
    other_signal = msg.ts_filtered
}

    // Plot Bands
    // let power;
    // let label;
    // let band_names = ['delta', 'theta', 'alpha', 'beta', 'gamma']
    // let band_meaning = ['(1-3 Hz)','(4-7 Hz)','(8-12 Hz)','(13-30 Hz)','(31-50 Hz)']
    //
    // for (let band = 0; band < band_names.length; band++) {
    //     try {
    //         power = bci.bandpower(y_filtered[0], samplerate, band_names[band], {relative: true});
    //         label = band_names[band] + ' ' + band_meaning[band]
    //     } catch {
    //         label = 'sample rate too low'
    //         this_band_color = p5.color('#FF76E9');
    //         power = 1
    //     }
    //     power = (p5.height / 2) - (p5.height / 4) * (power)
    //     squareColor.setAlpha(255 * (power));
    //     p5.fill(squareColor)
    //     p5.text(label, (band + .5) * (p5.width / band_names.length), power - 20);
    //     this_band_color.setAlpha(200 * (power));
    //     p5.fill(this_band_color)
    //     p5.rectMode(p5.CORNERS);
    //     p5.rect(band * (p5.width / (band_names.length)), p5.height / 2, (band + 1) * (p5.width / (band_names.length)), power)
    // }


function resetDisplacement(){
    let displacement = [];
    let user;
    let perUser = Math.floor(resolution/(numUsers*channels))
    for(user=0; user < numUsers; user++){
        displacement.push(new Array())
        for(let chan=0; chan < channels; chan++){
            displacement[user].push(new Array(perUser).fill(0.0));
        }
    }

    let remainder = resolution - channels*numUsers*perUser
        for (let chan = 0; chan < channels; chan++) {
            for (user = 0; user < numUsers; user++)
                if (remainder > 0) {
                    remainder--;
                    displacement[user][chan].push(0.0)
                }
        }

    return displacement
}

function generateSignal(generate, channels){
    generate = !generate;
    sendSignal(channels);

    if ( generate ){
        document.getElementById('auto-generate').innerHTML = "<i class=\"fas fa-pause-circle fa-2x\"></i>\n" +
            "<p>Stop Autoplay</p>"
    } else {
        document.getElementById('auto-generate').innerHTML = "<i class=\"fas fa-play-circle fa-2x\"></i>\n" +
            "<p>Autoplay Signal</p>"
    }

    return generate
}

function sendSignal(channels) {
    // Generate 1 second of sample data at 512 Hz
    // Contains 8 μV / 8 Hz and 4 μV / 17 Hz

    let len = duration // seconds
    let base_freq = document.getElementById("freqRange").value

    signal = new Array(channels);
    for (let channel =0; channel < channels; channel++) {
        signal[channel] = bci.generateSignal([(INNER_Z/2)/(2*channels)], [base_freq], samplerate, len);
    }

    let data = {
        ts_filtered: signal,
    }
    if (!ws) {
        showMessage('No WebSocket connection');
        return;
    } else {
        ws.send(JSON.stringify({'destination':'bci',
                'data': data
            })
        );
    }
}

function updateDisplacement(displacement,signal,user){
    let val;

        for (let chan in displacement[user]) {

            val = 0;

            if (signal[chan] != undefined) {
                if (signal[chan].length > 0) {
                    val = signal[chan].shift()
                }
            }

            for (let count = 0; count < Math.floor(signal_sustain); count++) {
                displacement[user][chan].shift();
                displacement[user][chan].push(val);
            }
        }

    return displacement
}

function switchToVoltage(resolution){
    // Reset View Matrix
    let viewMatrix = mat4.create();
    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, INITIAL_Z_OFFSET]);
    mat4.invert(viewMatrix, viewMatrix);

    // Create signal dashboard
    let vertexHome = getVoltages([],resolution,numUsers);
    let ease = true;
    let rotation = false;
    let zoom = false;

    return [vertexHome, viewMatrix, ease, rotation, zoom]

}

function distortToggle(){
    distort = !distort;

    if (distort) {
        distortFlag = true;
        if (distortIter == -1) {
            distortion = 0;
        }
        distortIter = 1;
    }

    if (!distort) {
        distortIter =+ ease_array[state][animState] * (-distortion);
    }

    if ( distort ){
        document.getElementById('distortToggle').innerHTML = "<i class=\"fas fa-pause-circle fa-2x\"></i>\n" +
            "<p>Undistort Shape</p>"
    } else {
        document.getElementById('distortToggle').innerHTML = "<i class=\"fas fa-play-circle fa-2x\"></i>\n" +
            "<p>Distort Shape</p>"
    }
}


function stateManager(animState){
    // reset displacement if leaving voltage visualization

    if (shape_array[prevState][animState] == 'voltage') {
        displacement = resetDisplacement();
        disp_flat = [...displacement.flat(2)]
        gl.bindBuffer(gl.ARRAY_BUFFER, dispBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disp_flat), gl.DYNAMIC_DRAW);
    }

    // set up variables for new state
    if (shape_array[state][animState] == 'brain'){
        vertexHome = [...brainVertices];
        ease = true;
        rotation = true;
        zoom = true;
    }

    if (shape_array[state][animState] == 'voltage'){

        channels = document.getElementById('channels').value;

        [vertexHome, viewMatrix, ease, rotation, zoom] = switchToVoltage(resolution)

        signal = new Array(channels);
        other_signal = new Array(channels);

        for (let chan = 0; chan < channels; chan++) {
            signal[chan] = new Array(REDUCE_POINT_DISPLAY_FACTOR).fill(0);
            other_signal[chan] = new Array(REDUCE_POINT_DISPLAY_FACTOR).fill(0);
        }

        displacement = resetDisplacement();
        disp_flat = [...displacement.flat(2)]
        signal_sustain = (Math.round(resolution/channels))/(numUsers*REDUCE_POINT_DISPLAY_FACTOR);
        cameraHome = VOLTAGE_Z_OFFSET;
    }
    else {
        viewMatrix = mat4.create();
        cameraHome = INITIAL_Z_OFFSET;
        mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
        mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
        mat4.translate(viewMatrix, viewMatrix, [0, 0, cameraCurr]);
        mat4.invert(viewMatrix, viewMatrix);
    }

    if (shape_array[state][animState] != 'brain' && shape_array[state][animState] != 'voltage'){
        vertexHome = createPointCloud(shape_array[state][animState], resolution);
        ease = true;
        rotation = false;
        zoom = false;
    }

    if (!rotation){
        diff_x = 0;
        diff_y = 0;
    }
}

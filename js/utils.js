/* -------------------------- Utility Functions -------------------------- */

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
        signal[channel] = bci.generateSignal([max_dy/4], [base_freq], samplerate, len);
        // signal[channel] = bci.generateSignal([10], [base_freq + (channel+1)*3], samplerate, len);

    }
    // signal = this.filterSignal(signal)
    // signal = bci.generateSignal([59], [rangeSlider]+10, samplerate, len);


    let data = {
        signal: signal,
        time: basetime
    }

    socket.emit('bci', data)
    console.log('Signal generated')
}

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
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
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

function passSignal(data) {
    passed_signal = data.signal
    passed_time = data.time
    console.log('Signal passed')
}

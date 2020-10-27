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

function calcWave(sig, t, yvals, bt) {
    bt.shift();
    bt.push(Date.now())

    for (let chan in sig){
        yvals[chan].shift();
        if (sig[chan].length > 0) {
            if (first_sig) {
                // start_time = Date.now();
                first_sig = false;
            }
            yvals[chan].push(sig[chan].shift())
        } else {
            yvals[chan].push(0)
        }
    }

    return sig, t, yvals, bt
}

function renderWave(yvals, bt, usr, c) {
    // A simple way to draw the wave with an ellipse at each location
    // c.setAlpha(100)

    // Filter
    let y_filtered = yvals //filterSignal(yvals)
    let offset;
    let margin = 100;
    max_dy = (p5.height - 2*margin) / channels;
    let dy = 200;

    // Map to Window Size
    p5.stroke(c);
    p5.strokeWeight(2);
    in_min = Math.min(...bt);
    in_max = Math.max(...bt);
    out_min = 0;
    out_max = p5.width;
    t_inner = bt.map(x => (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

    if (dy > max_dy){dy = max_dy;}

    for (let chan in y_filtered) {
        p5.push()
        p5.scale(1, -1);
        y1 = y_filtered[chan]
        offset = dy*((channels-1)/2) - ((chan * dy));
        // offset = (p5.height / 2 - margin) - (chan * (p5.height - 2*margin) / channels) + channels/2;
        for (let ind = 0; ind < y_filtered[chan].length - 1; ind++) {
            p5.line(t_inner[ind], y1[ind] + offset, t_inner[ind + 1], y1[ind + 1] + offset);
        }
        p5.pop()
    }


    // Plot Bands
    let power;
    let label;
    let band_names = ['delta', 'theta', 'alpha', 'beta', 'gamma']
    let band_meaning = ['(1-3 Hz)','(4-7 Hz)','(8-12 Hz)','(13-30 Hz)','(31-50 Hz)']

    p5.noStroke()
    let squareColor = p5.color(255, 255, 255);
    p5.textAlign(p5.CENTER, p5.BOTTOM);
    if (usr == 'me') {
        this_band_color = band_color[0]
    } else {
        this_band_color = band_color[1]
    }

    for (let band = 0; band < band_names.length; band++) {
        try {
            power = bci.bandpower(y_filtered[0], samplerate, band_names[band], {relative: true});
            label = band_names[band] + ' ' + band_meaning[band]
        } catch {
            label = 'sample rate too low'
            this_band_color = p5.color('#FF76E9');
            power = 1
        }
        power = (p5.height / 2) - (p5.height / 4) * (power)
        squareColor.setAlpha(255 * (power));
        p5.fill(squareColor)
        p5.text(label, (band + .5) * (p5.width / band_names.length), power - 20);
        this_band_color.setAlpha(200 * (power));
        p5.fill(this_band_color)
        p5.rectMode(p5.CORNERS);
        p5.rect(band * (p5.width / (band_names.length)), p5.height / 2, (band + 1) * (p5.width / (band_names.length)), power)
    }

    // Plot Synchrony
    if (usr == 'me') {
        // squareColor.setAlpha(255);
        // p5.fill(squareColor)
        if (synchrony != 1 && !isNaN(synchrony)) {
            if (synchrony > 0) {
                document.getElementById('sync-dot').style.backgroundColor = sync_color;
            } else {
                document.getElementById('sync-dot').style.backgroundColor = antisync_color;
            }

            document.getElementById('sync-dot').style.width = (synchrony * 50).toString() + 'px';
            document.getElementById('sync-dot').style.height = (synchrony * 50).toString() + 'px';
            // p5.ellipse(2*p5.width / 3, -p5.height / 4, synchrony * 50, synchrony * 50);
        } else{
            document.getElementById('sync-dot').style.height = '0px';
            document.getElementById('sync-dot').style.width = '0px';

        }
    }
}

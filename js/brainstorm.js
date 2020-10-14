// function sendMessage(e) {
//     e.preventDefault(); // prevents page reloading
//     socket.emit('chat message', $('#message').val());
//     $('#message').val('');
//     return false;
// }

function generateSignal(){
    generate = !generate;
    sendSignal(channels);

    if ( generate ){
    document.getElementById('auto-generate').innerHTML = "<i class=\"fas fa-pause-circle fa-2x\"></i>\n" +
        "<p>Stop Autoplay</p>"
    } else {
        document.getElementById('auto-generate').innerHTML = "<i class=\"fas fa-play-circle fa-2x\"></i>\n" +
            "<p>Autoplay Signal</p>"
    }
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


// function sendMessage(e) {
//     e.preventDefault(); // prevents page reloading
//     socket.emit('chat message', $('#message').val());
//     $('#message').val('');
//     return false;
// }

function generateSignal() {
    // Generate 1 second of sample data at 512 Hz
    // Contains 8 μV / 8 Hz and 4 μV / 17 Hz
    signal = [];
    let len = 1
    let channels = [0,1]
    for (let channel in channels) {
        if (channel==0){
            signal = [bci.generateSignal([59], [rangeSlider], samplerate, len)];
        } else {
            signal.push(bci.generateSignal([59], [rangeSlider], samplerate, len));
        }
    }
    // signal = this.filterSignal(signal)

    let data = {
        signal: signal[0],
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

function closeTutorial(){
    document.getElementById("tutorial").style.display = 'none';
}

function openTutorial(){
    document.getElementById("tutorial").style.display = 'flex';
}

function chooseVis(option){

    /* -------------------------- Visualizations -------------------------- */

    if (option == 'WebGL'){
        $('#canvas-container').empty();
        $('#canvas-container').prepend("<canvas id='webgl'></canvas>")
        let _c = document.getElementById('webgl');
        _c.width = window.innerWidth;
        _c.height = window.innerHeight;
        particleBrain()
    }

    if (option =='P5'){

        $('#canvas-container').empty();
        $('#canvas-container').prepend("<div id='p5Canvas'></div>")

        // Initialize Controls
        const selectElement = document.getElementById('channels');

        selectElement.addEventListener('change', (event) => {
            new_chan = parseFloat(event.target.value);
            console.log(new_chan)
            if (new_chan < channels) {
                for (let chan = new_chan; chan < channels; chan++){
                    yvalues[chan] = [];
                    other_yvalues[chan] = [];
                }
            } else {
                yvalues = [];
                other_yvalues = [];
                yvalues = new Array(new_chan);
                other_yvalues = new Array(new_chan);

                for (let chan = 0; chan < new_chan; chan++) {
                    yvalues[chan] = new Array(200).fill(0);
                    other_yvalues[chan] = new Array(200).fill(0);
                }
            }
            channels = new_chan;
        });

        // let filterOrder = 128;

        new p5(function (p5) {
            // let start_time = Date.now();
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
            let color_package = [p5.color('#7373FF'), p5.color('#76BEFF')]
            let band_color = [p5.color('#7373FF'), p5.color('#76BEFF')];
            let this_band_color;
            let synchrony;
            let sync_color = p5.color('#76BEFF')
            let antisync_color = p5.color('#FF76E9')
            let canvas;

            let bandpowers;

            p5.setup = () => {
                canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
                canvas.parent("p5Canvas");
            }

            p5.windowResized = () => {
                p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
            }

            p5.draw = () => {
                p5.background(0);
                p5.translate(0, p5.height / 2);
                signal_package = [signal, passed_signal];
                time_package = [passed_time, passed_time];
                y_package = [yvalues, other_yvalues];
                basetime_package = [basetime, other_basetime]

                // Only correlation of first channels
                synchrony = getPearsonCorrelation(yvalues[0], other_yvalues[0])

                // if (count == 1) {
                //     samplerate = p5.frameRate(); // This is almost definitely wrong
                //     console.log(samplerate)
                // }

                // generate_interval = Math.round(duration*samplerate); // seconds
                if (generate) {
                    if (count == generate_interval){
                        sendSignal(channels)
                        count = 0;
                    } else {
                        count += 1
                    }}

                processSignal(signal_package, time_package, y_package, basetime_package, label_package, color_package)
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

            function processSignal(sig, t, yvals, bt, usr, col) {
                for (let ind in sig) {
                    sig[ind], t[ind], yvals[ind], bt[ind] = calcWave(sig[ind], t[ind], yvals[ind], bt[ind]);
                    renderWave(yvals[ind], bt[ind], usr[ind], col[ind]);
                }
                return sig, t, yvals, bt
            }
        })
    }
}

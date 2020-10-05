<template>
    <div id="tutorial">
        <div id="tutorial-text">
        <h1>Welcome to Brainstorm!</h1>
        <button id="close-tutorial" v-on:click="closeTutorial">Close Tutorial</button>
        </div>
    </div>
    <div>
        <div id="p5Canvas"></div>
    </div>
    <div id="parameters">
        <button id="open-tutorial" v-on:click="openTutorial">Open Tutorial</button>
        <button v-on:click="generateSignal">Generate Signal</button>
        <div>
        <p>Frequency: {{ rangeSlider }}</p>
        <input v-model="rangeSlider" type="range" min="1" max="100" class="slider" id="myRange">
        </div>
    </div>
    <div id="chat">
        <ul id="messages"></ul>
        <form @submit.prevent="sendMessage">
<!--            <div class="gorm-group">-->
<!--                <label for="user">User:</label>-->
<!--                <input type="text" v-model="user" class="form-control">-->
<!--            </div>-->
            <div class="gorm-group pb-3">
                <label for="message"></label>
                <input type="text" v-model="message" class="form-control">
            </div>
            <button>Send</button>
        </form>
    </div>
</template>

<script>
    import io from 'socket.io-client';
    import $ from 'jquery'
    import bci from 'bcijs'
    import p5 from 'p5'

    let yvalues = new Array(200).fill(0);
    let other_yvalues = new Array(yvalues.length).fill(0);
    let basetime = new Array(yvalues.length).fill(Date.now());
    let other_basetime = new Array(yvalues.length).fill(Date.now());

    let signal = [];

    let samplerate = 125;

    export default {
        data() {
            return {
                // user: '',
                message: '',
                messages: [],
                socket: io.connect(('https://mousai.azurewebsites.net/')),
                rangeSlider: 10
            }
        },
        methods: {
            sendMessage(e) {
                e.preventDefault();
                this.socket.emit('chat message', this.message);

                // this.socket.emit('chat message', {
                //     user: this.user,
                //     message: this.message
                // });
                this.message = ''
            },
            generateSignal() {
                // Generate 1 second of sample data at 512 Hz
                // Contains 8 μV / 8 Hz and 4 μV / 17 Hz
                let len = 1
                signal = bci.generateSignal([59], [this.rangeSlider], samplerate, len);

                let data = {
                    signal: signal,
                    time: basetime
                }

                this.socket.emit('bci', data)
                console.log('Signal generated')
            },
            closeTutorial(){
                document.getElementById("tutorial").style.display = 'none';
            },
            openTutorial(){
                document.getElementById("tutorial").style.display = 'flex';
            }
        },
        mounted() {
            this.socket.on('chat message', (data) => {
                this.messages = [...this.messages, data];
                // you can also do this.messages.push(data)
            });

            this.socket.on('chat message', function (msg) {
                $('#messages').append($('<li>').text(msg));
            });

            let passed_signal = []
            let passed_time = []

            this.socket.on('bci', passSignal);

            function passSignal(data) {
                passed_signal = data.signal
                passed_time = data.time
                console.log('Signal passed')
            }


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
                let label_package = ['me','other'];
                let color_package = [p5.color('#7373FF'),p5.color('#76BEFF')]


                p5.setup = () => {
                    let canvas = p5.createCanvas(p5.windowWidth-300, p5.windowHeight);
                    canvas.parent("p5Canvas");
                }

                p5.draw = () => {
                    p5.background(0);
                    p5.translate(0, p5.height/2);
                    signal_package = [signal,passed_signal];
                    time_package = [passed_time,passed_time];
                    y_package = [yvalues,other_yvalues];
                    basetime_package = [basetime, other_basetime]
                    processSignal(signal_package, time_package, y_package, basetime_package, label_package, color_package)
                }

                function calcWave(sig,t,yvals,bt) {
                        bt.shift();
                        yvals.shift();
                        if (sig.length > 0) {
                            if (first_sig) {
                                // start_time = Date.now();
                                first_sig = false;
                            }
                            yvals.push(sig.shift())
                            bt.push(Date.now()) //start_time + t.shift())
                        } else {
                            yvals.push(null)
                            bt.push(Date.now()) // bt.push(Date.now()-start_time)
                        }

                    return sig, t, yvals, bt
                }

                function renderWave(yvals,bt,usr,c) {
                    // A simple way to draw the wave with an ellipse at each location
                    for (let ind = 0; ind < yvals.length-1; ind++) {
                        // c.setAlpha(100)
                        p5.stroke(c);
                        p5.strokeWeight(2);
                        in_min = Math.min(...bt);
                        in_max = Math.max(...bt);
                        out_min = 0;
                        out_max = p5.width;
                        t_inner = bt.map(x => (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

                        y1 = yvals[ind]
                        p5.push()
                        p5.scale(1, -1);
                        p5.line(t_inner[ind], y1, t_inner[ind+1], yvals[ind+1]);
                        p5.pop()
                    }
                    // let diffs = 0;
                    // for (let ii = 0; ii < bt.length-1;ii++){
                    //     diffs += (bt[ii+1] - bt[ii])
                    // }
                    // let diff = diffs/(bt.length-1)
                    if (usr == 'me'){
                        let band_names = ['alpha', 'beta', 'theta', 'gamma']
                        let bandpowers = bci.bandpower(yvals, samplerate, band_names,{relative:true});
                        let val;
                        p5.noStroke()
                        p5.fill('white')
                    for (let band = 0; band < bandpowers.length; band++) {
                        val = Math.round(bandpowers[band])
                        if (isNaN(val)) {
                            p5.text(band_names[band] + ' : ' + 0, 300, 125 - p5.height / 2 + 20 * band)
                        } else {
                            p5.text(band_names[band] + ' : ' + Math.round(bandpowers[band]), 300, 125 - p5.height / 2 + 20 * band)
                        }
                    }
                        }
                }

                function processSignal(sig,t,yvals,bt, usr,col){
                    for (let ind in sig) {
                        sig[ind], t[ind], yvals[ind], bt[ind] = calcWave(sig[ind], t[ind], yvals[ind], bt[ind]);
                        renderWave(yvals[ind], bt[ind], usr[ind], col[ind]);
                    }
                    return sig, t, yvals, bt
                }
            })
        }
    }
</script>

<style scoped>
    #p5Canvas {vertical-align: top; position: absolute; top: 0; left: 0; z-index: -1; height: 100%;}
    * { margin: 0; padding: 0; box-sizing: border-box; }

    h1{
        width: 100%;
        margin-bottom: 25px;
        text-align: center;
    }

    p {
        font-family: Roboto, sans-serif;
        font-size: 15px;
    }

    #tutorial{
        width: 100%; background: rgb(0,0,0);
        position: fixed; top: 0;
        left: 0; height: 100%; z-index:2;
        display: flex; flex-wrap: wrap; justify-content:center;
        align-items: center; opacity:90%;}

    #tutorial-text{
        background: rgb(0,0,0);
        display: flex; flex-wrap: wrap; justify-content:center;
        align-items: center;}

    #open-tutorial{
        width: 100%; border-radius: 0px; height: 50px; cursor: pointer; color: white; background: #50B5FF
    ; border: none; padding: 10px;
    }

    #close-tutorial{
        width: 100%; border-radius: 0px; height: 50px; cursor: pointer; color: white; background: #50B5FF
    ; border: none; padding: 10px;
    }

    #parameters{
        position: fixed; width: 250px; background: rgb(25,25,25);
        top: 0px; left: 0px; padding: 0px;
    }
    #parameters div{
        display: flex;
        flex-wrap: wrap;
        justify-content:center;
        align-items: center;
        margin: 20px 10px;
    }
    #parameters input{
        margin: 10px;
        flex-grow: 1;
    }

    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 25px;
        background: #d3d3d3;
        outline: none;
        opacity: 1;
        -webkit-transition: .2s;
        transition: opacity .2s;
    }

    .slider:hover {
        opacity: 1;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        background: #7373FF;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 25px;
        height: 25px;
        background: #7373FF;
        cursor: pointer;
    }

    #chat {width: 300px; background: rgb(5,5,5);
        position: fixed; top: 0;
        right: 0; height: 100%; z-index:1;
        display: flex; flex-wrap: wrap; justify-content:center;
        align-items: flex-end;}
    form { flex-grow: 1; height: 15%; display: flex; align-items: center; padding: 20px; background: rgb(50,50,50);}
    form input { flex-grow:4; border-radius: 10px;height: 50px; border: 0; padding: 10px; background: rgb(10,10,10); color:white;}
    form button {flex-grow: 1; width: auto;}
    #messages {width: 100%; height: 85%; list-style-type: none; text-align: left}
</style>

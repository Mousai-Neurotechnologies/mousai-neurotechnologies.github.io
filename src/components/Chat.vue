<template>
    <div class="container border">
        <div class="d-flex justify-content-center" id="p5Canvas"></div>
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
    let my_basetime = new Array(yvalues.length).fill(0);

    export default {
        data() {
            return {
                // user: '',
                message: '',
                messages: [],
                socket: io.connect(('https://mousai.azurewebsites.net/'))
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

            let socket = this.socket
            socket.on('bci', passSignal);

            function passSignal(data) {
                passed_signal = data.signal
                passed_time = data.time
                console.log('Signal passed')
            }


            new p5(function (p5) {
                let button;
                let signal = [];
                let other_yvalues;
                let start_time = Date.now();
                let first_sig = true;
                let in_min
                let in_max
                let out_min
                let out_max
                let t_inner
                let other_basetime
                let y1

                other_basetime = new Array(yvalues.length).fill(0);
                yvalues = new Array(200).fill(0);
                my_basetime = new Array(yvalues.length).fill(0);
                other_yvalues = new Array(yvalues.length).fill(0);


                // NOTE: Set up is here
                p5.setup = () => {
                    let canvas = p5.createCanvas((1)*p5.windowWidth, p5.windowHeight);
                    canvas.parent("p5Canvas");

                    button = p5.createButton('Generate Signal');
                    button.position(19, 19);
                    button.mousePressed(generateSignal);
                }
                // NOTE: Draw is here
                p5.draw = () => {
                    p5.background(0);
                    p5.translate(0, p5.height/2);
                    let client_time = passed_time
                    signal, client_time, yvalues, my_basetime = processSignal(signal, client_time, yvalues, my_basetime, 'me', p5.color('#FF76E9'))
                    passed_signal,passed_time, other_yvalues, other_basetime= processSignal(passed_signal, passed_time, other_yvalues, other_basetime, 'you', p5.color('#76BEFF'))
                }

                function calcWave(sig,t,yvals,bt) {
                    yvals.shift();
                    bt.shift();
                    if (sig.length > 0) {
                        if (first_sig){
                            start_time = Date.now();
                            first_sig = false;
                        }
                        yvals.push(sig.shift())
                        bt.push(Date.now()-start_time)//t.shift())
                    } else {
                        yvals.push(null)
                        bt.push(Date.now()-start_time) // bt.push(Date.now()-start_time)
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
                        out_max = p5.windowWidth;
                        t_inner = bt.map(x => (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

                        y1 = yvals[ind]
                        p5.push()
                        p5.scale(1, -1);
                        p5.line(t_inner[ind], y1, t_inner[ind+1], yvals[ind+1]);
                        p5.pop()
                    }
                }

                function processSignal(sig,t,yvals,bt, usr,col){
                    sig, t, yvals, bt = calcWave(sig,t,yvals,bt);
                    renderWave(yvals,bt,usr,col);
                    return sig, t, yvals, bt
                }

                function generateSignal() {
                    // Generate 1 second of sample data at 512 Hz
                    // Contains 8 μV / 8 Hz and 4 μV / 17 Hz
                    let samplerate = p5.frameRate() ;
                    let len = 1
                    let signal = bci.generateSignal([25, 50], [2, 4], samplerate, len);

                    let data = {
                        signal: signal,
                        time: my_basetime
                    }

                    socket.emit('bci', data)
                    console.log('Signal generated')
                }

            })
        }
    }
</script>

<style scoped>
    canvas {vertical-align: top; position: absolute; top: 0; left: 0; z-index: -1;}
    button {width: 200px; border-radius: 10px; height: 50px; cursor: pointer; color: white; background: #FF76E9; border: none; padding: 10px;}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    #chat {width: calc((1/3)*100%); background: rgb(5,5,5);
        position: fixed; bottom: 0;
        right: 0; height: 100%; z-index:1;
        display: flex; flex-wrap: wrap; justify-content:center;
        align-items: flex-end; opacity:50%;}
    form { flex-grow: 1; height: 15%; display: flex; align-items: center; padding: 20px; background: rgb(50,50,50);}
    form input { flex-grow:4; border-radius: 10px;height: 50px; border: 0; padding: 10px; background: rgb(10,10,10); color:white;}
    form button {flex-grow: 1; width: auto;}
    #messages {width: 100%; height: 85%; list-style-type: none; text-align: left}
    #messages li { flex-grow: 1; padding: 5px 10px; color: whitesmoke;}
    #messages li:nth-child(odd) { background: rgba(255,255,255,.1)}
</style>

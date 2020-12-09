const gl = document.getElementById("c").getContext('webgl');
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

// const arrays = {
//     position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
// };
const arrays = {
    position: brainpoints,
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);





function render(time) {

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    console.log('break');
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const uniforms = {
        time: time * 0.001,
        resolution: [gl.canvas.width, gl.canvas.height],
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

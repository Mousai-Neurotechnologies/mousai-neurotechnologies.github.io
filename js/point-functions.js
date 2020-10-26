const every_nth = (arr, offset, nth) => arr.filter((e, i) => (i+offset) % nth === nth - 1);

function sum(a,b){
    return a + b
}

function convertToMesh(pointCloud){
    let slice;
    let output = [];
    for (let ind = 0; ind < (pointCloud.length/3); ind++){
        slice = pointCloud.slice(ind, ind+9)
        output.push(...slice)
    }
    return output
}

function reducePointCount(pointCloud,desiredCount){
    let slice;
    let output = [];
    for (let ind = 0; ind < (pointCloud.length/3); ind+=Math.floor((pointCloud.length/3)/desiredCount)){
        slice = pointCloud.slice(ind*3, (ind*3)+3)
        output.push(...slice)
    }
    return output
}

function createPointCloud(pointFunction, pointCount) {
    let pointCloud = [];

    if (pointFunction != 'brain') {
        for (let i = 0; i < pointCount; i++) {
            const r = () => Math.random() - 0.5;
            const point = pointFunction(r(), r(), r());
            pointCloud.push(...point);
        }
    } else{
        pointCloud = getBrain()
    }

    return pointCloud;
}

const shapes = {

    box(...position) {
        return position;
    },

    boxShell(...position) {
        const distToWall = a => 0.5-Math.abs(a);
        const normalize1D = n => n/Math.abs(n);

        const dists = position.map(distToWall);
        const minDistToWall = Math.min(...dists);

        if (minDistToWall == dists[0]) {
            position[0] = 0.5 * normalize1D(position[0]);
        } else if (minDistToWall == dists[1]) {
            position[1] = 0.5 * normalize1D(position[1]);
        } else if (minDistToWall == dists[2]) {
            position[2] = 0.5 * normalize1D(position[2]);
        }

        return position;
    },

    sphere(...position) {
        const R = 1;

        const normalize1D = n => n/Math.abs(n);
        let [r, a, b] = position.map(n=> n + 0.5);
        r *= R;
        a *= 2 * Math.PI;   // 0 < a < 2PI
        b = position[2] * 2;   // -1 < b < 1

        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let z = b * Math.sqrt(R*R-r*r);

        return [x,y,z];
    },

    sphereShell(...position) {
        return vec3.normalize(vec3.create(), position);
    },

    sphereShell2(...position) {
        const R = 1;

        const normalize1D = n => n/Math.abs(n);
        let [r, a, b] = position.map(n=> n + 0.5);
        r *= R;
        a *= 2 * Math.PI;   // 0 < a < 2PI
        b = position[2] * 2;   // -1 < b < 1

        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let z = normalize1D(b) * Math.sqrt(R*R-r*r);

        return [x,y,z];
    },

    cylinderShellInfinte(...position) {
        const R = 1;

        let [_, a, b] = position.map(n=> n + 0.5);
        a *= 2 * Math.PI;   // 0 < a < 2PI
        b *= 2 * Math.PI;   // 0 < b < 2PI

        let x = R * Math.cos(a);
        let y = R * Math.sin(a);
        let z = Math.tan(b);

        return [x,y,z];
    },

    cone(...position) {
        const R = 1;

        let [r, a, b] = position.map(n=> n + 0.5);
        r *= R;
        a *= 2 * Math.PI;   // 0 < a < 2PI

        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let z = b * (R-r);

        return [x,y,z];
    },

    coneShell(...position) {
        const R = 1;

        let [r, a, b] = position.map(n=> n + 0.5);
        r *= R;
        a *= 2 * Math.PI;   // 0 < a < 2PI

        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let z = R-r;

        return [x,y,z];
    },

    cylinder(...position) {
        const R = 1;

        let [r, a, _] = position.map(n=> n + 0.5);
        r *= R;
        a *= 2 * Math.PI;   // 0 < a < 2PI

        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let z = position[2];

        return [x,y,z];
    },

    cylinderShell(...position) {
        const R = 1;

        let [r, a, _] = position.map(n=> n + 0.5);
        r *= R;
        a *= 2 * Math.PI;   // 0 < a < 2PI

        let x = R * Math.cos(a);
        let y = R * Math.sin(a);
        let z = position[2];

        return [x,y,z];
    },

    circularHyperboloid(...position) { // maybe??
        let [_, a, b] = position.map(n=> n + 0.5);
        a *= 2 * Math.PI;   // 0 < a < 2PI
        b *= 2 * Math.PI;   // 0 < b < 2PI

        let x = Math.cos(a) / Math.cos(b);
        let y = Math.sin(a) / Math.cos(b);
        let z = Math.sin(b);

        return [x,y,z];
    },
};

async function getBrain() {
    const response1 = await fetch('https://raw.githubusercontent.com/GarrettMFlynn/webgl-experiments/main/brain_in_webgl/public/lh.pial.json');
    const json1 = await response1.json();
    const vertexData1 = json1.position

    const response2 = await fetch('https://raw.githubusercontent.com/GarrettMFlynn/webgl-experiments/main/brain_in_webgl/public/rh.pial.json');
    const json2 = await response2.json();
    const vertexData2 = json2.position
    const vertices = [...vertexData1, ...vertexData2]
    for(var i = 0, length = vertices.length; i < length; i++){
        vertices[i] = vertices[i]/100;
    }

    return vertices
}

const every_nth = (arr, offset, nth) => arr.filter((e, i) => (i+offset) % nth === nth - 1);

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
    let usedInds = [];

    for (let i = 0; i < pointCloud.length/3; i+=Math.ceil((pointCloud.length/3)/desiredCount)){
        slice = pointCloud.slice(i*3, (i*3)+3)
        output.push(...slice)
        usedInds.push(i)
    }

    let remainder = desiredCount - (output.length/3)

    for (let i =0; i < remainder; i++){
        output.push(...pointCloud.slice((usedInds[i]+1)*3, ((usedInds[i]+1)*3)+3))
    }

    return output
}

function createPointCloud(pointFunction, pointCount) {
    let pointCloud = [];

    if (pointFunction == 'brain') {
        pointCloud = getBrain()
    } else if (pointFunction == 'brains'){
        let oneBrain = reducePointCount(brainVertices, Math.floor((brainVertices.length/3)/numUsers))
        let dim_size = Math.ceil(Math.sqrt(numUsers));
        let delta = (2*INNER_Z)/(dim_size-1)
        let row = 0;
        let col = -1;

        let tempBrain;
        for (let i = 0; i < numUsers; i++) {
            tempBrain = [...oneBrain];
            if (i % dim_size == 0) {
                row = 0;
                col++;
            }
            for (let point = 0; point < (oneBrain.length/3); point++){
                tempBrain[3*point] /= dim_size;
                tempBrain[3*point+1] /= dim_size;
                tempBrain[3*point+2] /= dim_size;

                tempBrain[3*point+1] += -INNER_Z + (delta) * col;
                tempBrain[3*point+2] += -INNER_Z + (delta) * row;
        }
            pointCloud.push(...tempBrain);
            row++
        }
    }
    else if (pointFunction == 'voltage') {
        pointCloud = getVoltages(pointCloud,pointCount,numUsers)
    } else if (pointFunction == shapes.sphereShells) {
        let dim_size = Math.ceil(Math.sqrt(numUsers));
        let delta = (2*INNER_Z)/(dim_size-1)
        let row = 0;
        let col = -1;
        for (let i = 0; i < numUsers; i++) {
            if (i % dim_size == 0) {
                row = 0;
                col++;
            }
            for (let j = 0; j < Math.floor(pointCount / numUsers); j++) {
                const r = () => (Math.random() - 0.5);
                let point = pointFunction(r(), r(), r());

                // Reduce point radius
                point[0] /= dim_size;
                point[1] /= dim_size;
                point[2] /= dim_size;

                // Shift spheres
                point[1] += -INNER_Z + (delta) * col;
                point[2] += -INNER_Z + (delta) * row;

                pointCloud.push(...point);
            }
            row++
        }
    }
    else{
            for (let i = 0; i < pointCount; i++) {
            const r = () => Math.random() - 0.5;
            const point = pointFunction(r(), r(), r());
            pointCloud.push(...point);
        }
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

    sphereShells(...position) {
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
        vertices[i] = vertices[i]/75;
        }

    return vertices
}


function getVoltages(pointCloud, pointCount, numUsers) {

    let channel_inds = [0];
    let usr_inds = [0];
    let factor = (pointCount/(2*numUsers*channels))
    let user = -1;
    let z;
    let y = -factor/2;
    let point;

    let shift_trigger = Math.floor(pointCount/(2*numUsers*channels));
    let user_trigger = Math.floor(pointCount/(2*numUsers));

    for (let i = 0; i < ((pointCount/2)-1); i++) {

        if (i % shift_trigger == 0) {
                channel_inds.push(i * 3);
                z += INNER_Z / (channels);
                y = -factor / 2;
        }

        if (i % user_trigger == 0){
            if (channels == 1){
                z = (INNER_Z/2);
            } else {
                z = -(INNER_Z/2) + INNER_Z / (channels);
            }
            y = -factor / 2;
            usr_inds.push(i * 3)
            user++;
        }

        point1 = [user*.01, (y) / (factor / 4), z - INNER_Z / (2 * channels)];
        point2 = [user*.01, ((y+1)) / (factor / 4), z - INNER_Z / (2 * channels)];
        pointCloud.push(...point1);
        pointCloud.push(...point2);
        y++;
    }

    return pointCloud
}


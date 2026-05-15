const fs = require('fs');

try {
  const buffer = fs.readFileSync('c:/Users/PC/OneDrive/Desktop/jaefar/jaefar main/2jaefar/frontend/public/dairplane.glb');
  const chunkLength = buffer.readUInt32LE(12);
  const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
  const json = JSON.parse(jsonStr);

  json.meshes.forEach((m, i) => {
    const primitive = m.primitives[0];
    const accessorId = primitive.attributes.POSITION;
    const accessor = json.accessors[accessorId];
    
    // accessor.min and max are arrays of [x, y, z]
    const min = accessor.min;
    const max = accessor.max;
    const size = [max[0]-min[0], max[1]-min[1], max[2]-min[2]];
    const center = [(max[0]+min[0])/2, (max[1]+min[1])/2, (max[2]+min[2])/2];
    
    console.log(`Mesh ${i}: ${m.name}`);
    console.log(`  Size: [${size[0].toFixed(2)}, ${size[1].toFixed(2)}, ${size[2].toFixed(2)}]`);
    console.log(`  Center: [${center[0].toFixed(2)}, ${center[1].toFixed(2)}, ${center[2].toFixed(2)}]`);
  });
} catch (e) {
  console.error("Error reading GLB", e);
}

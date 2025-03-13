self.onmessage = function(e) {
  const { chunks } = e.data;
  const startTime = Date.now();
  
  // 合并Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const mergedArray = new Uint8Array(totalLength);
  
  let offset = 0;
  chunks.forEach(chunk => {
    mergedArray.set(chunk, offset);
    offset += chunk.length;
  });
  
  // 转换为Float32Array
  const floatArray = new Float32Array(mergedArray.buffer);
  
  const endTime = Date.now();
  self.postMessage({
    data: floatArray.buffer,
    duration: (endTime - startTime) / 1000
  }, [floatArray.buffer]);
};
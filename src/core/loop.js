export function createLoop(update, render) {
  let lastTime = performance.now();
  let accumulator = 0;
  const timeStep = 1000 / 60; // 60 FPS simulation
  
  function frame(currentTime) {
    let frameTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Cap maximum frame time to prevent spiral of death
    frameTime = Math.min(frameTime, 100);
    accumulator += frameTime;
    
    // Fixed timestep updates
    while (accumulator >= timeStep) {
      update(timeStep / 1000); // Convert to seconds
      accumulator -= timeStep;
    }
    
    // Render with interpolation alpha
    const alpha = accumulator / timeStep;
    render(alpha);
    
    requestAnimationFrame(frame);
  }
  
  requestAnimationFrame(frame);
}
export function preloadAssets() {
    const imagePromises = [];
    
    // Preload all ingredient images
    Object.values(INGREDIENTS).forEach(ingredient => {
      const img = new Image();
      img.src = ingredient.image;
      imagePromises.push(new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      }));
    });
    
    return Promise.all(imagePromises);
  }
  
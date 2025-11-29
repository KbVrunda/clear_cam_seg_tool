const BASE_MIN_WIDTH = 780;
const BASE_MIN_HEIGHT = 520;
const MAX_WIDTH = 960;
const MAX_HEIGHT = 640;

export function computeDisplaySize(videoInfo = {}) {
  const naturalWidth = videoInfo?.width || BASE_MIN_WIDTH;
  const naturalHeight = videoInfo?.height || BASE_MIN_HEIGHT;
  const aspectRatio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 16 / 9;

  let displayWidth = Math.max(BASE_MIN_WIDTH, naturalWidth);
  let displayHeight = displayWidth / aspectRatio;

  if (displayWidth > MAX_WIDTH) {
    displayWidth = MAX_WIDTH;
    displayHeight = displayWidth / aspectRatio;
  }

  if (displayHeight > MAX_HEIGHT) {
    displayHeight = MAX_HEIGHT;
    displayWidth = displayHeight * aspectRatio;
  }

  if (displayHeight < BASE_MIN_HEIGHT) {
    displayHeight = BASE_MIN_HEIGHT;
    displayWidth = displayHeight * aspectRatio;
  }

  return {
    width: displayWidth,
    height: displayHeight,
  };
}

export function getSizingConstants() {
  return {
    BASE_MIN_WIDTH,
    BASE_MIN_HEIGHT,
    MAX_WIDTH,
    MAX_HEIGHT,
  };
}

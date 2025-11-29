// Mock data utilities for ClearCam

export const mockImages = Array.from({ length: 8 }, (_, i) => ({
  id: `IMG_${String(i + 1).padStart(3, '0')}`,
  filename: `IMG_${String(i + 1).padStart(3, '0')}.jpg`,
  resolution: '1920×1080',
  thumbnail: `https://via.placeholder.com/150x100/4a5568/ffffff?text=IMG_${String(i + 1).padStart(3, '0')}`,
}));

export const mockSelectedImage = mockImages[2]; // IMG_003.jpg

export const mockLabels = {
  clean: {
    name: 'Clean',
    color: 'green',
    checked: true,
    count: 0,
  },
  dirty: {
    name: 'Dirty',
    color: 'red',
    checked: true,
    expanded: true,
    sublabels: [
      { name: 'Blood', color: 'red', count: 42, checked: false },
      { name: 'Smoke', color: 'gray', count: 17, checked: false },
      { name: 'Fluid', color: 'blue', count: 9, checked: false },
      { name: 'Tissue', color: 'orange', count: 5, checked: false },
    ],
  },
};

export const mockAnalytics = {
  summary: {
    totalFrames: 2000,
    cleanFramesPercent: 74,
    mostCommonContaminant: 'Blood',
  },
  pieData: [
    { name: 'Clean', value: 1480, color: '#10b981' },
    { name: 'Dirty', value: 520, color: '#ef4444' },
  ],
  stackedBarData: [
    { project: 'Project A', Blood: 150, Smoke: 60, Fluid: 30, Tissue: 20 },
    { project: 'Project B', Blood: 180, Smoke: 70, Fluid: 40, Tissue: 15 },
    { project: 'Project C', Blood: 90, Smoke: 40, Fluid: 20, Tissue: 15 },
  ],
  contaminantCounts: [
    { name: 'Blood', count: 420 },
    { name: 'Smoke', count: 170 },
    { name: 'Fluid', count: 90 },
    { name: 'Tissue', count: 50 },
  ],
  trendData: Array.from({ length: 12 }, (_, i) => ({
    day: `Day ${i + 1}`,
    dirty: Math.floor(Math.random() * 50) + 20,
  })),
};

export const mockProjects = ['Project A', 'Project B', 'Project C'];
export const mockUsers = ['Demo User'];
export const mockCurrentProject = 'Clear Cam';
export const mockCurrentUser = 'Demo User';
export const mockNotifications = 2;

export const mockTools = [
  { id: 'brush', name: 'Circle', hotkey: 'B', icon: '' },
  { id: 'eraser', name: 'Erase', hotkey: 'E', icon: '' },
  { id: 'pan', name: 'Drag', hotkey: 'H', icon: '' },
];

export const mockHistory = [
  { action: 'Brush stroke', timestamp: Date.now() - 5000 },
  { action: 'Polygon added', timestamp: Date.now() - 10000 },
  { action: 'Mask cleared', timestamp: Date.now() - 15000 },
];


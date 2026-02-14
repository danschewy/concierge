// Default location: SoHo, Manhattan
export const NYC_DEFAULTS = {
  latitude: 40.7243,
  longitude: -73.9976,
  neighborhood: 'SoHo',
  city: 'New York City',
  state: 'NY',
  timezone: 'America/New_York',
} as const;

// MTA subway line colors (official)
export const MTA_COLORS: Record<string, string> = {
  '1': '#EE352E',
  '2': '#EE352E',
  '3': '#EE352E',
  '4': '#00933C',
  '5': '#00933C',
  '6': '#00933C',
  'A': '#0039A6',
  'C': '#0039A6',
  'E': '#0039A6',
  'B': '#FF6319',
  'D': '#FF6319',
  'F': '#FF6319',
  'M': '#FF6319',
  'N': '#FCCC0A',
  'Q': '#FCCC0A',
  'R': '#FCCC0A',
  'W': '#FCCC0A',
  'G': '#6CBE45',
  'J': '#996633',
  'Z': '#996633',
  'L': '#A7A9AC',
  '7': '#B933AD',
  'S': '#808183',
};

// Dark text lines (yellow background needs dark text)
export const MTA_DARK_TEXT_LINES = new Set(['N', 'Q', 'R', 'W']);

// Columbia University / Geffen Hall coordinates
export const DEMO_DESTINATION = {
  latitude: 40.7725,
  longitude: -73.9835,
  name: 'David Geffen Hall',
  address: '10 Lincoln Center Plaza, New York, NY',
};

// SoHo pickup
export const DEMO_PICKUP = {
  latitude: 40.7243,
  longitude: -73.9976,
  name: 'SoHo',
  address: 'Broadway & Spring St, New York, NY',
};

// Route coordinates for demo (SoHo to Lincoln Center via West Side)
export const DEMO_ROUTE_COORDINATES: [number, number][] = [
  [-73.9976, 40.7243], // SoHo
  [-74.0060, 40.7258], // Hudson St
  [-74.0099, 40.7310], // West Side Highway
  [-74.0089, 40.7420], // Chelsea
  [-74.0020, 40.7560], // Midtown West
  [-73.9870, 40.7680], // Columbus Circle
  [-73.9835, 40.7725], // Lincoln Center
];

export const MAPBOX_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';

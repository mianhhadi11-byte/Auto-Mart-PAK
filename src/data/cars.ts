import type { BodyType, Car, FuelType, Seller, Transmission } from '../types';

export const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
] as const;

export const BRANDS = [
  { name: 'Suzuki', models: ['Alto', 'Cultus', 'Swift'], tagline: 'Pakistan’s everyday favourite' },
  { name: 'Honda', models: ['City', 'Civic'], tagline: 'Refined performance' },
  { name: 'Toyota', models: ['Corolla', 'Yaris', 'Fortuner'], tagline: 'Built to last' },
  { name: 'Kia', models: ['Sportage'], tagline: 'Style meets capability' },
  { name: 'Hyundai', models: ['Tucson'], tagline: 'Modern Korean engineering' },
  { name: 'Haval', models: ['H6'], tagline: 'Premium hybrid SUVs' },
] as const;

export const BODY_TYPES: BodyType[] = ['Hatchback', 'Sedan', 'SUV'];
export const TRANSMISSIONS: Transmission[] = ['Automatic', 'Manual'];
export const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Hybrid'];
export const YEARS = Array.from({ length: 13 }, (_, i) => 2025 - i);

export const PRICE_RANGES = [
  { label: 'Under PKR 25 Lakh', min: 0, max: 2_500_000 },
  { label: 'PKR 25 – 40 Lakh', min: 2_500_000, max: 4_000_000 },
  { label: 'PKR 40 – 60 Lakh', min: 4_000_000, max: 6_000_000 },
  { label: 'PKR 60 – 80 Lakh', min: 6_000_000, max: 8_000_000 },
  { label: 'PKR 80 Lakh – 1 Crore', min: 8_000_000, max: 10_000_000 },
  { label: 'Above PKR 1 Crore', min: 10_000_000, max: 50_000_000 },
];

const img = (name: string) => `/images/cars/${name}.webp`;

const sellers: Record<string, Seller> = {
  ahmed: { name: 'Ahmed Motors', type: 'Dealer', phone: '+92 300 845 2211', rating: 4.8, memberSince: '2016', city: 'Lahore' },
  bilal: { name: 'Bilal Auto Gallery', type: 'Dealer', phone: '+92 321 447 9082', rating: 4.9, memberSince: '2014', city: 'Karachi' },
  khan: { name: 'Khan Motors', type: 'Dealer', phone: '+92 333 512 7740', rating: 4.7, memberSince: '2018', city: 'Islamabad' },
  habib: { name: 'Al-Habib Cars', type: 'Dealer', phone: '+92 345 806 1193', rating: 4.6, memberSince: '2015', city: 'Rawalpindi' },
  suneel: { name: 'Suneel Autos', type: 'Dealer', phone: '+92 301 773 4420', rating: 4.5, memberSince: '2017', city: 'Faisalabad' },
  ali: { name: 'Ali Raza', type: 'Private', phone: '+92 302 664 8817', rating: 4.9, memberSince: '2021', city: 'Lahore' },
  hamza: { name: 'Hamza Sheikh', type: 'Private', phone: '+92 335 229 1054', rating: 4.8, memberSince: '2022', city: 'Karachi' },
  fatima: { name: 'Fatima Noor', type: 'Private', phone: '+92 311 908 6632', rating: 5.0, memberSince: '2020', city: 'Islamabad' },
  usman: { name: 'Usman Tariq', type: 'Private', phone: '+92 306 445 7719', rating: 4.7, memberSince: '2023', city: 'Multan' },
  zeeshan: { name: 'Zeeshan Ali', type: 'Private', phone: '+92 344 120 8875', rating: 4.6, memberSince: '2019', city: 'Peshawar' },
};

const features = {
  alto: ['Power Steering', 'Power Windows', 'Air Conditioning', 'Dual Airbags', 'ABS with EBD', 'Keyless Entry', 'Touchscreen Display', 'Rear Parking Camera', 'Alloy Wheels', 'Immobilizer'],
  cultus: ['Power Steering', 'Power Windows', 'Air Conditioning', 'Dual Airbags', 'ABS with EBD', 'Keyless Entry', 'Touchscreen Display', 'Rear Parking Camera', 'Alloy Wheels', 'Fog Lamps'],
  swift: ['Automatic Climate Control', 'Cruise Control', '6 Airbags', 'ABS with EBD', 'Keyless Entry', 'Push Button Start', 'Touchscreen Display', 'Rear Parking Camera', 'Alloy Wheels', 'Fog Lamps'],
  city: ['Sunroof', 'Cruise Control', 'Paddle Shifters', '6 Airbags', 'ABS with EBD', 'Vehicle Stability Assist', 'Touchscreen Display', 'Rear Parking Camera', 'Push Button Start', 'Alloy Wheels'],
  civic: ['Honda Sensing', 'Lane Keeping Assist', 'Adaptive Cruise Control', 'Sunroof', 'Dual-Zone Climate Control', 'Wireless Charging', '9" Touchscreen', 'Rear Parking Camera', 'Leather Seats', '6 Airbags', 'Push Button Start', 'Alloy Wheels'],
  corolla: ['Sunroof', 'Cruise Control', 'Dual-Zone Climate Control', 'Leather Seats', 'Touchscreen Display', 'Rear Parking Camera', 'Keyless Entry', 'Push Button Start', '6 Airbags', 'Alloy Wheels', 'Fog Lamps'],
  yaris: ['Cruise Control', 'Automatic Climate Control', '7 Airbags', 'ABS with EBD', 'Touchscreen Display', 'Rear Parking Camera', 'Keyless Entry', 'Push Button Start', 'Alloy Wheels', 'Fog Lamps'],
  fortuner: ['Sunroof', 'Leather Seats', 'Power Driver Seat', 'Cruise Control', '9" Touchscreen', '360° Camera', '7 Airbags', 'Hill Start Assist', 'Traction Control', 'Alloy Wheels', 'LED Headlamps'],
  sportage: ['Panoramic Sunroof', 'Leather Seats', 'Power Seats', 'Cruise Control', 'Touchscreen Display', 'Rear Parking Camera', '6 Airbags', 'Electronic Stability Control', 'Hill Start Assist', 'Push Button Start', 'Alloy Wheels'],
  tucson: ['Panoramic Sunroof', 'Leather Seats', 'Power Seats', 'Wireless Charging', 'Cruise Control', '360° Camera', 'Blind Spot Monitor', '6 Airbags', 'Push Button Start', 'Alloy Wheels'],
  haval: ['Panoramic Sunroof', 'Leather Seats', 'Heated & Ventilated Seats', '360° Camera', 'Adaptive Cruise Control', 'Lane Keeping Assist', '12.3" Touchscreen', 'Wireless Charging', '6 Airbags', 'Push Button Start', 'Alloy Wheels', 'Regenerative Braking'],
};

const base = {
  condition: 'Used' as const,
  seats: 5,
};

const car = (
  data: Omit<Car, 'slug' | 'description' | 'images' | 'condition' | 'seats'> & {
    slug: string;
    images: string[];
    note: string;
    condition?: Car['condition'];
    seats?: number;
  },
): Car => ({
  ...base,
  ...data,
  images: data.images,
  condition: data.condition ?? 'Used',
  seats: data.seats ?? 5,
  description: `${data.note} This ${data.year} ${data.brand} ${data.model} ${data.variant} has covered ${data.mileage.toLocaleString('en-PK')} km and comes with a ${data.transmission.toLowerCase()} transmission. It is registered in ${data.registeredIn} and available for inspection in ${data.city}.`,
});

export const SEED_CARS: Car[] = [
  car({
    id: 'am-1001', slug: 'suzuki-alto-vxl-ags-2025-lahore', brand: 'Suzuki', model: 'Alto', variant: 'VXL AGS', year: 2025,
    price: 3_095_000, mileage: 6_500, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 660, fuelAverage: 22,
    bodyType: 'Hatchback', color: 'Pearl White', registeredIn: 'Lahore', features: features.alto, seller: sellers.ahmed,
    featured: true, verified: true, dateListed: '2026-10-22', views: 1840,
    images: [img('alto-1'), img('alto-2'), img('alto-3'), img('alto-interior')],
    note: 'A single-owner city car with factory paint, complete service history and a freshly renewed token.',
  }),
  car({
    id: 'am-1002', slug: 'suzuki-alto-vxr-2022-karachi', brand: 'Suzuki', model: 'Alto', variant: 'VXR', year: 2022,
    price: 2_295_000, mileage: 38_000, city: 'Karachi', transmission: 'Manual', fuel: 'Petrol', engine: 660, fuelAverage: 20,
    bodyType: 'Hatchback', color: 'Silky Silver', registeredIn: 'Karachi', features: features.alto.slice(0, 8), seller: sellers.bilal,
    featured: true, verified: false, dateListed: '2026-10-12', views: 1210,
    images: [img('alto-2'), img('alto-1'), img('alto-interior')],
    note: 'Economical daily driver with original paint on all panels and four new tyres fitted last month.',
  }),
  car({
    id: 'am-1003', slug: 'suzuki-alto-vxl-2020-islamabad', brand: 'Suzuki', model: 'Alto', variant: 'VXL', year: 2020,
    price: 1_895_000, mileage: 71_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Petrol', engine: 660, fuelAverage: 19,
    bodyType: 'Hatchback', color: 'Solid White', registeredIn: 'Islamabad', features: features.alto.slice(0, 7), seller: sellers.fatima,
    featured: false, verified: false, dateListed: '2026-09-28', views: 890,
    images: [img('alto-3'), img('alto-1'), img('alto-interior')],
    note: 'Carefully maintained by a family in Islamabad with documented oil changes and a clean interior.',
  }),
  car({
    id: 'am-1004', slug: 'suzuki-cultus-vxl-2022-lahore', brand: 'Suzuki', model: 'Cultus', variant: 'VXL', year: 2022,
    price: 3_095_000, mileage: 27_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 998, fuelAverage: 18,
    bodyType: 'Hatchback', color: 'Cerulean Blue', registeredIn: 'Lahore', features: features.cultus, seller: sellers.ali,
    featured: true, verified: true, dateListed: '2026-10-18', views: 1430,
    images: [img('cultus-1'), img('cultus-2'), img('cultus-3')],
    note: 'Low-mileage Cultus VXL with a smooth automatic gearbox, original alloys and no accident history.',
  }),
  car({
    id: 'am-1005', slug: 'suzuki-cultus-vxr-2018-faisalabad', brand: 'Suzuki', model: 'Cultus', variant: 'VXR', year: 2018,
    price: 2_395_000, mileage: 66_000, city: 'Faisalabad', transmission: 'Manual', fuel: 'Petrol', engine: 998, fuelAverage: 17,
    bodyType: 'Hatchback', color: 'Superior White', registeredIn: 'Faisalabad', features: features.cultus.slice(0, 8), seller: sellers.suneel,
    featured: false, verified: false, dateListed: '2026-09-20', views: 640,
    images: [img('cultus-2'), img('cultus-3')],
    note: 'Honest family hatchback with a strong engine, cold AC and recent suspension work.',
  }),
  car({
    id: 'am-1006', slug: 'suzuki-swift-glx-cvt-2023-islamabad', brand: 'Suzuki', model: 'Swift', variant: 'GLX CVT', year: 2023,
    price: 4_350_000, mileage: 18_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Petrol', engine: 1197, fuelAverage: 16,
    bodyType: 'Hatchback', color: 'Burning Red', registeredIn: 'Islamabad', features: features.swift, seller: sellers.khan,
    featured: true, verified: true, dateListed: '2026-10-25', views: 2100,
    images: [img('swift-3'), img('swift-1'), img('swift-2')],
    note: 'Top-of-the-line Swift GLX with six airbags, cruise control and a spotless, smoke-free cabin.',
  }),
  car({
    id: 'am-1007', slug: 'suzuki-swift-gl-2018-multan', brand: 'Suzuki', model: 'Swift', variant: 'GL', year: 2018,
    price: 2_950_000, mileage: 74_000, city: 'Multan', transmission: 'Manual', fuel: 'Petrol', engine: 1298, fuelAverage: 14,
    bodyType: 'Hatchback', color: 'Graphite Grey', registeredIn: 'Multan', features: features.swift.slice(0, 8), seller: sellers.usman,
    featured: false, verified: false, dateListed: '2026-09-15', views: 720,
    images: [img('swift-1'), img('swift-2')],
    note: 'Well-kept Swift GL with a responsive 1.3 engine, original body panels and upgraded sound system.',
  }),
  car({
    id: 'am-1008', slug: 'honda-city-1-5-aspire-2025-lahore', brand: 'Honda', model: 'City', variant: '1.5 Aspire', year: 2025,
    price: 6_150_000, mileage: 9_500, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 1498, fuelAverage: 14,
    bodyType: 'Sedan', color: 'Platinum White', registeredIn: 'Lahore', features: features.city, seller: sellers.ahmed,
    featured: true, verified: true, dateListed: '2026-10-27', views: 2650,
    images: [img('city-3'), img('city-4'), img('city-2')],
    note: 'Nearly new City Aspire with the balance of factory warranty, sunroof and full Honda service records.',
  }),
  car({
    id: 'am-1009', slug: 'honda-city-1-5-vti-2019-karachi', brand: 'Honda', model: 'City', variant: '1.5 VTi', year: 2019,
    price: 4_195_000, mileage: 52_000, city: 'Karachi', transmission: 'Automatic', fuel: 'Petrol', engine: 1498, fuelAverage: 13,
    bodyType: 'Sedan', color: 'Lunar Silver', registeredIn: 'Karachi', features: features.city.slice(0, 8), seller: sellers.hamza,
    featured: false, verified: true, dateListed: '2026-10-05', views: 1370,
    images: [img('city-2'), img('city-3')],
    note: 'A clean, garage-kept VTi with a flawless automatic transmission and recently replaced battery.',
  }),
  car({
    id: 'am-1010', slug: 'honda-city-1-3-ivtec-2014-rawalpindi', brand: 'Honda', model: 'City', variant: '1.3 i-VTEC', year: 2014,
    price: 2_750_000, mileage: 108_000, city: 'Rawalpindi', transmission: 'Manual', fuel: 'Petrol', engine: 1339, fuelAverage: 12,
    bodyType: 'Sedan', color: 'Crystal Black', registeredIn: 'Rawalpindi', features: features.city.slice(0, 6), seller: sellers.habib,
    featured: false, verified: false, dateListed: '2026-09-11', views: 980,
    images: [img('city-1')],
    note: 'Dependable fifth-generation City with a strong engine and a well-preserved interior.',
  }),
  car({
    id: 'am-1011', slug: 'honda-civic-oriel-2025-lahore', brand: 'Honda', model: 'Civic', variant: 'Oriel', year: 2025,
    price: 10_150_000, mileage: 7_800, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 1498, fuelAverage: 12,
    bodyType: 'Sedan', color: 'Platinum White', registeredIn: 'Lahore', features: features.civic, seller: sellers.ahmed,
    featured: true, verified: true, dateListed: '2026-10-29', views: 3210,
    images: [img('civic-1'), img('civic-2'), img('civic-3'), img('civic-interior')],
    note: 'Showroom-condition Civic Oriel with Honda Sensing, a panoramic sunroof and complete dealer history.',
  }),
  car({
    id: 'am-1012', slug: 'honda-civic-rs-turbo-2022-islamabad', brand: 'Honda', model: 'Civic', variant: 'RS Turbo', year: 2022,
    price: 8_650_000, mileage: 31_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Petrol', engine: 1498, fuelAverage: 12,
    bodyType: 'Sedan', color: 'Meteoroid Grey', registeredIn: 'Islamabad', features: features.civic, seller: sellers.khan,
    featured: true, verified: false, dateListed: '2026-10-16', views: 2450,
    images: [img('civic-3'), img('civic-1'), img('civic-interior')],
    note: 'Sporty RS Turbo with black alloy wheels, paddle shifters and a meticulously maintained interior.',
  }),
  car({
    id: 'am-1013', slug: 'honda-civic-vti-oriel-2019-karachi', brand: 'Honda', model: 'Civic', variant: 'VTi Oriel', year: 2019,
    price: 6_450_000, mileage: 64_000, city: 'Karachi', transmission: 'Automatic', fuel: 'Petrol', engine: 1799, fuelAverage: 11,
    bodyType: 'Sedan', color: 'Modern Steel', registeredIn: 'Karachi', features: features.civic.slice(0, 9), seller: sellers.bilal,
    featured: false, verified: true, dateListed: '2026-09-24', views: 1750,
    images: [img('civic-2'), img('civic-1'), img('civic-interior')],
    note: 'Tenth-generation Civic with a silky 1.8 engine, leather interior and clear ownership documents.',
  }),
  car({
    id: 'am-1014', slug: 'toyota-corolla-altis-grande-x-2024-lahore', brand: 'Toyota', model: 'Corolla', variant: 'Altis Grande X', year: 2024,
    price: 7_950_000, mileage: 21_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 1798, fuelAverage: 12,
    bodyType: 'Sedan', color: 'Super White', registeredIn: 'Lahore', features: features.corolla, seller: sellers.ahmed,
    featured: true, verified: true, dateListed: '2026-10-26', views: 2980,
    images: [img('corolla-3'), img('corolla-4'), img('corolla-1')],
    note: 'Flagship Altis Grande X with sunroof, leather seats and a full Toyota dealership service history.',
  }),
  car({
    id: 'am-1015', slug: 'toyota-corolla-altis-1-6-x-2021-islamabad', brand: 'Toyota', model: 'Corolla', variant: 'Altis 1.6 X', year: 2021,
    price: 6_150_000, mileage: 43_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Petrol', engine: 1598, fuelAverage: 12,
    bodyType: 'Sedan', color: 'Attitude Black', registeredIn: 'Islamabad', features: features.corolla.slice(0, 9), seller: sellers.fatima,
    featured: false, verified: true, dateListed: '2026-10-02', views: 1620,
    images: [img('corolla-4'), img('corolla-3'), img('corolla-1')],
    note: 'Family-owned Altis with a smooth automatic, cold AC and no history of major repairs.',
  }),
  car({
    id: 'am-1016', slug: 'toyota-corolla-gli-2016-peshawar', brand: 'Toyota', model: 'Corolla', variant: 'GLi', year: 2016,
    price: 3_850_000, mileage: 112_000, city: 'Peshawar', transmission: 'Manual', fuel: 'Petrol', engine: 1298, fuelAverage: 11,
    bodyType: 'Sedan', color: 'Super White', registeredIn: 'Peshawar', features: features.corolla.slice(0, 6), seller: sellers.zeeshan,
    featured: false, verified: false, dateListed: '2026-09-18', views: 810,
    images: [img('corolla-1'), img('corolla-2')],
    note: 'Proven Corolla GLi with a durable 1.3 engine, new clutch and a clean, original interior.',
  }),
  car({
    id: 'am-1017', slug: 'toyota-corolla-gli-2013-multan', brand: 'Toyota', model: 'Corolla', variant: 'GLi', year: 2013,
    price: 2_695_000, mileage: 148_000, city: 'Multan', transmission: 'Manual', fuel: 'Petrol', engine: 1298, fuelAverage: 10,
    bodyType: 'Sedan', color: 'Silver Metallic', registeredIn: 'Multan', features: ['Power Steering', 'Power Windows', 'Air Conditioning', 'Airbags', 'ABS', 'Immobilizer'], seller: sellers.usman,
    featured: false, verified: false, dateListed: '2026-09-06', views: 590,
    images: [img('corolla-2'), img('corolla-1')],
    note: 'Budget-friendly E140 Corolla with a strong engine, working AC and a straight, rust-free body.',
  }),
  car({
    id: 'am-1018', slug: 'toyota-yaris-ativ-x-1-5-cvt-2024-lahore', brand: 'Toyota', model: 'Yaris', variant: 'ATIV X 1.5 CVT', year: 2024,
    price: 5_050_000, mileage: 14_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 1496, fuelAverage: 15,
    bodyType: 'Sedan', color: 'Platinum White Pearl', registeredIn: 'Lahore', features: features.yaris, seller: sellers.ahmed,
    featured: true, verified: true, dateListed: '2026-10-24', views: 2190,
    images: [img('yaris-1')],
    note: 'Low-mileage Yaris ATIV X with seven airbags, a factory-fitted touchscreen and remaining warranty.',
  }),
  car({
    id: 'am-1019', slug: 'toyota-yaris-gli-1-3-2021-karachi', brand: 'Toyota', model: 'Yaris', variant: 'GLi 1.3', year: 2021,
    price: 4_050_000, mileage: 47_000, city: 'Karachi', transmission: 'Manual', fuel: 'Petrol', engine: 1329, fuelAverage: 14,
    bodyType: 'Sedan', color: 'Silver Metallic', registeredIn: 'Karachi', features: features.yaris.slice(0, 7), seller: sellers.hamza,
    featured: false, verified: false, dateListed: '2026-09-30', views: 1020,
    images: [img('yaris-1')],
    note: 'Reliable Yaris GLi used for family commuting, with original paint and a spotless interior.',
  }),
  car({
    id: 'am-1020', slug: 'toyota-fortuner-legender-2024-lahore', brand: 'Toyota', model: 'Fortuner', variant: 'Legender 2.8', year: 2024,
    price: 17_500_000, mileage: 18_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Diesel', engine: 2755, fuelAverage: 9,
    bodyType: 'SUV', color: 'Platinum White Pearl', registeredIn: 'Lahore', features: features.fortuner, seller: sellers.ahmed,
    featured: true, verified: true, dateListed: '2026-10-28', views: 3480, seats: 7,
    images: [img('fortuner-1'), img('fortuner-2'), img('fortuner-3'), img('fortuner-interior')],
    note: 'Flagship Fortuner Legender with a powerful 2.8 diesel, 360° camera and immaculate leather cabin.',
  }),
  car({
    id: 'am-1021', slug: 'toyota-fortuner-sigma-4-2018-karachi', brand: 'Toyota', model: 'Fortuner', variant: 'Sigma 4', year: 2018,
    price: 10_450_000, mileage: 86_000, city: 'Karachi', transmission: 'Automatic', fuel: 'Diesel', engine: 2982, fuelAverage: 8,
    bodyType: 'SUV', color: 'Silver Metallic', registeredIn: 'Karachi', features: features.fortuner.slice(0, 9), seller: sellers.bilal,
    featured: false, verified: true, dateListed: '2026-09-22', views: 1890, seats: 7,
    images: [img('fortuner-2'), img('fortuner-1'), img('fortuner-interior')],
    note: 'Genuine Sigma 4 with selectable four-wheel drive, a strong 3.0 diesel and complete service records.',
  }),
  car({
    id: 'am-1022', slug: 'kia-sportage-awd-2021-islamabad', brand: 'Kia', model: 'Sportage', variant: 'AWD', year: 2021,
    price: 7_450_000, mileage: 39_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Petrol', engine: 1999, fuelAverage: 10,
    bodyType: 'SUV', color: 'Clear White', registeredIn: 'Islamabad', features: features.sportage, seller: sellers.khan,
    featured: true, verified: true, dateListed: '2026-10-20', views: 2210,
    images: [img('sportage-1'), img('sportage-interior')],
    note: 'All-wheel-drive Sportage with panoramic sunroof, leather seats and a flawless service history.',
  }),
  car({
    id: 'am-1023', slug: 'kia-sportage-alpha-2023-lahore', brand: 'Kia', model: 'Sportage', variant: 'Alpha', year: 2023,
    price: 9_250_000, mileage: 16_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 1999, fuelAverage: 11,
    bodyType: 'SUV', color: 'Aurora Black', registeredIn: 'Lahore', features: features.sportage, seller: sellers.ali,
    featured: false, verified: true, dateListed: '2026-10-08', views: 1760,
    images: [img('sportage-2'), img('sportage-3'), img('sportage-interior')],
    note: 'New-generation Sportage Alpha with low mileage, digital cockpit and factory warranty until 2027.',
  }),
  car({
    id: 'am-1024', slug: 'hyundai-tucson-ultimate-2023-islamabad', brand: 'Hyundai', model: 'Tucson', variant: 'Ultimate', year: 2023,
    price: 8_950_000, mileage: 21_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Petrol', engine: 1999, fuelAverage: 11,
    bodyType: 'SUV', color: 'Polar White', registeredIn: 'Islamabad', features: features.tucson, seller: sellers.khan,
    featured: true, verified: true, dateListed: '2026-10-23', views: 2080,
    images: [img('tucson-1'), img('tucson-3'), img('tucson-interior')],
    note: 'Futuristic Tucson Ultimate with 360° camera, blind-spot monitoring and a panoramic glass roof.',
  }),
  car({
    id: 'am-1025', slug: 'hyundai-tucson-gls-2020-lahore', brand: 'Hyundai', model: 'Tucson', variant: 'GLS', year: 2020,
    price: 6_950_000, mileage: 58_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Petrol', engine: 1999, fuelAverage: 10,
    bodyType: 'SUV', color: 'Colbalt Grey', registeredIn: 'Lahore', features: features.tucson.slice(0, 8), seller: sellers.ahmed,
    featured: false, verified: false, dateListed: '2026-09-26', views: 1310,
    images: [img('tucson-2'), img('tucson-3'), img('tucson-interior')],
    note: 'Well-maintained Tucson GLS with a roomy cabin, smooth automatic and recently serviced brakes.',
  }),
  car({
    id: 'am-1026', slug: 'haval-h6-hev-2024-lahore', brand: 'Haval', model: 'H6', variant: 'HEV', year: 2024,
    price: 10_950_000, mileage: 15_000, city: 'Lahore', transmission: 'Automatic', fuel: 'Hybrid', engine: 1497, fuelAverage: 17,
    bodyType: 'SUV', color: 'Hamilton White', registeredIn: 'Lahore', features: features.haval, seller: sellers.ali,
    featured: true, verified: true, dateListed: '2026-10-29', views: 2860,
    images: [img('haval-1'), img('haval-2'), img('haval-3'), img('haval-interior')],
    note: 'Efficient H6 HEV with ventilated seats, adaptive cruise and an exceptional 17 km/l real-world average.',
  }),
  car({
    id: 'am-1027', slug: 'haval-h6-hev-2022-islamabad', brand: 'Haval', model: 'H6', variant: 'HEV', year: 2022,
    price: 8_950_000, mileage: 36_000, city: 'Islamabad', transmission: 'Automatic', fuel: 'Hybrid', engine: 1497, fuelAverage: 17,
    bodyType: 'SUV', color: 'Sapphire Black', registeredIn: 'Islamabad', features: features.haval, seller: sellers.fatima,
    featured: false, verified: true, dateListed: '2026-09-14', views: 1540,
    images: [img('haval-2'), img('haval-1'), img('haval-interior')],
    note: 'Fully loaded hybrid SUV with a panoramic roof, 360° camera and complete Sazgar service history.',
  }),
];

export const getBrandModels = (brand: string) =>
  BRANDS.find((b) => b.name === brand)?.models ?? [];

export const brandCount = (brand: string) => SEED_CARS.filter((c) => c.brand === brand).length;

export const brandStartingPrice = (brand: string) =>
  Math.min(...SEED_CARS.filter((c) => c.brand === brand).map((c) => c.price));

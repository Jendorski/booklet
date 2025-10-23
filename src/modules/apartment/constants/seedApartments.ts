import {
    IApartment,
    IApartmentAmenities,
    IApartmentStatus
} from '../../../database/models/Apartment.model';

export const seededApartments: Partial<IApartment>[] = [
    {
        hostName: 'John Doe',
        title: 'Modern Loft in Victoria Island',
        description:
            'Stunning industrial-style loft with exposed brick walls, high ceilings, and floor-to-ceiling windows. Perfect for young professionals or couples seeking urban living.',
        location: 'Victoria Island, Lagos',
        pricePerNight: 185,
        cautionFee: 500,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.AIR_CONDITIONING,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.WASHER,
            IApartmentAmenities.TV
        ],
        images: [
            'https://example.com/loft1.jpg',
            'https://example.com/loft2.jpg',
            'https://example.com/loft3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Alice Bob',
        title: 'Cozy Beachfront Studio',
        description:
            'Wake up to ocean views in this charming studio apartment just steps from the beach. Includes private balcony with stunning sunset views.',
        location: 'Lekki Phase 1, Lagos',
        pricePerNight: 220,
        cautionFee: 600,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/beach1.jpg',
            'https://example.com/beach2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'David Growth',
        title: 'Spacious Family Home with Garden',
        description:
            'Beautiful 3-bedroom house with a large backyard, perfect for families. Located in a quiet neighborhood with excellent schools nearby.',
        location: 'Maitama, Abuja',
        pricePerNight: 275,
        cautionFee: 800,
        bathrooms: 2,
        bedrooms: 3,
        toilets: 3,
        amenities: [
            IApartmentAmenities.WIFI,

            IApartmentAmenities.KITCHEN,

            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/family1.jpg',
            'https://example.com/family2.jpg',
            'https://example.com/family3.jpg',
            'https://example.com/family4.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Ebenezer Obey',
        title: 'Luxury Penthouse with City Views',
        description:
            'Exclusive penthouse suite featuring panoramic city views, high-end appliances, and concierge service. Experience premium urban living.',
        location: 'Ikoyi, Lagos',
        pricePerNight: 450,
        cautionFee: 1500,
        bathrooms: 3,
        bedrooms: 2,
        toilets: 3,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.GYM,
            IApartmentAmenities.SWIMMING_POOL,

            IApartmentAmenities.AIR_CONDITIONING,
            IApartmentAmenities.KITCHEN
        ],
        images: [
            'https://example.com/penthouse1.jpg',
            'https://example.com/penthouse2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'John Doe',
        title: 'Charming Duplex in GRA',
        description:
            'Classic duplex with modern finishes and spacious rooms. Located in a serene Government Reserved Area with excellent security.',
        location: 'GRA, Port Harcourt',
        pricePerNight: 195,
        cautionFee: 550,
        bathrooms: 1,
        bedrooms: 2,
        toilets: 2,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.KITCHEN,

            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/brownstone1.jpg',
            'https://example.com/brownstone2.jpg',
            'https://example.com/brownstone3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Alice Bob',
        title: 'Hilltop Retreat with Panoramic Views',
        description:
            'Secluded home nestled in the hills with breathtaking views. Perfect for nature lovers seeking peace and tranquility.',
        location: 'Abeokuta, Ogun State',
        pricePerNight: 320,
        cautionFee: 900,
        bathrooms: 2,
        bedrooms: 3,
        toilets: 2,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/cabin1.jpg',
            'https://example.com/cabin2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'David Growth',
        title: 'Contemporary Artist Loft',
        description:
            'Bright and airy loft space with gallery-style walls and creative atmosphere. Ideal for artists and creative professionals.',
        location: 'Yaba, Lagos',
        pricePerNight: 165,
        cautionFee: 500,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [
            IApartmentAmenities.WIFI,

            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/artist1.jpg',
            'https://example.com/artist2.jpg',
            'https://example.com/artist3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Ebenezer Obey',
        title: 'Waterfront Apartment with Marina Access',
        description:
            'Elegant waterfront apartment with stunning lagoon views. Resort-style amenities included.',
        location: 'Banana Island, Lagos',
        pricePerNight: 385,
        cautionFee: 1200,
        bathrooms: 2,
        bedrooms: 2,
        toilets: 2,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.SWIMMING_POOL,
            IApartmentAmenities.GYM,

            IApartmentAmenities.KITCHEN
        ],
        images: [
            'https://example.com/waterfront1.jpg',
            'https://example.com/waterfront2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'John Doe',
        title: 'Eco-Friendly Compact Home',
        description:
            'Sustainable home with solar panels and water harvesting system. Minimalist living with maximum charm.',
        location: 'Ibadan, Oyo State',
        pricePerNight: 95,
        cautionFee: 300,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/tiny1.jpg',
            'https://example.com/tiny2.jpg',
            'https://example.com/tiny3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Alice Bob',
        title: 'Colonial Style Mansion Suite',
        description:
            'Luxurious suite in a restored colonial mansion with period furniture and modern amenities. A true historic gem.',
        location: 'Old Ikoyi, Lagos',
        pricePerNight: 420,
        cautionFee: 1400,
        bathrooms: 2,
        bedrooms: 2,
        toilets: 2,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/victorian1.jpg',
            'https://example.com/victorian2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'David Growth',
        title: 'Downtown Studio with City Views',
        description:
            'Sleek studio apartment with floor-to-ceiling windows overlooking the city skyline. Modern finishes throughout.',
        location: 'Central Business District, Abuja',
        pricePerNight: 175,
        cautionFee: 525,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.AIR_CONDITIONING,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.GYM,
            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/skyline1.jpg',
            'https://example.com/skyline2.jpg',
            'https://example.com/skyline3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Ebenezer Obey',
        title: 'Tropical Garden Bungalow',
        description:
            'Private bungalow surrounded by lush tropical gardens. Outdoor seating and hammock included for ultimate relaxation.',
        location: 'Ikeja GRA, Lagos',
        pricePerNight: 265,
        cautionFee: 750,
        bathrooms: 1,
        bedrooms: 2,
        toilets: 2,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/tropical1.jpg',
            'https://example.com/tropical2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'John Doe',
        title: 'Urban Industrial Apartment',
        description:
            'Converted warehouse space with concrete floors, exposed ductwork, and modern industrial design elements.',
        location: 'Surulere, Lagos',
        pricePerNight: 210,
        cautionFee: 600,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.AIR_CONDITIONING,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.WASHER,
            IApartmentAmenities.GYM
        ],
        images: [
            'https://example.com/industrial1.jpg',
            'https://example.com/industrial2.jpg',
            'https://example.com/industrial3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Alice Bob',
        title: 'Lakeside Cottage with Private Access',
        description:
            'Charming cottage on a private lake with your own water access. Perfect for fishing and relaxation.',
        location: 'Badagry, Lagos',
        pricePerNight: 295,
        cautionFee: 850,
        bathrooms: 2,
        bedrooms: 3,
        toilets: 2,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/lakeside1.jpg',
            'https://example.com/lakeside2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'David Growth',
        title: 'Minimalist Zen Apartment',
        description:
            'Peaceful minimalist space designed for meditation and relaxation. Serene decor and tranquil atmosphere.',
        location: 'Asokoro, Abuja',
        pricePerNight: 155,
        cautionFee: 475,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/zen1.jpg',
            'https://example.com/zen2.jpg',
            'https://example.com/zen3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Ebenezer Obey',
        title: 'Spacious Estate Home',
        description:
            'Large family home with open floor plan, modern kitchen, and spacious compound. Great for extended stays.',
        location: 'Lekki Phase 2, Lagos',
        pricePerNight: 240,
        cautionFee: 700,
        bathrooms: 3,
        bedrooms: 4,
        toilets: 3,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/suburban1.jpg',
            'https://example.com/suburban2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'John Doe',
        title: 'Bohemian Chic Loft',
        description:
            'Colorful and eclectic loft space with vintage finds and artistic touches. Perfect for free spirits and creatives.',
        location: 'Ajah, Lagos',
        pricePerNight: 145,
        cautionFee: 450,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/boho1.jpg',
            'https://example.com/boho2.jpg',
            'https://example.com/boho3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Alice Bob',
        title: 'Golf Course Villa',
        description:
            'Luxurious villa overlooking the golf course with private patio and access to club amenities.',
        location: 'Lakowe Lakes, Lagos',
        pricePerNight: 525,
        cautionFee: 1600,
        bathrooms: 3,
        bedrooms: 3,
        toilets: 4,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.SWIMMING_POOL,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.AIR_CONDITIONING
        ],
        images: [
            'https://example.com/golf1.jpg',
            'https://example.com/golf2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'David Growth',
        title: 'Cozy Hilltop Studio',
        description:
            'Small but perfectly formed studio in a serene hilltop location. Spectacular views and hiking trails nearby.',
        location: 'Jabi, Abuja',
        pricePerNight: 125,
        cautionFee: 400,
        bathrooms: 1,
        bedrooms: 1,
        toilets: 1,
        amenities: [IApartmentAmenities.WIFI, IApartmentAmenities.KITCHEN],
        images: [
            'https://example.com/mountain1.jpg',
            'https://example.com/mountain2.jpg',
            'https://example.com/mountain3.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    },
    {
        hostName: 'Ebenezer Obey',
        title: 'Historic District Apartment',
        description:
            'Elegant apartment in a heritage building with original details and modern updates. Walk to museums and cultural sites.',
        location: 'Marina, Lagos Island',
        pricePerNight: 235,
        cautionFee: 675,
        bathrooms: 2,
        bedrooms: 2,
        toilets: 2,
        amenities: [
            IApartmentAmenities.WIFI,
            IApartmentAmenities.KITCHEN,
            IApartmentAmenities.WASHER
        ],
        images: [
            'https://example.com/townhouse1.jpg',
            'https://example.com/townhouse2.jpg'
        ],
        status: IApartmentStatus.AVAILABLE
    }
];

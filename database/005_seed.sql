-- ============================================================================
-- 005_seed.sql
-- Explore Sri Lanka - Realistic Seed Data
-- Description: Seeds the places table with 20 iconic Sri Lankan tourist destinations
-- ============================================================================

-- Clean existing data to avoid duplicates upon re-seeding
TRUNCATE TABLE places RESTART IDENTITY CASCADE;

INSERT INTO places (
    title,
    slug,
    description,
    cover_image,
    latitude,
    longitude,
    location,
    district,
    province,
    category,
    activity,
    travel_style
) VALUES
-- 1. Sigiriya Rock Fortress
(
    'Sigiriya Ancient Rock Fortress',
    'sigiriya-rock-fortress',
    'A 5th-century ancient palace citadel built atop a sheer 200-meter granite rock, renowned for its frescoes, mirror wall, and landscaped terraced gardens.',
    'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
    7.9570,
    80.7603,
    ST_SetSRID(ST_MakePoint(80.7603, 7.9570), 4326)::geography,
    'Matale',
    'Central',
    'Heritage',
    'Sightseeing',
    'Culture'
),
-- 2. Galle Fort
(
    'Galle Dutch Fort',
    'galle-fort',
    'A UNESCO World Heritage coastal bastion built by the Portuguese in 1588 and fortified by the Dutch, showcasing living colonial ramparts and cobblestone alleys.',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
    6.0268,
    80.2170,
    ST_SetSRID(ST_MakePoint(80.2170, 6.0268), 4326)::geography,
    'Galle',
    'Southern',
    'Historical',
    'Sightseeing',
    'Culture'
),
-- 3. Nine Arch Bridge, Ella
(
    'Nine Arch Bridge',
    'nine-arch-bridge-ella',
    'An iconic viaduct railway bridge built entirely out of stone, brick, and cement without steel, nestled amid lush tea estates and misty mountain peaks.',
    'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
    6.8768,
    81.0608,
    ST_SetSRID(ST_MakePoint(81.0608, 6.8768), 4326)::geography,
    'Badulla',
    'Uva',
    'Viewpoint',
    'Photography',
    'Nature'
),
-- 4. Diyaluma Falls
(
    'Diyaluma Falls & Natural Pools',
    'diyaluma-falls',
    'The second highest waterfall in Sri Lanka at 220 meters, famous for its tiered cascade and thrilling rooftop natural infinity pools overlooking the valley.',
    'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1200&q=80',
    6.7327,
    81.0315,
    ST_SetSRID(ST_MakePoint(81.0315, 6.7327), 4326)::geography,
    'Badulla',
    'Uva',
    'Waterfall',
    'Adventure',
    'Adventure'
),
-- 5. Unawatuna Beach
(
    'Unawatuna Coral Beach',
    'unawatuna-beach',
    'A turquoise semicircular bay fringed with coconut palms and lively beach cafes, protected by a natural reef making it ideal for swimming.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    6.0104,
    80.2492,
    ST_SetSRID(ST_MakePoint(80.2492, 6.0104), 4326)::geography,
    'Galle',
    'Southern',
    'Beach',
    'Swimming',
    'Relaxation'
),
-- 6. Mirissa Beach
(
    'Mirissa Beach & Coconut Tree Hill',
    'mirissa-beach',
    'World-renowned crescent beach famous for its scenic red-soil Coconut Tree Hill, serene sunsets, and morning blue whale watching excursions.',
    'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1200&q=80',
    5.9482,
    80.4578,
    ST_SetSRID(ST_MakePoint(80.4578, 5.9482), 4326)::geography,
    'Matara',
    'Southern',
    'Beach',
    'Surfing',
    'Couple'
),
-- 7. Yala National Park
(
    'Yala National Park Safari',
    'yala-national-park',
    'Sri Lanka’s premier wildlife sanctuary boasting one of the world’s highest densities of leopards, along with wild Asian elephants, sloth bears, and crocodiles.',
    'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    6.3683,
    81.5218,
    ST_SetSRID(ST_MakePoint(81.5218, 6.3683), 4326)::geography,
    'Hambantota',
    'Southern',
    'Wildlife',
    'Wildlife Watching',
    'Family'
),
-- 8. Nuwara Eliya & Lake Gregory
(
    'Lake Gregory Nuwara Eliya',
    'nuwara-eliya-lake-gregory',
    'Picturesque high-altitude lake nestled in Sri Lanka’s "Little England", surrounded by rolling tea plantations, colonial bungalows, and cool alpine breezes.',
    'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    6.9698,
    80.7788,
    ST_SetSRID(ST_MakePoint(80.7788, 6.9698), 4326)::geography,
    'Nuwara Eliya',
    'Central',
    'Lake',
    'Sightseeing',
    'Family'
),
-- 9. Horton Plains & World\'s End
(
    'Horton Plains & World''s End',
    'horton-plains-worlds-end',
    'A protected highland plateau featuring cloud forests, Baker’s Falls, and an awe-inspiring precipice dropping vertically over 880 meters down to the southern plains.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    6.8028,
    80.8038,
    ST_SetSRID(ST_MakePoint(80.8038, 6.8028), 4326)::geography,
    'Nuwara Eliya',
    'Central',
    'Mountain',
    'Hiking',
    'Nature'
),
-- 10. Adam\'s Peak (Sri Pada)
(
    'Adam''s Peak (Sri Pada)',
    'adams-peak-sri-pada',
    'Sacred conical mountain towering at 2,243 meters, revered across world faiths for the sacred footprint atop its summit and its breathtaking shadow sunrise.',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    6.8096,
    80.4994,
    ST_SetSRID(ST_MakePoint(80.4994, 6.8096), 4326)::geography,
    'Ratnapura',
    'Sabaragamuwa',
    'Temple',
    'Hiking',
    'Culture'
),
-- 11. Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)
(
    'Temple of the Sacred Tooth Relic',
    'temple-of-the-tooth-kandy',
    'Golden-roofed Buddhist temple complex in the historic kingdom of Kandy that houses the revered relic of the tooth of the Buddha.',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    7.2936,
    80.6413,
    ST_SetSRID(ST_MakePoint(80.6413, 7.2936), 4326)::geography,
    'Kandy',
    'Central',
    'Temple',
    'Sightseeing',
    'Culture'
),
-- 12. Arugam Bay
(
    'Arugam Bay Surf Point',
    'arugam-bay',
    'A world-class right-hand point break that hosts international surf competitions, characterized by a bohemian beach vibe and wildlife lagoons.',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    6.8417,
    81.8267,
    ST_SetSRID(ST_MakePoint(81.8267, 6.8417), 4326)::geography,
    'Ampara',
    'Eastern',
    'Beach',
    'Surfing',
    'Adventure'
),
-- 13. Bentota Beach
(
    'Bentota Golden Beach',
    'bentota-beach',
    'A broad golden sand spit separating the Indian Ocean from the serene Bentota River lagoon, famous for water sports, jet skiing, and luxury resorts.',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    6.4256,
    79.9984,
    ST_SetSRID(ST_MakePoint(79.9984, 6.4256), 4326)::geography,
    'Galle',
    'Southern',
    'Beach',
    'Swimming',
    'Luxury'
),
-- 14. Knuckles Mountain Range
(
    'Knuckles Mountain Range',
    'knuckles-mountain-range',
    'Rugged mountain massif resembling the knuckles of a clenched fist, featuring 34 summits, misty pygmy forests, endemic biodiversity, and wilderness trekking.',
    'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1200&q=80',
    7.4667,
    80.7833,
    ST_SetSRID(ST_MakePoint(80.7833, 7.4667), 4326)::geography,
    'Matale',
    'Central',
    'Mountain',
    'Camping',
    'Adventure'
),
-- 15. Pidurangala Rock
(
    'Pidurangala Rock Sunrise Viewpoint',
    'pidurangala-rock',
    'An enormous monolithic rock adjacent to Sigiriya offering the most breathtaking 360-degree panoramic sunrise view directly facing the Sigiriya citadel.',
    'https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=1200&q=80',
    7.9654,
    80.7635,
    ST_SetSRID(ST_MakePoint(80.7635, 7.9654), 4326)::geography,
    'Matale',
    'Central',
    'Viewpoint',
    'Hiking',
    'Solo'
),
-- 16. Ella Rock
(
    'Ella Rock Hiking Trail',
    'ella-rock',
    'A rewarding trekking peak through eucalyptus forests and tea plantations, presenting sweeping vistas across the Ella Gap and Little Adam’s Peak.',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    6.8573,
    81.0475,
    ST_SetSRID(ST_MakePoint(81.0475, 6.8573), 4326)::geography,
    'Badulla',
    'Uva',
    'Mountain',
    'Hiking',
    'Adventure'
),
-- 17. Ravana Falls
(
    'Ravana Falls & Caves',
    'ravana-falls-ella',
    'One of the widest waterfalls in Sri Lanka, cascading over concave rock outcrops steeped in legendary Ramayana folklore.',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    6.8407,
    81.0543,
    ST_SetSRID(ST_MakePoint(81.0543, 6.8407), 4326)::geography,
    'Badulla',
    'Uva',
    'Waterfall',
    'Sightseeing',
    'Nature'
),
-- 18. Galle Face Green & Colombo City
(
    'Galle Face Green & Colombo Waterfront',
    'galle-face-green-colombo',
    'A vibrant 5-hectare oceanfront urban promenade in the heart of Colombo, popular for street food like Isso Wade, sunset walks, and kite flying.',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    6.9298,
    79.8458,
    ST_SetSRID(ST_MakePoint(79.8458, 6.9298), 4326)::geography,
    'Colombo',
    'Western',
    'Cultural',
    'Sightseeing',
    'Solo'
),
-- 19. Pigeon Island National Park (Trincomalee)
(
    'Pigeon Island Marine National Park',
    'pigeon-island-trincomalee',
    'A marine national park boasting pristine coral reefs teeming with blacktip reef sharks, sea turtles, and over 300 species of reef fish.',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    8.7183,
    81.2045,
    ST_SetSRID(ST_MakePoint(81.2045, 8.7183), 4326)::geography,
    'Trincomalee',
    'Eastern',
    'Wildlife',
    'Swimming',
    'Couple'
),
-- 20. Udawalawe National Park
(
    'Udawalawe Elephant Sanctuary',
    'udawalawe-national-park',
    'An open savannah park established around a reservoir, renowned as the premier location in Asia to observe wild elephant herds and the Elephant Transit Home.',
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1200&q=80',
    6.4746,
    80.8987,
    ST_SetSRID(ST_MakePoint(80.8987, 6.4746), 4326)::geography,
    'Ratnapura',
    'Sabaragamuwa',
    'Wildlife',
    'Wildlife Watching',
    'Family'
);

-- Output count to confirm
SELECT COUNT(*) AS total_places_seeded FROM places;

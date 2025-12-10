-- Ensure image_url column exists
ALTER TABLE deals ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a demo user for the showcase deals
INSERT INTO users (username, email, password_hash, email_verified, created_at)
VALUES ('SlickDealHunter', 'deals@example.com', '$argon2id$v=19$m=65536,t=3,p=4$MzE0MTU5MjY1MzU4OTc5Mw$J/d/7P/G/w/A/r/E/a/L/H/a/s/h', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Get the user ID (in case it already existed)
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'deals@example.com';

    -- Clean up previous showcase deals to prevent duplicates
    DELETE FROM deals WHERE user_id = demo_user_id;

    -- Insert Showcase Deals
    INSERT INTO deals (user_id, title, description, price, original_price, product_url, image_url, category, created_at)
    VALUES 
    (demo_user_id, 'LG C3 Series 65-Inch Class OLED evo 4K Processor Smart TV', 'The LG OLED evo C-Series is powered by the a9 AI Processor Gen6—made exclusively for LG OLED—for beautiful picture and performance. The Brightness Booster improves brightness so you get luminous picture and high contrast, even in well-lit rooms.', 1396.99, 2499.99, 'https://www.amazon.com/dp/B0BVXDPZP3', 'https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg', 'Electronics', NOW()),

    (demo_user_id, 'Apple MacBook Air 13.6" Laptop - M2 Chip - 8GB Memory - 256GB SSD', 'Redesigned around the next-generation M2 chip, MacBook Air is strikingly thin and brings exceptional speed and power efficiency within its durable all-aluminum enclosure. It is the ultraportable, capable laptop that lets you work, play, or create just about anything — anywhere.', 899.00, 1099.00, 'https://www.bestbuy.com/site/apple-macbook-air-13-6-laptop-m2-chip-8gb-memory-256gb-ssd-midnight/6509650.p', 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6509/6509650_sd.jpg', 'Electronics', NOW() - INTERVAL '2 hours'),

    (demo_user_id, 'adidas Men''s Ultraboost 1.0 Sneakers', 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST. Its unique molecule design achieves the lightest BOOST foam to date.', 75.00, 190.00, 'https://www.adidas.com/us/ultraboost', 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/15f84b8981d34d7b9838af51010426f2_9366/Ultraboost_Light_Running_Shoes_White_HQ6351_01_standard.jpg', 'Apparel', NOW() - INTERVAL '5 hours'),

    (demo_user_id, 'DEWALT 20V MAX Cordless Drill / Driver Kit, Compact, 1/2-Inch', 'Compact, lightweight design fits into tight areas. High performance motor delivers 300 unit watts out (UWO) of power ability completing a wide range of applications.', 99.00, 179.00, 'https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-1-2-in-Drill-Driver-Kit', 'https://images.thdstatic.com/productImages/e2724797-2e0f-4e0d-98c2-c4c9a23883a7/svn/dewalt-power-tool-combo-kits-dck240c2-64_1000.jpg', 'Tools', NOW() - INTERVAL '1 day'),

    (demo_user_id, 'Sony PlayStation 5 Slim Console - Marvel''s Spider-Man 2 Bundle', 'Get the PlayStation 5 Console – Marvel’s Spider-Man 2 Bundle and experience the game with the power of the PS5 console. Includes the PS5 console, DualSense wireless controller, and a voucher for Marvel’s Spider-Man 2.', 449.99, 559.99, 'https://direct.playstation.com/', 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-slim-disc-console-image-block-01-en-16nov23?$1600px$', 'Gaming', NOW() - INTERVAL '3 hours'),

    (demo_user_id, 'Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD', 'Reach max performance of PCIe 4.0. Experience longer-lasting, opponent-blasting speed. The in-house controller''s smart heat control delivers supreme power efficiency while maintaining ferocious speed and performance.', 129.99, 249.99, 'https://www.newegg.com/samsung-2tb-990-pro/p/N82E16820147861', 'https://c1.neweggimages.com/ProductImage/20-147-861-V01.jpg', 'Electronics', NOW() - INTERVAL '6 hours'),

    (demo_user_id, 'Dyson V15 Detect Cordless Vacuum Cleaner', 'Dyson''s most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. Automatically adapts suction power. Scientific proof of a deep clean.', 599.99, 749.99, 'https://www.dyson.com/vacuum-cleaners/cordless/v15', 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/vacuum-cleaners/cordless/v15-detect/v15-detect-gold/V15-Detect-Gold-Hero.jpg', 'Home', NOW() - INTERVAL '12 hours'),

    (demo_user_id, 'Xbox Game Pass Ultimate: 3 Month Membership [Digital Code]', 'Includes Xbox Live Gold and over 100 high-quality games to play with friends on console, PC, phones and tablets, and an EA Play membership, all for one low monthly price.', 24.99, 44.99, 'https://www.target.com/p/xbox-game-pass-ultimate', 'https://target.scene7.com/is/image/Target/GUEST_b9f6c6e6-8b66-439e-9167-3493a1383276', 'Gaming', NOW() - INTERVAL '4 hours'),

    (demo_user_id, 'Levi''s Men''s 501 Original Fit Jeans', 'The original blue jean since 1873. The original straight fit jean. All-American style. A blank canvas for self-expression.', 35.40, 79.50, 'https://www.levi.com/US/en_US/clothing/men/jeans/501-original-fit-mens-jeans', 'https://lsco.scene7.com/is/image/lsco/005010193-front-pdp?fmt=jpeg&qlt=70,1&op_sharpen=0&resMode=sharp2&op_usm=0.8,1,10,0&fit=crop,0&wid=850&hei=1133', 'Apparel', NOW() - INTERVAL '1 day'),

    (demo_user_id, 'Ninja Foodi 6-in-1 8-qt. 2-Basket Air Fryer', 'The Ninja Foodi 6-in-1 8-qt. 2-Basket Air Fryer with DualZone Technology. The first air fryer with 2 independent baskets that lets you cook 2 foods at once, not back-to-back like a traditional single-basket air fryer.', 119.99, 199.99, 'https://www.amazon.com/Ninja-DZ201-Foodi-Basket-Fryer', 'https://m.media-amazon.com/images/I/71Xp-K4MMBL._AC_SL1500_.jpg', 'Home', NOW() - INTERVAL '8 hours');

END $$;
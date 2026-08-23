INSERT INTO hero_slides ("id","imageUrl","sortOrder","isActive","createdAt","updatedAt") VALUES
  ('hero_seed_1','https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80',0,true,NOW(),NOW()),
  ('hero_seed_2','https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80',1,true,NOW(),NOW()),
  ('hero_seed_3','https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80',2,true,NOW(),NOW()),
  ('hero_seed_4','https://images.unsplash.com/photo-1570366583862-f91883984fde?w=1400&q=80',3,true,NOW(),NOW()),
  ('hero_seed_5','https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=1400&q=80',4,true,NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

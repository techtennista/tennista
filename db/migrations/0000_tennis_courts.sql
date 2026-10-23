CREATE TABLE IF NOT EXISTS tennis_courts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source TEXT NOT NULL DEFAULT 'curated',
  external_id TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tennis_courts_location_idx
  ON tennis_courts (country, state, city)
  WHERE active = TRUE;

INSERT INTO tennis_courts (slug, name, address, city, state, country, image_url)
VALUES
  (
    'lagos-lawn-tennis-club',
    'Lagos Lawn Tennis Club',
    '12 Tafawa Balewa Road, Onikan, Lagos Island',
    'Lagos Island',
    'Lagos',
    'Nigeria',
    '/lagos-tennis-club.jpg'
  ),
  (
    'lagos-country-club',
    'Lagos Country Club',
    '2 Joel Ogunnaike Street, GRA, Ikeja',
    'Ikeja',
    'Lagos',
    'Nigeria',
    '/lagos-tennis-club.jpg'
  ),
  (
    'teslim-balogun-stadium',
    'Teslim Balogun Stadium',
    'Alhaji Masha Road, Surulere',
    'Surulere',
    'Lagos',
    'Nigeria',
    '/teslim-balogun.jpg'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

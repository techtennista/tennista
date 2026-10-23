INSERT INTO cms_assets (
  id, bucket, object_key, original_name, mime_type, byte_size, alt_text, status, uploaded_by
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'local',
    '/2025-tournament-1.jpg',
    '2025-tournament-1.jpg',
    'image/jpeg',
    0,
    'Junior tennis players and organisers at a Tennista Foundation tournament',
    'ready',
    'system'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'local',
    '/2026-tournament-3.jpg',
    '2026-tournament-3.jpg',
    'image/jpeg',
    0,
    'Junior tennis tournament prize presentation',
    'ready',
    'system'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'local',
    '/junior-tennis-open-cover.jpg',
    'junior-tennis-open-cover.jpg',
    'image/jpeg',
    0,
    'Young players at the Tennista Junior Tennis Open',
    'ready',
    'system'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_posts (
  id, slug, title, excerpt, body, hero_asset_id, status, author_user_id,
  seo_title, seo_description, published_at
)
VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    'atilola-zara-others-shine-at-tennista-foundation-junior-tennis-tourney',
    'Atilola, Zara, others shine at Tennista Foundation Junior Tennis’ tourney',
    'Young champions emerged across the U-16 and U-12 categories at the second Tennista Foundation Junior Tennis Tournament.',
    '{
      "version": 1,
      "blocks": [
        {"id":"p1","type":"paragraph","text":"Atilola Mofifun and Zara Adegoke emerged as the winners of the U-16 and U-12 categories at the second edition of the Tennista Foundation Junior Tennis Tournament."},
        {"id":"p2","type":"paragraph","text":"The tournament, played on clay courts at the Lagos Country Club, brought together budding tennis players who showcased their talents during the three-day event."},
        {"id":"p3","type":"paragraph","text":"Speaking after the event, Michael Nwoseh, President of Tennista Foundation, highlighted increased participation, better infrastructure, and the introduction of an under-12 division that created opportunities for younger athletes."},
        {"id":"q1","type":"quote","text":"Parents and coaches brought their kids from different parts of the country.","attribution":"Michael Nwoseh"},
        {"id":"p4","type":"paragraph","text":"The winners received educational grants, brand new tennis rackets, school bags, and other prizes designed to support their development on and off the court."}
      ]
    }'::jsonb,
    '10000000-0000-4000-8000-000000000001',
    'published',
    'system',
    'Atilola, Zara, others shine at Tennista Foundation Junior Tennis’ tourney',
    'Young champions emerged at the second Tennista Foundation Junior Tennis Tournament.',
    '2026-04-21T09:00:00+01:00'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'tennista-offer-junior-tennis-tournament-winners-runner-ups-scholarship',
    'Tennista offer junior tennis tournament winners, runner-ups scholarship',
    'Tennista Foundation announced scholarship support for winners and runners-up in its junior tennis tournament.',
    '{
      "version": 1,
      "blocks": [
        {"id":"p1","type":"paragraph","text":"Tennista Foundation announced scholarship support for the winners and runners-up of its junior tennis tournament, extending the event’s impact beyond the final match."},
        {"id":"p2","type":"paragraph","text":"The support combines tennis development with educational opportunity, helping promising young players continue learning while they strengthen their game."}
      ]
    }'::jsonb,
    '10000000-0000-4000-8000-000000000002',
    'published',
    'system',
    'Tennista offers junior tournament finalists scholarship support',
    'Scholarship support for winners and runners-up at the Tennista junior tennis tournament.',
    '2026-04-21T09:00:00+01:00'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '55-kids-serve-off-maiden-tennista-junior-tennis-open',
    '55 kids serve off maiden Tennista Junior Tennis Open',
    'Fifty-five young players took to the court for the maiden Tennista Junior Tennis Open.',
    '{
      "version": 1,
      "blocks": [
        {"id":"p1","type":"paragraph","text":"Fifty-five young players took to the court for the maiden Tennista Junior Tennis Open, gaining valuable match experience in a supportive competitive environment."},
        {"id":"p2","type":"paragraph","text":"The tournament gave children an opportunity to test their skills, build confidence, meet other players, and experience organised competition."}
      ]
    }'::jsonb,
    '10000000-0000-4000-8000-000000000003',
    'published',
    'system',
    '55 kids serve off maiden Tennista Junior Tennis Open',
    'Fifty-five children compete at the first Tennista Junior Tennis Open.',
    '2026-04-21T09:00:00+01:00'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_post_revisions (post_id, revision_number, snapshot, created_by)
SELECT
  post.id,
  1,
  jsonb_build_object(
    'title', post.title,
    'excerpt', post.excerpt,
    'body', post.body,
    'status', post.status
  ),
  'system'
FROM cms_posts post
WHERE post.id IN (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003'
)
ON CONFLICT (post_id, revision_number) DO NOTHING;

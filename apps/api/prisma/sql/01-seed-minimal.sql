-- Optional minimal seed — demo user + one community + one post
-- Password: password123
-- Run AFTER 00-init-schema.sql

BEGIN;

INSERT INTO "User" (
  "id", "username", "email", "passwordHash",
  "displayName", "bio", "createdAt", "updatedAt"
) VALUES (
  'cm4seed00000000000000000001',
  'demo',
  'demo@example.test',
  '$2b$10$X8rO1iC3tT1jWjsSE0XCJ./vrqRLi6pQwqBkWCfUOFkKBBavU14oW',
  'Demo User',
  'Default demo account.',
  NOW(), NOW()
);

INSERT INTO "Community" (
  "id", "name", "title", "description", "creatorId", "createdAt"
) VALUES (
  'cm4seed00000000000000000002',
  'programming',
  'Programming',
  'Computer programming discussion.',
  'cm4seed00000000000000000001',
  NOW()
);

INSERT INTO "CommunityMember" (
  "id", "userId", "communityId", "role", "joinedAt"
) VALUES (
  'cm4seed00000000000000000003',
  'cm4seed00000000000000000001',
  'cm4seed00000000000000000002',
  'MODERATOR',
  NOW()
);

INSERT INTO "CommunityRule" (
  "id", "communityId", "position", "title", "description", "createdAt"
) VALUES
  ('cm4seed00000000000000000004', 'cm4seed00000000000000000002', 1, 'Remember the human', 'Treat others with respect.', NOW()),
  ('cm4seed00000000000000000005', 'cm4seed00000000000000000002', 2, 'Stay on topic', 'Posts should fit the community.', NOW());

INSERT INTO "Post" (
  "id", "title", "body", "authorId", "communityId", "score", "createdAt", "updatedAt"
) VALUES (
  'cm4seed00000000000000000006',
  'Welcome to the learning app',
  'First post on a fresh database. Register or log in as demo / password123.',
  'cm4seed00000000000000000001',
  'cm4seed00000000000000000002',
  42,
  NOW(), NOW()
);

COMMIT;

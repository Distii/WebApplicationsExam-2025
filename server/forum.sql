BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	id INTEGER,
	email TEXT NOT NULL,
	name TEXT,
	hash TEXT NOT NULL,
	salt TEXT NOT NULL,
	secret TEXT NOT NULL,
    PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "posts" (
	id INTEGER,
    title TEXT NOT NULL UNIQUE,
    author_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    max_comments INTEGER,
    publication_timestamp DATETIME NOT NULL,
    PRIMARY KEY ("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "comments" (
    id INTEGER,
    post_id INTEGER NOT NULL,
    author_id INTEGER,
    text TEXT NOT NULL,
    interesting_count INTEGER DEFAULT 0,
    publication_timestamp DATETIME NOT NULL,
    PRIMARY KEY ("id" AUTOINCREMENT),
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "interesting_flags" (
    userId INTEGER NOT NULL,
    commentId INTEGER NOT NULL,
    PRIMARY KEY (userId, commentId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE
);


INSERT INTO "users" VALUES (1,'u1@p.it','Alice','c1779466cd4e3e631f51d59b1ecb2283ea85b1fb9a5da558198291ead22e0152','72e4eeb14def3b21',''); --pwd1
INSERT INTO "users" VALUES (2,'u2@p.it','Bob','b87d79efadb2a2ed7da0f765a835b0d5d87862a7224ddfb7ed361afb716d2bad','a8b618c717683608','LXBSMDTMSP2I5XFXIYRGFVWSFI'); --pwd2
INSERT INTO "users" VALUES (3,'u3@p.it','Carol','556b14f8294e3353cfd12e16487882582cf1da616bfac732556d23c892a82490','e818f0647b4e1fe0',''); --pwd3
INSERT INTO "users" VALUES (4,'u4@p.it','Dave','0c6b0ce72642407876ee2765c2815486cab5ac76da17eda94378bf5d42e6263d','e4b6e750e5b7f065',''); --pwd4
INSERT INTO "users" VALUES (5,'u5@p.it','Erin','f34e496892419aee379fa69194527d221210b091a75151754a981ceb19989ef4','7faff00374fdfb1e','LXBSMDTMSP2I5XFXIYRGFVWSFI'); --pwd5


INSERT INTO posts (title, author_id, text, max_comments, publication_timestamp) VALUES
('Alice Post 1', '1', 'This is the first post by Alice.\nHello everyone.', 3, '2025-06-10 10:00:00'),
('Alice Post 2', '1', 'Another post by Alice.', NULL, '2025-06-10 12:00:00');

INSERT INTO posts (title, author_id, text, max_comments, publication_timestamp) VALUES
('Bob Post 1', '2', 'Bob shares his thoughts. \nFew ideas', 2, '2025-06-11 14:00:00'),
('Bob Post 2', '2', 'Bob again with a new post.', 5, '2025-06-11 16:00:00');

INSERT INTO posts (title, author_id, text, max_comments, publication_timestamp) VALUES
('Carol Admin Post 1', '3', 'Carol, the admin, speaks.\nNo words', 4, '2025-06-09 09:00:00'),
('Carol Admin Post 2', '3', 'Carol again, still admin.', 2, '2025-06-09 10:00:00');

INSERT INTO posts (title, author_id, text, max_comments, publication_timestamp) VALUES
('Dave Non-Admin Post', '4', 'Dave is not an admin.', 0, '2025-06-11 12:00:00');

INSERT INTO posts (title, author_id, text, max_comments, publication_timestamp) VALUES
('Erin Admin Post 1', '5', 'Erin shares wisdom.', NULL, '2025-06-08 11:00:00'),
('Erin Admin Post 2', '5', 'Erin limited post.', 3, '2025-06-08 12:00:00');

INSERT INTO comments (post_id, author_id, text, interesting_count, publication_timestamp) VALUES
(1, '2', 'Nice post, Alice!', 0, '2025-06-12 10:05:00'),
(1, NULL, 'Anonymous compliment!', 1,  '2025-06-12 10:06:00');

INSERT INTO comments (post_id, author_id, text, interesting_count, publication_timestamp) VALUES
(2, '3', 'Interesting!', 3, '2025-06-12 12:15:00');

INSERT INTO comments (post_id, author_id, text, interesting_count, publication_timestamp) VALUES
(3, NULL, 'Anonymous reply.', 1, '2025-06-12 14:12:00');

INSERT INTO comments (post_id, author_id, text, interesting_count, publication_timestamp) VALUES
(4, '3', 'I agree.', 1, '2025-06-12 16:10:00'),
(4, '5', 'Well said.', 0, '2025-06-12 16:20:00'),
(4, NULL, 'Another take.', 0, '2025-06-12 16:30:00');

INSERT INTO comments (post_id, author_id, text, publication_timestamp) VALUES
(5, '1', 'Admin excellence!', '2025-06-12 09:10:00'),
(5, '2', 'Very helpful.', '2025-06-12 09:15:00'),
(5, NULL, 'Appreciated.', '2025-06-12 09:20:00');

INSERT INTO comments (post_id, author_id, text, publication_timestamp) VALUES
(6, '4', 'Waiting for more!', '2025-06-12 10:10:00');

INSERT INTO comments (post_id, author_id, text, publication_timestamp) VALUES
(8, '1', 'Thought-provoking.', '2025-06-12 12:10:00'),
(8, NULL, 'Anonymous input.', '2025-06-12 12:15:00');

INSERT INTO interesting_flags (userId, commentId) VALUES
(1, 2), (1, 3), (2, 3), (4, 3), (3, 5), (3, 6)
COMMIT;

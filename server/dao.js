'use strict'

const dayjs = require('dayjs');
const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('forum copy.db', (err) => {
    if (err) throw err;
});

db.run("PRAGMA foreign_keys = ON"); // to enable foreign key constraints

function postMapping(rows) {
    const post = rows.map((e) => ({
        id: e.id,
        title: e.title,
        authorId: e.author_id,
        author: e.author,
        text: e.text.replace(/\\n/g, '\n'), //to keep the newlines
        comment_count: e.comment_count,
        max_comments: e.max_comments,
        timestamp: e.publication_timestamp,
    }));
    return post;
}

function commentMapping(rows) {
    const comment = rows.map((e) => ({
        id: e.id,
        postId: e.post_id,
        authorId: e.author_id,
        author: e.author ? e.author : 'Anonymous',
        text: e.text.replace(/\\n/g, '\n'), //to keep the newlines
        num_interesting: e.interesting_count,
        isInteresting: e.isInteresting === undefined ? null : e.isInteresting,
        timestamp: e.publication_timestamp,
    }));
    return comment;
}

exports.retrievePosts = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT \
            posts.*, \
            users.name AS author, \
            COUNT(comments.id) AS comment_count\
            FROM posts\
            JOIN users ON posts.author_id = users.id\
            LEFT JOIN comments ON posts.id = comments.post_id\
            GROUP BY posts.id', (err, rows) => {
            if (err) reject(err);
            else resolve(postMapping(rows).sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()));
        });
    });
}

exports.retrieveComments = (userId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT \
            comments.*, \
            users.name AS author, \
            CASE WHEN interesting_flags.userId IS NOT NULL THEN 1 ELSE 0 END AS isInteresting\
            FROM comments\
            LEFT JOIN users ON comments.author_id = users.id\
            LEFT JOIN interesting_flags ON comments.id = interesting_flags.commentId AND interesting_flags.userId = ?', [userId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(commentMapping(rows).sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()));
            });
    });
}

exports.retrieveAnonymousComments = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT \
            comments.*, \
            users.name AS author \
            FROM comments\
            LEFT JOIN users ON comments.author_id = users.id', (err, rows) => {
            if (err) reject(err);
            else resolve(commentMapping(rows).filter((e) => e.author === 'Anonymous')
                .map((e) => ({ ...e, num_interesting: null }))
                .sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()));
        });
    });
}

exports.deletePost = (id, userId) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM posts WHERE author_id=? AND id=?', [userId, id], function (err) {
            if (err) reject(err);
            else if (this.changes === 0) resolve({ error: 'Post already not present or not authorized' });
            else resolve(`Post with id ${id} removed`);
        });
    });
}

exports.deletePostAdmin = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM posts WHERE id=?', id, function (err) {
            if (err) reject(err);
            else if (this.changes === 0) resolve('Post already not present');
            else resolve(`Post with id ${id} removed`);
        });
    });
}

exports.deleteComment = (id, userId) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM comments WHERE author_id=? AND id=?', [userId, id], function (err) {
            if (err) reject(err);
            else if (this.changes === 0) resolve({ error: 'Comment already not present or not authorized' });
            else resolve(`Comment with id ${id} removed`);
        });
    });
}

exports.deleteCommentAdmin = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM comments WHERE id=?', id, function (err) {
            if (err) reject(err);
            else if (this.changes === 0) resolve('Comment already not present');
            else resolve(`Comment with id ${id} removed`);
        });
    });
}

exports.createPost = (post, userId) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO posts(title, author_id, text, max_comments, publication_timestamp) VALUES(?,?,?,?,?)',
            [post.title, userId, post.text, post.max_comments, dayjs().format('YYYY-MM-DD HH:mm:ss')],
            function (err) {
                if (err) reject(err);
                else resolve(`Post Added with id: ${this.lastID}`);
            });
    });
}

exports.createComment = (comment, userId = undefined) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT max_comments FROM posts WHERE id = ?', [comment.postId], (err, row) => {
            if (err) reject(err);
            else if (!row) resolve({ error: 'Post not present' });
            else {
                db.get('SELECT COUNT(*) as count FROM comments WHERE post_id=?', [comment.postId], (err, count) => {
                    if (err) reject(err);
                    else if (count.count === row.max_comments) reject({ error: 'Maximum number of comments reached for this post' });
                    else {
                        db.run(
                            'INSERT INTO comments(post_id, author_id, text, interesting_count, publication_timestamp) VALUES(?, ?, ?, ?, ?)',
                            [
                                comment.postId,
                                userId ?? null,
                                comment.text,
                                comment.interesting_count,
                                dayjs().format('YYYY-MM-DD HH:mm:ss')
                            ],
                            function (err) {
                                if (err) reject(err);
                                else resolve(`Comment Added with id: ${this.lastID}`);
                            }
                        );
                    }
                })
            }
        });
    });
};

exports.editComment = (commentId, comment, userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM comments WHERE author_id=? AND id=?', [userId, commentId], (err, row) => {
            if (err) reject(err);
            else if (!row) reject({ error: 'Comment not present or not authorized' });
            else {
                row.text = comment.text || row.text;
                db.run('UPDATE comments SET text=? WHERE author_id=? AND id=?',
                    [row.text, userId, commentId],
                    function (err) {
                        if (err) reject(err);
                        else resolve(`Comment with id ${commentId} modified`);
                    });
            }
        });
    });
}

exports.editCommentAdmin = (id, comment) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM comments WHERE id=?', [id], (err, row) => {
            if (err) reject(err);
            else if (!row) resolve({ error: 'Comment not present' });
            else {
                row.text = comment.text || row.text;
                db.run('UPDATE comments SET text=? WHERE id=?',
                    [row.text, id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(`Comment with id ${id} modified`);
                    });
            }
        });
    });
}

// Mark comment as interesting and increment count
exports.markInteresting = (userId, commentId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM comments WHERE id = ?`, [commentId], (err, row) => {
            if (!row) resolve({ error: 'Comment not present' });
            else {
                db.run(`INSERT OR IGNORE INTO interesting_flags (userId, commentId) VALUES (?, ?)`, [userId, commentId],
                    function (err) {
                        if (err) reject(err);
                        if (this.changes === 0) resolve({ error: 'Comment already marked as interesting' })
                        else {
                            db.run(
                                `UPDATE comments SET interesting_count = interesting_count + 1 WHERE id = ?`,
                                [commentId],
                                function (err) {
                                    if (err) reject(err);
                                    else resolve(`Comment with id ${commentId} marked correctly`);
                                });
                        }
                    });
            }
        });
    });
};

// Unmark comment as interesting and decrement count
exports.unmarkInteresting = (userId, commentId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT 1 FROM comments WHERE id = ?`, [commentId], (err, row) => {
            if (!row) resolve({ error: 'Comment not present' });
            else {
                db.run(`DELETE FROM interesting_flags WHERE userId = ? AND commentId = ?`, [userId, commentId],
                    function (err) {
                        if (err) reject(err);
                        if (this.changes > 0) {
                            db.run(
                                `UPDATE comments SET interesting_count = max(interesting_count - 1, 0) WHERE id = ?`,
                                [commentId],
                                function (err) {
                                    if (err) reject(err);
                                    else resolve(`Comment with id ${commentId} un-marked correctly`);
                                });
                        }
                    });
            }
        });
    });
};

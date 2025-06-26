'use strict';

function Post(id, title, authorId, author, text, comment_count, max_comments, timestamp) {
    this.id = id;
    this.title = title;
    this.authorId = authorId
    this.author = author;
    this.text = text;
    this.comment_count = comment_count;
    this.max_comments = max_comments;
    this.timestamp = timestamp;
    this.comments = [];
}

function Comment(id, postId, authorId, author, text, num_interesting, isInteresting, timestamp) {
    this.id = id;
    this.postId = postId;
    this.authorId = authorId;
    this.author = author;
    this.text = text;
    this.num_interesting = num_interesting;
    this.isInteresting = isInteresting;
    this.timestamp = timestamp;
}

export { Post, Comment };

'use strict';

import { Post, Comment } from "./ObjectsModel";
// This file contains functions to call server APIs

const URL = 'http://localhost:3001/api';

// Get all posts
async function getPosts() {
  // call GET /api/posts
  const response = await fetch(URL + `/posts`);
  const posts = await response.json();
  if (response.ok) {
    return posts.map((e) => new Post(e.id, e.title, e.authorId, e.author, e.text, e.comment_count, e.max_comments, e.timestamp)).sort((a, b) => a.timestamp < b.timestamp);
  } else {
    throw posts;  // expected to be an object (extracted by json) that provides info about the error
  }
}

// Get all comments (only for logged-in users)
async function getComments() {
  // call GET /api/comments
  const response = await fetch(URL + `/comments`, {
    credentials: 'include',
  });
  const comments = await response.json();
  if (response.ok) {
    return comments.map((e) => new Comment(e.id, e.postId, e.authorId, e.author, e.text, e.num_interesting, e.isInteresting, e.timestamp));
  } else {
    throw comments;  // expected to be an object (extracted by json) that provides info about the error
  }
}

// Get only anonymous comments
async function getAnonymousComments() {
  // call GET /api/comments/anon
  const response = await fetch(URL + `/comments/anon`);
  const comments = await response.json();
  if (response.ok) {
    return comments.map((e) => new Comment(e.id, e.postId, e.authorId, e.author, e.text, e.num_interesting, e.isInteresting, e.timestamp));
  } else {
    throw comments;  // expected to be an object (extracted by json) that provides info about the error
  }
}

// Add a post (only for the author or admin)
function addPost(post) {
  // call POST /api/posts/add
  return new Promise((resolve, reject) => {
    fetch(URL + `/posts/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Delete a post (only for the author or admin)
function deletePost(id) {
  // call DELETE /api/posts/<id>/delete
  return new Promise((resolve, reject) => {
    fetch(URL + `/posts/${id}/delete`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Add a comment (only for the author or admin)
function addComment(comment) {
  // call POST /api/comments/add
  return new Promise((resolve, reject) => {
    fetch(URL + `/comments/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Edit a comment (only for the author or admin)
function editComment(comment) {
  // call PUT /api/comments/:id/update
  return new Promise((resolve, reject) => {
    fetch(URL + `/comments/${comment.id}/edit`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Delete a comment (only for the author or admin)
function deleteComment(id) {
  // call DELETE /api/comments/<id>/delete
  return new Promise((resolve, reject) => {
    fetch(URL + `/comments/${id}/delete`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Mark a comment as interesting (only for logged-in users)
function markInteresting(id) {
  // call POST /api/comments/:id/interesting
  return new Promise((resolve, reject) => {
    fetch(URL + `/comments/${id}/interesting`, {
      method: 'POST',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Un-mark a comment as interesting (only for logged-in users)
function unmarkInteresting(id) {
  // call POST /api/comments/:id/notInteresting
  return new Promise((resolve, reject) => {
    fetch(URL + `/comments/${id}/notInteresting`, {
      method: 'POST',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// Login with TOTP
function totpVerify(totpCode) {
  // call  POST /api/login-totp
  return new Promise((resolve, reject) => {
    fetch(URL + `/login-totp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: totpCode }),
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then(() => resolve())
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

// LogIn
async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

// LogOut
async function logOut() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

// Get current logged in user
async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

const API = {
  getPosts, deletePost, addPost,
  getComments, getAnonymousComments, addComment, deleteComment, editComment, markInteresting, unmarkInteresting,
  totpVerify, logIn, logOut, getUserInfo
};

export default API;

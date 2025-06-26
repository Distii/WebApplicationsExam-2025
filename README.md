[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/6EO6Vzam)
# Exam #1: "Forum"
## Student: DI STASIO ENRICO 

## React Client Application Routes

- Route `/`: Home page which shows all the posts, the anonymous comments and the non-anonymous ones when logged-in.
- Route `/add/post`: Form which allows to create a new post by choosing title, text and optionally maximum number of comments
- Route `/add/:postId/comment`: Form which allows to create a new comment to a post by choosing the text
- Route `/edit/:postId/:commentId`: Form which allows to edit a comment by changing its text
- Route `/login`: Form which allows to login using username (email) and password
- Route `/totp`: Form which appears after a user with the ability to be an admin logs-in and allows him or her to become admin by inserting a TOTP

## API Server

### Posts and Comments Management
- GET `/api/posts`
  * Description: Get all the posts.
  * Request body: _None_
  * Response: `200 OK` (success) or `404 Not Found` (no posts found) or `500 Internal Server Error` (generic error).
  * Response body: An array of objects, each describing a post.
```
[
  {
    "id": 1,
    "title": "Alice Post 1",
    "authorId": 1,
    "author": "Alice",
    "text": "This is the first post by Alice.\nHello everyone.",
    "comment_count": 2,
    "max_comments": 3,
    "timestamp": "2025-06-10 10:00:00"
  },
...]
```
- GET `/api/comments/anon`
  * Description: Get the anonymous comments.
  * Request body: _None_
  * Response: `200 OK` (success) or `404 Not Found` or `500 Internal Server Error` (generic error).
  * Response body: An array of objects, each describing a post.
```
[
  {
    "id": 2,
    "postId": 1,
    "authorId": null,
    "author": "Anonymous",
    "text": "Anonymous compliment!",
    "num_interesting": 0,
    "isInteresting": null,
    "timestamp": "2025-06-12 10:06:00"
  },
...]
```
- GET `/api/comments`
  * Description: Get all the comments.
  * Request body: _None_
  * Response: `200 OK` (success) or `401 Not Authorized` or `404 Not Found` or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: An array of objects, each describing a post.
```
  [
  {
    "id": 1,
    "postId": 1,
    "authorId": 2,
    "author": "Bob",
    "text": "Nice post, Alice!",
    "num_interesting": 0,
    "isInteresting": null,
    "timestamp": "2025-06-12 10:05:00"
  },
...]
```
- DELETE `/api/posts/<id>/delete`
  * Description: Deletes the post with a specific id `<id>`. May be performed only by the owner of the post or by an admin.
  * Request parameter: The postID `<id>`
  * Response: `200 OK` (success) or `401 Not Authorized` or `404 Not Found` (wrong id) or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: _None_

- DELETE `/api/comments/<id>/delete`
  * Description: Deletes the comment with a specific id `<id>`. May be performed only by the owner of the comment or by an admin.
  * Request parameter: The commentID `<id>`
  * Response: `200 OK` (success) or `401 Not Authorized` or `404 Not Found` (wrong id) or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: _None_

- POST `/api/posts/add`
  * Description: Adds a new post passed with body.
  * Request body: An object representing a post (Content-Type: `application/json`).
  ```
  {
      "title": "new title \n",
      "text": "this is a new text",
      "max_comments": "3"
  }
  ```
  * Response: `200 OK` (success) or `401 Not Authorized` or `500 Internal Server Error` (generic error or if a post with that title already exists). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: _None_

- POST `/api/comments/add`
  * Description: Adds a new comment passed with body.
  * Request parameter: _None_
  * Request body: An object representing a comment (Content-Type: `application/json`).
  ```
  {
      "text": "this is a new comment text",
  }
  ```
  * Response: `200 OK` (success) or `404 Not Found` or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: A message with the id of the added comment.

- PUT `/api/comments/<id>/edit`
  * Description: Edit an existing comment's text passed as body. May be performed only by the owner of the comment or by an admin.
  * Request parameter: The commentId `<id>` (also passed in body and then checked)
  * Request body: An object representing a comment (Content-Type: `application/json`).
  ```
  {
      "id": 5,
      "text": "this is text of an edited comment",
  }
  ```
  * Response: `200 OK` (success) or `401 Not Authorized` or `404 Not Found` or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error  ).
  * Response body: _None_

- POST `/api/comments/<id>/interesting`
  * Description: Mark a comment as interesting.
  * Request parameter: The commentID `<id>`
  * Request body: _Null_
  * Response: `200 OK` (success) or `401 Not Authorized` or `404 Not Found` or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: _None_

- POST `/api/comments/<id>/notInteresting`
  * Description: Un-mark a comment as interesting.
  * Request parameter: The commentID `<id>`
  * Request body: _Null_
  * Response: `200 OK` (success) or `401 Not Authorized` or `404 Not Found` or `500 Internal Server Error` (generic error). If the request is not valid, `422 Unprocessable Entity` (validation error).
  * Response body: _None_

### Users APIs
- POST `/api/sessions`
  * Description: Create a new session starting from given credentials.
  * Request body: An object with username and password
  ```
  {
    "username": "u1@p.com",
    "password": "pwd1"
  }
  ```
  * Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  * Response body: _None_

- POST `/api/login-totp`
  * Description: Create a session strating from a TOTP code
  * Request body: An object with the TOTP code
  ```
  {
    "code": "097620" 
  }
  ```
  * Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  * Response body:
  ```
  {
    "otp": "authorized"
  }
  ```

- DELETE `/api/sessions/current`
  * Description: Delete the current session.
  * Request body: _None_
  * Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  * Response body: _None_


- GET `/api/sessions/current`
  * Description: Verify if the given session is still valid and return the info about the logged-in user.
  * Request body: _None_ 
  * Response: `201 Created` (success) or `401 Unauthorized` (error).
  * Response body: An object with user information
  ```
  {
    "id": 1,
    "username": "u1@p.it",
    "name": "Alice",
    "canDoTotp": false,
    "isTotp": false
  }
  ```

## Database Tables
Two DB files: `forum.db` (original database) and `forum copy.db` (copy used for modifications and testing). SQL file `forum.sql` to recreate original database.
- Table `users` - contains the id (primary key), the email, the password hash, the salt and the TOTP secret (only for the admins) for all users.
- Table `posts` - contains the id (primary key), title, author_id, text, max number of comments (optional) and publication_timestamp of all the posts.
- Table `comments` - contains the id (primary key), post_id (foreign key referencing posts.id), author_id (if null the author is anonymous), text, number of interesting flags and publication_timestamp of all the comments.
- Table `interesting_flags` - contains the information regarding which user has marked which comment as interesting, userId (foreign key referencing users.id) and commentId (foreign key referencing comments.id) combination as a primary key.

## Main React Components

- `MyNavbar` (in `Navbar.jsx`): renders the navbar containing the login/logout button.
- `PostRoute` (in `PostList.jsx`): shows the button to add a new post and the list of current posts along with the comments to each post (every comment if logged-in otherwise only the anonymous ones). Wrapper for `PostsTable` and `CommentsTable`.
- `PostsTable` (in `PostList.jsx`): renders the tables that show the posts and comments. Also uses other minor components like `AddNewComment`, `DeletePost`.
- `CommentsTable` (in `PostList.jsx`): renders the tables that show the comments. Also uses other minor components like `EditComment`, `DeleteComment` and `Interesting`.
- `AddPost` (in `AddPost.jsx`): renders the form used to create a new post.
- `AddEditComment` (in `AddEditComment.jsx`): renders the form used to create a new comment or edit an existing one.
- `LoginForm` (in `AuthComponent.jsx`): renders the login form.
- `TotpForm` (in `TOTPComponent.jsx`): renders the TOTP form.

## Screenshot

![Screenshot](./img/notLoggedIn_home.png)
![Screenshot](./img/loggedInAsAdmin.png)
![Screenshot](./img/logIn_form.png)
![Screenshot](./img/totpLogIn_form.png)
![Screenshot](./img/addPost_form.png)
![Screenshot](./img/addComment_form.png)

## Users Credentials

| email      | name  | plain-text password  | Admin |
|------------|-------|----------------------|-------|
| u1@p.it    | Alice | pwd1                 | No    |
| u2@p.it    | Bob   | pwd2                 | Yes   |
| u3@p.it    | Carol | pwd3                 | No    |
| u4@p.it    | Dave  | pwd4                 | No    |
| u5@p.it    | Erin  | pwd5                 | Yes   |

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'

import { useState, useEffect } from 'react';
import { Col, Container, Row, Alert } from 'react-bootstrap';
import { Routes, Route, Outlet, useNavigate } from 'react-router';

import MyNavbar from './components/Navbar';
import PostsRoute from './components/PostList.jsx';
import LoginForm from './components/AuthComponent.jsx';
import TotpForm from './components/TOTPComponent.jsx';
import AddPost from './components/AddPost.jsx';
import AddEditComment from './components/AddEditComment.jsx';

import API from './API.js';

function Layout(props) {

  return (
    <Container fluid>
      <MyNavbar postList={props.postList} doLogOut={props.doLogOut} user={props.user}
        loggedIn={props.loggedIn} loggedInAsAdmin={props.loggedInAsAdmin} />
      {props.errorMsg ? <Row>
        <Col>
          <Alert variant='danger' dismissible
            onClose={() => {
              props.setErrorMsg('');
              setTimeout(() => props.setDirtyPosts(true), 100); // Fetch the current version from server, after a while
            }}>
            {props.errorMsg}</Alert>
        </Col>
      </Row> : null}
      <Outlet />
    </Container>

  )
}

function App() {
  const [postList, setPostList] = useState([]);
  const [waiting, setWaiting] = useState(false)

  const [dirtyPosts, setDirtyPosts] = useState(true);
  const [dirtyComments, setDirtyComments] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInAsAdmin, setLoggedInAsAdmin] = useState(false);

  const navigate = useNavigate();

  function handleError(err) {
    let errMsg = 'Unknown error';

    if (Array.isArray(err.errors) && err.errors.length > 0 && err.errors[0].msg) {
      errMsg = err.errors[0].msg;
    } else if (typeof err.error === 'string') {
      errMsg = err.error;
    } else if (typeof err.message === 'string') {
      errMsg = err.message;
    }

    setErrorMsg(errMsg);
  }

  function linkPostToComments(comments) {
    return comments.reduce((acc, c) => {
      if (!acc[c.postId]) acc[c.postId] = [];
      acc[c.postId].push(c);
      return acc;
    }, {});
  }

  // Getting Post list
  useEffect(() => {
    if (dirtyPosts) {
      setWaiting(true);
      API.getPosts().then(list => {
        setPostList(list);
        setDirtyPosts(false);
        setDirtyComments(true)
      }).catch(err => handleError(err))
    }
  }, [dirtyPosts]);

  // Getting anonymous or all comments'list and linking it to posts
  useEffect(() => {
    if (dirtyComments) {
      setWaiting(true);
      const fetchComments = loggedIn ? API.getComments : API.getAnonymousComments;
      
      fetchComments()
        .then(comments => {
          const grouped = linkPostToComments(comments);
          setPostList(prev =>
            prev.map(post => ({
              ...post,
              comments: grouped[post.id] || [],
            }))
          );
          setDirtyComments(false);
        })
        .catch(err => handleError(err))
        .finally(() => setWaiting(false));
    }
  }, [dirtyComments, loggedIn]);

  // Delete Post
  const deletePost = (id) => {
    API.deletePost(id)
      .then(() => setDirtyPosts(true))
      .catch(err => handleError(err));
  }

  // New Post
  const addPost = (post) => {
    API.addPost(post)
      .then(() => setDirtyPosts(true))
      .catch(err => handleError(err));
  }

  // Delete Comment
  const deleteComment = (id) => {
    API.deleteComment(id)
      .then(() => setDirtyPosts(true))
      .catch(err => handleError(err));
  }

  // New comment through + button and form
  const addComment = (post) => {
    API.addComment(post)
      .then(() => setDirtyPosts(true))
      .catch(err => handleError(err));
  }

  // Comment editing through pencil button and form
  const editComment = (comment) => {
    API.editComment(comment)
      .then(() => setDirtyComments(true))
      .catch(err => handleError(err));
  }

  // Mark comment as interesting
  const markInteresting = (id) => {
    API.markInteresting(id)
      .then(() => setDirtyComments(true))
      .catch(err => handleError(err));
  }

  // Unmark comment as interesting
  const unmarkInteresting = (id) => {
    API.unmarkInteresting(id)
      .then(() => setDirtyComments(true))
      .catch(err => handleError(err));
  }

  // LogOut
  const doLogOut = async () => {
    API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setLoggedInAsAdmin(false);
    setDirtyPosts(true);
    navigate('/');
  }

  // LogIn
  const loginSuccessful = (user) => {
    setWaiting(false)
    setUser(user);
    setLoggedIn(true);
    setDirtyPosts(true);
  }

  // LogIn with TOTP
  const totpSuccessful = () => {
    setWaiting(false);
    setLoggedInAsAdmin(true);
  }

  return (
    <Routes>
      <Route path='/' element={<Layout postList={postList} loggedIn={loggedIn} loggedInAsAdmin={loggedInAsAdmin} doLogOut={doLogOut} user={user}
        errorMsg={errorMsg} setErrorMsg={setErrorMsg} setDirtyPosts={setDirtyPosts} />} >
        <Route index element={<PostsRoute postList={postList} waiting={waiting} loggedIn={loggedIn} deletePost={deletePost} deleteComment={deleteComment}
          markInteresting={markInteresting} unmarkInteresting={unmarkInteresting} user={user} loggedInAsAdmin={loggedInAsAdmin} />} />
        <Route path='/add/post' element={<AddPost addPost={addPost} />} />
        <Route path='/add/:postId/comment' element={<AddEditComment postList={postList} addComment={addComment} />} />
        <Route path='/edit/:postId/:commentId' element={<AddEditComment postList={postList} editComment={editComment} />} />
      </Route>
      <Route path='/login' element={<LoginForm loginSuccessful={loginSuccessful} setWaiting={setWaiting} />} />
      <Route path='/totp' element={<TotpForm totpSuccessful={totpSuccessful} setWaiting={setWaiting} doLogOut={doLogOut} />} />
      <Route path='/*' element={<Alert className='d-flex justify-content-center' variant='danger' dismissible onClose={() => navigate('/')}> Incorrect path, close this alert to go back </Alert>} /> {/* Simple handling of incorrect path */}
    </Routes >
  )
}


export default App
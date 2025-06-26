import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import API from '../API';

function LoginForm(props) {
  const [username, setUsername] = useState('u1@p.it');
  const [password, setPassword] = useState('pwd1');

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    props.setWaiting(true)
    API.logIn(credentials)
      .then(user => {
        setAuthError('');
        props.loginSuccessful(user);
        // Check if user can log-in as admin
        if (user.secret)
          navigate('/totp');
        else
          navigate('/')
      })
      .catch(err => {
        setAuthError('Wrong username or password');
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setAuthError('');
    const credentials = { username, password };

    const newErrors = {};

    // Error messages
    if (username === '')
      newErrors.username = 'Username must be an email and cannot be empty'
    if (password === '')
      newErrors.password = 'Password cannot be empty'

    // Check if there are any errors at submission time
    if (Object.keys(newErrors).length === 0) {
      doLogIn(credentials);
    }
    else
      setErrors(newErrors);
  };

  return (props.waiting ?
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Spinner />
    </Container> :
    <Container>
      <Row>
        <Col lg={4} />
        <Col lg={4} className='loginForm'>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {(Object.keys(errors).length !== 0) ? <Alert variant='danger' dismissible onClose={() => setErrors({})}> Error(s) in one or more field(s) </Alert> :
              authError ? <Alert variant='danger' dismissible onClose={() => setAuthError({})}> {authError} </Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} isInvalid={errors.username} />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} isInvalid={errors.password} />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Button className='my-2 save-add-cancel-btn' type='submit' variant='outline-success' >Login</Button>
            <Button className='my-2 mx-2 save-add-cancel-btn' variant='outline-danger' onClick={() => navigate('/')}>Cancel</Button>
          </Form>
        </Col>
        <Col lg={2} />
      </Row>
    </Container>
  )
}

export default LoginForm;

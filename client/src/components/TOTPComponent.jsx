import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import API from '../API';

function TotpForm(props) {
  const [totpCode, setTotpCode] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doTotpVerify = () => {
    props.setWaiting(true)
    API.totpVerify(totpCode)
      .then(() => {
        setErrorMessage('');
        props.totpSuccessful();
        navigate('/');
      })
      .catch(() => {
        // NB: Generic error message
        setErrorMessage('Wrong code, please try again');
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    // Check if there are any errors at submission time
    let valid = true;
    if (totpCode === '' || totpCode.length !== 6)
      valid = false;

    if (valid) {
      doTotpVerify(totpCode);
    } else
      setErrorMessage('Invalid content in form: either empty or not 6-char long');
  };

  return (props.waiting ?
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Spinner />
    </Container> :
    <Container>
      <Row>
        <Col lg={3} />
        <Col lg={6} className='loginForm'>
          <h2>Second Factor Authentication (2FA)</h2>
          <h5>Please enter the code that you read on your device</h5>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
            <Form.Group controlId='totpCode'>
              <Form.Label>Code</Form.Label>
              <Form.Control type='text' value={totpCode} onChange={ev => setTotpCode(ev.target.value)} />
            </Form.Group>
            <Button className='my-2 save-add-cancel-btn' type='submit' variant='outline-success'>Validate</Button>
            <Button className='my-2 mx-2 save-add-cancel-btn' variant='outline-warning' onClick={() => navigate('/')}>Only login as user</Button>
            <Button className='my-2 mx-2 save-add-cancel-btn' variant='outline-danger' onClick={() => props.doLogOut()}>Cancel login</Button>
          </Form>
        </Col>
        <Col lg={2} />
      </Row>
    </Container>
  )
}

export default TotpForm;

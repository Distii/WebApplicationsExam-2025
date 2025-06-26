import { Button, Navbar, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router';

function MyNavbar(props) {
  const navigate = useNavigate();

  return (
      <Navbar className='navbar' data-bs-theme="dark">
          <Navbar.Brand className="p-0 d-flex align-items-end">
            <Button className="btn btn-primary title" onClick={() => navigate('/')}> <h1> <i className="bi bi-stack-overflow" /> {'Enrico\'s Forum '} </h1> </Button>
            {props.user ? <Navbar.Text > <h2>{`Welcome ${props.user.name}` + (props.loggedInAsAdmin ? ' (Logged in as Admin)' : '')} </h2> </Navbar.Text> : ''}
          </Navbar.Brand>
        <Col className="d-flex justify-content-end">
          {props.loggedIn ?
            <Button className="btn btn-primary me-2 logOut" onClick={() => props.doLogOut()}> Logout <i className="bi bi-person-circle" /> </Button> :
            <Button className="btn btn-primary me-2 logIn" onClick={() => navigate('/login')}> Login <i className="bi bi-person-circle" /> </Button>
          }
        </Col>
      </Navbar>
  );
}

export default MyNavbar;
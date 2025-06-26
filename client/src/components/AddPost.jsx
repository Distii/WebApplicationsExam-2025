import { useState } from 'react';
import { Form, Button, Alert, Col, Row, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router';

function AddPost(props) {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [max_comments, setMax_comments] = useState('');

    const [errors, setErrors] = useState({});

    function handleSubmit(event) {
        event.preventDefault();

        const newErrors = {};

        // Error messages
        if (!text)
            newErrors.text = 'Text cannot be empty'
        if (!title)
            newErrors.title = 'Title cannot be empty'
        if (max_comments !== '' && (parseInt(max_comments, 10) < 0 || typeof max_comments.rating === "string"))
            newErrors.max_comments = 'Max Comments must be an integer (0 or more)'

        // Check if there are any errors at submission time
        if (Object.keys(newErrors).length === 0) {
            const post = {
                title: title,
                text: text,
                max_comments: max_comments === '' ? undefined : max_comments
            }
            props.addPost(post);
            navigate('/');
        }
        setErrors(newErrors);
    }

    return (
        <Container fluid>
            <Row lg={5} className='p-1'>
                <h2 className='newPostTitle p-2 d-flex justify-content-center'> New Post Creation </h2>
            </Row>
            {(Object.keys(errors).length !== 0) ? <Alert variant='danger' dismissible onClose={() => setErrors({})}> Error(s) in one or more field(s) </Alert> : ''}
            <Row>
                <Col className='newPost m-1' lg={6}>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="postTitle">
                            <Form.Label><i className="bi bi-pencil-square me-2" /> <b>Title</b></Form.Label>
                            <Form.Control type="text" name="title" placeholder="Post title" required value={title} size='lg'
                                onChange={(event) => setTitle(event.target.value)} isInvalid={errors.title} />
                            <Form.Control.Feedback type="invalid">
                                {errors.title}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="postText">
                            <Form.Label><i className="bi bi-chat-left-text me-2" /> <b>Text</b></Form.Label>
                            <Form.Control as="textarea" name="text" placeholder="Post text" rows={3} required value={text} size='lg'
                                onChange={(event) => setText(event.target.value)} isInvalid={errors.text} />
                            <Form.Control.Feedback type="invalid">
                                {errors.text}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Version which uses type=number but allows writing non numeric characters in the form, still not considered as max_comments. Issue because of requiring empty form
                        <Form.Group className="mb-3" controlId="postMaxComments">
                            <Form.Label><i className="bi bi-hash me-2" /><b>Max Comments</b></Form.Label>
                            <Form.Control type="number" min={0} step={1} name="max_comments" value={max_comments} placeholder="Optional (only integers)" size='lg'
                                onChange={(event) => {
                                    const val = event.target.value;
                                    if (val === '' || /^\d+$/.test(val)) setMax_comments(val);
                                }} isInvalid={errors.max_comments} />
                            <Form.Control.Feedback type="invalid">
                                {errors.max_comments}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Version which doesn't use type=number but blocks writing non numeric characters in the form. Solves issue but not a proper number form.*/}
                        <Form.Group className="mb-3" controlId="postMaxComments">
                            <Form.Label><i className="bi bi-hash me-2" /><b>Max Comments</b></Form.Label>
                            <Form.Control type="text" name="max_comments" value={max_comments} placeholder="Optional (only integers)" size='lg'
                                onChange={(event) => {
                                    const val = event.target.value;
                                    if (val === '' || /^\d+$/.test(val)) setMax_comments(val);
                                }} isInvalid={errors.max_comments} />
                            <Form.Control.Feedback type="invalid">
                                {errors.max_comments}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className='d-flex justify-content-end'>
                            <Button variant='outline-success' type="submit" className="save-add-cancel-btn"> Add </Button>
                            <Button variant='outline-danger' className="save-add-cancel-btn" onClick={() => navigate('/')}> Cancel </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}

export default AddPost;
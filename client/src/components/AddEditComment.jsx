import { useState } from 'react';
import { Form, Button, Alert, Col, Row, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router';

function AddEditComment(props) {
    const navigate = useNavigate();
    const { postId, commentId } = useParams();

    // Recover comment to edit using thr postId and the commentId
    function findCommentById(posts, commentId) {
        for (const post of posts) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                return comment;
            }
        }
        return undefined; // not found
    }

    const objToEdit = findCommentById(props.postList, parseInt(commentId));

    const [text, setText] = useState(objToEdit ? objToEdit.text : '');

    const [errors, setErrors] = useState({});

    function handleSubmit(event) {
        event.preventDefault();

        const newErrors = {};

        // Error messages
        if (!text) {
            newErrors.text = 'Text cannot be empty'
        }

        // Check if there are any errors at submission time
        if (Object.keys(newErrors).length === 0) {

            if (objToEdit) {  // decide if this is an edit or an add

                const comment = {
                    id: objToEdit.id,
                    postId: parseInt(postId),
                    text: text,
                }

                props.editComment(comment);
                navigate('/');
            } else {

                const comment = {
                    postId: parseInt(postId),
                    text: text,
                }

                props.addComment(comment);
                navigate('/');
            }
        }
        setErrors(newErrors);
    }

    return (
        <Container fluid>
            <Row lg={5} className='p-1'>
                {objToEdit ? <h2 className='newPostTitle p-2 d-flex justify-content-center'>Comment Editing</h2> : <h2 className='newPostTitle p-2 d-flex justify-content-center'>Comment Creation</h2>}
            </Row>
            {(Object.keys(errors).length !== 0) ? <Alert variant='danger' dismissible onClose={() => setErrors({})}> Error(s) in one or more field(s) </Alert> : ''}
            <Row>
                <Col className='newPost m-1' lg={6}>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="commentText">
                            <Form.Label> <i className="bi bi-chat-left-text me-2" /><b>Text</b></Form.Label>
                            <Form.Control as="textarea" name="text" placeholder="Comment text" rows={3} value={text} size='lg'
                                onChange={(event) => setText(event.target.value)}
                                isInvalid={errors.text} />
                            <Form.Control.Feedback type="invalid">
                                {errors.text}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className='text-center d-flex justify-content-end'>
                            <Button variant='outline-success' type="submit" className="save-add-cancel-btn"> {objToEdit ? 'Edit' : 'Add'} </Button>
                            <Button variant='outline-danger' className="save-add-cancel-btn" onClick={() => navigate('/')}> Cancel </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container >
    )
}

export default AddEditComment;
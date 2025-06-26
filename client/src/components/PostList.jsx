import { Row, Table, Button, Container, Spinner, Collapse } from 'react-bootstrap';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

function AddNewComment(props) {
    const navigate = useNavigate();
    return (
        // Show the plus button to add the comment only if maximum number of comment has not been reached
        <Button className="addCommentBtn" disabled={props.maxComments}
            onClick={() => navigate(`/add/${props.postId}/comment`)} >
            <i className="bi bi-plus d-flex justify-content-around" />
        </Button>
    )
}

function DeletePost(props) {
    return (
        // Show the delete button for the post only if author or admin
        (props.loggedIn && (props.userId === props.authorId)) || props.loggedInAsAdmin ?
            <Button className="btn-lg deleteBtn" variant="outline-danger"
                onClick={() => props.deletePost(props.postId)}>
                <i className="bi bi-trash3" />
            </Button> : ''
    )
}

function EditComment(props) {
    const navigate = useNavigate();
    return (
        // Show the edit button for the comment only if author or admin
        (props.loggedIn && (props.userId === props.authorId)) || props.loggedInAsAdmin ?
            <td>
                <Button className="btn editBtn" variant='outline-warning'
                    onClick={() => navigate(`/edit/${props.postId}/${props.commentId}`)}>
                    <i className="bi bi-pencil" />
                </Button>
            </td> : ''
    )
}

function DeleteComment(props) {
    return (
        // Show the delete button for the comment only if author or admin
        (props.loggedIn && (props.userId === props.authorId)) || props.loggedInAsAdmin ?
            <td>
                <Button className="btn deleteBtn" variant='outline-danger'
                    onClick={() => props.deleteComment(props.commentId)}>
                    <i className="bi bi-trash3" />
                </Button>
            </td> : ''
    )
}

function Interesting(props) {
    return (
        // Show Interesting button only if logged-in
        props.loggedIn ?
            <Button className='interesting' variant='outline'
                onClick={() => {
                    if (props.isInteresting)
                        props.unmarkInteresting(props.commentId);
                    else
                        props.markInteresting(props.commentId);
                }} >
                <i id='interestingFlag' className={props.isInteresting ? "bi bi-pin-fill" : "bi bi-pin"} />
            </Button> : ''
    )
}

function CommentsTable(props) {
    const { post, expanded, user, deleteComment, markInteresting, unmarkInteresting, loggedIn, loggedInAsAdmin } = props
    return (
        < Collapse in={expanded}>
            <div>
                {post.comments.length > 0 ?
                    <Table className="mb-0 comment-table">
                        <tbody>
                            {post.comments.map((comment) => (
                                <tr key={comment.id}>
                                    <td className="ps-4 pre-wrap">
                                        {comment.text}
                                    </td>
                                    <td className="ps-4 text-secondary">
                                        {'by: ' + comment.author}
                                    </td>
                                    <td className="ps-4 text-secondary">
                                        {comment.timestamp}
                                    </td>
                                    <td className="ps-4">
                                        {loggedIn ? comment.num_interesting + ' ' : ''}
                                        <Interesting isInteresting={comment.isInteresting} markInteresting={markInteresting} unmarkInteresting={unmarkInteresting}
                                            postId={post.id} commentId={comment.id} authorId={comment.authorId} loggedIn={loggedIn}
                                            loggedInAsAdmin={loggedInAsAdmin} userId={user ? user.id : undefined} />
                                    </td>
                                    <EditComment postId={post.id} commentId={comment.id} authorId={comment.authorId}
                                        loggedIn={loggedIn} loggedInAsAdmin={loggedInAsAdmin} userId={user ? user.id : undefined} />
                                    <DeleteComment deleteComment={deleteComment} commentId={comment.id} authorId={comment.authorId}
                                        loggedIn={loggedIn} loggedInAsAdmin={loggedInAsAdmin} userId={user ? user.id : undefined} />
                                </tr>
                            ))}
                        </tbody>
                    </Table> : <div className="ps-3 text-muted"> No comments </div>}
            </div>
        </Collapse >
    )
}

function PostsTable(props) {
    const { posts, user, deletePost, deleteComment, expandedPostIds, setExpandedPostIds,
        loggedIn, loggedInAsAdmin, listOfInteresting, markInteresting, unmarkInteresting } = props;

    // To set which posts must show the comments
    const togglePost = (postId) => {
        setExpandedPostIds((prev) =>
            prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
        );
    };

    return (
        <Table className='post-table'>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Text</th>
                    <th>Author</th>
                    <th>Timestamp</th>
                    <th className='text-center'>Comments</th>
                </tr>
            </thead>
            <tbody>
                {posts.map((post) => {
                    const expanded = expandedPostIds.includes(post.id);
                    return (
                        <React.Fragment key={post.id}>
                            <tr>
                                <td className="p-2 bg-light fw-bold">
                                    {post.title}
                                </td>
                                <td className="p-2 bg-light pre-wrap">
                                    {post.text}
                                </td>
                                <td className="p-2 bg-light fw-bold">
                                    {post.author}
                                </td>
                                <td className="p-2 bg-light">
                                    {post.timestamp}
                                </td>
                                <td className="d-flex justify-content-evenly align-items-center">
                                    <span className="badge p-3" >{post.comment_count}/{post.max_comments === null ? <>&#x221E;</> : post.max_comments} </span>
                                    <AddNewComment postId={post.id} maxComments={post.max_comments === null ? false : post.comment_count >= post.max_comments} />
                                    <Button className='toggleComments' variant='outline-dark'
                                        onClick={() => togglePost(post.id)} >
                                        {expandedPostIds.includes(post.id) ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />}
                                    </Button>
                                    <DeletePost deletePost={deletePost} postId={post.id} authorId={post.authorId}
                                        loggedIn={loggedIn} loggedInAsAdmin={loggedInAsAdmin} userId={user ? user.id : undefined} />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="100%" className="no-hover-table">
                                    <CommentsTable post={post} expanded={expanded} listOfInteresting={listOfInteresting} loggedIn={loggedIn} loggedInAsAdmin={loggedInAsAdmin}
                                        deletePost={deletePost} deleteComment={deleteComment} user={user} markInteresting={markInteresting} unmarkInteresting={unmarkInteresting} />
                                </td>
                            </tr>
                        </React.Fragment>
                    );
                })}
            </tbody>
        </Table >
    );
}

function PostsRoute(props) {
    const [expandedPostIds, setExpandedPostIds] = useState([]);

    const { waiting, loggedIn, user, loggedInAsAdmin, postList, listOfInteresting,
        deletePost, deleteComment, markInteresting, unmarkInteresting } = props;
    const navigate = useNavigate();

    return (
        waiting ?
            <Container fluid className="d-flex justify-content-center align-items-center vh-100">
                <Spinner />
            </Container> :
            <Container fluid>
                <div className='d-flex justify-content-between align-items-end'>
                    <Row className='p-1'>
                        <h2 className='newPostTitle p-2 d-flex justify-content-center'> Current List of Posts</h2>
                    </Row>
                    {loggedIn ?
                        <Button variant="light" size='lg' className="my-2 addPostBtn" onClick={() => navigate('/add/post')} >
                            Add a new Post
                        </Button> : ''}
                </div>
                <Row>
                    <PostsTable posts={postList} listOfInteresting={listOfInteresting} loggedIn={loggedIn} loggedInAsAdmin={loggedInAsAdmin}
                        deletePost={deletePost} deleteComment={deleteComment} user={user} expandedPostIds={expandedPostIds} setExpandedPostIds={setExpandedPostIds}
                        markInteresting={markInteresting} unmarkInteresting={unmarkInteresting} />
                </Row>
            </Container>
    )
}


export default PostsRoute;
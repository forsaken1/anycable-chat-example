import React from "react"
import { ListGroup, Button, Row, Col } from 'react-bootstrap'
import { ActionCable } from 'react-actioncable-provider'

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

class Chats extends React.Component {
  constructor(props) {
    super(props)

    this.messagesContainerRef = React.createRef();

    this.state = {
      users: [],
      conversations: {},
      selectedUser: null,
      message: ''
    }
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers() {
    fetch('/users')
      .then(res => res.json())
      .then(res => {
        const selectedUser = res[0];

        if(selectedUser) {
          this.fetchMessages(selectedUser.id);
        }
        this.setState({users: res, selectedUser});
      })
  }

  fetchMessages(userId) {
    fetch('/messages?user_id=' + userId)
      .then(res => res.json())
      .then(res => {
        const { conversations } = this.state;
        this.setState({conversations: { ...conversations, [userId]: res }}, this.scrollDown);
      })
  }

  scrollDown = _ => {
    this.messagesContainerRef.current.scrollTop = this.messagesContainerRef.current.scrollHeight;
  }

  handleReceivedConversation = (userId, response) => {
    const { conversations } = this.state;
    const messages = conversations[userId] ? conversations[userId] : [];
    
    this.setState({conversations: {...conversations, [userId]: [...messages, response]}}, this.scrollDown);
  }

  handleSendButton = event => {
    event.preventDefault();

    const { selectedUser, message } = this.state;
    const data = JSON.stringify({user_id: selectedUser.id, text: message});

    if(message != '') {
      fetch('/messages', { method: 'POST', body: data, headers: HEADERS })
        .then(_ => {
          this.setState({message: ''});
          this.scrollDown();
        })
    }
  }

  handleUpdateTextarea = event => {
    const message = event.currentTarget.value;
    this.setState({message});
  }

  handleSelectUser = selectedUser => {
    this.setState({selectedUser});
    this.fetchMessages(selectedUser.id);
  }

  render() {
    const { users, conversations, message, selectedUser } = this.state;
    const { currentUserId } = this.props;
    const messages = selectedUser && conversations[selectedUser.id] ? conversations[selectedUser.id] : [];

    return (
      <Row className="chats-container">
        {users.map((user, i) =>
          <ActionCable
            key={i}
            channel={{ channel: 'MessagesChannel', user_id: user.id }}
            onReceived={response => this.handleReceivedConversation(user.id, response)}/>)}
        <Col sm={3}>
          <ListGroup>
            {users.map((user, i) =>
              <ListGroup.Item className={selectedUser.id === user.id ? 'active' : ''} key={i} onClick={_ => this.handleSelectUser(user)}>{user.name}</ListGroup.Item>)}
          </ListGroup>
        </Col>
        <Col sm={6}>
          <div id="messages" className="messages-container" ref={this.messagesContainerRef}>
            {messages.map((message, i) =>
              <div key={i} className={'message' + (message.user_from_id == currentUserId ? ' message__right' : '')}>{message.text}</div>)}
          </div>
          <div className="actions">
            <textarea value={message} onChange={this.handleUpdateTextarea} className="message-field"/>
            <Button variant="primary" onClick={this.handleSendButton} className="btn btn-default send-message-button">Send</Button>
          </div>
        </Col>
      </Row>
    )
  }
}

export default Chats

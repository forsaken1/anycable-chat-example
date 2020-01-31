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

    this.state = {
      users: [],
      messages: [],
      selectedUser: null,
      message: ''
    }
  }

  componentDidMount() {
    this.fetchUsers()
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
    fetch('/messages?user_from_id=' + userId + '&user_to_id=' + userId)
      .then(res => res.json())
      .then(res => {
        this.setState({messages: res});
      })
  }

  handleReceivedConversation = response => {
    const { messages } = this.state;
    
    this.setState({messages: [...messages, response]});
  }

  handleSendButton = event => {
    event.preventDefault();

    const { selectedUser, message } = this.state;
    const { currentUserId } = this.props;
    const data = JSON.stringify({user_from_id: currentUserId, user_to_id: selectedUser.id, text: message});

    fetch('/messages', { method: 'POST', body: data, headers: HEADERS })
      .then(_ => this.setState({message: ''}))
  }

  handleUpdateTextarea = event => {
    const message = event.currentTarget.value;
    this.setState({message});
  }

  render() {
    const { users, messages, message } = this.state
    const { currentUserId } = this.props;

    return (
      <Row className="chats-container">
        <ActionCable
          channel={{ channel: 'MessagesChannel' }}
          onReceived={this.handleReceivedConversation}
        />
        <Col sm={4}>
          <ListGroup>
            {users.map((user, i) =>
              <ListGroup.Item key={i}>{user.name}</ListGroup.Item>)}
          </ListGroup>
        </Col>
        <Col sm={8}>
          <div className="messages-container">
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

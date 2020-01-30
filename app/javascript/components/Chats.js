import React from "react"
import { ListGroup, Tab, Row, Col } from 'react-bootstrap'
import { ActionCable } from 'react-actioncable-provider';

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
      selectedUser: null
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
    const { selectedUser } = this.state;
    const { currentUser } = this.props;
    const data = JSON.stringify({user_from_id: currentUser, user_to_id: selectedUser.id, text: 'test'});

    fetch('/messages', { method: 'POST', body: data, headers: HEADERS })
  }

  render() {
    const { users, messages } = this.state

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
          <ListGroup>
            {messages.map((message, i) => <ListGroup.Item key={i}>{message.text}</ListGroup.Item>)}
          </ListGroup>
          <button onClick={this.handleSendButton}>Send</button>
        </Col>
      </Row>
    )
  }
}

export default Chats

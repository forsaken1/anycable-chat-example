import React from "react"
import { ListGroup, Tab, Row, Col } from 'react-bootstrap'

class Chats extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      users: []
    }
  }

  componentDidMount() {
    this.fetchUsers()
  }

  fetchUsers() {
    fetch('/users')
      .then(res => res.json())
      .then(res => {
        this.setState({users: res})
      })
  }

  render() {
    const { users } = this.state

    return (
      <Tab.Container defaultActiveKey="#link0">
        <Row className="chats-container">
          <Col sm={4}>
            <ListGroup>
              {users.map((user, i) =>
                <ListGroup.Item key={i} href={"#link" + i}>{user.name}</ListGroup.Item>)}
            </ListGroup>
          </Col>
          <Col sm={8}>
            <Tab.Content>
              {users.map((user, i) =>
                <Tab.Pane key={i} eventKey={"#link" + i}>
                  
                </Tab.Pane>)}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    )
  }
}

export default Chats

import React from "react"
import { Navbar } from 'react-bootstrap'
import Chats from "./Chats"
import { ActionCableProvider } from 'react-actioncable-provider'
import 'bootstrap/dist/css/bootstrap.min.css'

class Homepage extends React.Component {
  render () {
    const { currentUserId } = this.props;

    return (
      <ActionCableProvider url='ws://localhost:3334/cable'>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">Chats</Navbar.Brand>
        </Navbar>
        <Chats currentUserId={currentUserId}/>
      </ActionCableProvider>
    );
  }
}

export default Homepage

import React from "react"
import { Navbar } from 'react-bootstrap'
import Chats from "./Chats"
import 'bootstrap/dist/css/bootstrap.min.css'

class Homepage extends React.Component {
  render () {
    return (
      <>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">Chats</Navbar.Brand>
        </Navbar>
        <Chats/>
      </>
    );
  }
}

export default Homepage

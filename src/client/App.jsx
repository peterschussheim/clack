import React from 'react';
import { HashRouter as Router, Match } from 'react-router';
import io from 'socket.io-client'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      currentUser: '',
    }
  }

    componentDidMount() {
      this.socket = io('/')
      this.socket.on('message', message => {
        this.setState({ messages: [message, ...this.state.messages] })
      })
    }

    // TODO: componentWillUnmount for when clients disconnect

    handleSubmit = event => {
      const body = event.target.value
      if (event.keyCode === 13 && body) {
        const message = {
          body,
          from: this.state.currentUser
        }
        this.setState({ messages: [message, ...this.state.messages] })
        this.socket.emit('messages', body)
        event.target.value = ''
      }
    }


  render() {
    const messages = this.state.messages.map((message, idx) => {
      return <li key={idx}><b>{ message.from }: </b>{ message.body }</li>
    })

    return (
      <div>
        <h1>Clack Chat!!</h1>
        <input type="text" placeholder="Enter your message!" onKeyUp={ this.handleSubmit }/>
        { messages.reverse() }
      </div>
    )
  }
}

export default App;

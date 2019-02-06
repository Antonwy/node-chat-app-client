import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';

import AppBar from '@material-ui/core/AppBar';
import { Toolbar, Typography, Card, TextField, Button, CardActions, withStyles } from '@material-ui/core';

const socket = openSocket('https://node-chat-socket-api.herokuapp.com/');

const styles = {
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "20px auto",
    width: "90%",
    maxWidth: 700,
    flexDirection: "column"
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: "20px auto",
    width: "90%",
    maxWidth: 700,
  },
  formContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center"
  },
  nameInput: {
    display: "flex",
    alignItems: "center",
    marginTop: 10
  },
  nameSubmit: {
    margin: 20
  },
  changeNameContainer: {
    display: "flex",
    flexDirection: "column"
  },
  changeName: {
    margin: 10
  },
  nameText: {
    marginTop: 10
  },
  chatContainer: {
    width: "calc(95% - 40px)",
    marginTop: 10,
    padding: 20
  },
  messageField: {
    width: "100%",
    margin: "0 10px"
  },
  chatMessages: {
    marginTop: 10
  },
  errorMessage: {
    marginBottom: 10
  }
}

class App extends Component {

  state = {
    messageInfo: {
      name: "",
      text: ""
    },
    name: {
      value: "",
      submit: false
    },
    message: {
      value: "",
      submit: false
    },
    error: undefined,
    messages: []
  }

  componentDidMount(){
    socket.on('hello', (data) => {
      this.setState({messages: data})
    })
    socket.on('newMessage', (data) => {
      this.setState({messages: data});
    })
  }

  generateMessage = (item, i) => (
    <Typography key={i}><b>{item.from}</b>: {item.message}</Typography>
  )

  handleInputChange = (name) => (v) => {
    const newObj = {...this.state[name], value: v.target.value};
    this.setState({[name]: newObj})
  }

  handleSubmit = (name) => (e) => {
    e.preventDefault();
    const newObj = {...this.state[name], submit: true};
    this.setState({[name]: newObj, error: undefined})

    if(name === "message") this.handleSend();
  }

  handleSend = () => {
    const {name, message} = this.state;

    if(!name.submit) return this.setState({error: "Type in your name!"})

    socket.emit('createMessage', {from: name.value, message: message.value}, (m) => {
      this.setState({message: {value: "", submit: false}})
      console.log(m)
    })
  }
 
  handleChangeName = () => {
    this.setState({name: {value: "", submit: false}})
  }

  render() {
    const {classes} = this.props;
    const {name, message, error, messages} = this.state;
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">Chat App</Typography>
          </Toolbar>
        </AppBar>
        <Card className={classes.cardContainer}>
            {
              name.submit ?
              <div className={classes.changeNameContainer}>
                <Typography 
                  variant="title"
                  className={classes.nameText}
                >Your current name is: <b>{name.value}</b>      
                </Typography>
                <Button
                  variant="outlined"
                  className={classes.changeName}
                  onClick={this.handleChangeName}
                >Change name
                </Button>
              </div>
              :
              <form className={classes.nameInput} onSubmit={this.handleSubmit('name')}>
                <TextField 
                  placeholder="Name" 
                  variant="outlined" 
                  onChange={this.handleInputChange("name")}  
                />
                <Button 
                  className={classes.nameSubmit} 
                  color="primary" 
                  variant="outlined"
                  type="submit"
                  >Submit
                </Button>
              </form>
            }
            <Card className={classes.chatContainer}>
              <Typography variant="title">Chat</Typography>
              <div className={classes.chatMessages}>
                {
                  messages.map(this.generateMessage)
                }
              </div>
            </Card>
          <CardActions>
          </CardActions>
        </Card>
        <Card className={classes.messageContainer}>
          <form className={classes.formContainer} onSubmit={this.handleSubmit('message')}>
            <TextField 
              className={classes.messageField} 
              placeholder="Message" 
              variant="outlined"
              onChange={this.handleInputChange("message")}
              value={message.value}
            />
            <Button type="submit" className={classes.nameSubmit} color="primary" variant="outlined">Send</Button>
          </form>
          {error ? <Typography className={classes.errorMessage} color="error">{error}</Typography> : <div></div>}
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(App);

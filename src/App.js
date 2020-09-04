import React, { useState, useEffect } from "react"
import io from "socket.io-client"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import { TextField, Button, Container, Grid } from "@material-ui/core"

const ENDPOINT = "http://10.20.40.57:5000"

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/game" component={Game} />
          <Route path="/">
            <Home />
          </Route>
          <Route path="/art">
            <Art />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

const Home = () => {
  const [username, setUsername] = useState(
    `user${Math.floor(Math.random() * 100) + 1}`
  )
  return (
    <div>
      <Container className="main-page">
        <Grid container>
          <Grid item xs={12}>
            <img className="etb-image" src="https://energytoolbase.com/Content/images/logo-home-full.svg"></img>
          </Grid>
          <Grid item xs={12}>
            <h1>AxiGuess</h1>
          </Grid>
          <Grid item xs={12}>
            <p className="top-description">
              To play, first enter your name below, then Start Game
            </p>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Link
              className="big-button"
              to={{ pathname: "/game", state: { username: username } }}
            >
              Start Game
            </Link>
          </Grid>
          <Grid item xs={12}>
            <h3 className="works">How it works</h3>
            <p className="description">
              Using an <a href="https://axidraw.com/">Axidraw</a> machine, the <a href="https://quickdraw.withgoogle.com/">Google Quick Draw</a> data set, and a bit of knowledge we 
              have made a little game for all of you. Enter a unique username and start guessing what you see the Axidraw drawing, if you get it correct everyone will see who 
              got the answer and it will move onto the next drawing. We apologize for any and all bugs you find in the project.
            </p>
          </Grid>
        </Grid>
      </Container>
      <div className="footer-detail">
        An ETB <br /> Hackathon <br />
        project
      </div>
    </div>
  )
}

const startGame = () => {
  const Http = new XMLHttpRequest()
  const url = `http://10.20.40.57:8000/startGame`
  Http.open("POST", url)
  Http.send()
}

const Game = (props) => {
  useEffect(() => {
    //startGame()
  })
  return (
    <Container>
      <Grid container className="game-container">
        <Grid item xs={9}>
          <VideoFeed />
        </Grid>
        <Grid item xs={3}>
          <Chatbox username={props.location.state.username} />
        </Grid>
        <Grid item xs={12}>
          <div className="start-game">

          <Button
            onClick={startGame}
            className="start-game-button"
          >
            Start Game
          </Button>
          </div>
        </Grid>
      </Grid>
    </Container>
  )
}

const VideoFeed = () => {

  useEffect(() => {
    //document.getElementById('stream').contentWindow.find("img").setAttribute("style", "width: '100%';")
  })

  return (
    <div className="video-container">
      <iframe
        id="stream"
        title="embed"
        src="http://10.20.40.57:8081"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  )
}

const Chatbox = ({ username }) => {
  const [messages, setMessages] = useState([])
  const socket = io(ENDPOINT)

  useEffect(() => {
    socket.open()
    socket.emit("join", { username: username }, (error) => {
      if (error) {
        alert(error)
      }
    })
    return () => {
      socket.emit("disconnect")
      socket.off()
    }
  }, [])

  useEffect(() => {
    socket.on("message", (message) => {
      console.log(message)
      setMessages([...messages, message])
    })
  }, [])

  const submitCallback = (message) => {
    setMessages([...messages, message])
  }

  return (
    <Container>
      <MessageList messages={messages}></MessageList>
      <MessageInput
        username={username}
        messages={messages}
        setMessages={setMessages}
        socket={socket}
        submitCallback={submitCallback}
      />
    </Container>
  )
}

const MessageInput = ({
  messages,
  setMessages,
  username,
  socket,
  submitCallback,
}) => {
  const [currentInput, setCurrentInput] = useState("")

  const handleSubmit = () => {
    socket.emit(
      "sendMessage",
      { username: username, message: currentInput },
      submitCallback
    )
    setCurrentInput("")
  }
  return (
    <TextField
      placeholder={"guess"}
      onKeyPress={(e) => {
        if (e.charCode === 13) handleSubmit()
      }}
      onChange={(e) => setCurrentInput(e.target.value)}
      value={currentInput}
      InputProps={{
        endAdornment: (
          <Button type="submit" onClick={handleSubmit}>
            Send
          </Button>
        ),
      }}
    />
  )
}

const MessageList = ({ messages }) => {
  return (
    <div className="message-box">
      {messages &&
        messages.map((message) => (
          <Message
            key={Math.random()}
            username={message.username}
            message={message.message}
          />
        ))}
    </div>
  )
}

const Message = ({ username, message }) => {
  return (
    <div>
      {username}: {message}
    </div>
  )
}

const Art = () => {
  return <h1>Coming Soon</h1>
}

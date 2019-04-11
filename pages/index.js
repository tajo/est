import { Component } from "react";
import Link from "next/link";
import fetch from "isomorphic-unfetch";

class Votes extends Component {
  static async getInitialProps({ req }) {
    const response = await fetch("http://localhost:3000/votes");
    const votes = await response.json();
    return { votes };
  }

  static defaultProps = {
    votes: {
      connectedCount: 0,
      votes: []
    }
  };

  state = {
    subscribe: false,
    subscribed: false,
    voted: false,
    connectedCount: this.props.votes.connectedCount,
    votes: this.props.votes.votes
  };

  handleUserCount = count => this.setState({ connectedCount: count });
  handleVote = votes => {
    if (votes.length === 0) {
      this.setState({ voted: false });
    }
    this.setState({ votes });
  };

  vote = vote => {
    if (this.state.voted) return;
    this.props.socket.emit("votes.vote", {
      value: vote,
      id: this.props.socket.id
    });
    this.setState({ voted: true });
  };

  reset = () => this.props.socket.emit("votes.reset");

  handleKeyboard = event => {
    switch (event.keyCode) {
      case 48:
        this.vote(0.5);
        break;
      case 49:
        this.vote(1);
        break;
      case 50:
        this.vote(2);
        break;
      case 51:
        this.vote(3);
        break;
      case 53:
        this.vote(5);
        break;
      case 56:
        this.vote(8);
        break;
      case 114:
        this.reset();
        break;
    }
  };

  subscribe = () => {
    if (this.state.subscribe && !this.state.subscribed) {
      this.props.socket.on("votes.userCount", this.handleUserCount);
      this.props.socket.on("votes.vote", this.handleVote);
      this.setState({ subscribed: true });
    }
  };
  componentDidMount() {
    document.addEventListener("keypress", this.handleKeyboard);
    this.subscribe();
  }

  componentDidUpdate() {
    this.subscribe();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.socket && !state.subscribe) return { subscribe: true };
    return null;
  }

  // close socket connection
  componentWillUnmount() {
    this.props.socket.off("votes.userCount", this.handleUserCount);
    this.props.socket.off("votes.vote", this.handleVote);
  }

  render() {
    const btnStyles = { padding: "1em", margin: "0.3em", fontSize: "1.5em" };
    return (
      <main>
        <h1>
          {this.state.votes.length} / {this.state.connectedCount} voted
        </h1>
        <p>{this.state.voted ? "You have voted!" : "You have NOT voted!"}</p>
        <button
          style={btnStyles}
          onClick={() => this.vote(0.5)}
          disabled={this.state.voted}
        >
          ½
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(1)}
          disabled={this.state.voted}
        >
          1
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(2)}
          disabled={this.state.voted}
        >
          2
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(3)}
          disabled={this.state.voted}
        >
          3
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(5)}
          disabled={this.state.voted}
        >
          5
        </button>
        <button
          style={btnStyles}
          onClick={() => this.vote(8)}
          disabled={this.state.voted}
        >
          8
        </button>
        {this.state.votes.length === this.state.connectedCount && (
          <React.Fragment>
            <h1>Votes</h1>
            <div style={{ fontSize: "2em", marginBottom: "1em" }}>
              {this.state.votes.join(" - ")}
            </div>
          </React.Fragment>
        )}
        <p>
          <button onClick={this.reset}>reset votes</button>
        </p>
      </main>
    );
  }
}

export default Votes;

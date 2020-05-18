import React from "react";

class LoadOnScrollEnd extends React.Component {
  state = {
    isFetching: this.props.isFetching,
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    console.log("handle scroll");
    if (
      window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight ||
      this.state.isFetching
    ) {
      return;
    }
    this.setState({ isFetching: true });
  };

  //screen bottom reached
  render() {
    if (this.state.isFetching) {
      this.props.loadMoreResults(() =>
        console.log("useLoadOnScrollEnd: Callback called")
      );
    }

    return null;
  }
}

// export default LoadOnScrollEnd;

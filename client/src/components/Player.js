import React from "react";

/**3rd party Libraries */
import _ from "lodash";
import M from "materialize-css";
import Grid from "@material-ui/core/Grid";
import { decode } from "he";
import { Route } from "react-router-dom";
import { CircleLoader } from "react-spinners";

/**I Authored */
import Header from "./Header";
import VideoList from "./VideoList";
import VideoPlayer from "./VideoPlayer";
import { ShowError } from "./ShowError";
import axios from "axios";
import history from "../history";
import {
  THEATRE_INFO_TOAST,
  API_ERROR_TOAST,
  WELCOME_BACK,
  NOT_CONNECTED,
  DEFAULT_SEARCH,
  ONLINE,
  OFFLINE,
  NETWORK_ERROR,
  POP,
  WATCH,
} from "../helper/constants";

/**CSS */
import "../styles/Player.css";
import "materialize-css/dist/css/materialize.min.css";

export default class Player extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ONLINE: true,
      videoArray: [],
      selectedVideo: null,
      videoFeatures: {},
      channelFeatures: {},
      isFetching: false,
      nextPageToken: "",
      comments: [],
      commentsNextPageToken: "",
      isTheatre: false,
      loadMoreComments: false,
      smallWindow: false,
      noResults: false,
      errorCode: null,
      error: false,
    };
    this.searchVal = "";
    this.docHeight = 0;
    this.ERROR_API_FETCH = false;
    this.missedIntervalComments = null;
    this.commentsFetchMissed = false;
    this.featuresVideosChannelFetchError = false;

    this.nextURLParams = null;
    this.prevURLParams = null;
  }

  /******** LIFECYCLE METHODS *****************************************************************************************/

  componentDidMount() {
    const smallWindow = window.matchMedia("(max-width: 959px)").matches;
    if (smallWindow && !this.state.smallWindow) this.setState({ smallWindow });

    //show Theatre toast
    this.toastTime = setTimeout(() => {
      this.showToast(THEATRE_INFO_TOAST, 7000);
    }, 5000);

    //initialize search using URL args or default search term
    if (this.props.location.search === "") {
      history.replace({
        pathname: `${this.props.match.path}`,
        search: `q=${DEFAULT_SEARCH}`,
      });
    } else {
      const urlParams = new URLSearchParams(
        decodeURI(this.props.location.search)
      );
      if (urlParams.get("q")) {
        history.replace({
          pathname: `${this.props.match.path}`,
          search: `q=${urlParams.get("q")}`,
        });
        this.handleURLUpdates();
      }
    }

    window.addEventListener("scroll", _.throttle(this.handleScroll, 400));
    window.addEventListener("resize", _.throttle(this.handleWindowResize), 300);
    window.addEventListener("online", this.handleNetworkChanges);
    window.addEventListener("offline", this.handleNetworkChanges);
    document.addEventListener("keydown", this.toggleTheatreMode);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      history: {
        location: { search },
      },
      location,
    } = this.props;

    /**URL navigation for search update and individual video */
    if (prevProps.location.search !== location.search) {
      this.prevURLParams = new URLSearchParams(prevProps.location.search);
      this.nextURLParams = new URLSearchParams(search);

      if (history.action === POP) {
        //on browser back for individual video
        if (this.prevURLParams.get(WATCH) !== this.nextURLParams.get(WATCH)) {
          this.handleVideoSelection(
            this.props.location.state.selectedVideo,
            true
          );
        }

        if (this.prevURLParams.get("q") !== this.nextURLParams.get("q")) {
          this.handleURLUpdates(true);
        }
      } else if (this.prevURLParams.get("q") !== this.nextURLParams.get("q")) {
        this.handleURLUpdates();
      }
    }
    this.prevURLParams = null;
    this.nextURLParams = null;

    /**Comments fetch missed listener */
    if (
      this.commentsFetchMissed &&
      (prevState.isFetching !== this.state.isFetching ||
        !this.state.isFetching) &&
      this.missedIntervalComments == null
    ) {
      this.missedIntervalComments = setInterval(() => {
        this.loadMoreComments();
      }, 1000);
    } else if (
      !this.commentsFetchMissed &&
      this.missedIntervalComments != null
    ) {
      clearInterval(this.missedIntervalComments);
      this.missedIntervalComments = null;
    }
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleWindowResize);
    document.removeEventListener("online", this.handleNetworkChanges);
    document.removeEventListener("offline", this.handleNetworkChanges);
    document.removeEventListener("keydown", this.toggleTheatreMode);
    clearTimeout(this.toastTime);
    clearInterval(this.connected);
  }

  /********************************************************************************************************************/

  /**** LIFECYCLE SUPPORTING FUNCTIONS *********************************************************************************************/

  showToast = (html, displayLength) => {
    M.toast({ html, displayLength });
  };

  handleURLUpdates = (pop = false) => {
    const urlParams = new URLSearchParams(history.location.search);
    if (urlParams.get("q")) {
      this.getResults(urlParams.get("q"), pop);
    }
  };

  handleNetworkChanges = (event) => {
    switch (event.type) {
      case ONLINE:
        /**show welcome back online toast */

        this.showToast(WELCOME_BACK, 3000);
        if (!this.state.ONLINE) this.setState({ ONLINE: true });

        //refresh only if not completelt loaded
        if (this.featuresVideosChannelFetchError) {
          this.featuresVideosChannelFetchError = false;
          window.location.reload(false);
        }
        break;
      case OFFLINE:
        if (this.state.ONLINE) {
          /**show offline toast */
          this.showToast(NOT_CONNECTED, 3000);
        }
        this.setState(
          this.state.isFetching
            ? { ONLINE: false, isFetching: false }
            : { ONLINE: false }
        );
        break;
      default:
        return;
    }
  };

  handleVideoNav = () => {
    const { selectedVideo } = this.state;
    this.nextURLParams = new URLSearchParams(this.props.location.search);
    this.nextURLParams.set(WATCH, selectedVideo.id.videoId);
    const history2push = {
      pathname: history.location.pathname,
      search: this.nextURLParams.toString(),
      state: { selectedVideo },
    };
    if (this.props.location.search.includes(WATCH)) {
      history.push(history2push);
    } else {
      history.replace(history2push);
    }
    this.nextURLParams = null;
  };

  /********************************************************************************************************************/

  /**** API FETCH FUNCTIONS *********************************************************************************************/

  //fire api call to fetch results on search
  getResults = (searchVal = DEFAULT_SEARCH, pop = false) => {
    if (
      searchVal === "" ||
      this.searchVal.toLowerCase() === searchVal.toLowerCase()
    )
      return;

    this.searchVal = searchVal;
    this.setState({ isFetching: true }, () => {
      //apiCall
      axios
        .post("/api/search", {
          params: {
            q: searchVal,
            part: "snippet",
          },
        })
        .then((response) => {
          //response with no search results
          if (response.data.items && response.data.items.length < 1) {
            if (!this.state.noResults) {
              this.setState({
                noResults: true,
                isFetching: false,
                videoArray: [],
              });
            }
          } else {
            if (this.state.error || this.state.noResults) {
              this.setState({ error: false, noResults: false });
            }

            //response with results
            this.ERROR_API_FETCH = false;
            let state2Set = {
              isFetching: false,
              videoArray: response.data.items,
              nextPageToken: response.data.nextPageToken,
            };
            if (!pop)
              state2Set = {
                ...state2Set,
                selectedVideo: response.data.items[0],
              };

            this.setState(state2Set, () => {
              this.calculateNewDocHeight();
              if (!pop) this.handleVideoNav();
              if (this.state.comments.length > 0) {
                this.setState({ comments: [], commentsNextPageToken: "" }, () =>
                  this.fetchComments(response.data.items[0].id.videoId)
                );
              } else {
                this.fetchComments(response.data.items[0].id.videoId);
              }
            });

            this.scrollInView();
            this.gatherVideoFeatures(
              response.data.items.map((v) => v.id.videoId)
            );
            this.gatherChannelFeatures(
              response.data.items.map((v) => v.snippet.channelId)
            );
            document.title = response.data.items[0].snippet.title;
          }
        })
        .catch((err) => {
          this.setState({ isFetching: false });
          this.ERROR_API_FETCH = true;
          this.handleFetchError(err, "getResults");
        });
    });
  };

  //fetch comments for the current selected video
  fetchComments = async (videoId, fetchMore = false) => {
    let params = {
      part: "snippet,replies",
      videoId,
      order: "relevance",
    };

    if (fetchMore) {
      params = {
        ...params,
        pageToken: this.state.commentsNextPageToken,
      };
    }
    try {
      const response = await axios.post("/api/commentThreads", { params });

      this.ERROR_API_FETCH = false;
      const comments = response.data.items;
      this.setState({
        isFetching: false,
        comments: fetchMore ? [...this.state.comments, ...comments] : comments,
        commentsNextPageToken: response.data.nextPageToken
          ? response.data.nextPageToken
          : "",
      });
    } catch (err) {
      this.handleFetchError(err, "fetchComments");
      this.setState({ isFetching: false });
      this.ERROR_API_FETCH = true;
    }
  };

  //fetch more videos for the search term on scroll
  loadMoreResults = () => {
    axios
      .post("/api/search", {
        params: {
          q: this.searchVal,
          part: "snippet",
          pageToken: this.state.nextPageToken,
        },
      })
      .then((response) => {
        this.ERROR_API_FETCH = false;
        this.gatherVideoFeatures(response.data.items.map((v) => v.id.videoId));
        this.gatherChannelFeatures(
          response.data.items.map((v) => v.snippet.channelId)
        );
        this.setState(
          {
            videoArray: [...this.state.videoArray, ...response.data.items],
            nextPageToken: response.data.nextPageToken,
            isFetching: false,
          },
          () => this.calculateNewDocHeight()
        );
      })
      .catch((err) => {
        this.handleFetchError(err, "loadMoreResults");
        this.setState({ isFetching: false });
        this.ERROR_API_FETCH = true;
      });
  };

  gatherVideoFeatures = async (vidArray) => {
    const csVidsIDs = vidArray.join(",");
    const params = {
      part: "snippet,statistics,contentDetails",
      id: csVidsIDs,
    };
    try {
      const response = await axios.post("/api/videos", { params });
      this.ERROR_API_FETCH = false;
      const vFeatures = _.mapKeys(response.data.items, "id");

      this.setState({
        videoFeatures: { ...this.state.videoFeatures, ...vFeatures },
      });
    } catch (err) {
      this.handleFetchError(err, "gatherVideoFeatures");
      if (
        NETWORK_ERROR.includes(err.message) &&
        !this.featuresVideosChannelFetchError
      ) {
        this.featuresVideosChannelFetchError = true;
      }
      this.ERROR_API_FETCH = true;
    }
  };

  gatherChannelFeatures = async (channelArray) => {
    const csChannelIDs = channelArray.join(",");
    const params = {
      part: "snippet,statistics",
      id: csChannelIDs,
    };
    try {
      const response = await axios.post("/api/channels", { params });
      this.ERROR_API_FETCH = false;
      const cFeatures = _.mapKeys(response.data.items, "id");

      this.setState({
        channelFeatures: { ...this.state.channelFeatures, ...cFeatures },
      });
    } catch (err) {
      this.handleFetchError(err, "gatherChannelFeatures");
      if (
        NETWORK_ERROR.includes(err.message) &&
        !this.featuresVideosChannelFetchError
      ) {
        this.featuresVideosChannelFetchError = true;
      }
      this.ERROR_API_FETCH = true;
    }
  };

  /*****************************************************************************************************************/

  /********* HELPER FUNCTIONS *****************************************************************************************/

  handleFetchError = (
    err = { response: "defaultErrorResponse" },
    methodName = ""
  ) => {
    if (err.response) {
      console.log(
        `error from YoutubeApp:${methodName}:Code:${err.response.data.statusCode} \n Message:${err.response.data.message}`
      );

      if (methodName.includes("getResults")) {
        if (!this.state.error) {
          this.errorResponse = err.response.data;
          this.setState({ error: true, errorCode: err.response.status });
        }
      } else {
        this.handleSubErrors(methodName, err);
      }
    } else {
      console.log(`${methodName}: Error:`, err);
      this.handleSubErrors(methodName, err);
    }
  };

  handleSubErrors = (methodName, error) => {
    const feature = methodName.includes("Results")
      ? "loading more results"
      : methodName.includes("Comments")
      ? "fetching comments"
      : methodName.includes("Video")
      ? "gathering video features"
      : methodName.includes("Channel")
      ? "gathering channel features"
      : "";

    this.showToast(API_ERROR_TOAST.replace("{0}", feature), 5000);
  };

  toggleTheatreMode = (event) => {
    const input =
      event.target.id === "searchBar" || event.srcElement.id === "searchhBar"
        ? true
        : false;
    if (event.which === 84 && !input) {
      //letter t hit
      if (!window.matchMedia("(max-width: 600px)").matches) {
        this.setState({ isTheatre: !this.state.isTheatre }, () =>
          this.calculateNewDocHeight()
        );
      }
    }
  };

  handleWindowResize = (event) => {
    const smallWindow = event
      ? event.currentTarget.matchMedia("(max-width: 959px)").matches
      : false;
    //XOR
    if (smallWindow ? !this.state.smallWindow : this.state.smallWindow) {
      this.setState({ smallWindow }, () => this.calculateNewDocHeight());
    }

    if (this.state.isTheatre) {
      const toggleTheatreOut = event
        ? event.currentTarget.matchMedia("(max-width: 600px)").matches
        : false;
      if (toggleTheatreOut) this.setState({ isTheatre: !toggleTheatreOut });
    }
  };

  calculateNewDocHeight = () => {
    const loadMoreComments = this.state.smallWindow || this.state.isTheatre;
    if (
      loadMoreComments
        ? !this.state.loadMoreComments
        : this.state.loadMoreComments
    ) {
      this.setState({ loadMoreComments });
    }

    //calculating document height
    if (this.state.videoArray.length > 0) {
      const body = document.body;
      this.docHeight = body.scrollHeight - 800;
    }
  };

  handleScroll = () => {
    if (window.innerHeight + Math.ceil(window.pageYOffset) >= this.docHeight) {
      if (this.state.videoArray.length > 0) {
        if (this.safeTofetch()) {
          this.setState({ isFetching: true }, () => this.loadMoreResults());
        }
      }
    }
  };

  loadMoreComments = () => {
    if (this.safeTofetch()) {
      if (this.commentsFetchMissed) this.commentsFetchMissed = false;
      if (this.state.commentsNextPageToken !== "") {
        this.setState({ isFetching: true }, () =>
          this.fetchComments(this.state.selectedVideo.id.videoId, true)
        );
      }
    } else {
      if (!this.commentsFetchMissed) this.commentsFetchMissed = true;
    }
  };

  safeTofetch = () => {
    let safeTofetch = true;
    if (this.state.ONLINE) {
      this.ERROR_API_FETCH = false;
    } else {
      return false;
    }
    if (this.state.isFetching || this.ERROR_API_FETCH) {
      safeTofetch = false;
    }
    return safeTofetch;
  };

  handleVideoSelection = (video, pop = false) => {
    this.setState(
      { selectedVideo: video, comments: [], commentsNextPageToken: "" },
      () => {
        this.fetchComments(video.id.videoId);
        if (!pop) this.handleVideoNav();
        this.scrollInView();
      }
    );
    document.title = decode(video.snippet.title);
  };

  scrollInView = () => {
    if (window.pageYOffset && window.pageYOffset > 0) {
      window.scroll(0, 0);
    }
  };

  renderPlayer = ({ match: { url } }) => {
    return (
      <>
        <Route
          path={`${url}`}
          render={(props) => this.renderVideoFragment(props)}
        />
        <Grid
          item
          xs={12}
          sm={12}
          md={this.state.isTheatre ? 12 : 5}
          lg={this.state.isTheatre ? 12 : 4}
          // className="topLevelTransition"
        >
          <VideoList
            videos={this.state.videoArray}
            handleVideoSelection={this.handleVideoSelection}
            vFeatures={this.state.videoFeatures}
          />
        </Grid>
      </>
    );
  };

  renderVideoFragment = ({ location: { state } }) => {
    return (
      <Grid
        item
        xs={12}
        sm={12}
        md={this.state.isTheatre ? 12 : 7}
        lg={this.state.isTheatre ? 12 : 8}
        // className="topLevelTransition"
      >
        {state ? (
          <VideoPlayer
            online={this.state.ONLINE}
            smallWindow={this.state.smallWindow}
            isTheatre={this.state.isTheatre}
            video={this.state.selectedVideo}
            comments={this.state.comments}
            showLoadMoreComments={this.state.loadMoreComments}
            vFeatures={
              this.state.videoFeatures
                ? this.state.videoFeatures[this.state.selectedVideo.id.videoId]
                : {}
            }
            cFeatures={
              this.state.channelFeatures
                ? this.state.channelFeatures[
                    this.state.selectedVideo.snippet.channelId
                  ]
                : {}
            }
            loadMoreComments={this.loadMoreComments}
            lastCommentsPage={
              this.state.commentsNextPageToken === "" ||
              this.state.commentsNextPageToken === null
                ? true
                : false
            }
          />
        ) : (
          <div className="circularLoader">
            <CircleLoader size={300} color={"#26A69A"} loading={state} />
          </div>
        )}
      </Grid>
    );
  };

  /*****************************************************************************************************************/
  // static whyDidYouRender = true;
  render() {
    return (
      <Grid
        container
        spacing={0}
        justify="space-between"
        style={{ minWidth: "440px" }}
      >
        <Grid
          item
          xs={12}
          className="head"
          style={
            this.state.ONLINE
              ? {}
              : { backgroundColor: "rgba(255,0,0,0.9)", pointerEvents: "none" }
          }
        >
          <Header
            isTheatre={this.state.isTheatre}
            online={this.state.ONLINE}
            showProgressBar={this.state.isFetching}
          />
        </Grid>
        {this.state.videoArray.length >= 1 ? (
          <Route
            exact
            path={`${this.props.match.path}`}
            render={(props) => this.renderPlayer(props)}
          />
        ) : this.state.error || this.state.noResults ? (
          <Grid item xs={12} style={{ margin: "10%" }}>
            <ShowError
              noResults={this.state.noResults}
              searchValue={this.searchVal}
              error={this.state.error}
              errorCode={this.state.errorCode}
              errorResponse={this.errorResponse}
            />
          </Grid>
        ) : null}
      </Grid>
    );
  }
}

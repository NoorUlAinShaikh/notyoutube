import React from "react";

/**3rd Party Libraries*************/
import _ from "lodash";
import axios from "axios";

/** I Authored******************** */
import { SEARCH, FOCUS, BLUR, SOMETHING_WRONG } from "../helper/constants";
import history from "../history";
import "../styles/SearchBar.css";

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchVal: "",
      instantSearch: [],
      showSuggestions: false,
    };
    this.suggestions = [];
    this.searchInput = React.createRef(null);
  }

  /**API Call********************************************************************/

  getSearchSuggestions = (currentSearchVal) => {
    axios
      .post("/api/getSearchSuggestions", { currentSearchVal })
      .then(({ data }) => {
        if (data.length > 0 && data[1].length > 0) {
          this.suggestions = data[1].map((result) => result[0]);
          if (this.suggestions.length > 0) {
            this.setState({ instantSearch: [...this.suggestions] });
          }
        }
      })
      .catch((err) => {
        this.setState({ instantSearch: [SOMETHING_WRONG] });
        if (err.response) {
          console.log(
            `error from SearchBar:handleOnSearchChange:Code:${err.response.data.statusCode} \n Message:${err.response.data.message}`
          );
        } else {
          console.log(`SearchBar:handleOnSearchChange: Error:`, err);
        }
      });
  };

  /******************************************************************************/

  /**Helper functions********************************************************** */

  fireSearch = (searchValue) => {
    if (searchValue.length > 0) {
      history.push({
        pathname: history.location.pathname,
        search: `q=${searchValue}`,
      });
    }
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    if (this.searchInput) {
      this.searchInput.current.blur();
    }
    this.fireSearch(this.state.searchVal.trim());
  };

  handleOnChange = (event) => {
    const searchVal = event.target.value;
    if (searchVal.length < 1) {
      this.setState({ instantSearch: [] });
    }
    this.setState({ searchVal }, () =>
      this.handleOnSearchChange(this.state.searchVal)
    );
  };

  handleOnSearchChange = _.debounce((currentSearchVal) => {
    if (currentSearchVal !== "") {
      this.getSearchSuggestions(currentSearchVal);
    }
  }, 200);

  handleSuggestionClick = (event) => {
    if (event.target.innerText !== "") {
      const searchVal = event.target.innerText.trim();
      this.setState({ searchVal }, () => this.fireSearch(this.state.searchVal));
    }
  };

  handleInputFocus = ({ type }) => {
    if (FOCUS.includes(type)) {
      this.setState({ showSuggestions: true });
    } else if (BLUR.includes(type)) {
      this.setState({ showSuggestions: false });
    }
  };

  /*********************************************************************************** */

  render() {
    return (
      <>
        <div className="inputRow">
          <form onSubmit={(e) => this.handleFormSubmit(e)}>
            <div className="input-field" style={{ marginBottom: "2px" }}>
              <i
                className="searchIcon material-icons prefix"
                style={{ paddingTop: "3px" }}
              >
                search
              </i>
              <label
                style={{ fontSize: "1.2rem", paddingTop: "3px" }}
                htmlFor="searchBar"
              >
                {SEARCH}
              </label>
              <input
                ref={this.searchInput}
                style={{ color: "white", marginBottom: "0px" }}
                id="searchBar"
                type="text"
                value={this.state.searchVal}
                onChange={this.handleOnChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputFocus}
              />
            </div>
          </form>
        </div>
        <div className="suggestionsRow">
          {this.state.instantSearch.length > 0 ? (
            <ul
              className={`instantSearchList${
                this.state.showSuggestions ? "" : " hide"
              }`}
            >
              {this.state.instantSearch.map((suggestion, index) => (
                <li key={index} onMouseDown={this.handleSuggestionClick}>
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </>
    );
  }
}

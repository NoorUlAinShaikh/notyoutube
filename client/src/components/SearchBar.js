import React from "react";

/**3rd Party Libraries*************/
import _ from "lodash";
import axios from "axios";
import M from "materialize-css";

/** I Authored******************** */
import {
  SEARCH,
  BLUR,
  NO_RESULTS_FOUND,
  SOMETHING_WRONG,
  BAD_REQUEST_SEARCH,
} from "../helper/constants";
import history from "../history";
import "../styles/SearchBar.css";

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchVal: "",
      instantSearch: {},
      showError: false,
    };
    this.searchInput = React.createRef(null);
    this.errLiterals = [NO_RESULTS_FOUND, BAD_REQUEST_SEARCH, SOMETHING_WRONG];
  }

  componentDidMount() {
    if (!this.autocomplete && this.searchInput) {
      this.autocomplete = M.Autocomplete.init(this.searchInput.current, {
        minLength: 0,
        limit: 14,
        onAutocomplete: this.handleSuggestionClick,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.instantSearch !== this.state.instantSearch) {
      if (
        Object.keys(this.state.instantSearch).length === 1 &&
        this.errLiterals.some((i) => i in this.state.instantSearch)
      ) {
        this.setState({ showError: true });
      } else {
        if (this.state.showError) this.setState({ showError: false });
        this.autocomplete.updateData(this.state.instantSearch);
      }
    }
  }

  componentWillUnmount() {
    this.autocomplete.destroy();
  }

  /**API Call********************************************************************/

  getSearchSuggestions = (currentSearchVal) => {
    axios
      .post("/api/getSearchSuggestions", { currentSearchVal })
      .then(({ data }) => {
        if (data.length > 0 && data[1].length > 0) {
          let suggestions = Object.assign(
            {},
            ...data[1].map((result) => {
              return {
                [result[0]]: null,
              };
            })
          );

          if (suggestions) {
            this.setState({ instantSearch: { ...suggestions } });
          }
          suggestions = null;
        } else {
          this.setState({ instantSearch: { [NO_RESULTS_FOUND]: null } });
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(
            `error from SearchBar:handleOnSearchChange:Code:${err.response.data.statusCode} \n Message:${err.response.data.message}`
          );
          if (err.response.data.statusCode === 400) {
            this.setState({ instantSearch: { [BAD_REQUEST_SEARCH]: null } });
          } else {
            this.setState({ instantSearch: { [SOMETHING_WRONG]: null } });
          }
        } else {
          this.setState({ instantSearch: { [SOMETHING_WRONG]: null } });
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
      this.setState({ instantSearch: {}, showError: false });
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

  handleSuggestionClick = (suggestion) => {
    if (this.state.searchVal !== suggestion) {
      this.setState({ searchVal: suggestion }, () =>
        this.fireSearch(this.state.searchVal.trim())
      );
    } else {
      this.fireSearch(this.state.searchVal.trim());
    }
  };

  handleInputFocus = ({ type }) => {
    if (BLUR.includes(type)) {
      if (this.state.showError) this.setState({ showError: false });
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
                className="autocomplete"
                style={{ color: "white", marginBottom: "0px" }}
                id="searchBar"
                type="text"
                value={this.state.searchVal}
                onChange={this.handleOnChange}
                onBlur={this.handleInputFocus}
              />
            </div>
          </form>
        </div>
        <div className="suggestionsRow">
          {this.state.showError ? (
            <ul className="instantSearchList" style={{ color: "#fff" }}>
              <li style={{ padding: "0 1rem" }}>
                {Object.keys(this.state.instantSearch)[0]}
              </li>
            </ul>
          ) : null}
        </div>
      </>
    );
  }
}

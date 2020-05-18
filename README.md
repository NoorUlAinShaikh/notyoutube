Exploring the youtube developers api to make an imitation of youtube using react for my portfolio.

##### All rights reserved

# !Youtube

Access the site here: [!Youtube](https://notyoutube-007.herokuapp.com//)

Your guess to what the application does is correct. Data is served by Youtube data API v3.
Only embeddable videos along with their relevant information are fetched.
It is a read-only application at the moment.


# Disclaimer

```
This was supposed to be a pure React application, just a frontend. 
But to bypass CORS problem for querying the instant search endpoint, I had to put in place a server. 
Thus utilized the opportunity to mask the API key within the server.

I wanted to see how far I could go without a state management library and have kept it that way by 
implementing a way around the usual routing architecture.
```

```
Note: If you face a 'Daily Limit Exceeded error'. Hit me up. I'll update the API key.
```

# Features

- User is notified about network changes.
- React router v5 for client side navigation.
- Instant Seach suggestion.
- Home brewed Infinite Scroll for pagination.
- Independant trigger for comment section pagination.
- Support for multiple screen sizes. (Resize the window or Open in a mobile device).

# Upcoming Features

- Architecture redesign w.r.t Redux.
- Support for Authentication and Data updation.


# Tech Stack

- FrontEnd: ReactJS
- BackEnd: ExpressJS
- CSS: SemanticUI, Materialize CSS, MaterialUI and some old school handwritten bit
- Hosted: Heroku

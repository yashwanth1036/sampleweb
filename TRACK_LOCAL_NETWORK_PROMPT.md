Make this website reachable by the Track automation running on my local network. It currently opens at `http://127.0.0.1:8000/login`, but Track’s Playwright browser gets a 404 there.

Please inspect how this project is started and configure its development server to listen on `0.0.0.0` at port `8000`, while keeping the login route at `/login`. Don’t change the login form’s selectors: email `#email`, password `#password`, and submit button `#submit-button`.

Tell me how to restart the site and how to find the computer’s private IPv4 address, so I can try `http://<private-ip>:8000/login` from Track. Do not expose credentials or commit any secrets.

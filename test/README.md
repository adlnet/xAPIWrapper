# Testing xAPI-Util

Tests the functionality of /src/xapi-util.js. The test can be run in both a browser or in node.

For both/either:

* Clone the repository to your machine
    ```
    .../workspace
    $ git clone https://github.com/adlnet/xAPIWrapper.git
    ```

## Browser

From a browser:

* Use the terminal to start a server in the xAPIWrapper folder
    ```
    .../xAPIWrapper
    $ http-server
    Starting up http-server, serving ./
    Available on:
      http:172.16.0.111:8080
      http:127.0.0.1:8080
    Hit CTRL-C to stop the server

    ```
* With the browser navigate to /test/testUtil.html
    `http://localhost:8080/test/testUtil.html`
* The tests will automatically run displaying the results: passes, failures, duration, percentage. Below the test results, code coverage results are displayed.

## Node

* In the terminal navigate to the xAPIWrapper folder
* Use the commands
    ```
    .../xAPIWrapper
    $npm install should
    ...and...
    $ mocha test/tests/test.util.js

    ```
* The tests will run displaying the information in the terminal including results: passing, failing, milliseconds to complete, and a stack trace of any failing tests.

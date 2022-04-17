# cs5412-project
CS5412 Cloud Computing Project

## Requirements
- [`nvm`](https://github.com/nvm-sh/nvm)
- [`direnv`](https://github.com/direnv/direnv)
Azure Functions requires node version 14. One way you can acheive that is by using [`nvm`](https://github.com/nvm-sh/nvm), a tool for managing node versions. To run it locally, this project uses [`direnv`](https://github.com/direnv/direnv) to load private keys.


## How to run
Download the `Secrets` directory from the slack with the private keys for the DB and at the root of the project directory (in `cs5412-project`).

Then run Azure Functions by `cd`ing into the directory.

Set the node version using `nvm`

``` sh
nvm install 14
nvm use 14
```

Add needed dependencies with
``` sh
npm install
```

Then run the Azure Functions locally in terminal with:
``` sh
npm start
```

Then it should be running locally on your machine! You can send http requests however, but the script `test-script` (which uses [`httpie`](https://httpie.io/cli)) has some commands to make testing faster.

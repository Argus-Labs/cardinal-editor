# Cardinal Editor
Cardinal Editor is a visual interface for inspecting and interacting with Cardinal on your [World engine](github.com/Argus-Labs/world-engine) projects.

![Screenshot from 2024-03-22 15-14-34](https://github.com/Argus-Labs/cardinal-editor/assets/51780559/92c6fcd0-a6d0-4580-9463-681166c3ae08)

## Getting Started
### Install World CLI
Cardinal editor is managed by [World CLI](https://github.com/Argus-Labs/world-cli), which is the reccomended way to create, manage, and deploy World Engine projects. To install the latest version of World CLI on your system, run the following command:
```shell
curl https://install.world.dev/cli! | bash
```
Note: World CLI depends on Docker. Check out the [installation guide](https://docs.docker.com/get-docker/) if Docker is not already installed in your system.

### Run Cardinal Editor
Cardinal editor will automatically start at `http://localhost:3000` when you run Cardinal in development mode.
```shell
world cardinal dev
```

By default Cardinal Editor will only start in development mode. If you want to start it in production, run this command:
```shell
world cardinal start --editor
```

## Development
### Prerequisites
* Node.js (version: >=18.x)
* Pnpm (reccomended)
* Docker
* World CLI

### Local Development
To setup local development, you'll need to start both the Cardinal Editor and a World Engine project.

#### Setup Cardinal Editor
```shell
# clone the github repo
git clone https://github.com/Argus-Labs/cardinal-editor

# go to the project folder
cd cardinal-editor

# install dependencies
pnpm i

# run the development server
pnpm dev
```

#### Setup a World Engine project 
```shell
# create a new world engine project
world create my-game

# go to the project folder
cd my-game

# start cardinal in dev mode without cardinal editor
world cardinal dev --no-editor
```

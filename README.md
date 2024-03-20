# Cardinal Editor
Cardinal Editor is a visual interface for inspecting and interacting with cardinal on your [World engine](github.com/Argus-Labs/world-engine) projects.

[TODO: insert screenshot here]

## Installation
[TODO: installation instructions when confirmed here]

## Development
### Prerequisites
* Node.js (version: >=18.x)
* Pnpm (reccomended)
* Docker
* World CLI (see [installation instructions](https://github.com/Argus-Labs/world-cli?tab=readme-ov-file#installation))

### Local Development
To setup local development, you'll need to start both the Cardinal Editor as well as a World Engine project.

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

# start cardinal in dev mode
world cardinal dev
```

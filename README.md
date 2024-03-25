# Cardinal Editor
Cardinal Editor provides a visual interface for inspecting and interacting with Cardinal within your [World engine](github.com/Argus-Labs/world-engine) projects.

![Screenshot from 2024-03-22 15-14-34](https://github.com/Argus-Labs/cardinal-editor/assets/51780559/92c6fcd0-a6d0-4580-9463-681166c3ae08)

## Getting Started
### Install World CLI
Cardinal Editor is managed by [World CLI](https://github.com/Argus-Labs/world-cli), which is the recommended way to create, manage, and deploy World Engine projects. To install the latest version of World CLI on your system, run the following command:

```shell
curl https://install.world.dev/cli! | bash
```

Note: World CLI depends on Docker. Check out the [installation guide](https://docs.docker.com/get-docker/) if Docker isn't installed in your system.

### Run Cardinal Editor
Cardinal Editor automatically launches at `http://localhost:3000` while running Cardinal in development mode.

```shell
world cardinal dev
```

By default, Cardinal Editor will only start in development mode. If you want to start it in production, run this command:

```shell
world cardinal start --editor
```

## Development
### Prerequisites
* Node.js (version: >=18.x)
* Pnpm (recommended)
* Docker
* World CLI

### Local Development
To set up local development, you'll need to start both the Cardinal Editor and a World Engine project.

#### Set Up Cardinal Editor

```shell
# Clone the GitHub repo
git clone https://github.com/Argus-Labs/cardinal-editor

# Go to the project folder
cd cardinal-editor

# Install dependencies
pnpm i

# Run the development server
pnpm dev
```

#### Set Up a World Engine project 

```shell
# Create a new World Engine project
world create my-game

# Go to the project folder
cd my-game

# Start Cardinal in dev mode without the Cardinal Editor
world cardinal dev --no-editor
```

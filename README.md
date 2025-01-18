# YouTube Spot Saver

<img width="192" height="192" src="https://lh3.googleusercontent.com/zp90OrfRiblGvEt_f9MfydNRVrOY-v-NyrAPjAyenQVN6366dkkA4cC5is2OAabCJw4bgRT7wEbNm9LPEightTe8xQ=s128-rw">

YouTube Spot Saver is a Chrome Extension that saves your spot in a YouTube video when you exit the tab, so you can return to the same spot later. It stores the video timestamp in the browser's local storage and automatically redirects you to the saved timestamp when you revisit the video.

## Features

### v1.1
- Cleans up storage every time `www.youtube.com/*` is loaded.
- Switched to editing video player's current time instead of redirecting.

### v1.0
- Automatically saves the current timestamp of a YouTube video when you close or refresh the tab.
- Redirects you to the saved timestamp when you revisit the video.
- Cleans up expired timestamps from local storage (older than 24 hours).

## Future Features

- [ ] Allow users to set the amount of time the spot in the video is saved for
- [ ] Figure out if a work around is needed for preventing ads current time being changed instead of the YouTube videos.

## Installation

### Chrome Store
1. Download from the Chrome Store [here](https://chromewebstore.google.com/detail/youtube-spot-saver/lodlknnffpkkekcpciclpnfghnhmmpmk)

### Manual
1. Clone the repository to your local machine.
2. Open your browser and navigate to the extensions page (e.g., `chrome://extensions` for Chrome).
3. Enable "Developer mode" if it is not already enabled.
4. Click on "Load unpacked" and select the directory where you cloned the repository.

### Node.js Setup
1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Verify the installation by running:
    ```bash
    node -v
    npm -v
    ```
3. Navigate to the cloned repository directory:
    ```bash
    cd youtube-spot-saver
    ```
4. Install the project dependencies:
    ```bash
    npm install
    ```

### Running Tests
```bash
npx jest
```

## Usage

1. Open a YouTube video.
2. Watch the video and close or refresh the tab at any point.
3. When you revisit the video, the extension will automatically redirect you to where you left off.

## Contributing

Contributions are welcome! Here are some ways you can contribute:

1. **Report Bugs**: If you find any bugs, please report them by opening an issue on the GitHub repository.
2. **Feature Requests**: If you have any ideas for new features, feel free to open an issue to discuss them.
3. **Pull Requests**: If you want to contribute code, you can fork the repository, make your changes, and submit a pull request.

### Development Setup

1. Clone the repository
    ```bash
    git clone https://github.com/apknusel/YouTube-Spot-Saver.git
    cd youtube-spot-saver
    ```

2. Open the project in your favorite code editor (e.g., Visual Studio Code).

3. Make your changes and test them locally by loading the unpacked extension in your browser.

### Code Structure

- [contentScript.js](contentScript.js): Contains the main logic for saving and retrieving video timestamps. Contains logic for clearing up storage after 24 hours.
- [manifest.json](manifest.json): The manifest file that defines the extension's metadata and permissions.
- [assets](assets): Contains the extension's icons.
- [tests](tests): Contains the tests for the code.

## License

This project is licensed under the [GPL-3.0 license](LICENSE). See the LICENSE file for details.

## Contact

If you have any questions or need further assistance, feel free to contact the project maintainer at [apknusel@yahoo.com](mailto:apknusel@yahoo.com?subject=YouTube%20Spot%20Saver).

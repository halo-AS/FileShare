# FileShare

A lightweight, account-free file-sharing website that transfers files between two paired devices using WebRTC.

**ITWS-1100 Term Project | Fall 2025**  
**Team 6:** Ben Kudarauksas, Alex Santos, and Khloe Sakai

## Overview

FileShare lets users pair two devices with a one-time, four-digit code and transfer files directly between their browsers. File contents travel through a peer-to-peer connection rather than being stored on the application's server. The backend temporarily stores the connection metadata needed to pair the devices.

Inspired by Apple's AirDrop, the project explores a browser-based approach to sharing files between Apple and non-Apple devices. Our goal was to make personal file transfers more convenient than emailing files to yourself, uploading them to cloud storage, or sending them through a messaging service.

## Features

- **No account required:** Users can share files without registering or signing in.
- **Code-based pairing:** A one-time, four-digit code connects the sending and receiving devices.
- **Peer-to-peer transfers:** WebRTC data channels carry file contents between browsers.
- **No server-side file storage:** The backend handles connection metadata rather than the files themselves.
- **Simple interface:** A minimal layout guides users through pairing, sending, and downloading files.

## Using FileShare

1. Open the FileShare website on both devices.
2. On the sending device, select the file to transfer and obtain the pairing code.
3. Enter that code on the receiving device to pair the browsers.
4. Once the connection is established and the transfer finishes, use the generated download link on the receiving device to save the file.

## How It Works

1. **Gather connection information.** The sending browser uses WebRTC and Google's STUN server to discover possible connection addresses, known as [ICE candidates](https://webrtc.org/getting-started/peer-connections#ice-candidates).
2. **Create a pairing session.** The browser sends its connection information to the PHP backend, which returns a one-time, four-digit pairing code.
3. **Exchange connection metadata.** The receiving device enters the code, retrieves the sender's connection information, and sends back its own. The sender retrieves this response through the backend.
4. **Establish the connection.** WebRTC uses the exchanged information to establish a peer-to-peer connection between the browsers.
5. **Transmit the file.** The sending browser reads the selected file into an `ArrayBuffer`, represents its contents as a `Uint8Array`, and sends the bytes through the WebRTC data channel.
6. **Reconstruct and download.** The receiving browser reconstructs the file and generates a download link for the user.

The PHP API coordinates pairing and connection setup. The file contents travel through the WebRTC connection; they are not uploaded to the PHP server for storage.

## Architecture

The project separates the user interface, styling, connection logic, backend endpoints, and static assets. This allows changes to the interface or backend without combining their responsibilities in a single file.

| Component | Responsibility |
| --- | --- |
| HTML | Main page structure and controls for selecting files and entering pairing codes. |
| CSS | Page layout, colors, popup styling, and other visual elements. |
| JavaScript | Browser interactions, WebRTC connection setup, and file transmission and reconstruction. |
| PHP | Pairing sessions and the exchange of WebRTC connection metadata. |
| WebRTC | Peer-to-peer communication and file transfer through a data channel. |
| STUN | Helps browsers discover connection candidates. |
| JSON session storage | Temporarily holds the metadata used during pairing and connection setup. |

### Project Files

| Location or file | Purpose |
| --- | --- |
| API folder | PHP endpoints for pairing and connection negotiation. |
| `create_key.php` | Generates the one-time pairing code. |
| `get_offer.php` | Returns the sender's WebRTC connection offer. |
| `post_answer.php` | Receives the second device's connection response. |
| `get_answer.php` | Returns the second device's response to the sender. |
| `sessions.json` | Temporary storage for connection metadata. |
| Scripts folder / `fileshare.js` | Implements WebRTC connection setup and the sending and receiving of file data. |
| Styles folder / `style.css` | Defines the interface layout and visual styling. |
| Images folder | Contains the icons and graphics used throughout the website. |
| `index.html` | Main page for selecting files and entering pairing codes. |
| `README.md` | Project overview, usage, architecture, and development background. |
| `.gitignore` | Excludes generated session data from version control. |

## Background and Design Decisions

### From Temporary Storage to Peer-to-Peer Transfer

Our initial proposal considered uploading files to a server, allowing a single download, and then deleting them. During research, we chose WebRTC so that file contents could travel directly between devices instead. The final design retains temporary connection metadata on the backend, rather than storing the files there.

This approach supports the project's original goal: sharing files without creating an account or placing a persistent copy in a cloud-storage or messaging account.

### Pairing Codes and a Minimal Interface

We chose a short pairing code so users would not need to type a long download URL or use another service to send a link between devices. We also aimed to keep the interface focused on the transfer process, balancing helpful instructions with a simple layout.

Initial planning included Balsamiq wireframes, research into existing file-sharing tools, and an outline of the user journey. These steps helped us define the core functionality before building the interface and backend.

### Course Focus

Within the ITWS-1100 course framework, our proposal identified **Area 5** as the primary focus and **Area 1** as the secondary focus. The final implementation centered on file transfer and temporary connection data, supported by a clean UI/UX that reduced the steps between selecting and receiving a file.

## Development Timeline

| Period | Activities and milestones |
| --- | --- |
| **October 1-6, 2025** | Finalize the idea and scope, research existing file-sharing tools, and submit the proposal by October 6. |
| **October 7-31, 2025** | Research WebRTC, STUN, and peer-to-peer communication; experiment with PHP endpoints and ICE exchange; outline the user journey and project structure. |
| **November 3-20, 2025** | Build the pairing and connection-negotiation endpoints; test STUN communication and ICE exchange; begin the JavaScript transfer logic and core HTML layout. |
| **December 1-7, 2025** | Polish the interface and CSS, debug dynamic text and popups, test transfers across devices and file sizes, and prepare documentation. Target project completion by December 7. |
| **December 8-11, 2025** | Prepare slides, rehearse the live demonstration, and present the completed project on December 11. |

## Challenges and Lessons Learned

### Choosing a Transfer Method

One early challenge was deciding how to move files between devices. We initially considered temporary server storage, but research into browser-based file sharing led us to WebRTC. Learning how to exchange connection offers, answers, and ICE candidates was a central part of implementing this approach.

### Balancing Instructions and Simplicity

We debated how much explanation to include in the interface. Detailed instructions could clarify the process but also introduce clutter. We chose a minimal design that kept the main actions prominent and focused the interface on pairing and transferring files.

### Implementing Unfamiliar Interface Behavior

Popup styling, dynamically changing input text, and conflicting CSS rules required techniques we had not used before. We used documentation and AI-assisted explanations to understand both how a solution worked and why it addressed the problem. This helped us debug the interface and implement unfamiliar features.

## Project Outcome

The completed project demonstrated file transfers between paired devices without server-side file storage. Our team combined WebRTC communication, PHP signaling endpoints, and a minimal interface into a working application and presented it in class. The project gave us practical experience with peer-to-peer connections, frontend and backend integration, and collaborative web development.

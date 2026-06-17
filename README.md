# Werewolf Moderator Website
Hi! I'm happy to introduce you to the Werewolf Moderator Website!

This website is designed to help moderators manage their games more efficiently. It provides a user-friendly interface for creating a set of roles for an amount of players and creating and managing a game of werewolf. 

Since I've been building this website independently, I cannot guarantee that I will finish and deliver it on time. However, I am working hard to make sure that it is as good as possible. If you have any suggestions or feedback, please let me know!

Tech Stack:

1. FE
- ReactJS
- Vite
- TailwindCSS
2. BE
- Pocketbase

How to Run:
- Git clone this project
- Run 2 processes: `npm run dev` and `cd pocketbase; ./pocketbase serve`
- Open your browser and navigate to http://localhost:5173

## Features
- Deck builder — create role sets for any player count
- Host/join games via room codes
- Real-time player lobby with connectivity status
- In-progress game management (moderator tools):
  - Night phase: assign holder + target per role
  - Day phase: discussion timer
  - Voting phase: 5-minute countdown, record votes
  - Phase advancement: night → day → voting → next night
- Player elimination tracking
- PocketBase backend with custom API endpoints

# Telegram Wishlist Mini App

A Telegram Mini App that allows users to create and manage a wishlist.

## Features

- Create and manage wishlist items
- Set priority levels (low, medium, high)
- Add URL links to items
- Delete unwanted items
- Responsive design that adapts to Telegram themes

## Tech Stack

- React
- TypeScript
- Vite
- Telegram Mini App SDK

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone this repository
```
git clone https://github.com/yourusername/telegram-wishlist-app.git
cd telegram-wishlist-app
```

2. Install dependencies
```
npm install
# or
yarn
```

3. Start the development server
```
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:3000.

### Building for Production

```
npm run build
# or
yarn build
```

The built app will be in the `dist` directory.

## Deploying to Telegram

1. Host the built app on a secure HTTPS server
2. Register your bot with @BotFather on Telegram
3. Use @BotFather to enable the Web App and set the URL to your hosted app

## License

MIT 
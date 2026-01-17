# BotBrowserConsole

BotBrowserConsole is the desktop companion to **[BotBrowser](https://github.com/botswin/BotBrowser)**. It simplifies privacy-focused fingerprint configuration and multi-profile management for fingerprint protection and privacy research workflows. It also supports API-based extensions for custom requirements in authorized labs.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/e9c0b656-83b0-4be5-986e-d4bc3c04b4b5">

## Key Features

### Profile Management
- Create browser profiles for different accounts and use cases
- Choose from a library of fingerprint configuration files
- Clone existing profiles for faster setup and protection
- Import/export profiles for seamless team collaboration

### Network & Privacy
- Per-profile proxies for secure, privacy-respecting testing
- Optional fingerprint noise to evaluate cross-platform protection

### Advanced Operations
- Launch multiple isolated browsers with complete data separation
- Optionally pre-warm sessions for controlled experiments
- Organize profiles and settings into groups

### Developer Features
- API support for custom workflows and authorized research

## Development Setup

### Prerequisites
Install Neutralino CLI globally:
```bash
npm i -g @neutralinojs/neu
```

### Installation Steps

1. Install dependencies
   ```bash
   npm ci
   ```

2. Build the application
   ```bash
   npm run build
   ```

3. Run the application
   ```bash
   npm run app
   ```

## Getting Started

Quick Start

1. Download and install BotBrowserConsole
2. Create your first browser profile
3. Configure fingerprints, privacy controls, and settings
4. Start preparing research profiles and test environments

## Technical Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend Framework** | [Angular 19](https://angular.dev) | Comprehensive solution with built-in tools for routing, state management, and dependency injection |
| **UI Components** | [Angular Material](https://material.angular.io) | Modern, responsive, and accessible UI component library |
| **Application Runtime** | [Neutralino.js](https://neutralino.js.org) | Lightweight framework leveraging native WebView for efficient resource usage |


---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

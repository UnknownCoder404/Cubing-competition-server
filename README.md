# Cubing Competition Server

This repository contains the server-side implementation for the Cubing Competition application. It provides the backend infrastructure to support a comprehensive cubing competition management system.

## Project Overview

The Cubing Competition Server is designed to work seamlessly with the Cubing Competition Next.js Frontend. Together, they create a robust platform for managing and tracking cubing competitions.

## Prerequisites

Before you begin, ensure you have the following installed:

-   Docker: This project uses Docker for containerization, which ensures consistent deployment across different environments.
-   Verify installation by running `docker --version` in your terminal

## Getting Started

### Cloning the Repository

Run these commands in the folder the project should be created:

```bash
# Clone the repository
git clone https://github.com/UnknownCoder404/Cubing-competition-nextjs.git

# Navigate to the project directory
cd Cubing-competition-server
```

### Running the Server

We provide two primary ways to run the server:

#### Development Mode (with logs)

```bash
docker-compose up
```

Best for: Local development, debugging
Logs will be displayed directly in your terminal
Press Ctrl+C to stop the server

#### Production/Background Mode

```bash
docker-compose up -d
```

Best for: Deployment, long-running services
Server runs silently in the background

3. Verifying the Server

By default, the server typically runs on http://localhost:3000
You can verify the server is running by navigating to http://localhost:3000/health-check in your web browser.

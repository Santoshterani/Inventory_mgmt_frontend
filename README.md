# Inventory Management System — Frontend

A web-based Inventory Management System built with **React.js, Vite, and Material UI (MUI)**. The application provides a centralized interface for managing inventory, purchases, transfers, equipment types, assignments, and user operations.

The frontend communicates with a backend REST API to support application workflows and data management.

## Overview

Managing inventory involves more than tracking stock quantities. It also requires organizing equipment, recording purchases and transfers, managing assignments, and monitoring operations through a central dashboard.

This project brings these workflows together in a single web application with reusable UI components, protected routes, API service modules, and authentication-related state management.

## Features

### Dashboard
- Centralized dashboard for inventory-related information.
- Metric cards and filtering components.
- Loading and error states for a better user experience.

### Inventory Management
- Dedicated inventory management interface.
- Inventory-related API integration.
- Reusable components for common interactions.

### Purchase Management
- Interface for managing purchase operations.
- Integration with backend services.

### Transfer Management
- Dedicated module for inventory transfers.
- Transfer-related operations through backend APIs.

### Equipment Type Management
- Interface for organizing equipment types.

### Base Management
- Dedicated interface for managing bases or locations.

### Assignment Management
- Interface for managing equipment assignments.

### User Management
- Dedicated user management interface.
- Authentication-aware application workflows.

### Authentication and Navigation
- Login and logout workflows.
- Authentication context for sharing authentication state.
- Protected routes for restricting access to application pages.
- Change password, forgot password, and reset password pages.

### Reusable UI Components
- Loading indicators.
- Error messages.
- Confirmation dialogs.
- Dashboard metric cards.
- Consistent layouts and navigation.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Component-based user interface |
| Vite | Development server and build tooling |
| Material UI (MUI) | UI components and styling |
| React Router | Application navigation and routing |
| Axios or configured HTTP client | Backend communication, as configured in the project |
| Lucide | Icons |
| JavaScript (ES6+) | Application logic |
| CSS | Global styles and presentation |
| Git and GitHub | Version control |

## Project Structure

```text
inventory_frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── Loading.jsx
│   │   ├── dashboard/
│   │   │   ├── DashboardFilters.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   └── MovementDialog.jsx
│   │   └── layout/
│   │       ├── MainLayout.jsx
│   │       ├── Navbar.jsx
│   │       ├── ProtectedRoute.jsx
│   │       └── Sidebar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── Assignments.jsx
│   │   ├── Bases.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EquipmentTypes.jsx
│   │   ├── Expenditures.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Inventory.jsx
│   │   ├── Login.jsx
│   │   ├── Purchases.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Transfers.jsx
│   │   └── UserManagement.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── assignmentService.js
│   │   ├── authService.js
│   │   ├── baseService.js
│   │   ├── dashboardService.js
│   │   ├── equipmentTypeService.js
│   │   ├── expenditureService.js
│   │   ├── inventoryService.js
│   │   ├── purchaseService.js
│   │   ├── transferService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   └── permissions.js
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── theme.js
├── .dockerignore
├── .gitignore
├── Dockerfile
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

*The tree highlights the main application files; minor configuration files may be omitted.*

## Prerequisites

Install the following before running the application:

- Node.js and npm.
- Git.
- A running instance of the backend API.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Santoshterani/Inventory_mgmt_frontend.git
```

### 2. Navigate to the project directory

```bash
cd Inventory_mgmt_frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root if the application uses environment variables for its API configuration.

For a Vite application, the variable might look like this:

```env
VITE_API_URL=http://localhost:YOUR_BACKEND_PORT
```

Replace `YOUR_BACKEND_PORT` with the actual backend port and use the correct API base path required by the backend.

Check `src/services/api.js` to confirm the exact environment variable name and URL format used by this project.

**Important:** Never commit actual credentials, private API keys, or database passwords to GitHub. Keep `.env` excluded from version control.

### 5. Start the development server

```bash
npm run dev
```

Vite will display the local development URL in the terminal, typically:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

## Backend Integration

The frontend and backend are maintained in separate repositories.

**Frontend repository:**  
https://github.com/Santoshterani/Inventory_mgmt_frontend

**Backend repository:**  
https://github.com/Santoshterani/Inventory_mgmt_backend

The frontend organizes API communication into dedicated service modules. This separates backend requests from page components and helps keep the application easier to maintain.

For example, inventory-related requests are organized in `inventoryService.js`, while authentication-related requests are organized in `authService.js`.

The frontend requires the backend to be configured and running correctly for API-dependent features to work.

## Application Architecture

```text
User
  |
  v
React Pages and Components
  |
  v
Routes and Authentication Context
  |
  v
Service Modules
  |
  v
HTTP Requests
  |
  v
Backend REST API
  |
  v
Database
```

The frontend handles presentation, navigation, user interactions, and communication with the backend. Business rules, persistent data operations, and server-side validation belong to the backend.

## Production Build

To create a production build:

```bash
npm run build
```

Vite generates the production files in the `dist/` directory by default.

To preview the production build locally:

```bash
npm run preview
```

Use the scripts defined in `package.json` if your project has customized build or preview commands.

## Development Practices

The project is organized around the following practices:

- **Component reusability:** Common interface elements are maintained as reusable components.
- **Separation of concerns:** Pages, API services, routes, context, and utility functions are organized separately.
- **Centralized API communication:** Service modules keep API operations organized.
- **Authentication-aware navigation:** Protected routes help control access to application pages.
- **Consistent user feedback:** Loading indicators, error messages, and confirmation dialogs support common interaction flows.
- **Maintainability:** A modular structure makes individual features easier to update and extend.

## Future Enhancements

Potential improvements include:

- Automated frontend and API integration tests.
- Enhanced inventory reporting and analytics.
- Additional accessibility improvements.
- Improved application performance and error monitoring.
- Expanded deployment documentation.

## Author

**Santosh Terani**

GitHub: https://github.com/Santoshterani

## License

No license has been specified in this README. Add an appropriate license if you intend to distribute or reuse the project publicly.

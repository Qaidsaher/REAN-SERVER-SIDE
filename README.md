
# Support-Innovative-Project-server

This is the backend server for the "Support Innovative Project" application. It is built using **Node.js** and **Express**, providing APIs for various functionalities like user authentication, data storage, and other core features for the application.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 12 or later)
- [Git](https://git-scm.com/) for cloning the repository

## Cloning the Repository

### 1. Clone the repository to your local machine

To get started, clone the repository using the following command:

```bash
git clone https://github.com/Qaidsaher/REAN-SERVER-SIDE.git
```

### 2. Navigate to the Project Directory

Once cloned, navigate into the project folder:

```bash
cd REAN-SERVER-SIDE
```

## Installing Dependencies

### 3. Install Dependencies

After navigating to the project directory, install the required dependencies by running the following command:

```bash
npm install
```

This will install all the necessary packages as defined in the `package.json` file.

## Running the Server Locally

### 4. Start the Server

Once the dependencies are installed, you can start the development server by running:

```bash
node seeders/seedDatabase.js
```

```bash
nodemon server.js
```



By default, the server will run on `http://localhost:3000`. You can adjust the port in the `server.js` (or equivalent) file if needed.

### 5. Testing the Server

To ensure the server is running correctly, you can visit `http://localhost:3000` in your browser or use an API testing tool like **Postman** or **curl** to interact with the available APIs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

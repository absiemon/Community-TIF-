# Community TIF
A project to create community. Each user, can create a community and (automatically) gets assigned the Community Admin role. They can add other users to the community who get assigned the Community Member role.
  
## Installation Guide

Follow these steps to set up and run the project:
1. Create a folder of your desired name.
2. Navigate to the project folder.
   ```bash
   cd projectName
   ```
3. Clone the project repository to your local machine:
   ```bash
   git clone https://github.com/absiemon/Community-TIF-.git
   ```
4. Install dependencies using npm
```bash
   npm install
   ```
5. Create a env file in root directory (parallel to server.js) and mention
   ```bash
   MONGO_URL= your mongo url.
   JWT_SECRET = your jwt secret key.
   ```
6. Run below command to start the server.
   ```bash
   npm run dev
   ```
## License

[MIT](https://choosealicense.com/licenses/mit/)

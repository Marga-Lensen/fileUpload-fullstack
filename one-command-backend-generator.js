// mongoose-generator-scripts/one-command-backend-generator.js

// ⚠️ This file contains sensitive data: check before pushing
// import rls from 'readline-sync'; // Synchronous input
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { fileURLToPath } from 'url';


// =============================================================================
// 0. GLOBAL SETUP - Ensure parent folder has required dependencies
// =============================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.join(__dirname, '..');
const parentPackageJson = path.join(parentDir, 'package.json');


// Create parent package.json if missing
if (!fs.existsSync(parentPackageJson)) {
  console.log(`📦 Creating parent's package.json...`);
  fs.writeFileSync(parentPackageJson, JSON.stringify({
    type: "module",
    dependencies: {
      "readline-sync": "^1.4.10"
    }
  }, null, 2));
}

// Check if readline-sync is installed
let rlsInstalled = false;
try {
  const pkg = JSON.parse(fs.readFileSync(parentPackageJson, 'utf-8'));
  if (pkg.dependencies && pkg.dependencies['readline-sync']) {
    rlsInstalled = fs.existsSync(path.join(parentDir, 'node_modules', 'readline-sync'));
  }
} catch (err) {
  console.error('❌ Error reading package.json:', err);
}

// Install dependencies if needed
if (!rlsInstalled) {
  console.log('🔧 Installing dependencies...');
  execSync('npm install --no-package-lock --silent', {
    cwd: parentDir,
    stdio: 'inherit'
  });

  console.log('♻️ Restarting script after install...');
  execSync(`node ${__filename}`, { stdio: 'inherit' });
  process.exit(0); // Exit current instance after restart
}

// =============================================================================
// 1. IMPORTS (after dependencies are guaranteed)
// =============================================================================
// Now safely import
import rls from 'readline-sync';

// =============================================================================
// 2. --help flag (sync)
// =============================================================================
const helpFlag = process.argv.includes('--help') || process.argv.includes('-h');
if (helpFlag) {
  console.log(`
  Usage: node ${path.basename(process.argv[1])} [projectName] [port]
  
  General use case: node script.js [a] [b] whereby inputs [a] and [b] are optional

  Hints & Tips:
  - a) projectName: Name of the new project (default: 'newProject')
    ► Caution: No spaces! -> Use camelCase or hypens.//

  - b) port: Port for the server (default: '3000')
   ► Use different ports for multiple projects.
   
  - prompted input: connectionString: MongoDB URI (default: 
   ► Format: 'mongodb+srv://user:password@cluster.mongodb.net/newDB?retryWrites=true')
   ► Pro Tip: Write your DB name between the / and ?
  `);
  process.exit(0);
}

/// =============================================================================
// I. PROJECT SETUP - get USER INPUTS (sync with rls)
// =============================================================================
// a. Project name (argv[2])
const projectName = process.argv[2] || rls.question('Project name (default: newProject): ', {
  defaultInput: 'newProject'
});

// b. Port (argv[3]) - Useful for parallel projects (e.g., Postman testing)
// const port = process.argv[3] || rls.question('🌐 Server port (Enter for default: 3000): ', {
//  defaultInput: '3000'
//});  // Default: 3000
// =============================================================================
// DYNAMIC PORT HANDLER (Checks availability + respects user preference)
// =============================================================================
const getAvailablePort = async (preferredPort = 3000) => {
  const net = await import('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(getAvailablePort(preferredPort + 1)));
    server.listen(preferredPort, () => {
      server.close(() => resolve(preferredPort));
    });
  });
};

// Get final port (user preference -> dynamic check -> fallback)
const preferredPort = Math.max(
  1,  // Minimum port
  parseInt(process.argv[3]) || 
  rls.questionInt('🌐 Port (default: 3000): ', { defaultInput: 3000 })
);
const availablePort = await getAvailablePort(preferredPort);

if (preferredPort !== availablePort) {
  console.log(`⚠️  Port ${preferredPort} busy → Using ${availablePort}`);
}



// // c. MongoDB connection string 
// Note: Hide password in logs for security!
// let connectionString = process.argv[4] || rls.question(`
const connectionString = rls.question(`
  🔑 Enter connection string a.k.a. MongoDB URI 
  (press Enter for default: localhost; 
  Note: You can still change it later in .env.):
  ► Cloud: "mongodb+srv://user:pass@cluster.mongodb.net/DBname?retryWrites=true"
  ► Local: "mongodb://localhost:27017/DBname"
  Your Input: `, { defaultInput: 'mongodb://localhost:27017/' }); // Fallback to localhost
  

// =============================================================================
// II. PROJECT SCAFFOLDING
// =============================================================================
const projectDir = `./${projectName}`;
const utilsDir = path.join(projectDir, 'utils');


// 1. Create the new project folder ----------------------------------------------------------------------
// create project folder
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir);
  console.log(`📁 Created folder: ${projectName}`);
}

// 2. Create `server.js` with Express, JSON parsing, and Error Middleware ----------------------------------------------------------------------
const serverCode = `
import express from "express";
import connect from "./utils/connectDB.js"; // Import the DB connection function
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT  // use actually available port from .env

app.use(cors({
  origin: 'http://localhost:5173', // Match this with your frontend URL (later)
  credentials: true
}));

app.use(express.json()); // Middleware for JSON parsing

// Try connecting to MongoDB; start server anyway even if connection fails
connect(); // Connect to MongoDB

app.get("/", (req, res) => {
  res.send("Hello co-creator! Let's start building something great 🤓");
});

// Error Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error found:", err);
  res.sendStatus(500);
});


app.listen(PORT, () => {
  console.log(\`✅ Server running on http://localhost:\${PORT}\`);
});
`;
// ============================================================================
// Write the server.js file
fs.writeFileSync(path.join(projectDir, 'server.js'), serverCode);
console.log(`📄 Created: server.js!`);
// ============================================================================

// 3. Create `utils/` folder and `connectDB.js` ---------------------------------------------------------
// create utils folder
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir);
  console.log(`📁 Created folder: utils`);
}

const connectDBCode = `
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connect() {
  // first check if the .env has the right connection string
const uri = process.env.CONNECTION_STRING || process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Connection string is missing! 👉️ Set CONNECTION_STRING in .env.");
    // process.exit(1);
    return; // ❌ No process.exit(1), just return
  }

  mongoose.connection.on("connected", () => {
    console.log("🗃️  MongoDB connected 🤓");
  });

  mongoose.connection.on("error", (error) => {
    console.error(  "⚠️ Warning: MongoDB connection failed. Server will start without database connection.");
  });

  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error("✖️ MongoDB connection failed; 🕵️ check your  CONNECTION_STRING in .env for typos");
    // process.exit(1);
  }
}
`;
// ============================================================================
// Write the connectDB.js file
fs.writeFileSync(path.join(utilsDir, 'connectDB.js'), connectDBCode);
console.log(`📄 Created: utils/connectDB.js`);
// ============================================================================


// 4. Create `package.json` ----------------------------------------------------------------------------
// Initialize package.json with default values
exec('npm init -y', { cwd: projectDir }, (error) => {
  if (error) {
    console.error(`❌ Error initializing package.json: ${error.message}`);
    return;
  }
  console.log(`✔️ Created: package.json`);

  // Modify package.json to include "type": "module"
  // Enable ES6 modules
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.type = 'module';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('🔧 Updated package.json with "type": "module".');


  // 5. Install dependencies (Express, Mongoose, dotenv, cors) ----------------------------------------------
  exec('npm install express mongoose dotenv cors', { cwd: projectDir }, (error) => {
    if (error) {
      console.error(`❌ Error installing dependencies: ${error.message}`);
      return;
    }
    console.log("👍️ Installed dependencies: Express, Mongoose, dotenv and cors.");


// 6. Create `.gitignore` -------------------------------------------------------------------------
const gitignoreContent = `
# Node.js dependencies
node_modules/
# Logs
npm-debug.log*
# Environment files
.env
`;

// ==========================================================================
// Write the .gitignore file
fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent);
console.log('🫣 Created: .gitignore');
// ==========================================================================


// 7. Create .env file with entered or default values ------------------------------------------------
const envContent = `
# ⚠️ This file contains sensitive data: check before pushing
# --- MongoDB Connection ---
CONNECTION_STRING=${connectionString || 'mongodb://localhost:27017/'}
# Alternative name (uncomment if needed):
# MONGO_URI=${connectionString || 'mongodb://localhost:27017/'}

# --- Server ---
PORT=${availablePort}  # Use the actually available port
`;

// ==========================================================================
// Write the .env file
// Note: This file contains sensitive data, so be careful when pushing to GitHub
fs.writeFileSync(path.join(projectDir, '.env'), envContent);
console.log('🔐 Created .env with active connection string and port.');
// ==========================================================================


// 8. Start the server ---------------------------------------------------------------------------
    // console.log('starting server ...');
    
    const serverProcess = exec('node server.js', { cwd: projectDir });
    serverProcess.stdout.on('data', (data) => {
      console.log(data);
    });
    serverProcess.stderr.on('data', (data) => {
      console.error(`❌ Server error: ${data}`);
    });

/////// 9. Open Firefox using the port in .env as given at point 7.  -------------------------------------------
    // console.log('opening browser...');
    
    setTimeout(() => {
      console.log('🌍 Opening Firefox...');
      exec(`firefox http://localhost:${availablePort}`, (error) => {  // Use dynamic port
        if (error) {
          console.error(`❌ Error opening Firefox: ${error.message}`);
        } else {
          console.log(`🦊 Firefox opened at http://localhost:${availablePort}! Good luck and have fun 🤓`);
        }

    // ✅ Call finish() here, after everything is done
    finish();

      });
    }, 2000); // Wait 2 seconds before opening browser

  });   // end of exec for npm install
});  // end of exec for npm init


// ==========================================================================
// III. FINISHING
// ==========================================================================

// function finish (is called at the end of the script, i.e. in the setTimeout at point 9)
const finish = () => {
console.log(`
  
  Setup complete!
  Now run the following commands to start working on your project:
  cd ${projectName}
  node server.js  (or npm start)`);
}
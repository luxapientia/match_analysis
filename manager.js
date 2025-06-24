// server-manager-http.js
const express = require('express');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const { main } = require('./main.js');

main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
})

const app = express();
const PORT = 4000;
const TARGET = 'target.js';
const PID_FILE = 'target.pid';

app.use(express.json());


function readPid() {
    if (!fs.existsSync(PID_FILE)) return null;
    return parseInt(fs.readFileSync(PID_FILE, 'utf8'));
}

function deletePid() {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
}

function startServer(res) {
    if (fs.existsSync(PID_FILE)) return res.send('Already running.');

    const child = spawn('npm', ['run', 'start:forever'], {
        detached: true,
        stdio: 'ignore',
        shell: true,
    });

    fs.writeFileSync(PID_FILE, child.pid.toString());
    child.unref();

    res.send(`Started target.js with PID ${child.pid}`);
}

function stopServer(res) {
    const pid = readPid();
    if (!pid) {
        console.log('❌ No running server found.');
        return;
    }

    try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        console.log(`🛑 Force-killed process ${pid} using taskkill`);
    } catch (err) {
        console.error(`❌ Failed to kill process ${pid}:`, err.message);
    }
    deletePid();
    res.send('Stopped.');
}

function status(res) {
    if (!fs.existsSync(PID_FILE)) return res.send('Not running.');
    return res.send('Running: ' + readPid());
}

app.get('/start', (_, res) => startServer(res));
app.get('/stop', (_, res) => stopServer(res));
app.get('/status', (_, res) => status(res));

app.listen(PORT, () => {
    console.log(`Manager listening on http://localhost:${PORT}`);
});

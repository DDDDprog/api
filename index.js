const express = require('express');
const bodyParser = require('body-parser');
const { NodeVM } = require('vm2');
const cors = require('cors');

const app = express();
const port = 9000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint to run JavaScript code
app.post('/run', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    // Array to capture console.log output
    let output = [];

    // Create a new VM instance
    const vm = new NodeVM({
        console: 'redirect', // Redirect console.log to the output array
        sandbox: {}, // You can add any global variables here
        require: {
            external: false, // Don't allow external modules by default
            builtin: [], // Allow no built-in modules for security
        },
        timeout: 1000, // Limit the execution time of the script to 1 second
        wrapper: 'commonjs', // Wrap in CommonJS module for better compatibility
    });

    // Capture console.log output
    vm.on('console.log', (msg) => {
        output.push(msg);
    });

    try {
        // Run the code in the VM
        const result = vm.run(code);

        res.json({
            result,
            output, // Return the captured console.log output
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

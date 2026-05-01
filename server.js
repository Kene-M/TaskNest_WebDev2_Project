// ============================================================================
// IMPORTS
// ============================================================================
// Import required modules for creating and running the HTTP server
const http = require("http");
const URL = require("url").URL;
const crypto = require("crypto");
const app = require("./backend/app");
const debug = require("debug")("node-angular");

// import http from "http";
// import { URL } from "url";
// import crypto from "crypto";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// Normalize a port into a number, string, or false.
// Converts the port from environment variable into a valid port number
const normalizedPort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================
// Set the port from environment variable or default to 3000
var PORT = normalizedPort(process.env.PORT || 3000);

// Set port on the express app for it to work with the http server
app.set('port', PORT);
const HOST = process.env.HOST || "127.0.0.1";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window for rate limiting
const RATE_LIMIT_MAX = 120; // max 120 requests per window per IP address

// Map to track request counts per IP address for rate limiting
const buckets = new Map();


// Rate limiting function that checks if an IP has exceeded the request limit
// Returns an object indicating if the request is allowed and remaining quota
function rateLimit(ip) {
  const now = Date.now();
  const entry = buckets.get(ip);
  // If no entry exists or the window has expired, create a new bucket
  if (!entry || entry.resetAt <= now) {
    buckets.set(ip, { resetAt: now + RATE_LIMIT_WINDOW_MS, count: 1 });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  // Otherwise, increment the existing counter
  entry.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  return { ok: entry.count <= RATE_LIMIT_MAX, remaining, resetAt: entry.resetAt };
}

// Helper function to send HTTP responses with proper headers and security policies
// Sets Content-Type based on body type and includes security headers
function send(res, statusCode, body, headers = {}) {
  // Convert body to string (JSON for objects, plain text for strings)
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  // Set up headers with security policies to protect against common attacks
  const baseHeaders = {
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Content-Type-Options": "nosniff", // Prevent MIME type sniffing
    "X-Frame-Options": "DENY", // Prevent clickjacking
    "Referrer-Policy": "no-referrer", // Privacy: don't send referrer info
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'", // Strict CSP
    ...headers, // Allow overriding with custom headers
  };
  res.writeHead(statusCode, baseHeaders);
  res.end(payload);
}

// Logging function that safely logs HTTP requests with minimal information
// Includes timestamp, client IP, HTTP method, URL path, and response status code
function safeLogLine(req, statusCode) {
  // Avoid logging secrets; keep it minimal to prevent sensitive data exposure
  const ip = req.socket.remoteAddress ?? "unknown";
  const method = req.method ?? "UNKNOWN";
  const url = req.url ?? "/";
  console.log(`${new Date().toISOString()} ${ip} ${method} ${url} ${statusCode}`);
}

// ============================================================================
// SERVER EVENT HANDLERS
// ============================================================================
// Called when the server successfully starts listening for connections
const onListening = () => {
  const addr = server.address();
  const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
  debug("Listening on " + bind);
};

// Error handler for server errors (e.g., port conflicts, permission issues)
const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
  // Handle specific error types
  switch (error.code) {
    case "EACCES":
      // Permission denied - requires elevated privileges (run as admin)
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      // Port already in use - another process is using this port
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};
// ============================================================================
// CREATE HTTP SERVER
// ============================================================================
// Main request handler for incoming HTTP requests
const server = http.createServer((req, res) => {
  try {
    // --- Validate HTTP Method ---
    // Only allow GET and HEAD methods for security
    const method = req.method || "GET";
    if (!["GET", "HEAD"].includes(method)) {
      send(res, 405, { error: "Method Not Allowed" }, { "Allow": "GET, HEAD" });
      safeLogLine(req, 405);
      return;
    }

    // --- Parse Request URL ---
    // Safely parse the URL to extract pathname and query parameters
    const u = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // --- Apply Rate Limiting ---
    // Check if the client IP has exceeded the request quota
    const ip = req.socket.remoteAddress || "unknown";
    const rl = rateLimit(ip);
    // Send rate limit info in response headers (useful for clients to adjust behavior)
    res.setHeader("RateLimit-Limit", String(RATE_LIMIT_MAX));
    res.setHeader("RateLimit-Remaining", String(rl.remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(rl.resetAt / 1000)));
    if (!rl.ok) {
      // Too many requests from this IP - return 429 status
      send(res, 429, { error: "Too Many Requests" });
      safeLogLine(req, 429);
      return;
    }

    // --- Route Handling ---
    // Health check endpoint - used for monitoring and load balancers
    if (u.pathname === "/health") {
      send(res, 200, { ok: true });
      safeLogLine(req, 200);
      return;
    }

    // Home page endpoint
    if (u.pathname === "/") {
      send(res, 200, "Hello from a minimal Node.js HTTP server.\n");
      safeLogLine(req, 200);
      return;
    }

    // Nonce generation endpoint - generates a random cryptographic token
    // Useful for security tokens, CSRF protection, etc.
    if (u.pathname === "/nonce") {
      const nonce = crypto.randomBytes(16).toString("hex");
      send(res, 200, { nonce });
      safeLogLine(req, 200);
      return;
    }

    // --- Delegate to Express App ---
    // Forward API routes (paths starting with /api) to the Express application
    // Express handles its own routing and responses
    if (u.pathname.startsWith("/api")) {
      app(req, res, () => {
        // If Express doesn't handle the route, send 404 response
        send(res, 404, { error: "Not Found" });
        safeLogLine(req, 404);
      });
      return;
    }

    // --- Default: Not Found ---
    // No matching route found
    send(res, 404, { error: "Not Found" });
    safeLogLine(req, 404);
  } catch (err) {
    // --- Error Handling ---
    // Catch any unexpected errors and return 500 response
    send(res, 500, { error: "Internal Server Error" });
    // Don't expose stack traces to users for security; only log server-side
    console.error(err);
    safeLogLine(req, 500);
  }
});

// Handle client errors (e.g., malformed requests) gracefully
server.on("clientError", (_err, socket) => socket.end("HTTP/1.1 400 Bad Request\r\n\r\n"));

// ============================================================================
// START SERVER
// ============================================================================
// Start the server listening on the configured host and port
server.listen(PORT, HOST, () => {
  console.log(`Listening on http://${HOST}:${PORT}`);
});

// Attach error and listening event handlers
server.on("error", onError);
server.on("listening", onListening);

<h1>Ultimate Video Downloader</h1>

<p>A modern, full-stack video downloader supporting YouTube, TikTok, Instagram, and Facebook. Built with Laravel, React, and Python for optimal performance and user experience.</p>

<h2>Features</h2>

<ul>
  <li><strong>Multi-Platform Support:</strong> Download videos from YouTube, TikTok, Instagram, and Facebook</li>
  <li><strong>Modern UI:</strong> Beautiful, responsive interface with animated backgrounds and multi-step loading</li>
  <li><strong>Rate Limiting:</strong> Built-in daily download limits to prevent abuse</li>
  <li><strong>Direct Downloads:</strong> Videos download directly to user's device without server storage</li>
  <li><strong>Social Integration:</strong> Facebook page follow requirement with modal confirmation</li>
  <li><strong>Device Fingerprinting:</strong> Advanced user tracking combining IP address and device characteristics</li>
  <li><strong>Security:</strong> CSRF protection, input sanitization, and Laravel's built-in security features</li>
</ul>

<h2>Architecture</h2>

<h3>Tech Stack</h3>

<p><strong>Frontend:</strong></p>
<ul>
  <li>React 18 with TypeScript</li>
  <li>Inertia.js for seamless server-client communication</li>
  <li>Shadcn UI components for consistent design</li>
  <li>Tailwind CSS for styling</li>
  <li>Aceternity UI for advanced animations</li>
</ul>

<p><strong>Backend:</strong></p>
<ul>
  <li>Laravel 10 (PHP 8.1+)</li>
  <li>MySQL database</li>
  <li>Laravel's built-in rate limiting middleware</li>
</ul>

<p><strong>Video Processing:</strong></p>
<ul>
  <li>Python 3.8+ with Flask</li>
  <li>yt-dlp for video extraction</li>
  <li>Base64 encoding for secure file transfer</li>
</ul>

<h3>System Flow</h3>

<pre><code>User Input (React) 
    ↓
Laravel Controller 
    ↓
Rate Limit Check (MySQL) 
    ↓
Python Flask API 
    ↓
yt-dlp Processing 
    ↓
Base64 Video Data 
    ↓
Direct Browser Download</code></pre>

<h2>Installation</h2>

<p>Ensure you have the following installed on your system:</p>
<ul>
  <li><a href="https://www.php.net/" target="_blank">PHP 8.1+</a></li>
  <li><a href="https://nodejs.org/" target="_blank">Node.js 16+ & npm</a></li>
  <li><a href="https://www.python.org/" target="_blank">Python 3.8+</a></li>
  <li><a href="https://www.mysql.com/" target="_blank">MySQL 8.0+</a></li>
  <li><a href="https://getcomposer.org/" target="_blank">Composer</a></li>
</ul>

<h2>Installation Steps</h2>

<ol>
  <li><strong>Clone the repository:</strong>
    <pre><code>git clone https://github.com/yourusername/ultimate-video-downloader.git
cd ultimate-video-downloader</code></pre>
  </li>
  
  <li><strong>Install PHP dependencies:</strong>
    <pre><code>composer install</code></pre>
  </li>
  
  <li><strong>Copy the environment configuration file:</strong>
    <pre><code>cp .env.example .env</code></pre>
  </li>
  
  <li><strong>Generate the application key:</strong>
    <pre><code>php artisan key:generate</code></pre>
  </li>

  <li><strong>Configure database in .env file:</strong>
    <pre><code>DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=video_downloader
DB_USERNAME=your_username
DB_PASSWORD=your_password</code></pre>
  </li>
  
  <li><strong>Run database migrations:</strong>
    <pre><code>php artisan migrate</code></pre>
  </li>

  <li><strong>Install JavaScript dependencies:</strong>
    <pre><code>npm install</code></pre>
  </li>

  <li><strong>Install Shadcn UI components:</strong>
    <pre><code>npx shadcn@latest add button dialog input</code></pre>
  </li>

  <li><strong>Install multi-step loader:</strong>
    <pre><code>npx shadcn@latest add https://ui.aceternity.com/registry/multi-step-loader.json</code></pre>
  </li>

  <li><strong>Build frontend assets:</strong>
    <pre><code>npm run build
# or for development
npm run dev</code></pre>
  </li>
</ol>

<h2>Python API Setup</h2>

<ol>
  <li><strong>Navigate to Python directory:</strong>
    <pre><code>cd python-api</code></pre>
  </li>

  <li><strong>Create virtual environment:</strong>
    <pre><code>python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows</code></pre>
  </li>

  <li><strong>Install Python dependencies:</strong>
    <pre><code>pip install flask flask-cors yt-dlp</code></pre>
  </li>

  <li><strong>Run the Python API:</strong>
    <pre><code>python app.py</code></pre>
  </li>
</ol>

<p>The Python API will start on <code>http://localhost:5001</code></p>

<h2>Start the Application</h2>

<ol>
  <li><strong>Start Laravel server:</strong>
    <pre><code>php artisan serve</code></pre>
  </li>
  
  <li><strong>Start frontend development server (if not built):</strong>
    <pre><code>npm run dev</code></pre>
  </li>
  
  <li><strong>Ensure Python API is running on port 5001</strong></li>
</ol>

<p>Visit <code>http://127.0.0.1:8000</code> to use the application.</p>

<h2>Configuration</h2>

<h3>Rate Limiting</h3>

<p>Adjust daily download limits in <code>app/Models/DownloadLog.php</code>:</p>

<pre><code>public static function hasExceededDailyLimit(string $ipAddress, string $deviceFingerprint, int $limit = 5): bool</code></pre>

<h3>Supported Platforms</h3>

<p>Add or modify supported domains in <code>Welcome.tsx</code>:</p>

<pre><code>const allowedDomains = [
    'youtube.com',
    'youtu.be',
    'tiktok.com',
    'instagram.com',
    'facebook.com',
    // Add more domains here
];</code></pre>

<h3>Facebook Integration</h3>

<p>Update the Facebook page URL in <code>Welcome.tsx</code>:</p>

<pre><code>const handleImageClick = () => {
    window.open('https://www.facebook.com/your-page-url', '_blank');
    setHasClickedImage(true);
};</code></pre>

<h2>API Endpoints</h2>

<h3>Laravel Routes</h3>

<ul>
  <li><code>GET /</code> - Main application page</li>
  <li><code>POST /convert</code> - Video conversion endpoint (rate limited)</li>
</ul>

<h3>Python API Endpoints</h3>

<ul>
  <li><code>POST /api/convert</code> - Process video download</li>
  <li><code>GET /api/health</code> - Health check endpoint</li>
</ul>

<h3>Request/Response Format</h3>

<p><strong>Convert Video Request:</strong></p>
<pre><code>{
    "url": "https://www.youtube.com/watch?v=example"
}</code></pre>

<p><strong>Successful Response:</strong></p>
<pre><code>{
    "success": true,
    "message": "Video downloaded successfully",
    "data": {
        "title": "Video Title",
        "filename": "video_title.mp4",
        "file_data": "base64_encoded_video_data",
        "file_size": 1234567,
        "file_extension": ".mp4"
    }
}</code></pre>

<p><strong>Rate Limited Response (429):</strong></p>
<pre><code>{
    "success": false,
    "message": "Daily download limit exceeded. Please try again tomorrow.",
    "error_code": "RATE_LIMIT_EXCEEDED"
}</code></pre>

<h2>Database Schema</h2>

<h3>download_logs Table</h3>

<table>
  <thead>
    <tr>
      <th>Column</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td>bigint</td>
      <td>Primary key</td>
    </tr>
    <tr>
      <td>ip_address</td>
      <td>varchar(45)</td>
      <td>User's IP address</td>
    </tr>
    <tr>
      <td>user_agent</td>
      <td>text</td>
      <td>Browser user agent</td>
    </tr>
    <tr>
      <td>device_fingerprint</td>
      <td>varchar(64)</td>
      <td>SHA256 hash of device characteristics</td>
    </tr>
    <tr>
      <td>url</td>
      <td>text</td>
      <td>Downloaded video URL</td>
    </tr>
    <tr>
      <td>downloaded_at</td>
      <td>timestamp</td>
      <td>Download timestamp</td>
    </tr>
    <tr>
      <td>created_at</td>
      <td>timestamp</td>
      <td>Record creation time</td>
    </tr>
    <tr>
      <td>updated_at</td>
      <td>timestamp</td>
      <td>Record update time</td>
    </tr>
  </tbody>
</table>

<h2>Security Features</h2>

<ul>
  <li><strong>CSRF Protection:</strong> All POST requests require valid CSRF tokens</li>
  <li><strong>Input Sanitization:</strong> XSS prevention on all user inputs</li>
  <li><strong>Rate Limiting:</strong> Multiple layers including Laravel middleware and custom logic</li>
  <li><strong>Device Fingerprinting:</strong> Prevents simple IP-based bypass attempts</li>
  <li><strong>URL Validation:</strong> Strict domain whitelist for supported platforms</li>
</ul>

<h2>Development</h2>

<h3>Adding New Platforms</h3>

<ol>
  <li>Update domain list in <code>Welcome.tsx</code></li>
  <li>Add platform detection logic in Python <code>detect_platform()</code> function</li>
  <li>Configure platform-specific download strategies in <code>convert_video()</code> function</li>
  <li>Test with various URLs from the new platform</li>
</ol>

<h3>Customizing UI</h3>

<p>The application uses Tailwind CSS and Shadcn UI components. Key UI files:</p>
<ul>
  <li><code>Welcome.tsx</code> - Main application interface</li>
  <li><code>components/ui/*</code> - Reusable UI components</li>
  <li><code>tailwind.config.js</code> - Tailwind configuration</li>
</ul>

<h3>Debugging</h3>

<p>Enable debug logging by checking Laravel logs:</p>
<pre><code>tail -f storage/logs/laravel.log</code></pre>

<p>Rate limiting debug information is logged with each download attempt.</p>

<h2>Contributing</h2>

<ol>
  <li>Fork the repository</li>
  <li>Create a feature branch (<code>git checkout -b feature/amazing-feature</code>)</li>
  <li>Commit your changes (<code>git commit -m 'Add some amazing feature'</code>)</li>
  <li>Push to the branch (<code>git push origin feature/amazing-feature</code>)</li>
  <li>Open a Pull Request</li>
</ol>

<h3>Code Style</h3>

<ul>
  <li><strong>PHP:</strong> Follow PSR-12 coding standards</li>
  <li><strong>TypeScript/React:</strong> Use Prettier and ESLint configurations</li>
  <li><strong>Python:</strong> Follow PEP 8 guidelines</li>
</ul>

<h2>License</h2>

<p>This project is licensed under the MIT License - see the <a href="LICENSE">LICENSE</a> file for details.</p>

<h2>Disclaimer</h2>

<p>This tool is for educational and personal use only. Users are responsible for complying with the terms of service of the platforms from which they download content. The developers are not responsible for any misuse of this software.</p>

<h2>Support</h2>

<p>If you encounter any issues or have questions:</p>

<ol>
  <li>Check the <a href="https://github.com/yourusername/ultimate-video-downloader/issues">Issues</a> page</li>
  <li>Review the troubleshooting section above</li>
  <li>Create a new issue with detailed information about your problem</li>
</ol>

<h2>Acknowledgments</h2>

<ul>
  <li><a href="https://github.com/yt-dlp/yt-dlp">yt-dlp</a> for video extraction capabilities</li>
  <li><a href="https://laravel.com/">Laravel</a> for the robust backend framework</li>
  <li><a href="https://reactjs.org/">React</a> for the interactive frontend</li>
  <li><a href="https://ui.shadcn.com/">Shadcn UI</a> for beautiful UI components</li>
  <li><a href="https://ui.aceternity.com/">Aceternity UI</a> for advanced animations</li>
</ul>

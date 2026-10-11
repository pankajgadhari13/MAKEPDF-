#!/usr/bin/env python3
"""
MAKEPDF - Application Entry Point (Phase 1)
Run this script to start the local Flask development server.
"""

import os
from app import create_app

# Instantiate Flask app using development configuration
env = os.getenv('FLASK_ENV', 'development')
app = create_app(env)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = env == 'development'
    print(f"\n⚡ Starting MAKEPDF Application (Orange & Black Theme)")
    print(f"👉 Local Development URL: http://127.0.0.1:{port}")
    print(f"👉 Health Check: http://127.0.0.1:{port}/api/health\n")
    app.run(host='0.0.0.0', port=port, debug=debug)

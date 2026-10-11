import os
from flask import Flask, jsonify
from pathlib import Path
from app.config import config


def create_app(config_name='default'):
    """Application factory for MAKEPDF."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Ensure upload and output directories exist
    upload_dir = Path(app.config['UPLOAD_FOLDER'])
    output_dir = Path(app.config['OUTPUT_FOLDER'])
    upload_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Register blueprints
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    # Global Error Handlers (Phase 1)
    @app.errorhandler(404)
    def page_not_found(e):
        return jsonify({
            'status': 'error',
            'code': 404,
            'message': 'The requested resource was not found on MAKEPDF.'
        }), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({
            'status': 'error',
            'code': 500,
            'message': 'An internal server error occurred while processing your request.'
        }), 500

    return app

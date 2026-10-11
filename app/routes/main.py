from flask import Blueprint, render_template, jsonify
from datetime import datetime

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Render the MAKEPDF futuristic orange & black home page."""
    tools = [
        {
            'id': 'jpg-to-pdf',
            'title': 'JPG to PDF',
            'desc': 'Convert images (JPG, PNG, WebP) into pristine PDF documents with custom orientation and margins.',
            'icon': 'image',
            'url': '/tools/jpg-to-pdf'
        },
        {
            'id': 'merge-pdf',
            'title': 'Merge PDF',
            'desc': 'Combine multiple PDF files into one clean document in the exact order you need.',
            'icon': 'layers',
            'url': '/tools/merge-pdf'
        },
        {
            'id': 'split-pdf',
            'title': 'Split PDF',
            'desc': 'Separate specific page ranges or extract individual pages into separate PDF files.',
            'icon': 'scissors',
            'url': '/tools/split-pdf'
        },
        {
            'id': 'compress-pdf',
            'title': 'Compress PDF',
            'desc': 'Reduce PDF document file size while preserving high visual fidelity and text clarity.',
            'icon': 'minimize-2',
            'url': '/tools/compress-pdf'
        },
        {
            'id': 'pdf-to-jpg',
            'title': 'PDF to JPG',
            'desc': 'Extract every page of your PDF into crisp, high-resolution JPEG images.',
            'icon': 'file-image',
            'url': '/tools/pdf-to-jpg'
        },
        {
            'id': 'rotate-pdf',
            'title': 'Rotate PDF',
            'desc': 'Rotate pages 90°, 180°, or 270° clockwise or counterclockwise with instant preview.',
            'icon': 'rotate-cw',
            'url': '/tools/rotate-pdf'
        },
        {
            'id': 'watermark-pdf',
            'title': 'Watermark PDF',
            'desc': 'Stamp custom security watermarks with text, custom opacity, angle, and position.',
            'icon': 'stamp',
            'url': '/tools/watermark-pdf'
        }
    ]
    return render_template('index.html', tools=tools)


@main_bp.route('/tools')
def tools():
    """Render the full tools directory page."""
    return render_template('tools.html')


@main_bp.route('/api/health')
def health_check():
    """Phase 1 Health & Architecture Check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'MAKEPDF Backend Service',
        'version': '1.0.0-phase1',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'theme': 'Orange & Black Futuristic',
        'modules': {
            'flask': 'active',
            'upload_directory': 'ready',
            'output_directory': 'ready'
        }
    }), 200

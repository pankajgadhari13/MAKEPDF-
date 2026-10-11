import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app('development')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_home_page(client):
    """Test that the home page loads successfully with 200 OK."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"MAKE" in response.data
    assert b"PDF" in response.data


def test_health_check(client):
    """Test the Phase 1 /api/health endpoint."""
    response = client.get('/api/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'healthy'
    assert 'MAKEPDF' in json_data['service']


def test_404_page(client):
    """Test that invalid routes return a clean 404 response."""
    response = client.get('/non-existent-page-xyz')
    assert response.status_code == 404

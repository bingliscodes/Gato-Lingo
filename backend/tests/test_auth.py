"""Tests for the /auth signup + login flow."""

VALID_SIGNUP = {
    "email": "new@test.com",
    "first_name": "New",
    "last_name": "User",
    "password": "secret123",
    "password_confirm": "secret123",
}


def test_signup_returns_201_and_sets_cookie(client):
    res = client.post("/auth/signup", json=VALID_SIGNUP)

    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == "new@test.com"
    assert body["access_token"]  # truthy = a token came back
    assert "jwt" in res.cookies


def test_login_success_returns_token(client):
    client.post("/auth/signup", json=VALID_SIGNUP)

    # OAuth2PasswordRequestForm -> send `data=`, field is `username`.
    res = client.post(
        "/auth/login",
        data={"username": "new@test.com", "password": "secret123"},
    )

    assert res.status_code == 200
    assert res.json()["access_token"]


def test_signup_duplicate_email_returns_400(client):
    client.post("/auth/signup", json=VALID_SIGNUP)
    second = client.post("auth/signup", json=VALID_SIGNUP)

    assert second.status_code == 400


def test_signup_password_mismatch_returns_422(client):
    res = client.post(
        "/auth/signup", json=dict(VALID_SIGNUP, password_confirm="different")
    )
    assert res.status_code == 422


def test_login_wrong_password_returns_401(client):
    client.post("/auth/signup", json=VALID_SIGNUP)
    res = client.post(
        "/auth/login", data={"username": "new@test.com", "password": "different"}
    )
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_signup_then_me_roundtrip(client):
    client.post("/auth/signup", json=VALID_SIGNUP)
    res = client.get("/auth/me")
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == VALID_SIGNUP["email"]

from app.utils import rate_limit


def test_increment_allows_up_to_limit(fake_redis):
    key, limit = "usage:test:2026-06-25", 3
    results = [rate_limit.increment_usage(key, limit) for _ in range(4)]
    allowed = [r[0] for r in results]
    assert allowed == [True, True, True, False]  # 3 allowed, 4th rejected


def test_ttl_set_on_first_increment(fake_redis):
    key = "usage:test:2026-06-25"
    rate_limit.increment_usage(key, 10)
    assert fake_redis.ttl(key) > 0  # expiry armed on first hit


def test_get_usage_does_not_increment(fake_redis):
    key = "usage:test:2026-06-25"
    rate_limit.increment_usage(key, 10)
    assert rate_limit.get_usage(key) == 1
    rate_limit.get_usage(key)
    assert rate_limit.get_usage(key) == 1  # read-only, never bumps

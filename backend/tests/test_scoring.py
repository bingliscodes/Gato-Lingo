"""Tests for the scoring engine: JSON parsing + the AI-call wrapper."""
from types import SimpleNamespace

import pytest

from app.services.scoring_engine import ScoringEngine, extract_json_from_markdown


# --- Tier 1: extract_json_from_markdown (pure function) ------------------

def test_plain_json_parses():
    assert extract_json_from_markdown('{"a": 1}') == {"a": 1}


def test_json_inside_markdown_fence_is_extracted():
    text = 'Sure, here is the result:\n```json\n{"a": 1, "b": 2}\n```'
    assert extract_json_from_markdown(text) == {"a": 1, "b": 2}


def test_non_json_returns_none():
    assert extract_json_from_markdown("I cannot help with that.") is None


def test_malformed_json_in_fence_returns_none():
    text = "```json\n{not: valid, json}\n```"
    assert extract_json_from_markdown(text) is None


# --- Tier 2: analyze_with_ai (Anthropic client faked at the boundary) ----

def _engine_returning(text: str) -> ScoringEngine:
    """A ScoringEngine whose Anthropic client returns `text` as the reply.

    We build the engine normally, then replace its `.client` with a fake that
    mimics just the shape analyze_with_ai uses: client.messages.create(...)
    -> response.content[0].text.
    """
    engine = ScoringEngine(api_key="test-key")  # no network call until .create
    engine.client = SimpleNamespace(
        messages=SimpleNamespace(
            create=lambda **kwargs: SimpleNamespace(
                content=[SimpleNamespace(text=text)]
            )
        )
    )
    return engine


def _turns():
    return [SimpleNamespace(speaker="student", transcript="hola, me llamo Ana")]


def test_analyze_returns_parsed_scores():
    engine = _engine_returning('{"grammar_accuracy_score": 0.9}')
    result = engine.analyze_with_ai(
        target_language="Spanish",
        conversation_turns=_turns(),
        expected_tenses=["present"],
        vocabulary=["hola"],
    )
    assert result == {"grammar_accuracy_score": 0.9}


def test_analyze_handles_markdown_fenced_reply():
    engine = _engine_returning('```json\n{"fluency_score": 0.7}\n```')
    result = engine.analyze_with_ai(
        target_language="Spanish",
        conversation_turns=_turns(),
        expected_tenses=["present"],
        vocabulary=["hola"],
    )
    assert result == {"fluency_score": 0.7}


def test_analyze_raises_when_reply_is_not_json():
    engine = _engine_returning("Sorry, I can't produce that.")
    with pytest.raises(ValueError):
        engine.analyze_with_ai(
            target_language="Spanish",
            conversation_turns=_turns(),
            expected_tenses=["present"],
            vocabulary=["hola"],
        )

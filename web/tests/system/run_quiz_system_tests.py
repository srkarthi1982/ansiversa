#!/usr/bin/env python3
"""System-level checks for the Quiz mini app data flow.

The script emulates a representative learner journey through the quiz
selection funnel (platform → subject → topic → roadmap → level) and
validates that each stage is populated with active records. It then
samples questions for the selected path and simulates a quiz attempt to
verify scoring behaviour similar to the client-side store logic.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

ROOT = Path(__file__).resolve().parents[2]
CORE_ROOT = ROOT.parent / "core"
DATA_DIR = CORE_ROOT / "db" / "quiz"


@dataclass
class LearningPath:
    platform: Dict[str, Any]
    subject: Dict[str, Any]
    topic: Dict[str, Any]
    roadmap: Dict[str, Any]
    questions: List[Dict[str, Any]]


@dataclass
class TestCaseResult:
    id: str
    title: str
    steps: Sequence[str]
    expected: str
    actual: str
    status: str


def load_json(filename: str) -> Any:
    with open(filename, "r", encoding="utf-8") as handle:
        return json.load(handle)


def find_learning_path(level: str = "E", min_questions: int = 10) -> Optional[LearningPath]:
    platforms = load_json(DATA_DIR / "platforms.json")
    subjects = load_json(DATA_DIR / "subjects.json")
    topics = load_json(DATA_DIR / "topics.json")
    roadmaps = load_json(DATA_DIR / "roadmaps.json")
    # The seed currently includes medical questions only.
    questions = load_json(DATA_DIR / "questions" / "medical.json")

    subject_by_platform: Dict[int, List[Dict[str, Any]]] = {}
    for subject in subjects:
        if subject.get("isActive"):
            subject_by_platform.setdefault(int(subject["platformId"]), []).append(subject)

    topic_by_subject: Dict[tuple[int, int], List[Dict[str, Any]]] = {}
    for topic in topics:
        if topic.get("is_active"):
            key = (int(topic["platform_id"]), int(topic["subject_id"]))
            topic_by_subject.setdefault(key, []).append(topic)

    roadmap_by_topic: Dict[tuple[int, int, int], List[Dict[str, Any]]] = {}
    for roadmap in roadmaps:
        if roadmap.get("is_active"):
            key = (
                int(roadmap["platform_id"]),
                int(roadmap["subject_id"]),
                int(roadmap["topic_id"]),
            )
            roadmap_by_topic.setdefault(key, []).append(roadmap)

    questions_by_path: Dict[tuple[int, int, int, int], List[Dict[str, Any]]] = {}
    for question in questions:
        if not question.get("is_active", True):
            continue
        question_level = str(question.get("l") or question.get("level") or "").upper()
        if level and question_level != level.upper():
            continue
        key = (
            int(question["platform_id"]),
            int(question["subject_id"]),
            int(question["topic_id"]),
            int(question.get("roadmap_id") or 0),
        )
        questions_by_path.setdefault(key, []).append(question)

    for platform in platforms:
        if not platform.get("isActive"):
            continue
        platform_id = int(platform["id"])
        for subject in subject_by_platform.get(platform_id, []):
            subject_id = int(subject["id"])
            for topic in topic_by_subject.get((platform_id, subject_id), []):
                topic_id = int(topic["id"])
                for roadmap in roadmap_by_topic.get((platform_id, subject_id, topic_id), []):
                    roadmap_id = int(roadmap["id"])
                    path_key = (platform_id, subject_id, topic_id, roadmap_id)
                    available_questions = questions_by_path.get(path_key, [])
                    if len(available_questions) >= min_questions:
                        sorted_questions = sorted(
                            available_questions,
                            key=lambda row: int(row.get("id", 0)),
                        )
                        return LearningPath(
                            platform=platform,
                            subject=subject,
                            topic=topic,
                            roadmap=roadmap,
                            questions=sorted_questions[:min_questions],
                        )
    return None


def format_entity(entity: Dict[str, Any], *, name_key: str = "name", id_key: str = "id") -> str:
    label = str(entity.get(name_key) or "").strip() or "(unnamed)"
    identifier = entity.get(id_key)
    return f"{label} (ID {identifier})"


def validate_question(question: Dict[str, Any]) -> Optional[str]:
    if "o" not in question or not isinstance(question["o"], list) or len(question["o"]) < 2:
        return "Question is missing answer options."
    options = question["o"]
    answer = question.get("a")
    try:
        answer_index = int(answer)
    except (TypeError, ValueError):
        return "Answer key is not a numeric index."
    if not 0 <= answer_index < len(options):
        return "Answer index is out of range for the provided options."
    return None


def simulate_attempt(questions: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
    responses: List[Dict[str, Any]] = []
    score = 0
    for idx, question in enumerate(questions):
        options = question["o"]
        correct_index = int(question.get("a"))
        if idx < len(questions) // 2:
            selected = correct_index
        else:
            selected = (correct_index + 1) % len(options)
        is_correct = selected == correct_index
        if is_correct:
            score += 1
        responses.append(
            {
                "question_id": int(question.get("id")),
                "selected_index": selected,
                "correct_index": correct_index,
                "is_correct": is_correct,
            }
        )
    return {"score": score, "responses": responses}


def run_tests() -> List[TestCaseResult]:
    cases: List[TestCaseResult] = []
    learning_path = find_learning_path()

    if learning_path is None:
        cases.append(
            TestCaseResult(
                id="TC-QUIZ-01",
                title="Learning path discovery",
                steps=(
                    "Load quiz catalog JSON datasets.",
                    "Search for an active platform with active subject, topic, and roadmap entries.",
                    "Confirm at least 10 'Easy' level questions exist for the selected path.",
                ),
                expected="A fully populated learning path with >=10 questions is found.",
                actual="No valid learning path could be assembled from the seed data.",
                status="FAIL",
            )
        )
        return cases

    cases.append(
        TestCaseResult(
            id="TC-QUIZ-01",
            title="Learning path discovery",
            steps=(
                "Load quiz catalog JSON datasets.",
                "Search for an active platform with active subject, topic, and roadmap entries.",
                "Confirm at least 10 'Easy' level questions exist for the selected path.",
            ),
            expected="A fully populated learning path with >=10 questions is found.",
            actual=(
                "Selected path: "
                f"{format_entity(learning_path.platform)} → "
                f"{format_entity(learning_path.subject)} → "
                f"{format_entity(learning_path.topic)} → "
                f"{format_entity(learning_path.roadmap)}"
                f" with {len(learning_path.questions)} questions."
            ),
            status="PASS",
        )
    )

    question_issues = [
        (index, validate_question(question))
        for index, question in enumerate(learning_path.questions, start=1)
    ]
    failures = [(idx, issue) for idx, issue in question_issues if issue]
    if failures:
        sample_issue = failures[0]
        actual_message = (
            f"Question {sample_issue[0]} failed validation: {sample_issue[1]}"
        )
        status = "FAIL"
    else:
        actual_message = "All sampled questions expose choices and valid answer indices."
        status = "PASS"

    cases.append(
        TestCaseResult(
            id="TC-QUIZ-02",
            title="Question payload integrity",
            steps=(
                "Inspect the 10 sampled questions for the discovered learning path.",
                "Ensure each question lists at least two answer options.",
                "Verify the stored answer key resolves to a valid option index.",
            ),
            expected="All sampled questions include options and a resolvable correct answer index.",
            actual=actual_message,
            status=status,
        )
    )

    simulation = simulate_attempt(learning_path.questions)
    score = simulation["score"]
    total = len(learning_path.questions)
    expected_score = total // 2
    status = "PASS" if score == expected_score else "FAIL"
    actual = (
        f"Simulated attempt answered {score} / {total} correctly; "
        f"expected {expected_score} correct responses."
    )

    cases.append(
        TestCaseResult(
            id="TC-QUIZ-03",
            title="Quiz attempt scoring",
            steps=(
                "Answer the first half of sampled questions with the stored correct option.",
                "Answer the remaining questions with the subsequent option to force incorrect responses.",
                "Calculate the final mark by counting exact matches.",
            ),
            expected=f"Score should equal {expected_score} when half the responses are correct.",
            actual=actual,
            status=status,
        )
    )

    return cases


def main() -> None:
    results = run_tests()
    payload = {
        "cases": [asdict(result) for result in results],
        "summary": {
            "total": len(results),
            "passed": sum(1 for result in results if result.status == "PASS"),
            "failed": sum(1 for result in results if result.status == "FAIL"),
        },
    }
    json.dump(payload, fp=sys.stdout, indent=2)
    print()


if __name__ == "__main__":
    main()

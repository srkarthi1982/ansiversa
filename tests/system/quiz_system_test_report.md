# Quiz Mini App — System Test Report

The system tests emulate a learner walking through the quiz mini app's
end-to-end flow using the seeded catalog in `db/quiz`. The Python script
[`tests/system/run_quiz_system_tests.py`](./run_quiz_system_tests.py)
performs the checks and prints machine-readable results.

## Execution Summary

```
python tests/system/run_quiz_system_tests.py
```

## Test Cases

| ID | Title | Description | Result |
| --- | --- | --- | --- |
| TC-QUIZ-01 | Learning path discovery | Confirm an active platform → subject → topic → roadmap path with ≥ 10 "Easy" questions exists in the seed data. | ✅ Pass — Medical → Medical Entrance Exams → NEET UG → Understand NEET UG Exam Pattern (10 questions) |
| TC-QUIZ-02 | Question payload integrity | Validate that each sampled question exposes ≥ 2 options and that the stored answer key maps to a valid option index. | ✅ Pass — all sampled items expose choices and resolvable answer indices |
| TC-QUIZ-03 | Quiz attempt scoring | Simulate a mixed quiz attempt (half correct, half incorrect) and ensure the computed score matches expectations. | ✅ Pass — scored 5 / 10 as expected |

## Notes

* The discovery test currently targets the medical catalog because the
  seed data focuses on medical questions (`db/quiz/questions/medical.json`).
* The scoring simulation mirrors the client-side store logic by counting
  exact matches between selected and correct option indices.

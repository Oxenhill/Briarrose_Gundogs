"use client";

import { useEffect, useState } from "react";
import {
  readProgress,
  subscribeToProgress,
  toggleLessonBookmarked,
  toggleLessonCompleted,
} from "@/lib/course-progress";

/**
 * Sits under a single unlocked lesson's content. "Mark as done" and "Save
 * for the field" are separate concepts on purpose: done tracks working
 * through the course; saved is a shortlist of lessons worth reopening
 * quickly later (a specific technique, mid-training-session, with the dog
 * right there) regardless of whether it's been "completed" yet.
 */
export function LessonProgressControls({ courseSlug, lessonKey }: { courseSlug: string; lessonKey: string }) {
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const sync = () => {
      const state = readProgress(courseSlug);
      setCompleted(state.completed.includes(lessonKey));
      setBookmarked(state.bookmarked.includes(lessonKey));
    };
    sync();
    return subscribeToProgress(courseSlug, sync);
  }, [courseSlug, lessonKey]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
      <button
        type="button"
        className="pill"
        aria-pressed={completed}
        onClick={() => toggleLessonCompleted(courseSlug, lessonKey)}
        style={completed ? { background: "var(--deep)", color: "var(--on-deep)", borderColor: "var(--deep)" } : undefined}
      >
        {completed ? "✓ Marked as done" : "Mark as done"}
      </button>
      <button
        type="button"
        className="pill"
        aria-pressed={bookmarked}
        onClick={() => toggleLessonBookmarked(courseSlug, lessonKey)}
        style={bookmarked ? { background: "var(--deep)", color: "var(--on-deep)", borderColor: "var(--deep)" } : undefined}
      >
        {bookmarked ? "★ Saved for the field" : "☆ Save for the field"}
      </button>
    </div>
  );
}

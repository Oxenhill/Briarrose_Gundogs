"use client";

import { useEffect, useMemo, useState } from "react";
import { readProgress, subscribeToProgress } from "@/lib/course-progress";

export type CourseNavLesson = { key: string; title: string; locked: boolean };
export type CourseNavModule = { key: string; title: string; lessons: CourseNavLesson[] };

/**
 * A real sidebar, not a hidden-behind-a-button menu — sits next to the
 * course content (see `.course-layout` in globals.css) and is visible the
 * whole time on desktop, the same way the booking sidebar works elsewhere
 * on the site. On narrow screens the layout stacks it below the content
 * instead of hiding it, so it's still there without needing a toggle.
 *
 * Shows a jump link to every module/lesson, a completion count, and a
 * quick-access list of anything starred with "Save for the field".
 */
export function CourseNav({ courseSlug, modules }: { courseSlug: string; modules: CourseNavModule[] }) {
  const [progress, setProgress] = useState(() => readProgress(courseSlug));

  useEffect(() => {
    const sync = () => setProgress(readProgress(courseSlug));
    sync();
    return subscribeToProgress(courseSlug, sync);
  }, [courseSlug]);

  const { totalLessons, completedCount, bookmarkedLessons } = useMemo(() => {
    const unlocked = modules.flatMap((m) => m.lessons.filter((l) => !l.locked));
    const titleByKey = new Map(unlocked.map((l) => [l.key, l.title]));
    return {
      totalLessons: unlocked.length,
      completedCount: unlocked.filter((l) => progress.completed.includes(l.key)).length,
      bookmarkedLessons: progress.bookmarked
        .filter((k) => titleByKey.has(k))
        .map((k) => ({ key: k, title: titleByKey.get(k)! })),
    };
  }, [modules, progress]);

  if (totalLessons === 0) return null;

  return (
    <aside className="course-nav" aria-label="Course navigation">
      <h4 className="course-nav-heading">Course content</h4>
      <div className="course-nav-progress">
        <div className="course-nav-progress-bar">
          <span style={{ width: `${totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0}%` }} />
        </div>
        <p>{completedCount} of {totalLessons} lessons done</p>
      </div>

      {bookmarkedLessons.length > 0 ? (
        <div className="course-nav-section">
          <h4>Saved for the field</h4>
          <ul>
            {bookmarkedLessons.map((l) => (
              <li key={l.key}>
                <a href={`#lesson-${l.key}`}>★ {l.title}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="course-nav-section">
        {modules.map((mod) => (
          <div className="course-nav-module" key={mod.key}>
            <a href={`#module-${mod.key}`}>{mod.title}</a>
            <ul>
              {mod.lessons.map((lesson) => (
                <li key={lesson.key}>
                  <a href={lesson.locked ? undefined : `#lesson-${lesson.key}`} aria-disabled={lesson.locked}>
                    {lesson.locked ? "🔒 " : progress.completed.includes(lesson.key) ? "✓ " : ""}
                    {lesson.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

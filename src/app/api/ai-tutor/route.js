import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action, lessonTitle, content, query } = await request.json();

    if (action === 'summary') {
      return NextResponse.json({
        success: true,
        result: `Key Takeaways for "${lessonTitle || 'Lesson'}":
1. Core Concepts: Essential architectural primitives designed for high efficiency and scalability.
2. Best Practices: Isolate stateful logic, minimize unnecessary DOM mutations, and leverage streaming responses.
3. Quick Revision: Remember to verify edge runtime compatibility and measure performance using standard metrics.`,
      });
    }

    if (action === 'generate_quiz') {
      return NextResponse.json({
        success: true,
        quiz: {
          question: `Regarding ${lessonTitle || 'this topic'}, which statement is the most accurate?`,
          options: [
            'It reduces client JavaScript payloads by selectively hydrating components.',
            'It requires all assets to be re-downloaded synchronously on every click.',
            'It disables all modern browser caching mechanisms completely.',
            'It only operates in single-threaded legacy environments.'
          ],
          correctIndex: 0,
          explanation: 'Selective hydration isolates interactivity, maintaining a zero-bundle baseline for non-interactive areas.'
        }
      });
    }

    // Default concept explanation
    return NextResponse.json({
      success: true,
      result: `AI Tutor Explanation for "${query || lessonTitle || 'Lesson Concept'}":
Modern development architectures focus on minimal runtime footprint and predictable state flows. By breaking down complex features into composable, testable units, you achieve higher performance and better maintainability.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI Tutor failed' },
      { status: 500 }
    );
  }
}

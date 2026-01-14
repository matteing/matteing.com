---
title: "Prose Component Test"
date: 2026-01-04T00:00:00
url: https://matteing.com/posts/prose-test
slug: prose-test
---

# Prose Component Test

This post tests every element supported by the prose component. It should be used as a visual reference to ensure consistent typography and spacing.

## Headings

The following demonstrates the heading hierarchy:

### Third Level Heading

Content under a third-level heading. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

#### Fourth Level Heading

Content under a fourth-level heading.

##### Fifth Level Heading

Content under a fifth-level heading.

###### Sixth Level Heading

Content under a sixth-level heading.

## Paragraphs and Inline Elements

This is a standard paragraph with **bold text**, _italic text_, and **_bold italic text_**. You can also use **underscores for bold** and _underscores for italics_.

Here's a paragraph with a [link to an external site](https://example.com) and some `inline code` for technical terms. You can also use <kbd>Cmd</kbd> + <kbd>K</kbd> for keyboard shortcuts.

This paragraph contains <mark>highlighted text</mark> for emphasis, along with <small>small text</small> for fine print. We also support <abbr title="HyperText Markup Language">HTML</abbr> abbreviations.

For scientific notation: H<sub>2</sub>O is water, and E = mc<sup>2</sup> is Einstein's famous equation.

---

## Blockquotes

> This is a simple blockquote. It should have a left border and be styled in italics with a secondary text color.

> "A more elaborate blockquote with a citation. Design is not just what it looks like and feels like. Design is how it works."
>
> <cite>— Steve Jobs</cite>

> Nested blockquotes are also supported:
>
> > This is a nested blockquote inside the main one.
> > It can contain multiple lines.
>
> Back to the main blockquote level.

---

## Lists

### Unordered Lists

- First item in the list
- Second item with a bit more text to see how wrapping works
- Third item
  - Nested item one
  - Nested item two
    - Deeply nested item
    - Another deeply nested item
  - Back to second level
- Fourth item

### Ordered Lists

1. First ordered item
2. Second ordered item
3. Third ordered item
   1. Nested ordered item
   2. Another nested item
4. Fourth ordered item

### Mixed Lists

1. First ordered item
   - Unordered nested item
   - Another unordered item
2. Second ordered item
   1. Ordered nested item
   2. Another ordered nested item

### Task Lists (GitHub-style)

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task

---

## Code

### Inline Code

Use `console.log()` to debug your JavaScript. The `useState` hook is essential in React.

### Code Blocks

```javascript
// JavaScript example
function greet(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}

greet("World");
```

### Code with Title

```typescript title="lib/utils.ts"
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

### Line Highlighting

```javascript {3-5}
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}
```

### Line Numbers

```python showLineNumbers
def fibonacci(n):
    """Generate Fibonacci sequence up to n."""
    a, b = 0, 1
    while a < n:
        yield a
        a, b = b, a + b

for num in fibonacci(100):
    print(num)
```

### Line Numbers Starting at Specific Number

```python showLineNumbers{42}
# This code starts at line 42
def the_answer():
    return 42
```

### Word/Character Highlighting

```javascript /greeting/
function greet(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}
```

### Multiple Word Highlighting

```jsx /useState/ /useEffect/
import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

### Grouped Highlighting by ID

```jsx /age/#v /name/#v /setAge/#s /setName/#s
const [age, setAge] = useState(50);
const [name, setName] = useState("Taylor");
```

### Code with Caption

```css caption="Basic button styling"
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: #3b82f6;
  color: white;
}

.button:hover {
  background-color: #2563eb;
}
```

### Combined Features

```tsx title="components/Counter.tsx" showLineNumbers {4,8-10}
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

---

## Images

![A placeholder image representing a scenic landscape](https://placehold.co/800x400/e7e7e7/666666?text=Landscape+Image)

Images can also have captions using figures:

<figure>
  <img src="https://placehold.co/600x300/e7e7e7/666666?text=Figure+with+Caption" alt="A placeholder demonstrating figure captions">
  <figcaption>This is a figure caption explaining the image above.</figcaption>
</figure>

A smaller inline image:

![Small placeholder](https://placehold.co/300x200/e7e7e7/666666?text=Small+Image)

---

## Tables

### Simple Table

| Name  | Role      | Location      |
| ----- | --------- | ------------- |
| Alice | Designer  | New York      |
| Bob   | Developer | San Francisco |
| Carol | Manager   | London        |

### Complex Table

| Feature       | Free Plan | Pro Plan | Enterprise |
| ------------- | :-------: | :------: | :--------: |
| Users         |     1     |    10    | Unlimited  |
| Storage       |   5 GB    |  100 GB  |    1 TB    |
| Support       |   Email   | Priority | Dedicated  |
| API Access    |    ❌     |    ✅    |     ✅     |
| Custom Domain |    ❌     |    ✅    |     ✅     |
| SSO           |    ❌     |    ❌    |     ✅     |

---

## Definition Lists

<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language, the standard markup language for documents designed to be displayed in a web browser.</dd>
  
  <dt>CSS</dt>
  <dd>Cascading Style Sheets, a style sheet language used for describing the presentation of a document written in HTML.</dd>
  
  <dt>JavaScript</dt>
  <dd>A high-level, interpreted programming language that conforms to the ECMAScript specification.</dd>
</dl>

---

## Horizontal Rules

Content before the rule.

---

Content after the rule.

---

Another style of horizontal rule (asterisks).

---

And another (underscores).

---

## Embedded Content

### Video Embed (iframe)

<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

---

## Long-form Content Test

This section tests how the prose handles longer paragraphs and content flow. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

> "The quick brown fox jumps over the lazy dog" is a pangram, a sentence that contains every letter of the alphabet at least once. It has been used to test typewriters and computer keyboards, and in other applications involving all the letters in the English alphabet.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.

### Technical Deep-dive

When implementing a feature, consider the following steps:

1. **Planning Phase**
   - Define requirements
   - Create user stories
   - Estimate complexity

2. **Development Phase**
   - Write tests first (TDD)
   - Implement the feature
   - Code review

3. **Deployment Phase**
   - Stage the changes
   - Run integration tests
   - Deploy to production

Here's the configuration you might use:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
```

And that concludes our comprehensive prose test!

---

_Last updated: January 4, 2026_

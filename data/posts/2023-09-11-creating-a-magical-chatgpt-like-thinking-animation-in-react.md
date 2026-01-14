---
title: 'Building a delightful "thinking" animation in React'
date: 2023-09-11T12:00:00
url: https://matteing.com/posts/creating-a-magical-chatgpt-like-thinking-animation-in-react
slug: creating-a-magical-chatgpt-like-thinking-animation-in-react
---

# Building a delightful "thinking" animation in React

Alright, here's the deal: I'm building a custom ChatGPT UI in React for private use, and I'd like to have it "think" like it does on the official client.

Exposing this behavior is a clever idea on OpenAI's part: it's anthropomorphism. Through adding a delay between words and a a subtle "typing" animation, the software appears a lot more "magical". It feels like the computer is doing work, it's "thinking" each response, pausing in between words like a human would. This contributes to the allure of ChatGPT: using it feels like talking to a human, because it's not instant like a computer.

However, I don't want to replicate OpenAI's animation one-to-one. I want to make it even more magical and futuristic. This is the end result:

It's surprisingly difficult to execute an animation like this in Framer Motion due to the little details that go into making it feel human:

- The cursor appearing and disappearing to indicate the "presence" of the AI
- The slow, probabilistic waits in between words
- Blinking the cursor if the "thinking" is taking longer than base timing per word

Let's dive in. The code is raw, unfiltered, and unapologetically messy. As you've come to expect from this blog™️

## Approach 1: staggerChildren

My first approach was what seemed the easiest: utilizing Framer Motion's staggerChildren to animate the entry of each word after a response. I'd also create a simple `<Cursor />` component that would handle the blinking cursor, but that's something we'll discover later.

```jsx
<motion.div
  transition={{
    staggerChildren: 0.05,
  }}
>
  {text.split("").map((character, index) => {
    return (
      <motion.span variants={characterAnimation} key={index}>
        {character}
      </motion.span>
    );
  })}{" "}
  <Cursor loading={true} />
</motion.div>
```

This approach has some benefits: there's no state management on my end, it "just works" when changing the props of a string. This seemed like the most logical first-shot approach at building an animation like this.

I created some variants in Framer Motion to create a cool "magical" animation in between each word. In particular, I'm super excited about a "blur" effect in between words: it's a subtle touch that makes everything feel more high-end.

```javascript
const characterAnimation = {
  hidden: {
    opacity: 0,
    width: "0px",
    position: "absolute",
    y: `10px`,
    filter: "blur(2px)",
  },
  visible: {
    opacity: 1,
    y: `0px`,
    position: "static",
    width: "auto",
    filter: "blur(0px)",
  },
};
```

### Problem: Why is my cursor jumping?

Immediately, I noticed a huge problem with the cursor. It seemed to be jumping in between animations, and it never "followed" the ongoing progress of the word reveal. I spent a couple hours debugging the problem:

I ended up chalking it down to a problem with Framer Motion, because even when absolutely positioning them, I couldn't figure it out. This was a total dealbreaker for this approach.

### Problem: No fine-grained animation control

A big part of what makes ChatGPT interesting is the delays in between word generation. It makes it feel as if the computer is "thinking", deliberating over the response it's handing down to you.

Using `staggerChildren`, I wouldn't be able to finely control the animations between word appearance. There's no way to set a dynamic stagger value, and that's one more total dealbreaker for this approach.

## Approach 2: Slowly add words into an array

This approach sounds a little crazy, but it felt like the next logical step.

The idea was to manage my own word rendering state.

- I'd initialize an empty array with useState called `words`. This contains all words being rendered on the screen.
- I'd slowly trickle the value of the input string prop (the response from ChatGPT) into the `words` array, at a given ms interval.
- AnimatePresence would handle the enter and exit of each word, giving me more fine-grained control over each animation.

It made sense. So I got it to a point where it's somewhat working, the animation is flawlessly moving the cursor. I managed to tweak the transitions until I got them to a point of satisfaction. I moved quickly and added probabilistic thinking: every X percent of the time it'd slow down and "think" a word through.

The resulting code looked something like this, with bits of the cursor management code sprinkled in:

```typescript
// should be a useRef
let timer: ReturnType<typeof setTimeout> | null = null;
useEffect(() => {
  const timing = randomizer([
    { value: 25, probability: 0.8 },
    { value: 50, probability: 0.15 },
    { value: 65, probability: 0.05 },
  ]);
  // do this by words, not letters
  if (index < fullText.length) {
    // manage cursor state
    setWaiting(false);
    // go word by word
    timer = setTimeout(() => {
      setChars((chars) => [...chars, fullText[index]]);
      setIndex(index + 1);
    }, timing);
    if (timing > 25) setWaiting(true);
  }
  return () => {
    if (timer !== null) clearTimeout(timer);
  };
}, [fullText, index]);

const complete = index !== fullText.length;
```

The rendering bit came naturally:

```jsx
<AnimatePresence key="parent">
  {chars.map((c, idx) => (
    <motion.span
      key={idx}
      initial="hidden"
      animate="visible"
      variants={characterAnimation}
    >
      {c}
    </motion.span>
  ))}
</AnimatePresence>{" "}
<Cursor blink={waiting} loading={index !== fullText.length} />
```

The good bits? Fine-grained animation management is a solved problem here. I could manage the whole lifecycle and even set state on every iteration. **Since new words appearing were tied to a corresponding React re-render, this was an easy approach to reason about.** (This is something that we will envy in our final approach.)

### Problem: State Management & Race Conditions

State management quickly became unwieldy. There's multiple state arrays holding the final and rendered string, `useEffect` hooks everywhere to manage state changes.

How do you manage one or more prop changes while mid-animation? What happens to the words array then? How do you manage the multiple timeouts required to control cursor, thinking and animation state?

In practice, it was a case of "death by a thousand cuts". Edge cases make managing the state for this approach incredibly time-consuming and not worth it.

Ultimately I wasn't willing to spend _that much time_ on this approach for a simple animation. There had to be another way.

## Approach 3: A component-level delay

This approach seemed promising. After some Googling, I managed to find [a CodeSandbox](https://codesandbox.io/s/framer-motion-animate-presence-stagger-children-7j0v3?file=/src/App.js:900-927) that featured an approach I didn't think of before: creating a wrapper ` component that would:

- Render null initially
- Wait `n` (a component prop) seconds
- Render the child component, triggering AnimatePresence.

This approach was brilliant. If my reasoning was right, I'd be able to finely control animation timings without `staggerChildren`, have little state management and we'd also have exit animations per element for free.

We'd create a `<Delay />` component:

```typescript
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Delay = ({ children, delay }) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(showTimer);
  });

  return <motion.span layout="size">{done ? children : null}</motion.span>;
};
```

Note the `layout="size"` on the component: this is important to make sure the cursor moves smoothly once the contents of this component render and it gains full width.

On the rendering side, we'd do something like this:

```jsx
<LayoutGroup id="cursor">
  <AnimatePresence key="parent" mode="sync">
    <motion.div
      aria-hidden="true"
      key="parent"
      initial="hidden"
      animate="visible"
    >
      {string.split(" ").map((c, idx) => {
        const probTiming = Number(randomizer(probabilities));
        const newTiming = prevTiming.current + probTiming;
        prevTiming.current = newTiming;
        return (
          <Delay key={idx} delay={newTiming}>
            <motion.span key={idx} variants={characterAnimation}>
              {c}{" "}
            </motion.span>
          </Delay>
        );
      })}
      <AnimateCursorOnWait />
    </motion.div>
  </AnimatePresence>
</LayoutGroup>
```

All Delay items are rendered _only once_ , and then their timers kick off individually. It's important to keep in mind that the parent component renders _only once_ , because this matters for the final solution.

### Problem: Only one render happens

This is the biggest drawback of this approach. This means a lot of hackery, especially around the cursor component. You might've noticed there's a separate `<AnimateCursorOnWait />` component.

Since we only render once, we need a way to hold state for the animated cursor without triggering a parent component re-render, so we isolate it into its own component.

### Problem: Animation ordering

The single render requirement is incompatible with probabilistic animation timings without a `useRef` hack. Since each item is passed a different delay prop, it's possible for all children to kick-off their timers at the same time.

Because they're not direct children of `AnimatePresence`, setting the `mode="wait"` parameter doesn't do much. In fact, thinking about it now, it's entirely possible AnimatePresence doesn't do much at all here.

```typescript
// in the component body -- triggers on each re-render
prevTiming.current = 0;
// in the render loop
const probTiming = Number(randomizer(probabilities));
const newTiming = prevTiming.current + probTiming;
prevTiming.current = newTiming;
```

This relies on the fact that all delay components render once, so we can keep track of the timing sum via a ref. If we used setState, we'd have an infinite rendering loop.

### Problem: The cursor's animations

Due to the strict requirement to prevent re-renders, we can't know within the `AnimateCursorOnWait` component if the last rendered word triggers a cursor "waiting" animation. This is crucial to make sure that the cursor component can know when to start blinking in between words.

Instead of passing the timings down via props to the cursor (which we can't do), we opt for a more clever approach. Since we're animating the cursor using Framer Motion's layout animations, is there a callback that allows us to know when layout animations start and end?

Effectively so! `onLayoutAnimationStart` and `onLayoutAnimationComplete` allow us to hook into the layout animation lifecycle. With this information, creating _all_ the animations for the cursor becomes a piece of cake with some timers.

```typescript
function AnimateCursorOnWait({ loading = false }) {
  const [waiting, setWaiting] = useState(false);
  const [finished, setFinished] = useState(false);
  const thinkingTimer = useRef();
  const finishedTimer = useRef();

  return (
    <motion.div
      className="inline-flex mb-[-1.75px] relative"
      layout="position"
      layout="position"
 animate={{ top: 1.75 }}
 transition={{
 layout: { duration: 0.15 },
 }}
 onLayoutAnimationStart={() => {
 setWaiting(false);
 if (finishedTimer.current) clearInterval(finishedTimer.current);
 }}
 onLayoutAnimationComplete={() => {
 if (thinkingTimer.current) clearInterval(thinkingTimer.current);
 if (finishedTimer.current) clearInterval(finishedTimer.current);
 thinkingTimer.current = setTimeout(
 () => setWaiting(true),
 BASE_TIMING + 10
 );
 finishedTimer.current = setTimeout(() => setFinished(true), 1500);
 }}
 >
 <Cursor blink={waiting} loading={!finished} />
 </motion.div>
 );
 }


If the cursor isn't moving for longer than `BASE_TIMING`, then we're thinking. If it isn't moving for longer than a couple of seconds, we're probably done writing.

## Conclusion

So we've managed to solve all problems with animating both the cursor and the word entry, all the little behaviors that make the product feel magical, and any transitional states between string changes.

This is a hack.

```

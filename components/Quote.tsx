'use client'

import { useState, useEffect } from "react";

const quotes = [
  // Franz Kafka
  "A book must be the axe for the frozen sea within us. – Franz Kafka",
  "I write differently from what I speak, I speak differently from what I think, I think differently from the way I ought to think, and so it all proceeds into deepest darkness. – Franz Kafka",

  // Keigo Higashino
  "The more I read, the more I know that the world is stranger than fiction. – Keigo Higashino",
  "Every mystery has a story behind it; sometimes it’s hidden in plain sight. – Keigo Higashino",

  // Agatha Christie
  "The best time for planning a book is while you’re doing the dishes. – Agatha Christie",
  "Good advice is always certain to be ignored, but that's no reason not to give it. – Agatha Christie",
  "Books, like friends, should be few and well chosen. – Agatha Christie",

  // Arthur Conan Doyle
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth. – Arthur Conan Doyle",
  "Education never ends, Watson. It is a series of lessons, with the greatest for the last. – Arthur Conan Doyle",
];

export default function Quote() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <blockquote className="border-l-4 border-neutral-500 pl-4 text-neutral-300 leading-relaxed">
      {quote}
    </blockquote>
  );
}

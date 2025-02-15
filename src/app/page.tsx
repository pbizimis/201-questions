'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import data from './data.json';

// We'll define a type for each question.
interface Question {
  id: string;
  lecture: number;
  question: string;
  choices: string[];
  correctAnswer: string | null;
  explanation: string;
}

// Props for the QuestionCard
interface QuestionCardProps {
  question: Question;
  onMarkQuestion: (id: string) => void;
  isMarked: boolean;
}

// Component to display a single question and its choices
const QuestionCard: React.FC<QuestionCardProps> = ({ question, onMarkQuestion, isMarked }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);

  const handleChoice = (choice: string) => {
    if (!showCorrect) {
      setSelectedAnswer(choice);
    }
  };

  const handleCheckAnswer = () => {
    setShowCorrect(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4"
    >
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-4">
          {/* ID in lower opacity for debugging */}
          <div className="text-gray-400 text-sm mb-1">ID: {question.id}</div>

          {/* Render question text with LaTeX support */}
          <MathJaxContext>
            <MathJax>
              <h2 className="text-xl font-semibold mb-3">{question.question}</h2>
            </MathJax>
          </MathJaxContext>

          {/* List of choices */}
          <div className="flex flex-col gap-2 mb-3">
            {question.choices.map((choice) => {
              const isCorrectChoice = choice === question.correctAnswer;
              const isSelected = choice === selectedAnswer;

              // If user has revealed the correct answer, highlight
              let bgColor = "";
              if (showCorrect) {
                if (isCorrectChoice) {
                  bgColor = "bg-green-100";
                } else if (isSelected) {
                  bgColor = "bg-red-100";
                }
              } else {
                if (isSelected) {
                  bgColor = "bg-blue-50";
                }
              }

              return (
                <button
                  key={choice}
                  className={`p-2 border rounded-lg text-left transition-colors ${bgColor}`}
                  onClick={() => handleChoice(choice)}
                >
                  <MathJaxContext>
                    <MathJax>{choice}</MathJax>
                  </MathJaxContext>
                </button>
              );
            })}
          </div>

          {/* Button to check the answer */}
          {!showCorrect && (
            <Button variant="default" onClick={handleCheckAnswer}>
              Check Answer
            </Button>
          )}

          {/* Show result if user has revealed the correct answer */}
          {showCorrect && (
            <div className="mt-3">
              {selectedAnswer === question.correctAnswer ? (
                <p className="text-green-700 font-semibold">Correct!</p>
              ) : (
                <p className="text-red-700 font-semibold">
                  Incorrect! The correct answer is: {question.correctAnswer}
                </p>
              )}

              {question.explanation && (
                <p className="text-gray-700 text-sm mt-2">Explanation: {question.explanation}</p>
              )}
            </div>
          )}
        </CardContent>

        {/* Mark question checkbox */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <Checkbox
            checked={isMarked}
            onCheckedChange={() => onMarkQuestion(question.id)}
            id={`mark-${question.id}`}
          />
          <label htmlFor={`mark-${question.id}`} className="select-none">
            Mark this question
          </label>
        </div>
      </Card>
    </motion.div>
  );
};

// Main Quiz component
export default function QuizApp() {
  const [questions, setQuestions] = useState<Question[]>(data.questions);
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [showMarkedOnly, setShowMarkedOnly] = useState(false);
  const [randomOrder, setRandomOrder] = useState(false);

  // For showing one question at a time
  const [questionIndex, setQuestionIndex] = useState(0);

  // Load marked questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("marked-questions");
    if (stored) {
      setMarkedQuestions(JSON.parse(stored));
    }
  }, []);

  // Save marked questions to localStorage
  useEffect(() => {
    localStorage.setItem("marked-questions", JSON.stringify(markedQuestions));
  }, [markedQuestions]);

  // Shuffle or restore order
  useEffect(() => {
    if (randomOrder) {
      const shuffled = [...data.questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQuestions(shuffled);
    } else {
      setQuestions(data.questions);
    }
  }, [randomOrder]);

  // Filter if showMarkedOnly is on
  const displayedQuestions = showMarkedOnly
    ? questions.filter((q) => markedQuestions.includes(q.id))
    : questions;

  // Ensure questionIndex is valid. If out of range, set to 0.
  useEffect(() => {
    if (questionIndex >= displayedQuestions.length) {
      setQuestionIndex(0);
    }
  }, [displayedQuestions, questionIndex]);

  const handleMarkQuestion = (id: string) => {
    setMarkedQuestions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleNext = () => {
    if (questionIndex < displayedQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const resetMarked = () => {
    setMarkedQuestions([]);
  };

  // New function to reset the quiz state
  const resetQuiz = () => {
    setQuestions(data.questions);
    setMarkedQuestions([]);
    setShowMarkedOnly(false);
    setRandomOrder(false);
    setQuestionIndex(0);
  };

  // If the code is not clear, we'd like to ask:
  // "What should the UI do if no questions are available or the index is invalid?"

  return (
    <MathJaxContext>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">LaTeX Quiz</h1>

        {/* Controls for marked only, random order, and new reset quiz button */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowMarkedOnly(!showMarkedOnly);
            }}
          >
            {showMarkedOnly ? "Show All" : "Show Marked Only"}
          </Button>

          {showMarkedOnly && (
            <Button variant="destructive" onClick={resetMarked}>
              Reset Marked
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              checked={randomOrder}
              onCheckedChange={() => setRandomOrder(!randomOrder)}
              id="random-order"
            />
            <label htmlFor="random-order">Random Order</label>
          </div>

          {/* New Reset Quiz Button */}
          <Button variant="outline" onClick={resetQuiz}>
            Reset Quiz
          </Button>
        </div>

        {displayedQuestions.length === 0 && (
          <p>No questions to display.</p>
        )}

        {/* Only render the QuestionCard if we have a valid question */}
        {displayedQuestions.length > 0 && questionIndex < displayedQuestions.length && (
          <QuestionCard
            key={displayedQuestions[questionIndex].id}
            question={displayedQuestions[questionIndex]}
            isMarked={markedQuestions.includes(displayedQuestions[questionIndex].id)}
            onMarkQuestion={handleMarkQuestion}
          />
        )}

        {/* Prev / Next buttons plus question count */}
        <div className="flex gap-2 mt-4 items-center">
          <Button variant="outline" onClick={handlePrev} disabled={questionIndex === 0}>
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={questionIndex === displayedQuestions.length - 1}
          >
            Next
          </Button>
          {displayedQuestions.length > 0 && (
            <span className="text-sm text-gray-600">
              Question {questionIndex + 1} / {displayedQuestions.length}
            </span>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}

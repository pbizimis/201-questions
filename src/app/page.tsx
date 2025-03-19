"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import data from "./data.json";

// We'll define a type for each question.
interface Question {
    id: string;
    lecture: number;
    question: string;
    choices: string[];
    correctAnswer: string | null;
    explanation: string;
    description?: string; // optional field
}

// Props for the QuestionCard
interface QuestionCardProps {
    question: Question;
    onMarkQuestion: (id: string) => void;
    isMarked: boolean;
    hideAnswers: boolean;
    onRevealAnswers: () => void;
    darkMode: boolean;
}

// A quick test suite for our data.
function runBasicTests() {
    console.log("Running Basic Tests...");
    // Test 1: data should have at least one question.
    if (data.questions.length === 0) {
        console.error("Test 1 FAILED: No questions found in data.");
    } else {
        console.log("Test 1 PASSED: Found questions in data.");
    }

    // Test 2: first question has a valid correctAnswer.
    const firstQ = data.questions[0];
    if (!firstQ.correctAnswer || !firstQ.choices.includes(firstQ.correctAnswer)) {
        console.error(
            "Test 2 FAILED: The first question's correctAnswer is invalid.",
        );
    } else {
        console.log("Test 2 PASSED: The first question's correctAnswer is valid.");
    }

    // Test 3: Check if at least one question includes an optional description.
    const hasDescription = data.questions.some((q) => q.description);
    if (hasDescription) {
        console.log("Test 3 PASSED: Found question(s) with optional description.");
    } else {
        console.log("Test 3 NOTE: No question has a description.");
    }
}

// Component to display a single question and its choices
const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    onMarkQuestion,
    isMarked,
    hideAnswers,
    onRevealAnswers,
    darkMode,
}) => {
    // Track which answer was chosen
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    // Show/hide correctness display
    const [showCorrect, setShowCorrect] = useState(false);
    // Local toggle for revealing choices if global hideAnswers is on
    const [localAnswersShown, setLocalAnswersShown] = useState(false);

    // For the description overlay
    const [showDescriptionOverlay, setShowDescriptionOverlay] = useState(false);

    const handleChoice = (choice: string) => {
        if (!showCorrect) {
            setSelectedAnswer(choice);
        }
    };

    const handleCheckAnswer = () => {
        setShowCorrect(true);
    };

    // If we are hiding answers globally, user must press a local "Show Answers" to see them
    const choicesVisible = !hideAnswers || localAnswersShown;

    // Helper to unify button styling
    const buttonCommon = `transition-colors duration-300 rounded-md px-3 py-1`;
    const buttonStyles = darkMode
        ? `border border-gray-500 text-gray-100 hover:bg-gray-700`
        : `border border-gray-400 text-black hover:bg-gray-200`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
        >
            <Card
                className={`relative shadow-lg rounded-2xl transition-colors duration-300
          ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"}`}
            >
                <CardContent className="p-4">
                    {/* ID in lower opacity for debugging */}
                    <div className="text-gray-400 text-sm mb-1">ID: {question.id}</div>

                    <MathJaxContext>
                        <MathJax>
                            <h2 className="text-xl font-semibold mb-3">
                                {question.question}
                            </h2>
                        </MathJax>
                    </MathJaxContext>

                    {/* If description is present, show a button to open an overlay */}
                    {question.description && (
                        <button
                            onClick={() => setShowDescriptionOverlay(true)}
                            className={`${buttonCommon} ${buttonStyles} mb-3`}
                        >
                            Show Description
                        </button>
                    )}

                    {/* The overlay for the description, only if present and triggered */}
                    {question.description && showDescriptionOverlay && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                            onClick={() => setShowDescriptionOverlay(false)}
                        >
                            <div
                                className={`p-4 rounded-lg shadow-lg max-w-md w-full mx-2 relative
                  transition-colors duration-300
                  ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-bold mb-2">Description</h3>
                                <p className="mb-4">{question.description}</p>
                                <button
                                    className={`${buttonCommon} ${buttonStyles}`}
                                    onClick={() => setShowDescriptionOverlay(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Choices (hidden if hideAnswers is active and user hasn't revealed them) */}
                    {choicesVisible && (
                        <div className="flex flex-col gap-2 mb-3">
                            {question.choices.map((choice) => {
                                const isCorrectChoice = choice === question.correctAnswer;
                                const isSelected = choice === selectedAnswer;

                                let bgColor = "";
                                if (showCorrect) {
                                    if (isCorrectChoice) {
                                        bgColor = darkMode ? "bg-green-900" : "bg-green-100";
                                    } else if (isSelected) {
                                        bgColor = darkMode ? "bg-red-900" : "bg-red-100";
                                    }
                                } else {
                                    if (isSelected) {
                                        bgColor = darkMode ? "bg-blue-900" : "bg-blue-50";
                                    }
                                }

                                return (
                                    <button
                                        key={choice}
                                        className={`p-2 rounded-lg text-left transition-colors duration-300
                      ${darkMode ? "border border-gray-600 text-gray-100" : "border border-gray-300 text-black"}
                      ${bgColor}`}
                                        onClick={() => handleChoice(choice)}
                                    >
                                        <MathJaxContext>
                                            <MathJax>{choice}</MathJax>
                                        </MathJaxContext>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* If hiding, provide a local toggle button */}
                    {hideAnswers && !localAnswersShown && (
                        <button
                            onClick={() => {
                                setLocalAnswersShown(true);
                                onRevealAnswers();
                            }}
                            className={`${buttonCommon} ${buttonStyles}`}
                        >
                            Show Answers
                        </button>
                    )}

                    {/* Button to check the answer, only if choices are visible and not yet shown as correct/incorrect */}
                    {!showCorrect && choicesVisible && (
                        <button
                            onClick={handleCheckAnswer}
                            className={`${buttonCommon} ${buttonStyles} ml-2`}
                        >
                            Check Answer
                        </button>
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
                                <p className="text-gray-700 text-sm mt-2">
                                    className=
                                    {`text-sm mt-2 ${darkMode ? "text-white" : "text-black"}`}
                                    Explanation: {question.explanation}
                                </p>
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
                        className="bg-white"
                    />
                    <label htmlFor={`mark-${question.id}`} className="select-none">
                        Mark this question
                    </label>
                </div>
            </Card>
        </motion.div>
    );
};

export default function QuizApp() {
    // Use the data instead of an imported JSON file
    const [questions, setQuestions] = useState<Question[]>(data.questions);
    const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
    const [showMarkedOnly, setShowMarkedOnly] = useState(false);
    const [randomOrder, setRandomOrder] = useState(false);

    // For showing one question at a time
    const [questionIndex, setQuestionIndex] = useState(0);

    // For globally hiding answers
    const [hideAnswers, setHideAnswers] = useState(false);

    // For day/night mode
    const [darkMode, setDarkMode] = useState(false);

    // Run basic tests on mount
    useEffect(() => {
        runBasicTests();
    }, []);

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

    // Reset the quiz state
    const resetQuiz = () => {
        setQuestions(data.questions);
        setMarkedQuestions([]);
        setShowMarkedOnly(false);
        setRandomOrder(false);
        setQuestionIndex(0);
        setHideAnswers(false);
    };

    // Collect all unique lecture numbers from the displayedQuestions
    const lectureNumbers = Array.from(
        new Set(displayedQuestions.map((q) => q.lecture)),
    ).sort((a, b) => a - b);

    // Jump to first question of a given lecture (in the displayedQuestions)
    const jumpToLecture = (lecture: number) => {
        const idx = displayedQuestions.findIndex((q) => q.lecture === lecture);
        if (idx !== -1) {
            setQuestionIndex(idx);
        }
    };

    // Called whenever we reveal answers for a question
    const onRevealAnswers = () => {
        // placeholder if we need global logic
    };

    // Helper to unify styling for our top-level buttons
    const buttonCommon = `transition-colors duration-300 rounded-md px-3 py-1`;
    const buttonStyles = darkMode
        ? `border border-gray-500 text-gray-100 hover:bg-gray-700`
        : `border border-gray-600 text-black hover:bg-gray-200`;

    return (
        <MathJaxContext>
            {/* This container fills the entire viewport with background color */}
            <div
                className={`min-h-screen w-full transition-colors duration-300
          ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-black"}`}
            >
                {/* Centered content container */}
                <div className="max-w-4xl mx-auto p-4">
                    <h1 className="text-3xl font-bold mb-4">201 Final Preparation</h1>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        {/* Lecture buttons on the left of the question box */}
                        <div
                            className={`border p-3 rounded-lg transition-colors duration-300
                ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}
                        >
                            <h2 className="font-bold mb-2">Lectures</h2>
                            <div className="flex flex-col gap-2">
                                {lectureNumbers.map((lec, idx) => (
                                    <button
                                        key={lec}
                                        onClick={() => jumpToLecture(lec)}
                                        className={`${buttonCommon} ${buttonStyles}`}
                                    >
                                        {idx + 1} {lec}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1">
                            {/* Controls row */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <button
                                    onClick={() => setShowMarkedOnly(!showMarkedOnly)}
                                    className={`${buttonCommon} ${buttonStyles}`}
                                >
                                    {showMarkedOnly ? "Show All" : "Show Marked Only"}
                                </button>

                                {showMarkedOnly && (
                                    <button
                                        onClick={resetMarked}
                                        className={`${buttonCommon} ${darkMode ? "border border-red-500 text-red-300 hover:bg-red-900" : "border border-red-600 text-red-600 hover:bg-red-100"}`}
                                    >
                                        Reset Marked
                                    </button>
                                )}

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={randomOrder}
                                        onCheckedChange={() => setRandomOrder(!randomOrder)}
                                        id="random-order"
                                        className="bg-white"
                                    />
                                    <label htmlFor="random-order">Random Order</label>
                                </div>

                                {/* Hide/Show answers globally */}
                                <button
                                    onClick={() => setHideAnswers((prev) => !prev)}
                                    className={`${buttonCommon} ${buttonStyles}`}
                                >
                                    {hideAnswers ? "Disable Hide Answers" : "Hide Answers"}
                                </button>

                                <button
                                    onClick={resetQuiz}
                                    className={`${buttonCommon} ${buttonStyles}`}
                                >
                                    Reset Quiz
                                </button>

                                {/* Day/Night mode toggle */}
                                <button
                                    onClick={() => setDarkMode((prev) => !prev)}
                                    className={`${buttonCommon} ${buttonStyles}`}
                                >
                                    {darkMode ? "Day Mode" : "Night Mode"}
                                </button>
                            </div>

                            {/* If no questions are displayed */}
                            {displayedQuestions.length === 0 && (
                                <p>No questions to display.</p>
                            )}

                            {/* Only render the QuestionCard if we have a valid question */}
                            {displayedQuestions.length > 0 &&
                                questionIndex < displayedQuestions.length && (
                                    <QuestionCard
                                        key={`q-${questionIndex}-${hideAnswers}-${darkMode}`}
                                        question={displayedQuestions[questionIndex]}
                                        isMarked={markedQuestions.includes(
                                            displayedQuestions[questionIndex].id,
                                        )}
                                        onMarkQuestion={handleMarkQuestion}
                                        hideAnswers={hideAnswers}
                                        onRevealAnswers={onRevealAnswers}
                                        darkMode={darkMode}
                                    />
                                )}

                            {/* Prev / Next buttons plus question count */}
                            <div className="flex gap-2 mt-4 items-center">
                                <button
                                    onClick={handlePrev}
                                    disabled={questionIndex === 0}
                                    className={`${buttonCommon} ${buttonStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={questionIndex === displayedQuestions.length - 1}
                                    className={`${buttonCommon} ${buttonStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Next
                                </button>
                                {displayedQuestions.length > 0 && (
                                    <span className="text-sm text-gray-600">
                                        Question {questionIndex + 1} / {displayedQuestions.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MathJaxContext>
    );
}

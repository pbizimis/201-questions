"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4"
        >
            <Card className="relative shadow-lg rounded-2xl">
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
                        <Button
                            variant="outline"
                            onClick={() => setShowDescriptionOverlay(true)}
                            className="mb-3"
                        >
                            Show Description
                        </Button>
                    )}

                    {/* The overlay for the description, only if present and triggered */}
                    {question.description && showDescriptionOverlay && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mx-2">
                                <h3 className="text-lg font-bold mb-2">Description</h3>
                                <p className="mb-4">{question.description}</p>
                                <Button
                                    variant="default"
                                    onClick={() => setShowDescriptionOverlay(false)}
                                >
                                    Close
                                </Button>
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
                    )}

                    {/* If hiding, provide a local toggle button */}
                    {hideAnswers && !localAnswersShown && (
                        <Button
                            variant="default"
                            onClick={() => {
                                setLocalAnswersShown(true);
                                onRevealAnswers();
                            }}
                        >
                            Show Answers
                        </Button>
                    )}

                    {/* Button to check the answer, only if choices are visible and not yet shown as correct/incorrect */}
                    {!showCorrect && choicesVisible && (
                        <Button
                            variant="default"
                            onClick={handleCheckAnswer}
                            className="ml-2"
                        >
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
                                <p className="text-gray-700 text-sm mt-2">
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

    return (
        <MathJaxContext>
            <div className="p-4 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">201 Quiz</h1>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Lecture buttons on the left of the question box */}
                    <div className="border p-3 rounded-lg bg-gray-100">
                        <h2 className="font-bold mb-2">Lectures</h2>
                        <div className="flex flex-col gap-2">
                            {lectureNumbers.map((lec) => (
                                <Button
                                    key={lec}
                                    variant="outline"
                                    onClick={() => jumpToLecture(lec)}
                                >
                                    Lecture {lec}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1">
                        {/* Controls row */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
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

                            {/* Hide/Show answers globally */}
                            <Button
                                variant="outline"
                                onClick={() => setHideAnswers((prev) => !prev)}
                            >
                                {hideAnswers ? "Disable Hide Answers" : "Hide Answers"}
                            </Button>

                            <Button variant="outline" onClick={resetQuiz}>
                                Reset Quiz
                            </Button>
                        </div>

                        {/* If no questions are displayed */}
                        {displayedQuestions.length === 0 && <p>No questions to display.</p>}

                        {/* Only render the QuestionCard if we have a valid question */}
                        {displayedQuestions.length > 0 &&
                            questionIndex < displayedQuestions.length && (
                                <QuestionCard
                                    key={`q-${questionIndex}-${hideAnswers}`}
                                    question={displayedQuestions[questionIndex]}
                                    isMarked={markedQuestions.includes(
                                        displayedQuestions[questionIndex].id,
                                    )}
                                    onMarkQuestion={handleMarkQuestion}
                                    hideAnswers={hideAnswers}
                                    onRevealAnswers={onRevealAnswers}
                                />
                            )}

                        {/* Prev / Next buttons plus question count */}
                        <div className="flex gap-2 mt-4 items-center">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={questionIndex === 0}
                            >
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
                </div>
            </div>
        </MathJaxContext>
    );
}

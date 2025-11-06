import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import axiosClient from '../utils/axiosClient';

function ProblemPage() {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [solutions, setSolutions] = useState([]);
    const [selectedSolution, setSelectedSolution] = useState(null);
    const editorRef = useRef(null);
    let { problemId } = useParams();

    const { handleSubmit, register, watch } = useForm();
    const customTestCaseInput = watch('customTestCase');

    // Default STARTER code templates for different languages
    const starterCode = {
        javascript: `/**
* @param {any} input
* @return {any}
*/
function solve(input) {
    // Your code here
    return input;
}`,
        python: `class Solution:
    def solve(self, input):
        # Your code here
        return input`,
        java: `class Solution {
    public Object solve(Object input) {
        // Your code here
        return input;
    }
}`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Your code here
};`,
        c: `#include <stdio.h>

// Your code here`
    };

    // Fetch problem data - ONLY LOAD STARTER CODE
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
                setProblem(data);
                
                // ALWAYS load starter code, never solution
                const initialCode = getStarterCode(data, selectedLanguage);
                setCode(initialCode);
                
                // Load solutions separately (just for display)
                loadSolutions(data);
            } catch (error) {
                console.error('Error fetching problem:', error);
            } finally {
                setLoading(false);
            }
        };

        if (problemId) {
            fetchProblem();
        }
    }, [problemId]);

    // Helper function to get starter code
    const getStarterCode = (problemData, language) => {
        // First try to get from problem.startCode
        const problemStarterCode = problemData.startCode?.find(sc => 
            sc.language?.toLowerCase() === language.toLowerCase()
        )?.initialCode;
        
        // If not found, use default starter code
        return problemStarterCode || starterCode[language] || starterCode.javascript;
    };

    // Load solutions from problem data (just for display, not for editor)
    const loadSolutions = (problemData) => {
        if (problemData.refrenceSolution && problemData.refrenceSolution.length > 0) {
            setSolutions(problemData.refrenceSolution);
        } else {
            // Fallback solutions if none provided
            const fallbackSolutions = [
                {
                    language: 'JavaScript',
                    completeCode: `// Optimal Solution
function solve(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
                    explanation: 'Time: O(n), Space: O(n) - Efficient hash map solution'
                },
                {
                    language: 'Python',
                    completeCode: `# Optimal Solution
class Solution:
    def solve(self, nums, target):
        hash_map = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hash_map:
                return [hash_map[complement], i]
            hash_map[num] = i
        return []`,
                    explanation: 'Time: O(n), Space: O(n) - Single pass solution'
                }
            ];
            setSolutions(fallbackSolutions);
        }
    };

    // FIXED: Update code when language changes - ONLY LOAD STARTER CODE
    useEffect(() => {
        if (problem && selectedLanguage) {
            const starter = getStarterCode(problem, selectedLanguage);
            setCode(starter);
        }
    }, [selectedLanguage, problem]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.updateOptions({
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
        });
    };

    // Load solution into editor - but don't interfere with language changes
    const loadSolutionIntoEditor = (solution) => {
        setSelectedSolution(solution);
        setCode(solution.completeCode);
    };

    // Reset to starter code
    const resetToStarterCode = () => {
        const starter = getStarterCode(problem, selectedLanguage);
        setCode(starter);
        setSelectedSolution(null);
    };

    // Real API call for running code
    const handleRunCode = async () => {
        if (!editorRef.current) return;

        setIsRunning(true);
        setRunResult(null);
        
        try {
            const currentCode = editorRef.current.getValue().trim();
            
            // Basic validation
            if (!currentCode || isEmptyCode(currentCode, selectedLanguage)) {
                setRunResult({
                    status: 'error',
                    message: 'Please write actual code before running.'
                });
                setActiveRightTab('result');
                setIsRunning(false);
                return;
            }

            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code: currentCode,
                language: selectedLanguage,
                customTestCase: customTestCaseInput || null
            });

            setRunResult(response.data);
            setActiveRightTab('result');
            
        } catch (error) {
            console.error('Run code error:', error);
            setRunResult({
                status: 'error',
                message: 'Runtime Error',
                error: error.response?.data?.message || error.message
            });
            setActiveRightTab('result');
        } finally {
            setIsRunning(false);
        }
    };

    // Real API call for submitting code
    const handleSubmitCode = async () => {
        if (!editorRef.current) return;

        setIsSubmitting(true);
        setSubmitResult(null);
        
        try {
            const currentCode = editorRef.current.getValue().trim();
            
            // Basic validation
            if (!currentCode || isEmptyCode(currentCode, selectedLanguage)) {
                setSubmitResult({
                    status: 'error',
                    message: 'Please write actual code before submitting.'
                });
                setActiveRightTab('result');
                setIsSubmitting(false);
                return;
            }

            const response = await axiosClient.post(`/submission/submit/${problemId}`, {
                code: currentCode,
                language: selectedLanguage
            });

            setSubmitResult(response.data);
            setActiveRightTab('result');
            
        } catch (error) {
            console.error('Submit code error:', error);
            setSubmitResult({
                status: 'error',
                message: 'Submission Failed',
                error: error.response?.data?.message || error.message
            });
            setActiveRightTab('result');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCustomTestCaseRun = () => {
        if (!customTestCaseInput) return;
        handleRunCode();
    };

    // Helper function to check if code is empty/default
    const isEmptyCode = (code, language) => {
        const emptyPatterns = {
            javascript: ['// Your code here', 'function solve', '// some comment'],
            python: ['# Your code here', 'def solve', '# some comment'],
            java: ['// Your code here', 'public Object solve', '// some comment'],
            cpp: ['// Your code here', '// Your code here', '// some comment'],
            c: ['// Your code here', '// Your code here', '// some comment']
        };
        
        const patterns = emptyPatterns[language] || [];
        return patterns.some(pattern => code.includes(pattern)) || code.trim().length < 20;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Problem Not Found</h2>
                    <p className="text-gray-600">The problem you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <span className={`badge ${
                                problem.difficulty === 'easy' ? 'badge-success' : 
                                problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                            }`}>
                                {problem.difficulty}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Panel - Problem Description */}
                <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
                    <div className="border-b border-gray-200 bg-white">
                        <div className="flex space-x-1 px-6 bg-white">
                            {['description', 'solutions', 'editorial', 'submissions'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveLeftTab(tab)}
                                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                        activeLeftTab === tab
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-white">
                        {activeLeftTab === 'description' && (
                            <div className="space-y-6">
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4 text-gray-900">Description</h2>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {problem.description || 'No description available.'}
                                    </div>
                                </div>

                                {/* Examples */}
                                {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
                                        {problem.visibleTestCases.map((testCase, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="mb-3 text-gray-900">
                                                    <strong>Example {index + 1}:</strong>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <strong className="text-gray-900">Input:</strong>
                                                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-1 text-sm overflow-x-auto">
                                                            {testCase.input}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <strong className="text-gray-900">Output:</strong>
                                                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-1 text-sm overflow-x-auto">
                                                            {testCase.output}
                                                        </pre>
                                                    </div>
                                                    {testCase.explanation && (
                                                        <div>
                                                            <strong className="text-gray-900">Explanation:</strong>
                                                            <p className="text-gray-700 mt-1">{testCase.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Constraints */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Constraints</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>2 ≤ nums.length ≤ 10⁴</li>
                                        <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                                        <li>-10⁹ ≤ target ≤ 10⁹</li>
                                        <li>Only one valid answer exists</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeLeftTab === 'solutions' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Solutions</h2>
                                
                                {solutions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No solutions available for this problem yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Solution Tabs */}
                                        <div className="flex space-x-2 overflow-x-auto pb-2">
                                            {solutions.map((solution, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedSolution(solution)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        selectedSolution === solution
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {solution.language}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Selected Solution */}
                                        {selectedSolution && (
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-blue-800 mb-2">Solution Explanation</h4>
                                                    <p className="text-blue-700">{selectedSolution.explanation || 'No explanation provided.'}</p>
                                                </div>

                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <div className="bg-gray-800 px-4 py-2">
                                                        <span className="text-gray-300 text-sm">{selectedSolution.language} Solution</span>
                                                    </div>
                                                    <pre className="bg-gray-900 text-green-400 p-4 text-sm overflow-x-auto max-h-96">
                                                        {selectedSolution.completeCode}
                                                    </pre>
                                                </div>

                                                <button
                                                    onClick={() => loadSolutionIntoEditor(selectedSolution)}
                                                    className="btn btn-primary w-full"
                                                >
                                                    Load This Solution in Editor
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeLeftTab === 'editorial' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Editorial</h2>
                                <div className="prose max-w-none text-gray-700">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800">
                                            <strong>Coming soon!</strong> Our team is working on detailed editorials.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeLeftTab === 'submissions' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Submissions</h2>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                    <p className="text-gray-600">Your submission history will appear here after you submit solutions.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="w-1/2 flex flex-col bg-white border-l border-gray-200">
                    {/* Code Editor Header */}
                    <div className="border-b border-gray-200 px-6 py-3 bg-white">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="select select-bordered select-sm bg-white text-gray-900"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                </select>
                                <div className="text-sm text-gray-600">
                                    Language: {selectedLanguage}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    className="btn btn-ghost btn-sm text-gray-700"
                                    onClick={resetToStarterCode}
                                >
                                    ⎘ Reset to Starter Code
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={selectedLanguage}
                            value={code}
                            onMount={handleEditorDidMount}
                            onChange={(value) => setCode(value)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                insertSpaces: true,
                            }}
                        />
                    </div>

                    {/* Bottom Panel */}
                    <div className="border-t border-gray-200 bg-white">
                        {/* Tabs */}
                        <div className="border-b border-gray-200 bg-white">
                            <div className="flex space-x-1 px-6 bg-white">
                                {['code', 'testcases', 'result'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveRightTab(tab)}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                            activeRightTab === tab
                                                ? 'border-blue-500 text-blue-600 bg-blue-50'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 bg-white max-h-64 overflow-y-auto">
                            {activeRightTab === 'testcases' && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900">Test Cases</h3>
                                    <div className="space-y-3">
                                        {problem.visibleTestCases?.map((testCase, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <div className="text-sm font-medium text-gray-900">Case {index + 1}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Input: {testCase.input}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Output: {testCase.output}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-2 text-gray-900">Custom Test Case</h4>
                                        <textarea
                                            {...register('customTestCase')}
                                            placeholder="Enter your custom test case input..."
                                            className="textarea textarea-bordered w-full h-20 text-gray-900 bg-white"
                                        />
                                        <button
                                            onClick={handleCustomTestCaseRun}
                                            className="btn btn-outline btn-sm mt-2 text-gray-700"
                                        >
                                            Run Custom Test Case
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeRightTab === 'result' && (
                                <div className="space-y-4">
                                    {runResult && (
                                        <div className={`p-4 rounded-lg border ${
                                            runResult.status === 'success' ? 'bg-green-50 border-green-200' :
                                            runResult.status === 'error' ? 'bg-red-50 border-red-200' :
                                            'bg-yellow-50 border-yellow-200'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <h3 className={`font-semibold ${
                                                    runResult.status === 'success' ? 'text-green-800' :
                                                    runResult.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                                                }`}>
                                                    {runResult.status === 'success' ? '✅ Test Results' : '❌ Error'}
                                                </h3>
                                                {runResult.executionTime && (
                                                    <span className="text-sm text-gray-600">
                                                        Time: {runResult.executionTime}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`mt-2 ${
                                                runResult.status === 'success' ? 'text-green-700' :
                                                runResult.status === 'error' ? 'text-red-700' : 'text-yellow-700'
                                            }`}>
                                                {runResult.message}
                                            </p>
                                        </div>
                                    )}

                                    {submitResult && (
                                        <div className={`p-4 rounded-lg border ${
                                            submitResult.status === 'accepted' ? 'bg-green-50 border-green-200' :
                                            'bg-red-50 border-red-200'
                                        }`}>
                                            <h3 className={`font-semibold text-lg ${
                                                submitResult.status === 'accepted' ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {submitResult.status === 'accepted' ? '🎉 Accepted' : '❌ Wrong Answer'}
                                            </h3>
                                            <p className={`mt-2 ${
                                                submitResult.status === 'accepted' ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                                {submitResult.message}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeRightTab === 'code' && (
                                <div className="text-center text-gray-500 py-8">
                                    <p>Write your solution in the code editor above</p>
                                    <p className="text-sm mt-1">Click "Run" to test your code or "Submit" when you're ready</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    {isRunning ? 'Running...' : isSubmitting ? 'Submitting...' : 'Ready'}
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleRunCode}
                                        disabled={isRunning || isSubmitting}
                                        className="btn btn-outline btn-primary"
                                    >
                                        {isRunning ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Running...
                                            </>
                                        ) : (
                                            '▶️ Run'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSubmitCode}
                                        disabled={isRunning || isSubmitting}
                                        className="btn btn-primary bg-linear-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            '📤 Submit'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemPage;
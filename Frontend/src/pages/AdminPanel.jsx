import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";
import { useState } from "react";

// zod schema matching the problem schema
const problemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.enum(['array', 'linked list', 'graph', 'dp', 'string', 'tree', 'binary search']),
    visibleTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required'),
            explanation: z.string().min(1, 'Explanation is required')
        })
    ).min(1, 'At least one visible test case required'),
    hiddenTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required')
        })
    ).min(1, 'At least one hidden test case required'),
    startCode: z.array(
        z.object({
            language: z.enum(['C++', 'Java', 'JavaScript', 'C', 'Python']),
            initialCode: z.string().min(1, 'Initial code is required')
        })
    ).min(1, 'At least one language template required')
});

function AdminPanel() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');

    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            visibleTestCases: [{ input: '', output: '', explanation: '' }],
            hiddenTestCases: [{ input: '', output: '' }],
            startCode: [
                { language: 'C++', initialCode: '// C++ starter code\n#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Your solution here\n};' },
                { language: 'Java', initialCode: '// Java starter code\nclass Solution {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}' },
                { language: 'JavaScript', initialCode: '// JavaScript starter code\n/**\n * @param {*} input\n * @return {*}\n */\nfunction solve(input) {\n    // Your solution here\n};' },
                { language: 'Python', initialCode: '# Python starter code\nclass Solution:\n    def solve(self, input):\n        # Your solution here\n        pass' },
                { language: 'C', initialCode: '// C starter code\n#include <stdio.h>\n\n// Your solution here' }
            ]
        }
    });

    const {
        fields: visibleFields,
        append: appendVisible,
        remove: removeVisible
    } = useFieldArray({
        control,
        name: 'visibleTestCases'
    });

    const {
        fields: hiddenFields,
        append: appendHidden,
        remove: removeHidden
    } = useFieldArray({
        control,
        name: 'hiddenTestCases'
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await axiosClient.post('/problem/create', data);
            alert('🎉 Problem created successfully!');
            navigate('/');
        } catch (error) {
            alert(`❌ Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sectionButtons = [
        { id: 'basic', label: '📝 Basic Info', icon: '📝' },
        { id: 'test-cases', label: '🧪 Test Cases', icon: '🧪' },
        { id: 'code', label: '💻 Code Templates', icon: '💻' }
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Create New Problem
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Design and build coding challenges for your platform
                    </p>
                </div>

                {/* Progress Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-2 flex space-x-2">
                        {sectionButtons.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                                    activeSection === section.id
                                        ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                <span>{section.icon}</span>
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information Section */}
                    {activeSection === 'basic' && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-2xl">📝</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                                    <p className="text-gray-600">Define the problem title, description and metadata</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 text-lg">Problem Title</span>
                                    </label>
                                    <input
                                        {...register('title')}
                                        className={`input input-bordered input-lg w-full transition-all duration-300 ${
                                            errors.title ? 'input-error border-2' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                        }`}
                                        placeholder="e.g., Two Sum, Reverse Linked List..."
                                    />
                                    {errors.title && (
                                        <span className="text-error font-medium mt-2 flex items-center">
                                            <span className="mr-2">⚠️</span>
                                            {errors.title.message}
                                        </span>
                                    )}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 text-lg">Problem Description</span>
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        className={`textarea textarea-bordered w-full h-48 transition-all duration-300 ${
                                            errors.description ? 'textarea-error border-2' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                        }`}
                                        placeholder="Describe the problem statement, constraints, and examples..."
                                    />
                                    {errors.description && (
                                        <span className="text-error font-medium mt-2 flex items-center">
                                            <span className="mr-2">⚠️</span>
                                            {errors.description.message}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700 text-lg">Difficulty Level</span>
                                        </label>
                                        <select
                                            {...register('difficulty')}
                                            className={`select select-bordered w-full transition-all duration-300 ${
                                                errors.difficulty ? 'select-error border-2' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                            }`}
                                        >
                                            <option value="easy">🎯 Easy</option>
                                            <option value="medium">⚡ Medium</option>
                                            <option value="hard">💀 Hard</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700 text-lg">Problem Tag</span>
                                        </label>
                                        <select
                                            {...register('tags')}
                                            className={`select select-bordered w-full transition-all duration-300 ${
                                                errors.tags ? 'select-error border-2' : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                            }`}
                                        >
                                            <option value="array">📊 Array</option>
                                            <option value="linked list">🔗 Linked List</option>
                                            <option value="graph">🕸️ Graph</option>
                                            <option value="dp">🎯 Dynamic Programming</option>
                                            <option value="string">📝 String</option>
                                            <option value="tree">🌳 Tree</option>
                                            <option value="binary search">🎯 Binary Search</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('test-cases')}
                                    className="btn btn-primary px-8 py-3 text-lg font-semibold bg-linear-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600"
                                >
                                    Next: Test Cases →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Test Cases Section */}
{activeSection === 'test-cases' && (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🧪</span>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Test Cases</h2>
                <p className="text-gray-600">Define visible and hidden test cases for validation</p>
            </div>
        </div>

        {/* Visible Test Cases */}
        <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">👁️</span>
                    Visible Test Cases
                    <span className="ml-2 text-sm font-normal text-gray-500">(Users can see these)</span>
                </h3>
                <button
                    type="button"
                    onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                    className="btn btn-success btn-sm text-white"
                >
                    + Add Visible Case
                </button>
            </div>

            <div className="grid gap-4">
                {visibleFields.map((field, index) => (
                    <div key={field.id} className="border-2 border-dashed border-green-200 bg-green-50 rounded-xl p-6 transition-all duration-300 hover:border-green-300">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-green-800">Test Case #{index + 1}</h4>
                            <button
                                type="button"
                                onClick={() => removeVisible(index)}
                                className="btn btn-error btn-xs text-white"
                            >
                                🗑️ Remove
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                                <textarea
                                    {...register(`visibleTestCases.${index}.input`)}
                                    placeholder="Test input (e.g., [2,7,11,15], 9"
                                    className="textarea textarea-bordered w-full font-mono text-gray-900 bg-white"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                                <textarea
                                    {...register(`visibleTestCases.${index}.output`)}
                                    placeholder="Expected output (e.g., [0,1])"
                                    className="textarea textarea-bordered w-full font-mono text-gray-900 bg-white"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                                <textarea
                                    {...register(`visibleTestCases.${index}.explanation`)}
                                    placeholder="Explain why this output is expected..."
                                    className="textarea textarea-bordered w-full text-gray-900 bg-white"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Hidden Test Cases */}
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">🕵️</span>
                    Hidden Test Cases
                    <span className="ml-2 text-sm font-normal text-gray-500">(Users cannot see these)</span>
                </h3>
                <button
                    type="button"
                    onClick={() => appendHidden({ input: '', output: '' })}
                    className="btn btn-warning btn-sm text-white"
                >
                    + Add Hidden Case
                </button>
            </div>

            <div className="grid gap-4">
                {hiddenFields.map((field, index) => (
                    <div key={field.id} className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-xl p-6 transition-all duration-300 hover:border-orange-300">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-orange-800">Hidden Case #{index + 1}</h4>
                            <button
                                type="button"
                                onClick={() => removeHidden(index)}
                                className="btn btn-error btn-xs text-white"
                            >
                                🗑️ Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                                <textarea
                                    {...register(`hiddenTestCases.${index}.input`)}
                                    placeholder="Hidden test input"
                                    className="textarea textarea-bordered w-full font-mono text-gray-900 bg-white"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                                <textarea
                                    {...register(`hiddenTestCases.${index}.output`)}
                                    placeholder="Expected output for hidden case"
                                    className="textarea textarea-bordered w-full font-mono text-gray-900 bg-white"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-between mt-8">
            <button
                type="button"
                onClick={() => setActiveSection('basic')}
                className="btn btn-outline px-8 py-3 text-lg font-semibold"
            >
                ← Back
            </button>
            <button
                type="button"
                onClick={() => setActiveSection('code')}
                className="btn btn-primary px-8 py-3 text-lg font-semibold bg-linear-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600"
            >
                Next: Code Templates →
            </button>
        </div>
    </div>
)}

                    {/* Code Templates Section */}
                    {activeSection === 'code' && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-2xl">💻</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Code Templates</h2>
                                    <p className="text-gray-600">Provide starter code for different programming languages</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[0, 1, 2, 3, 4].map((index) => (
                                    <div key={index} className="border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-purple-300 hover:shadow-md">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <span className="mr-2">
                                                {index === 0 ? '⚡' : index === 1 ? '☕' : index === 2 ? '🟨' : index === 3 ? '🐍' : '🔷'}
                                            </span>
                                            {index === 0 ? 'C++' : 
                                             index === 1 ? 'Java' : 
                                             index === 2 ? 'JavaScript' : 
                                             index === 3 ? 'Python' : 'C'}
                                        </h3>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold text-gray-700">Starter Code Template</span>
                                            </label>
                                            <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700">
                                                <textarea
                                                    {...register(`startCode.${index}.initialCode`)}
                                                    className="w-full bg-gray-900 text-green-400 font-mono text-sm focus:outline-none resize-none"
                                                    rows={8}
                                                    spellCheck="false"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('test-cases')}
                                    className="btn btn-outline px-8 py-3 text-lg font-semibold"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-success px-8 py-3 text-lg font-semibold text-white bg-linear-to-r from-green-500 to-blue-500 border-none hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm mr-2"></span>
                                            Creating Problem...
                                        </>
                                    ) : (
                                        '🚀 Create Problem'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default AdminPanel;
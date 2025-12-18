/**
 * AI Service
 * This file contains the AI service functions for the application
 */

const axios = require("axios");
const systemInstructions = require("../config/systemInstructions");

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    throw new Error("Missing Groq API key. Set GROQ_API_KEY in your environment.");
}

const modelName = "llama-3.3-70b-versatile";
const url = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Send a single-turn prompt using a specific system instruction.
 * @param {string} systemInstruction
 * @param {string} userPrompt
 * @param {object} options
 * @param {boolean} [options.clean] - whether to apply response sanitisation
 * @returns {Promise<string>}
 */
async function sendPrompt(systemInstruction, userPrompt, { clean = true } = {}) {
    try {
        const response = await axios.post(url, {
            model: modelName,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        const text = response.data.choices[0].message.content.trim();
        return clean ? cleanAIResponse(text) : text;
    } catch (error) {
        console.error("Error calling Groq API:", error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Generate code based on a prompt
 * @param {string} prompt - The prompt to generate code from
 * @param {string} lang - The programming language to generate code in
 * @returns {Promise<string>} - The generated code
 */
async function generateCode(prompt, lang) {
    const userPrompt = lang
        ? `${prompt}\n\nPreferred language: ${lang}`
        : prompt;
    return sendPrompt(systemInstructions.codeGenerator, userPrompt);
}

/**
 * Clean AI response by removing system instruction text
 * @param {string} response - The raw AI response
 * @returns {string} - The cleaned response
 */
function cleanAIResponse(response) {
    // Remove common system instruction patterns that might appear in responses
    const patternsToRemove = [
        /AI System Instruction:.*?(?=\n|$)/gi,
        /System Instruction:.*?(?=\n|$)/gi,
        /Role & Responsibilities:.*?(?=\n|$)/gi,
        /Here's a solid system instruction.*?(?=\n|$)/gi,
        /Senior Code Reviewer.*?Experience.*?(?=\n|$)/gi,
        /expert code reviewer.*?years.*?experience.*?(?=\n|$)/gi
    ];
    
    let cleanedResponse = response;
    patternsToRemove.forEach(pattern => {
        cleanedResponse = cleanedResponse.replace(pattern, '');
    });
    
    cleanedResponse = cleanedResponse.trim();
    
    return cleanedResponse;
}

/**
 * Generate a code review
 * @param {string} prompt - The code to review
 * @returns {Promise<string>} - The review
 */
async function generateReview(prompt) {
    return sendPrompt(systemInstructions.codeOptimizer, prompt);
}

/**
 * Generate a complexity analysis
 * @param {string} prompt - The code to analyze
 * @returns {Promise<string>} - The complexity analysis
 */
async function generateComplexity(prompt) {
    return sendPrompt(systemInstructions.codeComplexity, prompt);
}

/**
 * Compare two code snippets
 * @param {string} code1 - The first code snippet
 * @param {string} code2 - The second code snippet
 * @param {string} language - The programming language
 * @returns {Promise<string>} - The comparison result
 */
async function compareCode(code1, code2, language) {
    const prompt = `Please compare these two code snippets written in ${language || 'the provided language'}:

Code Snippet 1:
\`\`\`
${code1}
\`\`\`

Code Snippet 2:
\`\`\`
${code2}
\`\`\`

Focus only on identifying critical logical errors, syntax errors, or bugs that would cause the code to fail.
Provide a line-by-line analysis of the errors with brief explanations.`;

    return sendPrompt(systemInstructions.codeComparer, prompt);
}

/**
 * Generate test cases for code
 * @param {string} code - The code to generate test cases for
 * @param {string} language - The programming language
 * @returns {Promise<string>} - The generated test cases
 */
async function generateTestCases(code, language) {
    const prompt = `Generate comprehensive test cases for the following ${language || 'code'}:

\`\`\`
${code}
\`\`\`

Please provide a variety of test cases including normal cases, edge cases, and error cases.`;

    return sendPrompt(systemInstructions.testCaseGenerator, prompt);
}

/**
 * Beautify code
 * @param {string} code - The code to beautify
 * @param {string} language - The programming language
 * @returns {Promise<string>} - The beautified code
 */
async function beautifyCode(code, language) {
    const prompt = `Beautify and format the following ${language || 'code'} to improve readability:

\`\`\`
${code}
\`\`\`

Please maintain the original functionality while making it more readable and well-structured.`;

    return sendPrompt(systemInstructions.codeBeautifier, prompt, { clean: false });
}

/**
 * Debug code
 * @param {string} code - The code to debug
 * @param {string} language - The programming language
 * @returns {Promise<string>} - The debugging result
 */
async function debugCode(code, language) {
    const prompt = `Debug the following ${language || 'code'} and identify any errors or issues:

\`\`\`
${code}
\`\`\`

Please provide a detailed analysis of any errors found and suggest fixes.`;

    return sendPrompt(systemInstructions.errorDebugger, prompt, { clean: false });
}

/**
 * Analyze code performance
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language
 * @returns {Promise<string>} - The performance analysis
 */
async function analyzePerformance(code, language) {
    const prompt = `Analyze the execution time and memory usage of the following ${language || 'code'}:

\`\`\`
${code}
\`\`\`

Please provide a detailed analysis of time complexity, space complexity, and suggest optimizations.`;

    return sendPrompt(systemInstructions.performanceAnalyzer, prompt, { clean: false });
}

/**
 * Summarize content from text
 * @param {string} content - The content to summarize
 * @param {string} summaryLength - The desired length of the summary (short, medium, long)
 * @param {string} summaryType - The type of summary (general, academic, business)
 * @returns {Promise<string>} - The summary
 */
async function summarizeContent(content, summaryLength = 'medium', summaryType = 'general') {
    const prompt = `Please summarize the following content:

\`\`\`
${content}
\`\`\`

Please provide a ${summaryLength} summary in ${summaryType} style.`;

    return sendPrompt(systemInstructions.contentSummarizer, prompt, { clean: false });
}


/**
 * Analyze code for security vulnerabilities
 * @param {string} code - The code to analyze
 * @param {string} language - The programming language
 * @returns {Promise<string>} - The security analysis
 */
async function analyzeSecurity(code, language) {
    const prompt = `Analyze the following ${language || 'code'} for security vulnerabilities:

\`\`\`
${code}
\`\`\`

Please provide a detailed security analysis including vulnerability types, severity levels, line numbers, and recommended fixes.`;

    return sendPrompt(systemInstructions.securityAnalyzer, prompt, { clean: false });
}

module.exports = {
    generateReview,
    generateCode,
    generateComplexity,
    compareCode,
    generateTestCases,
    beautifyCode,
    debugCode,
    analyzePerformance,
    summarizeContent,
    analyzeSecurity,
};
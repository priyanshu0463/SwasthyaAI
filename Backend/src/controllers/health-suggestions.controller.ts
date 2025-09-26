// health-suggestions.controller.ts

import { Request, Response } from "express";
import { model } from "../handlers/gpt/gemini.service";
import { GenerationConfig, SchemaType } from "@google/generative-ai";
import profileService from "../handlers/user/profile.service";
import { userSessions } from "../app";

// Configuration for health suggestions generation
const healthSuggestionsConfig: GenerationConfig = {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
    responseSchema: {
        type: "object" as SchemaType,
        properties: {
            suggestions: {
                type: "array" as SchemaType,
                description: "Array of personalized health suggestions",
                items: {
                    type: "object" as SchemaType,
                    properties: {
                        icon: {
                            type: "string" as SchemaType,
                            description: "Emoji icon representing the suggestion"
                        },
                        title: {
                            type: "string" as SchemaType,
                            description: "Title of the health suggestion"
                        },
                        description: {
                            type: "string" as SchemaType,
                            description: "Detailed description of the suggestion"
                        },
                        category: {
                            type: "string" as SchemaType,
                            description: "Category of the suggestion",
                            enum: ["nutrition", "hydration", "exercise", "wellness", "mental", "sleep", "preventive"]
                        },
                        priority: {
                            type: "string" as SchemaType,
                            description: "Priority level of the suggestion",
                            enum: ["high", "medium", "low"]
                        },
                        timeframe: {
                            type: "string" as SchemaType,
                            description: "When to implement this suggestion (e.g., 'daily', 'weekly', 'morning', 'evening')"
                        }
                    },
                    required: ["icon", "title", "description", "category", "priority", "timeframe"]
                }
            },
            summary: {
                type: "string" as SchemaType,
                description: "Brief summary of the user's health patterns and focus areas"
            }
        },
        required: ["suggestions", "summary"]
    },
};

export const getHealthSuggestions = async (req: Request, res: Response): Promise<void> => {
    const { email, month } = req.body;
    
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }

    try {
        // Get user profile
        const userProfile = await profileService.getProfileByEmail(email);
        
        // Get chat history if session exists
        let chatHistory = "No previous conversations available.";
        if (userSessions[email]) {
            try {
                // Get the chat history from the session
                const history = await userSessions[email].getHistory();
                if (history.length > 0) {
                    chatHistory = history.map((msg: any) => {
                        const role = msg.role === 'user' ? 'User' : 'AI';
                        const content = msg.parts.map((part: any) => part.text).join(' ');
                        return `${role}: ${content}`;
                    }).join('\n');
                }
            } catch (error) {
                console.log("Could not retrieve chat history:", error);
            }
        }

        // Create a new model instance for health suggestions
        const healthModel = model;
        
        const prompt = `
        Role: You are a health analytics AI that generates personalized health suggestions based on user data and conversation history.

        User Profile: ${JSON.stringify(userProfile) || "No profile data"}
        Month/Period: ${month || "Current period"}
        
        Recent Health Conversations:
        ${chatHistory}

        Instructions:
        1. Analyze the user's health conversations, symptoms discussed, remedies suggested, and any patterns
        2. Consider the user's profile information (age, gender, medical conditions, etc.)
        3. Generate 5-6 personalized health suggestions that are:
           - Relevant to their discussed health concerns
           - Practical and actionable
           - Based on AYUSH principles when applicable
           - Preventive in nature
           - Varied across different categories

        4. Categories to consider: nutrition, hydration, exercise, wellness, mental, sleep, preventive
        5. Priority levels: high (urgent/important), medium (beneficial), low (optional)
        6. Include appropriate emojis for each suggestion
        7. Make suggestions specific to patterns you observe in their conversations

        If no conversation history is available, provide general wellness suggestions based on the user profile.

        Focus on:
        - Seasonal recommendations for ${month}
        - Lifestyle improvements
        - Preventive measures
        - Mind-body wellness
        - Dietary adjustments
        - Exercise routines
        - Stress management
        `;

        const result = await healthModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: healthSuggestionsConfig,
        });

        const response = result.response.text();
        const parsedResponse = JSON.parse(response);

        res.json({
            success: true,
            suggestions: parsedResponse.suggestions,
            summary: parsedResponse.summary,
            isPersonalized: chatHistory !== "No previous conversations available.",
            generatedAt: new Date().toISOString(),
            month: month || "Current"
        });

    } catch (error) {
        console.error("Error generating health suggestions:", error);
        
        // Fallback to default suggestions if AI fails
        const fallbackSuggestions = [
            {
                icon: "🍎",
                title: "Eat More Fruits",
                description: "Include seasonal fruits in your diet for essential vitamins and antioxidants.",
                category: "nutrition",
                priority: "medium",
                timeframe: "daily"
            },
            {
                icon: "💧",
                title: "Stay Hydrated",
                description: "Drink at least 2-3 liters of water daily to maintain optimal body function.",
                category: "hydration",
                priority: "high",
                timeframe: "daily"
            },
            {
                icon: "🏃‍♂️",
                title: "Regular Exercise",
                description: "Engage in 30 minutes of physical activity to boost cardiovascular health.",
                category: "exercise",
                priority: "high",
                timeframe: "daily"
            },
            {
                icon: "😴",
                title: "Quality Sleep",
                description: "Maintain 7-8 hours of consistent sleep for better recovery and mental health.",
                category: "sleep",
                priority: "high",
                timeframe: "daily"
            },
            {
                icon: "🧘‍♀️",
                title: "Stress Management",
                description: "Practice meditation or deep breathing exercises to reduce stress levels.",
                category: "mental",
                priority: "medium",
                timeframe: "daily"
            }
        ];

        res.json({
            success: true,
            suggestions: fallbackSuggestions,
            summary: "General wellness recommendations provided due to system limitations.",
            isPersonalized: false,
            generatedAt: new Date().toISOString(),
            month: month || "Current"
        });
    }
};

export const getWeeklyHealthInsights = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }

    try {
        const userProfile = await profileService.getProfileByEmail(email);
        
        let chatHistory = "No recent conversations.";
        if (userSessions[email]) {
            try {
                const history = await userSessions[email].getHistory();
                if (history.length > 0) {
                    // Get only recent conversations (last 10 exchanges)
                    const recentHistory = history.slice(-10);
                    chatHistory = recentHistory.map((msg: any) => {
                        const role = msg.role === 'user' ? 'User' : 'AI';
                        const content = msg.parts.map((part: any) => part.text).join(' ');
                        return `${role}: ${content}`;
                    }).join('\n');
                }
            } catch (error) {
                console.log("Could not retrieve chat history:", error);
            }
        }

        const insightPrompt = `
        Analyze the user's recent health conversations and provide weekly insights:
        
        User Profile: ${JSON.stringify(userProfile)}
        Recent Conversations: ${chatHistory}
        
        Generate a weekly health insight report including:
        1. Health patterns observed
        2. Progress areas
        3. Areas of concern
        4. Weekly focus recommendation
        5. Motivational message
        
        Keep it concise and encouraging.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: insightPrompt }] }],
            generationConfig: {
                temperature: 0.6,
                topP: 0.9,
                maxOutputTokens: 1024,
            },
        });

        res.json({
            success: true,
            insight: result.response.text(),
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error generating weekly insights:", error);
        res.status(500).json({ error: "Failed to generate weekly insights" });
    }
};
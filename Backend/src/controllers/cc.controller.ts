import { Part } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { userSessions } from "../app";
import { model, queryConfig } from "../handlers/gpt/gemini.service";
import { Request, Response } from "express";
import profileService from "../handlers/user/profile.service";

export const defaultProfile = "Unknown"

export const answer = async (req: Request, res: Response): Promise<void> => {
    const { email, message } = req.body;
    if (!email || !message) {
        res.status(400).json({ error: "User ID and message are required" });
        return;
    }
    if (!userSessions[email]) {
        userSessions[email] = model.startChat({
            history: [],
            generationConfig: queryConfig

        });
    }
    try {
        const result = await userSessions[email].sendMessage(message);
        const reply = result.response.text();
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
}

export const firsttime = async (req: Request, res: Response): Promise<void> => {
    const { email, qtype } = req.body;
    if (!email || !qtype) {
        res.status(400).json({ error: "Email ID and query type are required" });
        return;
    }
    const userProfile = await profileService.getProfileByEmail(email);
    // console.log(userProfile);
    if (userSessions[email]) {
        delete userSessions[email];
    }
    userSessions[email] = model.startChat({
        history: [],
        generationConfig: queryConfig
    });


    let message = `User Profile: ${userProfile || defaultProfile} \n User wants to have a conversation. Find out what he/she wants and guide him/her.`;
    if (qtype == "remedy") {
        message = `User Profile: ${userProfile || defaultProfile} \nUser wants to find a remedy for something. Understand and guide him/her.`;
    }
    else if (qtype == "doctor") {
        message = `User Profile: ${userProfile || defaultProfile} \nUser wants to find a remedy for something. Understand and guide him/her.`;
    }
    else if (qtype == "describe") {
        message = `User Profile: ${userProfile || defaultProfile} \nUser wants to have a conversation about his/her health.`;
    }
    try {
        const result = await userSessions[email].sendMessage(message);
        const reply = result.response.text();
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
}

export const answerImage = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    const { email, message } = req.body;
    if (!email || !message) {
        res.status(400).json({ error: "User ID and message are required" });
        return;
    }
    if (!userSessions[email]) {
        userSessions[email] = model.startChat({
            history: [],
            generationConfig: queryConfig

        });
    }
    try {
        const imagePath = path.join(__dirname, '../..', 'uploads', req.file.filename); // Adjust path based on your file structure
        console.log(imagePath);
        const imageBuffer = await fs.readFile(imagePath);
        const imageBase64 = imageBuffer.toString('base64');

        const parts: Part[] = [
            { text: message },
            {
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: imageBase64,
                },
            },
        ];

        const result = await userSessions[email].sendMessage(parts);

        const reply = result.response.text();
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
}

export const getDailyHealthSuggestions = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }

    try {
        const userProfile = await profileService.getProfileByEmail(email);
        const currentDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const prompt = `Generate 5 personalized daily health suggestions for today (${currentDate}) based on the user profile: ${userProfile || defaultProfile}. 
        
        The suggestions should be:
        1. Practical and actionable
        2. Based on AYUSH principles (Ayurveda, Yoga, Unani, Siddha, Homeopathy)
        3. Personalized to the user's profile
        4. Include specific timing, duration, or quantities where applicable
        5. Focus on preventive health and wellness
        
        Return the response in this JSON format:
        {
            "suggestions": [
                {
                    "icon": "emoji or icon name",
                    "title": "Suggestion title",
                    "description": "Detailed description with specific instructions",
                    "category": "diet|exercise|lifestyle|mindfulness|prevention",
                    "priority": "high|medium|low",
                    "estimatedTime": "time required (e.g., '5 minutes', '30 minutes')"
                }
            ],
            "date": "${currentDate}",
            "personalizedMessage": "A brief personalized message for the user"
        }`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        
        // Try to parse JSON, fallback to default suggestions if parsing fails
        try {
            const parsedResponse = JSON.parse(reply);
            res.json(parsedResponse);
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", parseError);
            // Fallback to default suggestions
            res.json({
                suggestions: [
                    {
                        icon: "🍎",
                        title: "Eat More Fruits",
                        description: "Include at least 2-3 servings of fresh fruits in your daily diet for essential vitamins and antioxidants.",
                        category: "diet",
                        priority: "high",
                        estimatedTime: "5 minutes"
                    },
                    {
                        icon: "💧",
                        title: "Stay Hydrated",
                        description: "Drink at least 8-10 glasses of water throughout the day to maintain optimal hydration.",
                        category: "lifestyle",
                        priority: "high",
                        estimatedTime: "Throughout day"
                    },
                    {
                        icon: "🧘",
                        title: "Practice Mindfulness",
                        description: "Spend 10-15 minutes in meditation or deep breathing exercises to reduce stress.",
                        category: "mindfulness",
                        priority: "medium",
                        estimatedTime: "15 minutes"
                    },
                    {
                        icon: "🚶",
                        title: "Take a Walk",
                        description: "Go for a 20-30 minute walk in nature to improve circulation and mental well-being.",
                        category: "exercise",
                        priority: "medium",
                        estimatedTime: "30 minutes"
                    },
                    {
                        icon: "🌅",
                        title: "Morning Sunlight",
                        description: "Get 15-20 minutes of morning sunlight exposure for vitamin D synthesis.",
                        category: "lifestyle",
                        priority: "low",
                        estimatedTime: "20 minutes"
                    }
                ],
                date: currentDate,
                personalizedMessage: "Here are your personalized health suggestions for today!"
            });
        }
    } catch (error) {
        console.error("Error generating health suggestions:", error);
        res.status(500).json({ error: "Failed to generate health suggestions" });
    }
}

// doctor.route.ts

import { Router } from "express";
import { answer, firsttime, answerImage } from "../controllers/cc.controller";
import { getHealthSuggestions, getWeeklyHealthInsights } from "../controllers/health-suggestions.controller";
import upload from "../handlers/gpt/image.service";

const router = Router();

// Existing routes
router.post("/firsttime", firsttime);
router.post("/answer", answer);
router.post("/upload", upload.single("image"), answerImage);

// New health suggestions routes
router.post("/health-suggestions", getHealthSuggestions);
router.post("/weekly-insights", getWeeklyHealthInsights);

export default router;
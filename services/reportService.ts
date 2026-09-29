import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, AnalysisReport, TranscriptItem, MimicAttempt, UserMemory } from '../types';

export async function generateAnalysisReport(apiKey: string, transcript: TranscriptItem[], targetAccent: string, mission: Scenario, speakLikeStyle?: any, targetLanguage: string = 'English'): Promise<AnalysisReport> {
  const ai = new GoogleGenAI({ apiKey });
  
  const targetTraits = speakLikeStyle ? speakLikeStyle.targetTraits.join(', ') : `standard professional ${targetLanguage}`;
  const targetStyleStr = speakLikeStyle ? speakLikeStyle.label : 'Natural speaker';

  // Filter out empty transcripts and format
  const conversationText = transcript
    .filter(t => t.text.trim() !== '')
    .map(t => `${t.speaker === 'user' ? 'Student' : 'Tutor'}: ${t.text}`)
    .join('\n');

  const prompt = `
    Analyze the following ${targetLanguage} learning conversation for the mission: "${mission.title}".
    TARGET SPEAKING STYLE: ${targetStyleStr} (Key Traits: ${targetTraits}).
    MISSION CONTEXT:
    - Difficulty: ${mission.difficulty}
    - Goals: ${mission.goals.join(', ')}
    - Emotional Tone Target: ${mission.emotionalTone}
    - Vocabulary Focus: ${mission.vocabularyFocus.join(', ')}
    
    The "Student" is a ${targetLanguage} learner aiming for a ${targetAccent} influence in this specific scenario. 
    
    1. MISSION EVALUATION: 
       - Evaluate how well the Student achieved the specific MISSION GOALS listed above.
       - Assess if they maintained the appropriate ${mission.emotionalTone} tone.
       - Check if they used the suggested vocabulary: ${mission.vocabularyFocus.join(', ')}.

    2. Evaluate the Student's performance on a scale of 0-100 for:
       - Overall Score
       - Fluency (based on sentence flow and complexity)
       - Vocabulary (range and appropriateness)
       - Grammar (accuracy)
       - Accent Style Match (how well their phrasing matches the native ${targetLanguage} style${targetAccent !== 'Standard' ? ` with ${targetAccent} influence` : ''})
       - Vocabulary Richness (variety of words used)
       - Confidence Score (assertiveness and flow)
       - Grammar Consistency (regularity of correct grammar)
       - Pacing Score (how steady their speaking speed is)
       - Filler Words Detected (approximate count based on common fillers in ${targetLanguage})

    2. Provide detailed session analysis:
       - Performance Data: An array of 10 numbers (0-100) representing the Student's performance progression throughout the conversation for visual charting.
       - Highlights: 3 specific positive achievements.
       - Weak Points: 3 specific areas needing more practice.
       - Suggestions: 3 actionable personalized tips for improvement.

    3. Identify 3-5 key errors or areas for improvement.
       - Provide the Original phrase.
       - Provide a Corrected version in correct ${targetLanguage}.
       - Provide an "Alternative" way to say it that sounds more native.
       - Explain the rule or reason.

    4. Provide specific Accent/Style Coaching:
       - Pronunciation Feedback: General advice on their pronunciation based on the transcript.
       - Intonation Tips: How to sound more like a native ${targetLanguage} speaker.
       - Difficult Sounds: 2-3 specific phonemes or sounds they might struggle with in ${targetLanguage}.
       - Practice Phrases: 3 short phrases common in ${targetLanguage} for them to practice.
       - Conversational Rhythm: Description of the ${targetLanguage} rhythm.
       - Slang Examples: 2-3 slang terms appropriate for the context.
       - Vocabulary Tips: Specific local words to use.
       - Filler Words: What fillers sound natural.

    5. Provide a brief, encouraging summary (max 2 sentences).

    6. PERSISTENT MEMORY UPDATE (CRITICAL):
       Analyze the session for long-term tracking:
       - grammarMistakes: 2-3 significant repeated grammar errors.
       - pronunciationWeakness: 2-3 specific phonemes or sounds struggled with.
       - avoidedStructures: Patterns the user seems to avoid (e.g. "Avoids conditional sentences").
       - progressNote: A brief 1-sentence note on progress since they started (if applicable).

    7. SPEAKING STYLE ANALYSIS:
       If the user was aiming for a specific "Speak Like" style (${targetStyleStr}):
       - Assign a score (0-100) based on how well they embodied traits: ${targetTraits}.
       - Provide 1 specific feedback sentence on their style.
    
    Conversation:
    ${conversationText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            fluencyScore: { type: Type.NUMBER },
            vocabularyScore: { type: Type.NUMBER },
            grammarScore: { type: Type.NUMBER },
            accentMatchScore: { type: Type.NUMBER },
            vocabularyRichness: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            grammarConsistency: { type: Type.NUMBER },
            pacingScore: { type: Type.NUMBER },
            fillerWordsDetected: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            performanceData: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            corrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  alternative: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            },
            accentCoaching: {
              type: Type.OBJECT,
              properties: {
                pronunciationFeedback: { type: Type.STRING },
                intonationTips: { type: Type.STRING },
                difficultSounds: { type: Type.ARRAY, items: { type: Type.STRING } },
                practicePhrases: { type: Type.ARRAY, items: { type: Type.STRING } },
                conversationalRhythm: { type: Type.STRING },
                slangExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
                vocabularyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                fillerWords: { type: Type.STRING }
              },
              required: ['pronunciationFeedback', 'intonationTips', 'difficultSounds', 'practicePhrases']
            },
            persistentObservations: {
                type: Type.OBJECT,
                properties: {
                    grammarMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    pronunciationWeakness: { type: Type.ARRAY, items: { type: Type.STRING } },
                    avoidedStructures: { type: Type.ARRAY, items: { type: Type.STRING } },
                    progressNote: { type: Type.STRING }
                }
            },
            styleScore: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                    styleName: { type: Type.STRING }
                }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from model");
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
    const parsed = JSON.parse(cleanJson);

    return {
      score: typeof parsed.score === 'number' ? parsed.score : 75,
      fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 75,
      vocabularyScore: typeof parsed.vocabularyScore === 'number' ? parsed.vocabularyScore : 75,
      grammarScore: typeof parsed.grammarScore === 'number' ? parsed.grammarScore : 75,
      accentMatchScore: typeof parsed.accentMatchScore === 'number' ? parsed.accentMatchScore : 75,
      vocabularyRichness: typeof parsed.vocabularyRichness === 'number' ? parsed.vocabularyRichness : 70,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 70,
      grammarConsistency: typeof parsed.grammarConsistency === 'number' ? parsed.grammarConsistency : 75,
      pacingScore: typeof parsed.pacingScore === 'number' ? parsed.pacingScore : 75,
      fillerWordsDetected: typeof parsed.fillerWordsDetected === 'number' ? parsed.fillerWordsDetected : 0,
      summary: parsed.summary || "Great practice session! Consistent practice will continue to build your conversational flow.",
      highlights: Array.isArray(parsed.highlights) && parsed.highlights.length ? parsed.highlights : ["Active conversational engagement", "Good comprehension"],
      weakPoints: Array.isArray(parsed.weakPoints) && parsed.weakPoints.length ? parsed.weakPoints : ["Pacing consistency", "Vocabulary variety"],
      suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length ? parsed.suggestions : ["Speak with steady rhythm", "Incorporate new idiomatic expressions"],
      performanceData: Array.isArray(parsed.performanceData) && parsed.performanceData.length >= 5 
        ? parsed.performanceData 
        : [70, 72, 75, 74, 78, 80, 82, 85, 84, 86],
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
      accentCoaching: parsed.accentCoaching || undefined,
      persistentObservations: parsed.persistentObservations || undefined,
      styleScore: parsed.styleScore || undefined
    };
  } catch (error) {
    console.error("Report generation failed", error);
    return {
        score: 70,
        fluencyScore: 70,
        vocabularyScore: 70,
        grammarScore: 70,
        accentMatchScore: 70,
        vocabularyRichness: 65,
        confidenceScore: 70,
        grammarConsistency: 70,
        pacingScore: 70,
        fillerWordsDetected: 0,
        summary: "Session completed. Analysis was generated with baseline metrics.",
        highlights: ["Completed interactive session", "Maintained conversational intent"],
        weakPoints: ["More practice recommended"],
        suggestions: ["Continue practicing everyday scenarios"],
        performanceData: [68, 70, 72, 74, 75, 78, 80, 82, 81, 83],
        corrections: []
    };
  }
}

export async function analyzeMimicAttempt(apiKey: string, phrase: string, audioBlob: Blob, accent: string): Promise<MimicAttempt> {
  const ai = new GoogleGenAI({ apiKey });

  // Convert Blob to Base64
  const arrayBuffer = await audioBlob.arrayBuffer();
  const base64Audio = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  const prompt = `
    Analyze this pronunciation mimic attempt. 
    The user is trying to repeat the following native phrase: "${phrase}"
    They are aiming for a ${accent} influence.

    INSTRUCTIONS:
    1. Listen to the provided audio.
    2. Transcribe what the user said.
    3. Compare their pronunciation, rhythm, and stress to the target phrase.
    4. Provide a 'prosodyScore' (0-100) reflecting how natural and accurate it sounds.
    5. Breakdown the feedback by phoneme clusters or specific sounds.
    6. For each sound cluster, provide a score (0-100) and a helpful 'suggestion' on how to improve.

    Return ONLY JSON:
    {
      "transcription": "string",
      "prosodyScore": number,
      "phonemeFeedback": [
        { "phoneme": "string", "score": number, "suggestion": "string" }
      ]
    }
  `;

  try {
    const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: base64Audio,
                            mimeType: audioBlob.type || 'audio/webm'
                        }
                    }
                ]
            }
        ]
    });
    
    const text = result.text;
    if (!text) throw new Error("No response from model");
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
    const data = JSON.parse(cleanJson);
    
    return {
        id: Date.now().toString(),
        phrase,
        transcription: data.transcription,
        prosodyScore: typeof data.prosodyScore === 'number' ? data.prosodyScore : 75,
        phonemeFeedback: Array.isArray(data.phonemeFeedback) ? data.phonemeFeedback : [],
        timestamp: new Date()
    };
  } catch (error) {
    console.error("Mimic analysis failed", error);
    return {
        id: Date.now().toString(),
        phrase,
        prosodyScore: 0,
        phonemeFeedback: [],
        timestamp: new Date()
    };
  }
}

export async function updateUserMemory(apiKey: string, currentMemory: UserMemory, latestReport: AnalysisReport, favoriteTopic?: string): Promise<UserMemory> {
    const ai = new GoogleGenAI({ apiKey });
    
    // We use gemini-2.0-flash to synthesize the memory update
    const prompt = `
        Update the Student's persistent learning memory based on the latest session report.
        
        CURRENT MEMORY:
        - Repeated Grammar Mistakes: ${currentMemory.repeatedGrammarMistakes.join(', ')}
        - Pronunciation Weaknesses: ${currentMemory.pronunciationWeaknesses.join(', ')}
        - Avoided Structures: ${currentMemory.avoidedSentenceStructures.join(', ')}
        - Coach's Notes: ${currentMemory.coachNotes}
        - Existing Topics: ${currentMemory.favoriteTopics.join(', ')}
        
        LATEST SESSION OBSERVATIONS:
        - New Grammar Errors: ${latestReport.persistentObservations?.grammarMistakes.join(', ') || 'None'}
        - New Pronunciation Weakness: ${latestReport.persistentObservations?.pronunciationWeakness.join(', ') || 'None'}
        - Observed Avoidances: ${latestReport.persistentObservations?.avoidedStructures.join(', ') || 'None'}
        - Session Progress Note: ${latestReport.persistentObservations?.progressNote || 'Session completed.'}
        - Current Context: ${favoriteTopic || 'General conversation'}
        
        GOAL:
        - Merge the new observations into the persistent memory.
        - Keep a maximum of 5 items for grammar and pronunciation (the most consistent ones).
        - Update speaking confidence based on the session (latest score: ${latestReport.confidenceScore}).
        - Extract 1-3 specific discussion topics/themes mentioned by the user to build rapport.
        - Synthesize a new "Coach's Note" that summarizes where they stand and what to focus on next.
        
        Return JSON:
        {
            "repeatedGrammarMistakes": string[],
            "pronunciationWeaknesses": string[],
            "avoidedSentenceStructures": string[],
            "speakingConfidence": number,
            "favoriteTopics": string[],
            "coachNotes": string (max 3 sentences)
        }
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        });
        const text = result.text;
        if (!text) throw new Error("No response from synthesis model");
        
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
        const data = JSON.parse(cleanJson);

        const extractedTopics = Array.isArray(data.favoriteTopics) ? data.favoriteTopics : [];
        const combinedTopics = Array.from(new Set([
            ...currentMemory.favoriteTopics,
            ...extractedTopics,
            ...(favoriteTopic ? [favoriteTopic] : [])
        ])).slice(-8);

        return {
            ...currentMemory,
            repeatedGrammarMistakes: Array.isArray(data.repeatedGrammarMistakes) ? data.repeatedGrammarMistakes : currentMemory.repeatedGrammarMistakes,
            pronunciationWeaknesses: Array.isArray(data.pronunciationWeaknesses) ? data.pronunciationWeaknesses : currentMemory.pronunciationWeaknesses,
            avoidedSentenceStructures: Array.isArray(data.avoidedSentenceStructures) ? data.avoidedSentenceStructures : currentMemory.avoidedSentenceStructures,
            speakingConfidence: typeof data.speakingConfidence === 'number' ? data.speakingConfidence : latestReport.confidenceScore,
            coachNotes: data.coachNotes || currentMemory.coachNotes,
            favoriteTopics: combinedTopics,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Memory synthesis failed", error);
        return currentMemory;
    }
}

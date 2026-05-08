import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, AnalysisReport, TranscriptItem, MimicAttempt, UserMemory } from '../types';

export async function generateAnalysisReport(apiKey: string, transcript: TranscriptItem[], targetAccent: string, mission: Scenario, speakLikeStyle?: any): Promise<AnalysisReport> {
  const ai = new GoogleGenAI({ apiKey });
  
  const targetTraits = speakLikeStyle ? speakLikeStyle.targetTraits.join(', ') : 'standard professional English';
  const targetStyleStr = speakLikeStyle ? speakLikeStyle.label : 'Natural speaker';

  // Filter out empty transcripts and format
  const conversationText = transcript
    .filter(t => t.text.trim() !== '')
    .map(t => `${t.speaker === 'user' ? 'Student' : 'Tutor'}: ${t.text}`)
    .join('\n');

  const prompt = `
    Analyze the following English learning conversation for the mission: "${mission.title}".
    TARGET SPEAKING STYLE: ${targetStyleStr} (Key Traits: ${targetTraits}).
    MISSION CONTEXT:
    - Difficulty: ${mission.difficulty}
    - Goals: ${mission.goals.join(', ')}
    - Emotional Tone Target: ${mission.emotionalTone}
    - Vocabulary Focus: ${mission.vocabularyFocus.join(', ')}
    
    The "Student" is an English learner aiming for a ${targetAccent} accent in this specific scenario. 
    
    1. MISSION EVALUATION: 
       - Evaluate how well the Student achieved the specific MISSION GOALS listed above.
       - Assess if they maintained the appropriate ${mission.emotionalTone} tone.
       - Check if they used the suggested vocabulary: ${mission.vocabularyFocus.join(', ')}.

    2. Evaluate the Student's performance on a scale of 0-100 for:
       - Overall Score
       - Fluency (based on sentence flow and complexity)
       - Vocabulary (range and appropriateness)
       - Grammar (accuracy)
       - Accent Style Match (how well their phrasing matches the ${targetAccent} native English style)
       - Vocabulary Richness (variety of words used)
       - Confidence Score (assertiveness and flow)
       - Grammar Consistency (regularity of correct grammar)
       - Pacing Score (how steady their speaking speed is)
       - Filler Words Detected (approximate count based on "um", "uh", "like")

    2. Provide detailed session analysis:
       - Performance Data: An array of 10 numbers (0-100) representing the Student's performance progression throughout the conversation for visual charting.
       - Highlights: 3 specific positive achievements.
       - Weak Points: 3 specific areas needing more practice.
       - Suggestions: 3 actionable personalized tips for improvement.

    3. Identify 3-5 key errors or areas for improvement.
       - Provide the Original phrase.
       - Provide a Corrected version.
       - Provide an "Alternative" way to say it that sounds more native in a ${targetAccent} context.
       - Explain the rule or reason.

    4. Provide specific Accent Coaching for the ${targetAccent} accent:
       - Pronunciation Feedback: General advice on their pronunciation based on the transcript.
       - Intonation Tips: How to sound more like a native ${targetAccent} speaker in terms of rhythm and pitch.
       - Difficult Sounds: 2-3 specific phonemes or sounds they might struggle with in this accent.
       - Practice Phrases: 3 short phrases common in ${targetAccent} English for them to practice.
       - Conversational Rhythm: Description of the ${targetAccent} rhythm (stress-timed vs syllable-timed).
       - Slang Examples: 2-3 slang terms appropriate for the context.
       - Vocabulary Tips: Specific local words to use (e.g., 'petrol' vs 'gas').
       - Filler Words: What fillers sound natural in this accent.

    5. Provide a brief, encouraging summary (max 2 sentences).

    6. PERSISTENT MEMORY UPDATE (CRITICAL):
       Analyze the session for long-term tracking:
       - grammarMistakes: 2-3 significant repeated grammar errors.
       - pronunciationWeakness: 2-3 specific phonemes or sounds struggled with.
       - avoidedStructures: Patterns the user seems to avoid (e.g. "Avoids conditional sentences").
       - progressNote: A brief 1-sentence note on progress since they started (if applicable).

    7. SPEAKING STYLE ANALYSIS:
       If the user was aiming for a specific "Speak Like" style ($targetStyle):
       - Assign a score (0-100) based on how well they embodied traits: ${targetTraits}.
       - Provide 1 specific feedback sentence on their style.
    
    Conversation:
    ${conversationText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
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
    return JSON.parse(text) as AnalysisReport;
  } catch (error) {
    console.error("Report generation failed", error);
    return {
        score: 0,
        fluencyScore: 0,
        vocabularyScore: 0,
        grammarScore: 0,
        accentMatchScore: 0,
        vocabularyRichness: 0,
        confidenceScore: 0,
        grammarConsistency: 0,
        pacingScore: 0,
        fillerWordsDetected: 0,
        summary: "Could not generate report due to an error.",
        highlights: [],
        weakPoints: [],
        suggestions: [],
        performanceData: [],
        corrections: []
    };
  }
}

export async function analyzeMimicAttempt(apiKey: string, phrase: string, userAudioTranscription: string, accent: string): Promise<MimicAttempt> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this pronunciation mimic attempt.
    Target Phrase (Native): "${phrase}"
    User Transcription: "${userAudioTranscription}"
    Target Accent: ${accent}

    Instructions:
    1. Compare the user's speech to the native phrase.
    2. Provide a 'prosodyScore' (0-100) reflecting rhythm, stress, and intonation match.
    3. Breakdown accuracy by individual phonemes or sounds in 'phonemeFeedback'.
    4. For any incorrect sounds, provide a brief 'suggestion'.

    Return JSON:
    {
      "prosodyScore": number,
      "phonemeFeedback": [
        { "phoneme": "string", "score": number, "suggestion": "string" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt
    });
    const text = response.text;
    if (!text) throw new Error("No response from model");
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
    const data = JSON.parse(cleanJson);
    
    return {
        id: Date.now().toString(),
        phrase,
        prosodyScore: data.prosodyScore || 0,
        phonemeFeedback: data.phonemeFeedback || [],
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
    
    // We use a lighter model to synthesize the memory update
    const prompt = `
        Update the Student's persistent learning memory based on the latest session report.
        
        CURRENT MEMORY:
        - Repeated Grammar Mistakes: ${currentMemory.repeatedGrammarMistakes.join(', ')}
        - Pronunciation Weaknesses: ${currentMemory.pronunciationWeaknesses.join(', ')}
        - Avoided Structures: ${currentMemory.avoidedSentenceStructures.join(', ')}
        - Coach's Notes: ${currentMemory.coachNotes}
        
        LATEST SESSION OBSERVATIONS:
        - New Grammar Errors: ${latestReport.persistentObservations?.grammarMistakes.join(', ') || 'None'}
        - New Pronunciation Weakness: ${latestReport.persistentObservations?.pronunciationWeakness.join(', ') || 'None'}
        - Observed Avoidances: ${latestReport.persistentObservations?.avoidedStructures.join(', ') || 'None'}
        - Session Progress Note: ${latestReport.persistentObservations?.progressNote || 'Session completed.'}
        
        GOAL:
        - Merge the new observations into the persistent memory.
        - Keep a maximum of 5 items for grammar and pronunciation (the most consistent ones).
        - Update speaking confidence based on the session (latest score: ${latestReport.confidenceScore}).
        - Synthesize a new "Coach's Note" that summarizes where they stand and what to focus on next.
        
        Return JSON:
        {
            "repeatedGrammarMistakes": string[],
            "pronunciationWeaknesses": string[],
            "avoidedSentenceStructures": string[],
            "speakingConfidence": number,
            "coachNotes": string (max 3 sentences)
        }
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt
        });
        const text = result.text;
        if (!text) throw new Error("No response from synthesis model");
        
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text.trim();
        const data = JSON.parse(cleanJson);

        return {
            ...currentMemory,
            repeatedGrammarMistakes: data.repeatedGrammarMistakes || currentMemory.repeatedGrammarMistakes,
            pronunciationWeaknesses: data.pronunciationWeaknesses || currentMemory.pronunciationWeaknesses,
            avoidedSentenceStructures: data.avoidedSentenceStructures || currentMemory.avoidedSentenceStructures,
            speakingConfidence: data.speakingConfidence || latestReport.confidenceScore,
            coachNotes: data.coachNotes || currentMemory.coachNotes,
            favoriteTopics: favoriteTopic ? [...new Set([...currentMemory.favoriteTopics, favoriteTopic])] : currentMemory.favoriteTopics,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error("Memory synthesis failed", error);
        return currentMemory;
    }
}

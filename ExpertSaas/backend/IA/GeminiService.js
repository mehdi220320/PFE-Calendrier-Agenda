const { GoogleGenerativeAI } = require("@google/generative-ai");

async function extractFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return {
            text: data.text,
            pageCount: data.numpages,
            metadata: data.metadata
        };
    } catch (error) {
        throw new Error(`PDF extraction failed: ${error.message}`);
    }
}

async function extractFromDOCX(filePath) {
    try {
        const docx = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: docx });
        return {
            text: result.value,
            pageCount: Math.ceil(result.value.length / 3000), // Estimation
            metadata: {}
        };
    } catch (error) {
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
}

async function extractFromExcel(filePath) {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        let allData = '';
        const sheetNames = [];
        const rowCounts = [];

        workbook.eachSheet((worksheet) => {
            sheetNames.push(worksheet.name);
            let rowCount = 0;
            worksheet.eachRow((row) => {
                allData += row.values.filter(v => v !== null).join(' | ') + '\n';
                rowCount++;
            });
            rowCounts.push(rowCount);
        });

        return {
            text: allData,
            pageCount: sheetNames.length,
            metadata: {
                sheetNames,
                rowCounts,
                totalRows: rowCounts.reduce((a, b) => a + b, 0)
            }
        };
    } catch (error) {
        throw new Error(`Excel extraction failed: ${error.message}`);
    }
}

async function extractFileContent(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
        case '.pdf':
            return await extractFromPDF(filePath);
        case '.docx':
        case '.doc':
            return await extractFromDOCX(filePath);
        case '.xlsx':
        case '.xls':
        case '.csv':
            return await extractFromExcel(filePath);
        default:
            throw new Error(`Unsupported file format: ${ext}`);
    }
}

function extractKeywords(text, limit = 15) {
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
        'have', 'has', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'that', 'this', 'these', 'those', 'which', 'who', 'what', 'when', 'where',
        'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'some',
        'such', 'no', 'nor', 'not', 'only', 'same', 'so', 'than', 'too', 'very'
    ]);

    const words = text.toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 4 && !commonWords.has(word));

    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word, count]) => ({ word, count }));
}

function splitTextIntoChunks(text, maxChunkSize = 25000) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + maxChunkSize, text.length);

        // Try to break at a sentence or paragraph boundary
        if (endIndex < text.length) {
            const lastPeriod = text.lastIndexOf('.', endIndex);
            const lastNewline = text.lastIndexOf('\n\n', endIndex);
            const breakPoint = Math.max(lastPeriod, lastNewline);

            if (breakPoint > startIndex) {
                endIndex = breakPoint + 1;
            }
        }

        chunks.push(text.substring(startIndex, endIndex));
        startIndex = endIndex;
    }

    return chunks;
}

function getRecommendation(workingModels) {
    if (workingModels.length === 0) {
        return "No models working. Check your API key and billing status.";
    }

    // Prioritize models
    const hasFastModel = workingModels.some(m => m.name.includes('flash'));
    const hasProModel = workingModels.some(m => m.name.includes('pro'));

    if (hasFastModel) {
        const fastModel = workingModels.find(m => m.name.includes('flash'));
        return `✅ Use "${fastModel.name}" for fast, everyday processing. It's working and responsive.`;
    } else if (hasProModel) {
        const proModel = workingModels.find(m => m.name.includes('pro'));
        return `✅ Use "${proModel.name}" for complex analysis. It's working but may be slower.`;
    } else {
        return `✅ Use "${workingModels[0].name}" - it's the only working model found.`;
    }
}

async function summarizeChunk(chunk, chunkNumber, totalChunks, retryCount = 0) {
    const maxRetries = 5;
    const baseDelay = 2000; // 2 seconds

    try {
        // FIXED: Correct model name
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `You are analyzing PART ${chunkNumber} of ${totalChunks} of a document.
    Provide a concise analysis of THIS PORTION only.
    
    Return a JSON object with:
    {
      "summary": "Brief summary of this section (2-3 sentences)",
      "keyPoints": ["key point 1", "key point 2"],
      "themes": ["theme1", "theme2"]
    }
    
    Section content:
    """
    ${chunk}
    """`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());

    } catch (error) {
        // Handle 503 and other retryable errors
        if (error.status === 503 || error.status === 429 || error.status === 500) {
            if (retryCount < maxRetries) {
                const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
                console.log(`⚠️ Chunk ${chunkNumber} failed (attempt ${retryCount + 1}/${maxRetries}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return summarizeChunk(chunk, chunkNumber, totalChunks, retryCount + 1);
            }
        }
        throw error;
    }
}

async function mergeSummaries(chunkSummaries, fileName, fileType) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const combinedSummaries = chunkSummaries.map((s, i) =>
        `PART ${i+1}: ${s.summary}\nKey Points: ${s.keyPoints.join(', ')}`
    ).join('\n\n');

    const prompt = `You are an expert document analyst. You have received ${chunkSummaries.length} summaries from different parts of a document.
  
  Based on ALL these partial summaries, create a FINAL comprehensive analysis.
  
  Partial summaries:
  """
  ${combinedSummaries}
  """
  
  Return a JSON object with:
  {
    "summary": "2-3 sentence executive summary of the ENTIRE document",
    "themes": ["main theme 1", "main theme 2", "main theme 3"],
    "keyPoints": ["most important point 1", "most important point 2", "most important point 3"],
    "documentType": "Type of document (Report, Contract, Guide, etc.)",
    "sentiment": "Overall tone (Professional, Technical, Educational, etc.)"
  }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
}

async function generateAISummary(text, fileName, fileType) {
    try {
        console.log(`📊 Analyzing document of ${text.length} characters...`);

        // Step 1: Split text into chunks (max 25k chars each for safety)
        const chunks = splitTextIntoChunks(text, 25000);
        console.log(`📦 Split into ${chunks.length} chunks`);

        // If document is small enough, process directly
        if (chunks.length === 1) {
            console.log(`✅ Document fits in single chunk, processing directly...`);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const prompt = `You are an expert document analyst. Analyze this file content (${fileType}) and provide a detailed analysis.
      
      Return a JSON object with this exact schema:
      {
        "summary": "2-3 sentence executive summary",
        "themes": ["theme1", "theme2", "theme3"],
        "keyPoints": ["key point 1", "key point 2", "key point 3"],
        "documentType": "Type of document",
        "sentiment": "Overall tone"
      }
      
      File content:
      """
      ${chunks[0]}
      """`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const jsonResponse = JSON.parse(response.text());

            return {
                summary: jsonResponse.summary || "Analysis completed",
                themes: jsonResponse.themes || [],
                keyPoints: jsonResponse.keyPoints || [],
                documentType: jsonResponse.documentType || "Document",
                sentiment: jsonResponse.sentiment || "Neutral"
            };
        }

        // Step 2: Process large document in parallel with rate limiting
        console.log(`🔄 Processing ${chunks.length} chunks in parallel with rate limiting...`);

        const chunkSummaries = [];
        const concurrencyLimit = 3; // Process 3 chunks at a time
        const delayBetweenBatches = 1000; // 1 second delay between batches

        for (let i = 0; i < chunks.length; i += concurrencyLimit) {
            const batch = chunks.slice(i, i + concurrencyLimit);
            const batchNumbers = Array.from({ length: batch.length }, (_, idx) => i + idx + 1);

            console.log(`📝 Processing batch ${Math.floor(i/concurrencyLimit) + 1}: chunks ${batchNumbers[0]}-${batchNumbers[batchNumbers.length-1]}`);

            const batchResults = await Promise.all(
                batch.map((chunk, idx) => summarizeChunk(chunk, i + idx + 1, chunks.length))
            );

            chunkSummaries.push(...batchResults);

            // Delay between batches to avoid rate limiting
            if (i + concurrencyLimit < chunks.length) {
                console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }
        }

        console.log(`✅ All ${chunks.length} chunks processed successfully`);

        // Step 3: Merge all chunk summaries into final analysis
        console.log(`🔗 Merging ${chunkSummaries.length} summaries into final analysis...`);
        const finalAnalysis = await mergeSummaries(chunkSummaries, fileName, fileType);

        return {
            summary: finalAnalysis.summary || "Analysis completed",
            themes: finalAnalysis.themes || [],
            keyPoints: finalAnalysis.keyPoints || [],
            documentType: finalAnalysis.documentType || "Document",
            sentiment: finalAnalysis.sentiment || "Neutral"
        };

    } catch (error) {
        console.error('❌ Gemini API error:', error);

        // Provide fallback analysis
        return {
            summary: `Analysis temporarily unavailable. Document contains ${text.length} characters. Please try again in a few moments.`,
            themes: ["Document analysis pending"],
            keyPoints: [`Document size: ${text.length} characters`, `File type: ${fileType}`],
            documentType: fileType || "Document",
            sentiment: "Unknown",
            error: error.message
        };
    }
}

async function generateAISummarySequential(text, fileName, fileType) {
    try {
        console.log(`📊 Analyzing document of ${text.length} characters (sequential mode)...`);

        const chunks = splitTextIntoChunks(text, 25000);
        console.log(`📦 Split into ${chunks.length} chunks`);

        if (chunks.length === 1) {
            return await generateAISummary(text, fileName, fileType);
        }

        // Process chunks one by one (slower but more reliable)
        const chunkSummaries = [];
        for (let i = 0; i < chunks.length; i++) {
            console.log(`📝 Processing chunk ${i+1}/${chunks.length}...`);

            let retryCount = 0;
            let success = false;

            while (!success && retryCount < 3) {
                try {
                    const summary = await summarizeChunk(chunks[i], i+1, chunks.length, retryCount);
                    chunkSummaries.push(summary);
                    success = true;
                    console.log(`✅ Chunk ${i+1}/${chunks.length} completed`);

                    // Wait between chunks to avoid rate limiting
                    if (i < chunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } catch (error) {
                    retryCount++;
                    if (retryCount >= 3) {
                        console.error(`❌ Failed to process chunk ${i+1} after 3 attempts`);
                        chunkSummaries.push({
                            summary: `[Processing failed for section ${i+1}]`,
                            keyPoints: [],
                            themes: []
                        });
                    }
                }
            }
        }

        return await mergeSummaries(chunkSummaries, fileName, fileType);

    } catch (error) {
        console.error('❌ Sequential processing error:', error);
        throw error;
    }
}

function generateDetailedAnalysis(extractedData) {
    const { text, pageCount, metadata } = extractedData;
    const keywords = extractKeywords(text);

    // Calculate statistics
    const lines = text.split('\n').length;
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const paragraphs = text.split(/\n\n+/).length;
    const avgWordLength = (text.replace(/\s/g, '').length / words).toFixed(2);
    const avgSentenceLength = (words / sentences).toFixed(2);

    // Identify language (simple detection)
    const frenchWords = ['le', 'la', 'de', 'et', 'à', 'en', 'que', 'est', 'je', 'vous'];
    const englishWords = ['the', 'a', 'and', 'to', 'of', 'in', 'is', 'you', 'that', 'for'];

    const frenchCount = frenchWords.filter(word =>
        text.toLowerCase().includes(word)
    ).length;
    const englishCount = englishWords.filter(word =>
        text.toLowerCase().includes(word)
    ).length;

    const language = frenchCount > englishCount ? 'Français' : 'Anglais';

    // Calculate reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(words / 200);

    return {
        statistics: {
            totalCharacters: text.length,
            totalWords: words,
            totalLines: lines,
            totalSentences: sentences,
            totalParagraphs: paragraphs,
            pageCount: pageCount,
            averageWordLength: avgWordLength,
            averageSentenceLength: avgSentenceLength,
            estimatedReadingTime: `${readingTimeMinutes} minutes`,
            detectedLanguage: language
        },
        metadata: metadata,
        topKeywords: keywords,
        textComplexity: calculateComplexity(words, sentences, avgWordLength)
    };
}

function calculateComplexity(words, sentences, avgWordLength) {
    // Flesch-Kincaid style complexity
    const complexity = (0.39 * (words / sentences)) + (11.8 * (avgWordLength / 5)) - 15.59;

    let level = 'Simple';
    let score = 'Facile';

    if (complexity < 6) {
        level = 'Elementary School';
        score = 'Très facile';
    } else if (complexity < 9) {
        level = 'Middle School';
        score = 'Facile';
    } else if (complexity < 13) {
        level = 'High School';
        score = 'Moyen';
    } else if (complexity < 16) {
        level = 'College';
        score = 'Difficile';
    } else {
        level = 'Graduate School';
        score = 'Très difficile';
    }

    return {
        score: score,
        level: level,
        index: complexity.toFixed(2)
    };
}

async function generateCompleteResume(rawText, fileName, fileType) {
    const extractedData = { text: rawText, pageCount: 1, metadata: {} };
    const detailedAnalysis = generateDetailedAnalysis(extractedData);

    // Generate AI summary
    const aiSummary = await generateAISummary(rawText, fileName, fileType);
    /*const aiSummary= {
        summary: "Analysis failed",
        themes: [],
        keyPoints: [],
        documentType: "Unknown",
        sentiment: "N/A",
        error: "error.message"
      };*/
    // Create preview (first 800 characters or until first paragraph break, whichever is smaller)
    let preview = rawText.substring(0, 800);
    const paragraphBreak = preview.indexOf('\n\n');
    if (paragraphBreak > -1 && paragraphBreak < 800) {
        preview = preview.substring(0, paragraphBreak);
    }
    if (rawText.length > preview.length) {
        preview += '\n\n...';
    }

    return {
        fileName: fileName,
        fileType: fileType,
        generatedAt: new Date().toISOString(),
        preview: preview,
        fullText: rawText,  // Add full text for client if needed
        analysis: {
            statistics: detailedAnalysis.statistics,
            complexity: detailedAnalysis.textComplexity,
            topKeywords: detailedAnalysis.topKeywords
        },
        aiSummary: aiSummary,
        metadata: detailedAnalysis.metadata
    };
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


class GeminiService {
    static async upload( file,filePath,fileName,fileType){
    try {
        console.log(`Processing file: ${fileName}`);

        const extractedContent = await extractFileContent(filePath);

        const resume = await generateCompleteResume(
            extractedContent.text,
            fileName,
            fileType
        );

        fs.unlinkSync(filePath);
        return {
            status: 'success',
            data: resume
        }

        } catch (error) {
            console.error('Error:', error);
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({
                status: 'error',
                error: error.message
            });
        }
}

}


export default GeminiService;
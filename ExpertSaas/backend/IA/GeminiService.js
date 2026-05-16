const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const mammoth = require('mammoth');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY est requis');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.maxRetries = 5;
        this.baseDelay = 2000;
        this.uploadDir = 'uploads';

        // Créer le répertoire uploads s'il n'existe pas
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Télécharger un fichier depuis une URL (Cloudinary, etc.)
     */
    async downloadFromURL(fileURL, fileName) {
        return new Promise((resolve, reject) => {
            try {
                const parsedUrl = new URL(fileURL);
                const protocol = parsedUrl.protocol === 'https:' ? https : http;
                const fileName_sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = path.join(this.uploadDir, `${Date.now()}-${fileName_sanitized}`);

                const file = fs.createWriteStream(filePath);

                const request = protocol.get(fileURL, (response) => {
                    // Gérer les redirections
                    if (response.statusCode === 301 || response.statusCode === 302) {
                        fs.unlinkSync(filePath);
                        return this.downloadFromURL(response.headers.location, fileName)
                            .then(resolve)
                            .catch(reject);
                    }

                    if (response.statusCode !== 200) {
                        fs.unlinkSync(filePath);
                        reject(new Error(`Échec du téléchargement. Code d'état : ${response.statusCode}`));
                        return;
                    }

                    response.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ Téléchargé : ${fileName} vers ${filePath}`);
                        resolve(filePath);
                    });
                });

                request.on('error', (err) => {
                    fs.unlink(filePath, () => { });
                    reject(new Error(`Échec du téléchargement : ${err.message}`));
                });

                file.on('error', (err) => {
                    fs.unlink(filePath, () => { });
                    reject(new Error(`Erreur d'écriture du fichier : ${err.message}`));
                });

            } catch (error) {
                reject(new Error(`Erreur d'analyse de l'URL : ${error.message}`));
            }
        });
    }

    /**
     * Analyser un fichier depuis une URL Cloudinary
     */
    async analyzeFromURL(fileURL, fileName) {
        let filePath = null;
        try {
            console.log(`📥 Téléchargement du fichier depuis l'URL : ${fileURL}`);
            filePath = await this.downloadFromURL(fileURL, fileName);
            console.log(`✅ Fichier téléchargé avec succès`);

            const fileType = path.extname(fileName).toLowerCase();
            const result = await this.uploadFile(filePath, fileName, fileType);

            return result;

        } catch (error) {
            console.error('Erreur :', error);
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }

    /**
     * Analyse par lot depuis plusieurs URLs
     */
    async analyzeFromURLBatch(filesData) {
        try {
            if (!filesData || filesData.length === 0) {
                throw new Error('Aucun fichier fourni');
            }

            const startTime = Date.now();

            const promises = filesData.map(async (fileData) => {
                let filePath = null;
                try {
                    const { url, fileName } = fileData;

                    if (!url || !fileName) {
                        throw new Error('Chaque fichier doit avoir "url" et "fileName"');
                    }

                    console.log(`📥 Téléchargement : ${fileName}`);
                    filePath = await this.downloadFromURL(url, fileName);

                    const fileType = path.extname(fileName).toLowerCase();
                    const result = await this.uploadFile(filePath, fileName, fileType);

                    return {
                        status: 'success',
                        fileName: fileName,
                        data: result.data
                    };

                } catch (error) {
                    console.error(`Erreur lors du traitement de ${fileData.fileName} :`, error.message);

                    if (filePath && fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    return {
                        status: 'error',
                        fileName: fileData.fileName,
                        error: error.message
                    };
                }
            });

            const results = await Promise.all(promises);
            const processingTime = (Date.now() - startTime) / 1000;

            return {
                status: 'completed',
                totalFiles: filesData.length,
                successful: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'error').length,
                processingTime: `${processingTime.toFixed(2)}s`,
                results: results
            };

        } catch (error) {
            console.error('Erreur de traitement par lot :', error);
            throw error;
        }
    }

    // ============= FONCTIONS D'EXTRACTION =============

    /**
     * Extraire le texte d'un PDF
     */
    async extractFromPDF(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);

            let data;
            if (typeof pdfParse === 'function') {
                data = await pdfParse(dataBuffer);
            } else if (pdfParse.default && typeof pdfParse.default === 'function') {
                data = await pdfParse.default(dataBuffer);
            } else {
                throw new Error('pdfParse n\'est pas correctement initialisé');
            }

            return {
                text: data.text,
                pageCount: data.numpages,
                metadata: data.metadata || {}
            };
        } catch (error) {
            throw new Error(`Échec de l'extraction PDF : ${error.message}`);
        }
    }

    /**
     * Extraire le texte d'un DOCX
     */
    async extractFromDOCX(filePath) {
        try {
            const docx = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: docx });
            return {
                text: result.value,
                pageCount: Math.ceil(result.value.length / 3000),
                metadata: {}
            };
        } catch (error) {
            throw new Error(`Échec de l'extraction DOCX : ${error.message}`);
        }
    }

    /**
     * Extraire les données d'un Excel
     */
    async extractFromExcel(filePath) {
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
            throw new Error(`Échec de l'extraction Excel : ${error.message}`);
        }
    }

    /**
     * Extraction générique de fichier basée sur l'extension
     */
    async extractFileContent(filePath) {
        const ext = path.extname(filePath).toLowerCase();

        switch (ext) {
            case '.pdf':
                return await this.extractFromPDF(filePath);
            case '.docx':
            case '.doc':
                return await this.extractFromDOCX(filePath);
            case '.xlsx':
            case '.xls':
            case '.csv':
                return await this.extractFromExcel(filePath);
            default:
                throw new Error(`Format de fichier non supporté : ${ext}`);
        }
    }

    // ============= FONCTIONS D'ANALYSE =============

    /**
     * Extraire les mots-clés du texte
     */
    extractKeywords(text, limit = 15) {
        const commonWords = new Set([
            'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'ni',
            'de', 'du', 'des', 'pour', 'par', 'sur', 'dans', 'avec', 'sans', 'sous',
            'est', 'sont', 'était', 'étaient', 'sera', 'seront', 'a', 'ont', 'avait',
            'avaient', 'aura', 'auront', 'ce', 'cet', 'cette', 'ces', 'il', 'elle',
            'ils', 'elles', 'nous', 'vous', 'je', 'tu', 'me', 'te', 'se', 'lui',
            'leur', 'eux', 'y', 'en', 'que', 'qui', 'quoi', 'dont', 'où'
        ]);

        const words = text.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3 && !commonWords.has(word));

        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, count]) => ({ word, count }));
    }

    /**
     * Diviser le texte en morceaux pour le traitement
     */
    splitTextIntoChunks(text, maxChunkSize = 25000) {
        const chunks = [];
        let startIndex = 0;

        while (startIndex < text.length) {
            let endIndex = Math.min(startIndex + maxChunkSize, text.length);

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

    /**
     * Générer un résumé pour un seul morceau
     */
    async summarizeChunk(chunk, chunkNumber, totalChunks, retryCount = 0) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const prompt = `Vous analysez la PARTIE ${chunkNumber} sur ${totalChunks} d'un document.
      Fournissez une analyse concise de CETTE PARTIE uniquement.
      
      Retournez un objet JSON avec :
      {
        "summary": "Résumé bref de cette section (2-3 phrases en français)",
        "keyPoints": ["point clé 1", "point clé 2"],
        "themes": ["thème 1", "thème 2"]
      }
      
      Contenu de la section :
      """
      ${chunk}
      """`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());

        } catch (error) {
            if (error.status === 503 || error.status === 429 || error.status === 500) {
                if (retryCount < this.maxRetries) {
                    const delay = this.baseDelay * Math.pow(2, retryCount);
                    console.log(`⚠️ Morceau ${chunkNumber} échoué (tentative ${retryCount + 1}/${this.maxRetries}), nouvelle tentative dans ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.summarizeChunk(chunk, chunkNumber, totalChunks, retryCount + 1);
                }
            }
            throw error;
        }
    }

    /**
     * Fusionner plusieurs résumés de morceaux en une analyse finale
     */
    async mergeSummaries(chunkSummaries, fileName, fileType) {
        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const combinedSummaries = chunkSummaries.map((s, i) =>
            `PARTIE ${i + 1}: ${s.summary}\nPoints clés : ${s.keyPoints.join(', ')}`
        ).join('\n\n');

        const prompt = `Vous êtes un expert en analyse de documents. Vous avez reçu ${chunkSummaries.length} résumés de différentes parties d'un document.
    
    En vous basant sur TOUS ces résumés partiels, créez une analyse finale complète.
    
    Résumés partiels :
    """
    ${combinedSummaries}
    """
    
    Retournez un objet JSON avec :
    {
      "summary": "Résumé exécutif de 2-3 phrases du document ENTIER (en français)",
      "themes": ["thème principal 1", "thème principal 2", "thème principal 3"],
      "keyPoints": ["point le plus important 1", "point le plus important 2", "point le plus important 3"],
      "documentType": "Type de document (Rapport, Contrat, Guide, etc.)",
      "sentiment": "Ton général (Professionnel, Technique, Éducatif, etc.)"
    }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    }

    /**
     * Générer un résumé alimenté par l'IA avec fragmentation pour les gros fichiers
     */
    async generateAISummary(text, fileName, fileType) {
        try {
            console.log(`📊 Analyse d'un document de ${text.length} caractères...`);

            const chunks = this.splitTextIntoChunks(text, 25000);
            console.log(`📦 Divisé en ${chunks.length} morceaux`);

            // Morceau unique - traitement direct
            if (chunks.length === 1) {
                console.log(`✅ Le document tient dans un seul morceau, traitement direct...`);
                const model = this.genAI.getGenerativeModel({
                    model: "gemini-2.5-flash-lite",
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                });

                const prompt = `Vous êtes un expert en analyse de documents. Analysez ce contenu de fichier (${fileType}) et fournissez une analyse détaillée en français.
        
        Retournez un objet JSON avec ce schéma exact :
        {
          "summary": "Résumé exécutif de 2-3 phrases en français",
          "themes": ["thème 1", "thème 2", "thème 3"],
          "keyPoints": ["point clé 1", "point clé 2", "point clé 3"],
          "documentType": "Type de document",
          "sentiment": "Ton général"
        }
        
        Contenu du fichier :
        """
        ${chunks[0]}
        """`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const jsonResponse = JSON.parse(response.text());

                return {
                    summary: jsonResponse.summary || "Analyse terminée",
                    themes: jsonResponse.themes || [],
                    keyPoints: jsonResponse.keyPoints || [],
                    documentType: jsonResponse.documentType || "Document",
                    sentiment: jsonResponse.sentiment || "Neutre"
                };
            }

            // Morceaux multiples - traitement parallèle avec limitation de débit
            console.log(`🔄 Traitement de ${chunks.length} morceaux en parallèle avec limitation de débit...`);

            const chunkSummaries = [];
            const concurrencyLimit = 3;
            const delayBetweenBatches = 1000;

            for (let i = 0; i < chunks.length; i += concurrencyLimit) {
                const batch = chunks.slice(i, i + concurrencyLimit);
                const batchNumbers = Array.from({ length: batch.length }, (_, idx) => i + idx + 1);

                console.log(`📝 Traitement du lot ${Math.floor(i / concurrencyLimit) + 1} : morceaux ${batchNumbers[0]}-${batchNumbers[batchNumbers.length - 1]}`);

                const batchResults = await Promise.all(
                    batch.map((chunk, idx) => this.summarizeChunk(chunk, i + idx + 1, chunks.length))
                );

                chunkSummaries.push(...batchResults);

                if (i + concurrencyLimit < chunks.length) {
                    console.log(`⏳ Attente de ${delayBetweenBatches}ms avant le prochain lot...`);
                    await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
                }
            }

            console.log(`✅ Tous les ${chunks.length} morceaux traités avec succès`);

            const finalAnalysis = await this.mergeSummaries(chunkSummaries, fileName, fileType);

            return {
                summary: finalAnalysis.summary || "Analyse terminée",
                themes: finalAnalysis.themes || [],
                keyPoints: finalAnalysis.keyPoints || [],
                documentType: finalAnalysis.documentType || "Document",
                sentiment: finalAnalysis.sentiment || "Neutre"
            };

        } catch (error) {
            console.error('❌ Erreur API Gemini :', error);

            return {
                summary: `Analyse temporairement indisponible. Le document contient ${text.length} caractères. Veuillez réessayer dans quelques instants.`,
                themes: ["Analyse du document en attente"],
                keyPoints: [`Taille du document : ${text.length} caractères`, `Type de fichier : ${fileType}`],
                documentType: fileType || "Document",
                sentiment: "Inconnu",
                error: error.message
            };
        }
    }

    /**
     * Traitement séquentiel pour les fichiers très volumineux (plus fiable)
     */
    async generateAISummarySequential(text, fileName, fileType) {
        try {
            console.log(`📊 Analyse d'un document de ${text.length} caractères (mode séquentiel)...`);

            const chunks = this.splitTextIntoChunks(text, 25000);
            console.log(`📦 Divisé en ${chunks.length} morceaux`);

            if (chunks.length === 1) {
                return await this.generateAISummary(text, fileName, fileType);
            }

            const chunkSummaries = [];
            for (let i = 0; i < chunks.length; i++) {
                console.log(`📝 Traitement du morceau ${i + 1}/${chunks.length}...`);

                let retryCount = 0;
                let success = false;

                while (!success && retryCount < 3) {
                    try {
                        const summary = await this.summarizeChunk(chunks[i], i + 1, chunks.length, retryCount);
                        chunkSummaries.push(summary);
                        success = true;
                        console.log(`✅ Morceau ${i + 1}/${chunks.length} terminé`);

                        if (i < chunks.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    } catch (error) {
                        retryCount++;
                        if (retryCount >= 3) {
                            console.error(`❌ Échec du traitement du morceau ${i + 1} après 3 tentatives`);
                            chunkSummaries.push({
                                summary: `[Traitement échoué pour la section ${i + 1}]`,
                                keyPoints: [],
                                themes: []
                            });
                        }
                    }
                }
            }

            return await this.mergeSummaries(chunkSummaries, fileName, fileType);

        } catch (error) {
            console.error('❌ Erreur de traitement séquentiel :', error);
            throw error;
        }
    }

    /**
     * Calculer le score de complexité du texte
     */
    calculateComplexity(words, sentences, avgWordLength) {
        const complexity = (0.39 * (words / sentences)) + (11.8 * (avgWordLength / 5)) - 15.59;

        let level = 'Simple';
        let score = 'Facile';

        if (complexity < 6) {
            level = 'Primaire';
            score = 'Très facile';
        } else if (complexity < 9) {
            level = 'Collège';
            score = 'Facile';
        } else if (complexity < 13) {
            level = 'Lycée';
            score = 'Moyen';
        } else if (complexity < 16) {
            level = 'Université';
            score = 'Difficile';
        } else {
            level = 'Master/Doctorat';
            score = 'Très difficile';
        }

        return {
            score: score,
            level: level,
            index: complexity.toFixed(2)
        };
    }

    /**
     * Générer un rapport d'analyse détaillé
     */
    generateDetailedAnalysis(extractedData) {
        const { text, pageCount, metadata } = extractedData;
        const keywords = this.extractKeywords(text);

        const lines = text.split('\n').length;
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length;
        const paragraphs = text.split(/\n\n+/).length;
        const avgWordLength = (text.replace(/\s/g, '').length / words).toFixed(2);
        const avgSentenceLength = (words / sentences).toFixed(2);

        // Détection de la langue (français par défaut)
        const frenchWords = ['le', 'la', 'de', 'et', 'à', 'en', 'que', 'est', 'je', 'vous'];
        const englishWords = ['the', 'a', 'and', 'to', 'of', 'in', 'is', 'you', 'that', 'for'];

        const frenchCount = frenchWords.filter(word => text.toLowerCase().includes(word)).length;
        const englishCount = englishWords.filter(word => text.toLowerCase().includes(word)).length;

        const language = frenchCount > englishCount ? 'Français' : 'Anglais';
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
            textComplexity: this.calculateComplexity(words, sentences, avgWordLength)
        };
    }

    /**
     * Générer un rapport d'analyse complet
     */
    async generateCompleteResume(rawText, fileName, fileType) {
        const extractedData = { text: rawText, pageCount: 1, metadata: {} };
        const detailedAnalysis = this.generateDetailedAnalysis(extractedData);

        const aiSummary = await this.generateAISummary(rawText, fileName, fileType);

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
            fullText: rawText,
            analysis: {
                statistics: detailedAnalysis.statistics,
                complexity: detailedAnalysis.textComplexity,
                topKeywords: detailedAnalysis.topKeywords
            },
            aiSummary: aiSummary,
            metadata: detailedAnalysis.metadata
        };
    }

    // ============= MÉTHODES API PUBLIQUES =============

    /**
     * Télécharger et analyser un seul fichier
     */
    async uploadFile(filePath, fileName, fileType) {
        try {
            console.log(`Traitement du fichier : ${fileName}`);

            const extractedContent = await this.extractFileContent(filePath);

            const resume = await this.generateCompleteResume(
                extractedContent.text,
                fileName,
                fileType
            );

            // Nettoyer le fichier téléchargé
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            return {
                status: 'success',
                data: resume
            };

        } catch (error) {
            console.error('Erreur :', error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }

    /**
     * Téléchargement et analyse par lots de plusieurs fichiers
     */
    async uploadBatch(files) {
        try {
            if (!files || files.length === 0) {
                throw new Error('Aucun fichier fourni');
            }

            const startTime = Date.now();

            const promises = files.map(async (file) => {
                try {
                    const filePath = file.path;
                    const fileName = file.originalname;
                    const fileType = path.extname(fileName);

                    console.log(`Traitement du fichier : ${fileName}`);

                    const extractedContent = await this.extractFileContent(filePath);

                    const resume = await this.generateCompleteResume(
                        extractedContent.text,
                        fileName,
                        fileType
                    );

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    return {
                        status: 'success',
                        data: resume
                    };
                } catch (error) {
                    console.error(`Erreur lors du traitement de ${file.originalname} :`, error.message);

                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }

                    return {
                        status: 'error',
                        fileName: file.originalname,
                        error: error.message
                    };
                }
            });

            const results = await Promise.all(promises);
            const processingTime = (Date.now() - startTime) / 1000;

            return {
                status: 'completed',
                totalFiles: files.length,
                successful: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'error').length,
                processingTime: `${processingTime.toFixed(2)}s`,
                results: results
            };

        } catch (error) {
            console.error('Erreur de traitement par lot :', error);
            throw error;
        }
    }

    /**
     * Analyser du texte brut
     */
    async analyzeText(text) {
        try {
            if (!text || text.trim().length === 0) {
                throw new Error('Aucun texte fourni');
            }

            const resume = await this.generateCompleteResume(text, 'texte-brut', '.txt');

            return {
                status: 'success',
                data: resume
            };

        } catch (error) {
            console.error('Erreur :', error);
            throw error;
        }
    }

    /**
     * Extraire le texte d'un fichier sans analyse
     */
    async extractText(filePath, fileName) {
        try {
            const extractedContent = await this.extractFileContent(filePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            return {
                status: 'success',
                fileName: fileName,
                fileType: path.extname(fileName),
                extractedText: extractedContent.text,
                pageCount: extractedContent.pageCount,
                metadata: extractedContent.metadata
            };

        } catch (error) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }

    /**
     * Tester les modèles Gemini disponibles
     */
    async testModels() {
        const results = [];

        const modelsToTest = [
            { name: "gemini-2.5-flash", type: "Stable, rapide et puissant. Idéal pour la plupart des tâches." },
            { name: "gemini-2.5-pro", type: "Stable, le plus avancé pour le raisonnement complexe." },
            { name: "gemini-2.5-flash-lite", type: "Stable, optimisé pour le coût et la faible latence." },
            { name: "gemini-3-flash-preview", type: "Aperçu du modèle Flash de nouvelle génération." },
            { name: "gemini-3-pro-preview", type: "Aperçu du modèle Pro de nouvelle génération." }
        ];

        console.log(`\n🔍 Test de ${modelsToTest.length} modèles Gemini actuels...\n`);

        for (const modelConfig of modelsToTest) {
            const startTime = Date.now();
            const result = {
                model: modelConfig.name,
                type: modelConfig.type,
                status: "unknown",
                error: null,
                responseTime: null,
                working: false
            };

            try {
                console.log(`📡 Test : ${modelConfig.name}...`);

                const model = this.genAI.getGenerativeModel({
                    model: modelConfig.name,
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.1,
                        maxOutputTokens: 100
                    }
                });

                const testPrompt = `Retournez un objet JSON avec un champ : "status" défini sur "ok"`;
                const response = await model.generateContent(testPrompt);
                const responseText = await response.response.text();

                JSON.parse(responseText);
                result.status = "success";
                result.working = true;
                result.responseTime = `${Date.now() - startTime}ms`;
                console.log(`✅ ${modelConfig.name} - FONCTIONNE (${result.responseTime})`);

            } catch (error) {
                result.status = "failed";
                result.working = false;

                if (error.status === 429) {
                    result.error = "Limite de débit dépassée. Vous avez peut-être épuisé votre quota quotidien du niveau gratuit.";
                    result.errorType = "RATE_LIMIT";
                } else if (error.message?.includes('404') || error.message?.includes('not found')) {
                    result.error = "Modèle non trouvé. Veuillez vérifier le nom.";
                    result.errorType = "NOT_FOUND";
                } else {
                    result.error = error.message || "Erreur inconnue";
                    result.errorType = "OTHER";
                }
                console.log(`❌ ${modelConfig.name} - ÉCHEC : ${result.error}`);
            }

            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const workingModels = results.filter(r => r.working);
        const failedModels = results.filter(r => !r.working);

        console.log(`\n📊 RÉSUMÉ : ${workingModels.length}/${modelsToTest.length} modèles fonctionnent\n`);

        return {
            timestamp: new Date().toISOString(),
            totalTested: results.length,
            workingCount: workingModels.length,
            failedCount: failedModels.length,
            workingModels: workingModels,
            failedModels: failedModels.map(m => ({ name: m.model, error: m.error })),
            recommendation: workingModels.length > 0
                ? `✅ Utilisez "${workingModels[0].model}" - c'est un modèle stable et actuel.`
                : "❌ Aucun modèle ne fonctionne. Vérifiez votre clé API et votre statut de facturation dans Google AI Studio."
        };
    }

    /**
     * Obtenir l'état de santé
     */
    getHealthStatus() {
        return {
            status: 'running',
            timestamp: new Date().toISOString(),
            services: {
                server: 'online',
                geminiAI: 'connected'
            },
            message: 'Tous les systèmes sont opérationnels'
        };
    }
}

module.exports = GeminiService;
const express = require('express');
const multer = require('multer');
const path = require('path');
const GeminiService = require('./GeminiService');

const router = express.Router();

// Initialize GeminiService with API key from environment
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Multer configuration for local file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ============= CLOUDINARY URL ROUTES =============

/**
 * POST /from-url - Analyze file from Cloudinary URL
 * Body: {
 *   "url": "https://res.cloudinary.com/.../file.pdf",
 *   "fileName": "document.pdf"
 * }
 */
router.post('/from-url', express.json(), async (req, res) => {
  try {
    const { url, fileName } = req.body;

    if (!url || !fileName) {
      return res.status(400).json({
        error: 'Missing required fields: url and fileName'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }

    console.log(`\n📥 Processing Cloudinary file: ${fileName}`);
    const result = await geminiService.analyzeFromURL(url, fileName);

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /from-urls - Batch analyze from multiple Cloudinary URLs
 * Body: {
 *   "files": [
 *     { "url": "...", "fileName": "doc1.pdf" },
 *     { "url": "...", "fileName": "doc2.docx" }
 *   ]
 * }
 */
router.post('/from-urls', express.json(), async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: 'Missing required field: files (array)'
      });
    }

    // Validate all files have url and fileName
    const invalid = files.filter(f => !f.url || !f.fileName);
    if (invalid.length > 0) {
      return res.status(400).json({
        error: 'Each file must have "url" and "fileName"'
      });
    }

    // Validate all URLs
    try {
      files.forEach(f => new URL(f.url));
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format in files'
      });
    }

    console.log(`\n📥 Processing ${files.length} Cloudinary files...`);
    const result = await geminiService.analyzeFromURLBatch(files);

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ============= LOCAL FILE ROUTES =============

/**
 * POST /upload - Upload and analyze a single file
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = path.extname(fileName);

    const result = await geminiService.uploadFile(filePath, fileName, fileType);

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /batch - Upload and analyze multiple files
 */
router.post('/batch', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const result = await geminiService.uploadBatch(req.files);

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /analyze - Analyze raw text
 */
router.post('/analyze', express.text(), async (req, res) => {
  try {
    const text = req.body;

    const result = await geminiService.analyzeText(text);

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /extract - Extract text without analysis
 */
router.post('/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    const result = await geminiService.extractText(filePath, fileName);

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /extract-from-url - Extract text from URL without analysis
 */
router.post('/extract-from-url', express.json(), async (req, res) => {
  try {
    const { url, fileName } = req.body;

    if (!url || !fileName) {
      return res.status(400).json({
        error: 'Missing required fields: url and fileName'
      });
    }

    let filePath = null;
    try {
      console.log(`📥 Downloading file: ${fileName}`);
      filePath = await geminiService.downloadFromURL(url, fileName);

      const result = await geminiService.extractText(filePath, fileName);
      res.json(result);

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ============= HEALTH & TEST ROUTES =============

/**
 * GET /health - Health check
 */
router.get('/health', (req, res) => {
  const health = geminiService.getHealthStatus();
  res.json(health);
});

/**
 * GET /test-models - Test available Gemini models
 */
router.get('/test-models', async (req, res) => {
  try {
    const results = await geminiService.testModels();
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ============= DEMO & DOCUMENTATION =============


router.post('/test', express.json(), async (req, res) => {
  try {
    const { type } = req.body;

    if (!type || !['text', 'docx'].includes(type)) {
      return res.status(400).json({
        error: 'Missing or invalid type. Use "text" or "docx"'
      });
    }

    let testData;

    if (type === 'text') {
      testData = {
        url: 'https://res.cloudinary.com/dqqegvzt4/raw/upload/v1777982206/Agenda/log.txt',
        fileName: 'log.txt'
      };
    } else {
      testData = {
        url: 'https://res.cloudinary.com/dqqegvzt4/raw/upload/v1778918914/Agenda/Examen_Devops_5-GLSI-S_Principale_2025-2026_-_Correction_3.docx',
        fileName: 'Examen_Devops_5-GLSI-S_Principale_2025-2026_-_Correction_3.docx'
      };
    }

    console.log(`\n🧪 Testing with ${type} file...`);
    const result = await geminiService.analyzeFromURL(testData.url, testData.fileName);

    res.json({
      test_type: type,
      message: 'Test completed successfully',
      result
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      test_type: req.body.type,
      error: error.message
    });
  }
});

module.exports = router;

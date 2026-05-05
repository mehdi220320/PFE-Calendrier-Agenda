const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authentication, googleAuth ,adminAuthorization} = require('../middleware/authMiddleware');
const Document = require('./Document');
const uploadToCloudinary = require('../config/cloudinary');
require('../models/Associations');
const User = require("../models/User");
const { fn, col } = require('sequelize');

// Configure multer for memory storage (files will be uploaded to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max file size
    }
});

// ==================== EXPERT ENDPOINTS ====================

/**
 * CREATE: Expert sends document(s) to client
 * POST /api/documents/send
 * Requires authentication middleware (expert)
 * Body: { title, description, summary, receiverId }
 * Files: multiple files can be attached
 */
router.post('/send', authentication, upload.array('files', 10), async (req, res) => {
    try {
        const { title, description, summary, receiverId } = req.body;
        const expertId = req.user.userId;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one file is required' });
        }

        // Verify receiver exists
        const receiver = await User.findByPk(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Upload files and collect file data
        const uploadPromises = req.files.map(async (file) => {
            try {
                const cloudinaryResult = await uploadToCloudinary(file.buffer, file.originalname);

                return {
                    fileName: file.originalname,
                    fileUrl: cloudinaryResult.secure_url,
                    fileType: file.mimetype.split('/')[0],
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    uploadedAt: new Date()
                };
            } catch (error) {
                console.error('File upload error:', error);
                throw new Error(`Failed to upload file: ${file.originalname}`);
            }
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        // Create document with files array
        const document = await Document.create({
            title: title.trim(),
            description: description || null,
            summary: summary || null,
            sender: expertId,
            receiver: receiverId,
            files: uploadedFiles,
            status: 'sent'
        });

        // Fetch complete document with relations
        const completeDocument = await Document.findByPk(document.id, {
            include: [
                {
                    model: User,
                    as: 'senderUser',
                    attributes: ['id', 'firstname', 'email']
                },
                {
                    model: User,
                    as: 'receiverUser',
                    attributes: ['id', 'firstname', 'email']
                }
            ]
        });

        return res.status(201).json({
            message: 'Document sent successfully',
            document: completeDocument
        });

    } catch (error) {
        console.error('Error sending document:', error);
        return res.status(500).json({
            message: 'Error sending document',
            error: error.message
        });
    }
});

/**
 * READ: Expert views all documents sent by them
 * GET /api/documents/sent
 * Requires authentication middleware (expert)
 */
router.get('/sent', authentication, async (req, res) => {
    try {
        const expertId = req.user.userId;

        const documents = await Document.findAll({
            where: { sender: expertId },
            include: [
                {
                    model: User,
                    as: 'receiverUser',
                    attributes: ['id',
                        [fn('concat', col('receiverUser.firstname'), ' ', col('receiverUser.lastname')), 'name'],
                        'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            count: documents.length,
            documents: documents
        });

    } catch (error) {
        console.error('Error fetching sent documents:', error);
        return res.status(500).json({
            message: 'Error fetching documents',
            error: error.message
        });
    }
});

/**
 * UPDATE: Expert updates a document
 * PUT /api/documents/:documentId
 * Requires authentication middleware (expert)
 * Can update title, description, summary
 */
router.put('/:documentId', authentication, async (req, res) => {
    try {
        const { documentId } = req.params;
        const { title, description, summary } = req.body;
        const expertId = req.user.userId;

        const document = await Document.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify ownership (only expert who sent can update)
        if (document.sender !== expertId) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own documents' });
        }

        // Prevent updating viewed documents
        if (document.status === 'viewed') {
            return res.status(400).json({ message: 'Cannot update a viewed document' });
        }

        // Update allowed fields
        if (title) document.title = title.trim();
        if (description !== undefined) document.description = description;
        if (summary !== undefined) document.summary = summary;

        await document.save();

        const updatedDocument = await Document.findByPk(documentId, {
            include: [
                {
                    model: User,
                    as: 'senderUser',
                    attributes: ['id', 'firstname', 'email']
                },
                {
                    model: User,
                    as: 'receiverUser',
                    attributes: ['id', 'firstname', 'email']
                }
            ]
        });

        return res.status(200).json({
            message: 'Document updated successfully',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            message: 'Error updating document',
            error: error.message
        });
    }
});

/**
 * DELETE: Expert deletes a document
 * DELETE /api/documents/:documentId
 * Requires authentication middleware (expert)
 * Can only delete pending or sent documents
 */
router.delete('/:documentId', authentication, async (req, res) => {
    try {
        const { documentId } = req.params;
        const expertId = req.user.userId;

        const document = await Document.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify ownership
        if (document.sender !== expertId) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own documents' });
        }

        // Can only delete if not yet viewed
        if (document.status === 'viewed') {
            return res.status(400).json({ message: 'Cannot delete a viewed document' });
        }

        // Delete document
        await document.destroy();

        return res.status(200).json({
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({
            message: 'Error deleting document',
            error: error.message
        });
    }
});

// ==================== CLIENT ENDPOINTS ====================

/**
 * READ: Client views all documents received
 * GET /api/documents/received
 * Requires googleAuth middleware (client)
 */
router.get('/received', googleAuth, async (req, res) => {
    try {
        const clientId = req.user.id;

        const documents = await Document.findAll({
            where: { receiver: clientId },
            include: [
                {
                    model: User,
                    as: 'senderUser',
                    attributes: ['id', 'firstname', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            count: documents.length,
            documents: documents
        });

    } catch (error) {
        console.error('Error fetching received documents:', error);
        return res.status(500).json({
            message: 'Error fetching documents',
            error: error.message
        });
    }
});

/**
 * READ: Client gets a specific document detail
 * GET /api/documents/:documentId
 * Requires googleAuth middleware (client)
 * Also marks document as viewed
 */
router.get('/:documentId', googleAuth, async (req, res) => {
    try {
        const { documentId } = req.params;
        const clientId = req.user.id;

        const document = await Document.findByPk(documentId, {
            include: [
                {
                    model: User,
                    as: 'senderUser',
                    attributes: ['id', 'firstname', 'email']
                },
                {
                    model: User,
                    as: 'receiverUser',
                    attributes: ['id', 'firstname', 'email']
                }
            ]
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify access (only receiver can view)
        if (document.receiver !== clientId) {
            return res.status(403).json({ message: 'Unauthorized: You can only view documents sent to you' });
        }

        // Mark as viewed if not already
        if (document.status !== 'viewed') {
            document.status = 'viewed';
            await document.save();
        }

        return res.status(200).json({
            document: document
        });

    } catch (error) {
        console.error('Error fetching document:', error);
        return res.status(500).json({
            message: 'Error fetching document',
            error: error.message
        });
    }
});

/**
 * READ: Get all documents (admin/analytics endpoint)
 * GET /api/documents/all
 * Requires authentication middleware
 * Returns all documents with pagination
 */
router.get('/all', adminAuthorization, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Document.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'senderUser',
                    attributes: ['id', 'firstname', 'email']
                },
                {
                    model: User,
                    as: 'receiverUser',
                    attributes: ['id', 'firstname', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            documents: rows
        });

    } catch (error) {
        console.error('Error fetching all documents:', error);
        return res.status(500).json({
            message: 'Error fetching documents',
            error: error.message
        });
    }
});

/**
 * DELETE: Client marks document as deleted (soft delete)
 * DELETE /api/documents/client/:documentId
 * Requires googleAuth middleware (client)
 * Client can only mark as deleted, not actually delete
 */
router.delete('/client/:documentId', googleAuth, async (req, res) => {
    try {
        const { documentId } = req.params;
        const clientId = req.user.id;

        const document = await Document.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify access
        if (document.receiver !== clientId) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete documents sent to you' });
        }

        // Archive/delete from client perspective
        await document.destroy();

        return res.status(200).json({
            message: 'Document deleted from your inbox'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({
            message: 'Error deleting document',
            error: error.message
        });
    }
});

module.exports = router;
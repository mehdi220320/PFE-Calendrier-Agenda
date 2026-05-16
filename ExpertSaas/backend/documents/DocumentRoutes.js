const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authentication, googleAuth, adminAuthorization } = require('../middleware/authMiddleware');
const Document = require('./Document');
const uploadToCloudinary = require('../config/cloudinary');
require('../models/Associations');
const User = require("../models/User");
const { fn, col,Op, where} = require('sequelize');
const { createNotification } = require("../notification/NotificationService");

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

// ==================== EXPERT ENDPOINTS ====================

router.post('/send', authentication, upload.array('files', 10), async (req, res) => {
    try {
        const { title, description, summary, receiverId } = req.body;
        const expertId = req.user.userId;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one file is required' });
        }

        // Verify receiver exists only if receiverId is provided (optional)
        let receiver = null;
        if (receiverId && receiverId !== 'undefined') {
            receiver = await User.findByPk(receiverId);
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }
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
            receiver: (receiverId && receiverId !== 'undefined') ? receiverId : null,
            sharedWith: [],
            files: uploadedFiles,
            status: receiverId && receiverId !== 'undefined' ? 'sent' : 'pending'
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
                    attributes: ['id', 'firstname', 'email'],
                    required: false
                }
            ]
        });

        if (receiver) {
            await createNotification({
                title: `📄 Nouveau document reçu`,
                description: `${req.user.firstname} vous a envoyé un nouveau document : "${title}"`,
                userId: receiverId,
                documentId: document.id
            });
        }

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

router.put('/:documentId', authentication, async (req, res) => {
    try {
        const { documentId } = req.params;
        const { title, description, summary, receiverId } = req.body;
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

        // Verify new receiver if provided
        if (receiverId && receiverId !== 'undefined') {
            const receiver = await User.findByPk(receiverId);
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }
            document.receiver = receiverId;
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

// ==================== SHARE ENDPOINTS ====================

router.post('/:documentId/share', authentication, async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userIds } = req.body; // Array of user IDs to share with
        const expertId = req.user.userId;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'At least one user ID is required' });
        }

        const document = await Document.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify ownership
        if (document.sender !== expertId) {
            return res.status(403).json({ message: 'Unauthorized: You can only share your own documents' });
        }

        // Verify all users exist
        const users = await User.findAll({ where: { id: userIds } });
        if (users.length !== userIds.length) {
            return res.status(404).json({ message: 'One or more users not found' });
        }

        // Update sharedWith array (avoid duplicates)
        const currentSharedWith = document.sharedWith || [];
        const updatedSharedWith = [...new Set([...currentSharedWith, ...userIds])];
        document.sharedWith = updatedSharedWith;
        await document.save();

        // Send notifications to all shared users
        for (const userId of userIds) {
            if (!currentSharedWith.includes(userId)) { // Only notify if not already shared
                await createNotification({
                    title: `📄 Document partagé`,
                    description: `${req.user.firstname} a partagé un document avec vous : "${document.title}"`,
                    userId: userId,
                    documentId: document.id
                });
            }
        }

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
            message: 'Document shared successfully',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error sharing document:', error);
        return res.status(500).json({
            message: 'Error sharing document',
            error: error.message
        });
    }
});

router.post('/:documentId/unshare', authentication, async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.body;
        const expertId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const document = await Document.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify ownership
        if (document.sender !== expertId) {
            return res.status(403).json({ message: 'Unauthorized: You can only unshare your own documents' });
        }

        // Remove user from sharedWith array
        const sharedWith = document.sharedWith || [];
        document.sharedWith = sharedWith.filter(id => id !== userId);
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
            message: 'Document unshared successfully',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error unsharing document:', error);
        return res.status(500).json({
            message: 'Error unsharing document',
            error: error.message
        });
    }
});

// ==================== CLIENT ENDPOINTS ====================

router.get('/received', googleAuth, async (req, res) => {
    try {
        const clientId = req.user.id;

        const documents = await Document.findAll({
            where: {
                [Op.or]: [
                    { receiver: clientId },
                    where(
                        fn('JSON_ARRAY_LENGTH', col('sharedWith')),
                        Op.gt,
                        0
                    )
                ]
            },
            include: [
                {
                    model: User,
                    as: 'senderUser',
                    attributes: ['id', 'firstname', 'email', 'lastname']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Client-side filter only for sharedWith (minimal filtering)
        const filteredDocuments = documents.filter(doc =>
            doc.receiver === clientId ||
            (Array.isArray(doc.sharedWith) && doc.sharedWith.includes(clientId))
        );

        return res.status(200).json({
            count: filteredDocuments.length,
            documents: filteredDocuments
        });

    } catch (error) {
        console.error('Error fetching received documents:', error);
        return res.status(500).json({
            message: 'Error fetching documents',
            error: error.message
        });
    }
});


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

        // Verify access (receiver or shared with)
        const sharedWith = document.sharedWith || [];
        if (document.receiver !== clientId && !sharedWith.includes(clientId)) {
            return res.status(403).json({ message: 'Unauthorized: You do not have access to this document' });
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

router.delete('/client/:documentId', googleAuth, async (req, res) => {
    try {
        const { documentId } = req.params;
        const clientId = req.user.id;

        const document = await Document.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Verify access
        const sharedWith = document.sharedWith || [];
        if (document.receiver !== clientId && !sharedWith.includes(clientId)) {
            return res.status(403).json({ message: 'Unauthorized: You do not have access to this document' });
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
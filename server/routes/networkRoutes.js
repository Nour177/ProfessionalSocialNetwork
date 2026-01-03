import express from 'express';
import {
    getSuggestions,
    getPendingInvitations,
    getConnections,
    sendConnectionRequest,
    acceptConnection,
    declineConnection
} from '../controllers/networkController.js';

const router = express.Router();

router.get('/api/network/suggestions', getSuggestions);
router.get('/api/network/invitations', getPendingInvitations);
router.get('/api/network/connections', getConnections);
router.post('/api/network/connect', sendConnectionRequest);
router.post('/api/network/accept', acceptConnection);
router.post('/api/network/decline', declineConnection);

export default router;


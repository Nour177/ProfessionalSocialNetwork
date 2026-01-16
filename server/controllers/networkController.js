import employee from '../models/Employees.js';
import Connection from '../models/connection.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationController.js';

// Obtenir 5 suggestions aléatoires (utilisateurs de la base- pas connecté avec )
export const getSuggestions = async (req, res) => {
    try {
        const { email } = req.query;
        const userEmail = email || req.session?.user?.email;
        
        if (!userEmail) {
            return res.status(400).json({ success: false, message: 'User email required' });
        }

        //l'utilisateur actuel
        const currentUser = await employee.findOne({ email: userEmail });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Trouver tous les utilisateurs avec qui l'utilisateur a déjà une connexion (pending, accepted, rejected)
        const existingConnections = await Connection.find({
            $or: [
                { user1: currentUser._id },
                { user2: currentUser._id }
            ]
        });

        // Extraire les IDs des utilisateurs déjà connectés/en attente
        const excludedUserIds = new Set([currentUser._id.toString()]);
        existingConnections.forEach(conn => {
            excludedUserIds.add(conn.user1.toString());
            excludedUserIds.add(conn.user2.toString());
        });

        // Convertir les IDs en ObjectId pour la requête
        const excludedObjectIds = Array.from(excludedUserIds).map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (err) {
                console.error('Invalid ObjectId:', id);
                return null;
            }
        }).filter(id => id !== null);

        // Compter le nombre d'utilisateurs disponibles
        const totalUsers = await employee.countDocuments({
            _id: { $nin: excludedObjectIds }
        });
        if (totalUsers === 0) {
            return res.json({ success: true, suggestions: [] });
        }

        // Déterminer le nombre de suggestions à récupérer (max 5, ou le nombre disponible)
        const sampleSize = Math.min(5, totalUsers);

        // Trouver les utilisateurs aléatoires
        let suggestions;
        try {
            // Utiliser aggregate avec $sample pour un échantillonnage aléatoire
            suggestions = await employee.aggregate([
                {
                    $match: {
                        _id: { $nin: excludedObjectIds }
                    }
                },
                { $sample: { size: sampleSize } },
                {
                    $project: {
                        _id: 1,
                        firstname: 1,
                        lastname: 1,
                        email: 1,
                        profileImagePath: 1,
                        experiences: 1
                    }
                }
            ]);
        } catch (aggregateError) {
            console.error('Aggregate error, using find as fallback:', aggregateError);
            // Fallback: utiliser find avec limit si aggregate échoue
            suggestions = await employee.find({
                _id: { $nin: excludedObjectIds }
            })
            .select('firstname lastname email profileImagePath experiences')
            .limit(sampleSize)
            .lean();
        }

        // Formatage
        const formattedSuggestions = suggestions.map(user => ({
            id: user._id.toString(),
            name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
            job: getUserJobTitle(user),
            avatar: user.profileImagePath || '../images/default-avatar.png',
            email: user.email
        }));

        res.json({ success: true, suggestions: formattedSuggestions });
    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Obtenir les invitations en attente (où l'utilisateur est le recipient)
export const getPendingInvitations = async (req, res) => {
    try {
        const { email } = req.query;
        const userEmail = email || req.session?.user?.email;
        
        if (!userEmail) {
            return res.status(400).json({ success: false, message: 'User email required' });
        }

        // Trouver l'utilisateur actuel
        const currentUser = await employee.findOne({ email: userEmail });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        //invitations où l'utilisateur est (recipient) et status = "pending"et où requestedBy n'est pas l'utilisateur actuel
        const invitations = await Connection.find({
            $or: [
                { user2: currentUser._id, status: 'pending', requestedBy: { $ne: currentUser._id } },
                { user1: currentUser._id, status: 'pending', requestedBy: { $ne: currentUser._id } }
            ]
        }).populate('requestedBy', 'firstname lastname email profileImagePath experiences')
          .populate('user1', 'firstname lastname email profileImagePath experiences')
          .populate('user2', 'firstname lastname email profileImagePath experiences');

        // Formater 
        const formattedInvitations = invitations.map(inv => {
            // L'utilisateur qui a envoyé la demande
            const requester = inv.requestedBy;
            return {
                id: inv._id.toString(),
                connectionId: inv._id.toString(),
                name: `${requester.firstname || ''} ${requester.lastname || ''}`.trim(),
                job: getUserJobTitle(requester),
                avatar: requester.profileImagePath || '../images/default-avatar.png',
                email: requester.email
            };
        });

        res.json({ success: true, invitations: formattedInvitations });
    } catch (error) {
        console.error('Error getting pending invitations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Obtenir les connexions acceptées
export const getConnections = async (req, res) => {
    try {
        const { email } = req.query;
        const userEmail = email || req.session?.user?.email;
        
        if (!userEmail) {
            return res.status(400).json({ success: false, message: 'User email required' });
        }
        const currentUser = await employee.findOne({ email: userEmail });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Trouver les connexions acceptées 
        const connections = await Connection.find({
            $or: [
                { user1: currentUser._id, status: 'accepted' },
                { user2: currentUser._id, status: 'accepted' }
            ]
        }).populate('user1', 'firstname lastname email profileImagePath experiences')
          .populate('user2', 'firstname lastname email profileImagePath experiences');

        // Formater les connexions (exclure l'utilisateur actuel)
        const formattedConnections = connections.map(conn => {
            // L'autre utilisateur
            const otherUser = conn.user1._id.toString() === currentUser._id.toString() 
                ? conn.user2 
                : conn.user1;
            
            return {
                id: conn._id.toString(),
                connectionId: conn._id.toString(),
                name: `${otherUser.firstname || ''} ${otherUser.lastname || ''}`.trim(),
                job: getUserJobTitle(otherUser),
                avatar: otherUser.profileImagePath || '../images/default-avatar.png',
                email: otherUser.email
            };
        });

        res.json({ success: true, connections: formattedConnections });
    } catch (error) {
        console.error('Error getting connections:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Envoyer une demande de connexion
export const sendConnectionRequest = async (req, res) => {
    try {
        const { email, recipientEmail } = req.body;
        const userEmail = email || req.session?.user?.email;
        
        if (!userEmail || !recipientEmail) {
            return res.status(400).json({ success: false, message: 'User email and recipient email required' });
        }

        // Trouver les utilisateurs
        const requester = await employee.findOne({ email: userEmail });
        const recipient = await employee.findOne({ email: recipientEmail });
        
        if (!requester || !recipient) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (requester._id.toString() === recipient._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
        }

        // Vérifier si une connexion existe déjà
        const existingConnection = await Connection.findOne({
            $or: [
                { user1: requester._id, user2: recipient._id },
                { user1: recipient._id, user2: requester._id }
            ]
        });

        if (existingConnection) {
            return res.status(400).json({ success: false, message: 'Connection already exists' });
        }

        // Créer la connexion (user1 doit être le plus petit ObjectId)
        const userId1 = requester._id < recipient._id ? requester._id : recipient._id;
        const userId2 = requester._id < recipient._id ? recipient._id : requester._id;

        const newConnection = await Connection.create({
            user1: userId1,
            user2: userId2,
            status: 'pending',
            requestedBy: requester._id
        });

        //notif 
        await createNotification(
            recipient._id,
            'connection_request',
            'New Connection Request',
            `${requester.firstname} ${requester.lastname} wants to connect with you`,
            requester._id,
            `/pages/network.html`
        );

        res.json({ success: true, message: 'Connection request sent', connection: newConnection });
    } catch (error) {
        console.error('Error sending connection request:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Connection already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Accepter une demande de connexion
export const acceptConnection = async (req, res) => {
    try {
        const { email, connectionId } = req.body;
        const userEmail = email || req.session?.user?.email;
        
        if (!userEmail || !connectionId) {
            return res.status(400).json({ success: false, message: 'User email and connection ID required' });
        }
        const currentUser = await employee.findOne({ email: userEmail });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection not found' });
        }

        // Vérifier que l'utilisateur est bien le recipient
        const isRecipient = connection.user1.toString() === currentUser._id.toString() || 
                           connection.user2.toString() === currentUser._id.toString();
        
        if (!isRecipient) {
            return res.status(403).json({ success: false, message: 'Not authorized to accept this connection' });
        }

        // Mettre à jour le statut
        connection.status = 'accepted';
        await connection.save();

        //notif
        const requesterId = connection.requestedBy;
        const requester = await employee.findById(requesterId);
        if (requester) {
            await createNotification(
                requesterId,
                'connection_accepted',
                'Connection Accepted',
                `${currentUser.firstname} ${currentUser.lastname} accepted your connection request`,
                currentUser._id,
                `/pages/network.html`
            );
        }

        res.json({ success: true, message: 'Connection accepted', connection });
    } catch (error) {
        console.error('Error accepting connection:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Refuser une demande de connexion
export const declineConnection = async (req, res) => {
    try {
        const { email, connectionId } = req.body;
        const userEmail = email || req.session?.user?.email;
        
        if (!userEmail || !connectionId) {
            return res.status(400).json({ success: false, message: 'User email and connection ID required' });
        }
        const currentUser = await employee.findOne({ email: userEmail });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection not found' });
        }
        const isRecipient = connection.user1.toString() === currentUser._id.toString() || 
                           connection.user2.toString() === currentUser._id.toString();
        
        if (!isRecipient) {
            return res.status(403).json({ success: false, message: 'Not authorized to decline this connection' });
        }

        // Supprimer la connexion 
        await Connection.findByIdAndDelete(connectionId);

        res.json({ success: true, message: 'Connection declined' });
    } catch (error) {
        console.error('Error declining connection:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Fonction utilitaire pour obtenir le titre du travail
function getUserJobTitle(user) {
    if (!user) return '';
    
    if (user.experiences && user.experiences.length > 0) {
        const firstExp = user.experiences[0];
        const jobTitle = firstExp.role || '';
        const company = firstExp.company || '';
        if (jobTitle && company) {
            return `${jobTitle} • ${company}`;
        } else if (jobTitle) {
            return jobTitle;
        } else if (company) {
            return company;
        }
    }
    return '';
}


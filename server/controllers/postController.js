import Post from '../models/post.js';

// Récupérer tous les posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 }) //  récents en premier
            .exec();
        
        return res.status(200).json({
            success: true,
            posts: posts
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des posts',
            error: error.message
        });
    }
};

// Créer un nouveau post (dans la base)
export const createPost = async (req, res) => {
    try {
        // Gérer les données selon le type de requête (JSON ou FormData)
        let { author, authorAvatar, postType, content, image, video, article, event } = req.body;
        
        // Si les données viennent de FormData, parser les objets JSON
        if (typeof article === 'string' && article) {
            try {
                article = JSON.parse(article);
            } catch (e) {
                article = null;
            }
        }
        
        if (typeof event === 'string' && event) {
            try {
                event = JSON.parse(event);
            } catch (e) {
                event = null;
            }
        }

        // Validation basique
        if (!author) {
            return res.status(400).json({
                success: false,
                message: 'Le nom de l\'auteur est requis'
            });
        }

        if (!postType || !['text', 'image', 'video', 'article', 'event'].includes(postType)) {
            return res.status(400).json({
                success: false,
                message: 'Type de post invalide'
            });
        }

        // Gérer l'image uploadée si présente
        let imagePath = image || '';
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        // Créer le post
        const postData = {
            author,
            authorAvatar: authorAvatar || '',
            postType,
            content: content || '',
            image: imagePath,
            video: video || '',
            likes: 0,
            comments: []
        };

        // Ajouter les données spécifiques selon le type
        if (postType === 'article' && article) {
            postData.article = article;
        }

        if (postType === 'event' && event) {
            postData.event = {
                ...event,
                date: event.date ? new Date(event.date) : new Date()
            };
        }

        const newPost = new Post(postData);
        await newPost.save();

        return res.status(201).json({
            success: true,
            message: 'Post créé avec succès',
            post: newPost
        });
    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du post',
            error: error.message
        });
    }
};

// Liker/Unliker un post
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post non trouvé'
            });
        }

        // Pour le moment, on incrémente simplement les likes
        // Plus tard, on pourra gérer les utilisateurs pour unliker, et voir qui a aimé
        post.likes = (post.likes || 0) + 1;
        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Like ajouté',
            likes: post.likes,
            liked: true
        });
    } catch (error) {
        console.error('Erreur lors du like:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du like',
            error: error.message
        });
    }
};

// Ajouter un commentaire
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, text } = req.body;

        if (!user || !text) {
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur et le texte du commentaire sont requis'
            });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post non trouvé'
            });
        }

        // Ajouter le commentaire
        post.comments.push({
            user,
            text,
            createdAt: new Date()
        });

        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Commentaire ajouté avec succès',
            post: post
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout du commentaire',
            error: error.message
        });
    }
};

// Récupérer un post par ID
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            post: post
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du post:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du post',
            error: error.message
        });
    }
};

// Modifier un post
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        let { content, image, video, article, event } = req.body;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post non trouvé'
            });
        }

        // Parser les objets JSON si nécessaire (FormData)
        if (typeof article === 'string' && article) {
            try {
                article = JSON.parse(article);
            } catch (e) {
                article = null;
            }
        }
        
        if (typeof event === 'string' && event) {
            try {
                event = JSON.parse(event);
            } catch (e) {
                event = null;
            }
        }

        // Mettre à jour les champs
        if (content !== undefined) post.content = content;
        
        // Gérer l'image uploadée si présente
        if (req.file) {
            post.image = `/uploads/${req.file.filename}`;
        } else if (image !== undefined) {
            post.image = image;
        }
        
        if (video !== undefined) post.video = video;
        
        // Mettre à jour selon le type de post
        if (post.postType === 'article' && article) {
            post.article = article;
        }
        
        if (post.postType === 'event' && event) {
            post.event = {
                ...post.event,
                ...event,
                date: event.date ? new Date(event.date) : (post.event?.date || new Date())
            };
        }

        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Post modifié avec succès',
            post: post
        });
    } catch (error) {
        console.error('Erreur lors de la modification du post:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du post',
            error: error.message
        });
    }
};

// Supprimer un post
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post non trouvé'
            });
        }

        await Post.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Post supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du post:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du post',
            error: error.message
        });
    }
};



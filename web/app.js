document.addEventListener('DOMContentLoaded', () => {
    const videoList = document.getElementById('videos');
    const searchBar = document.getElementById('search-bar');
    const videoPlayer = document.getElementById('video-player');
    const player = document.getElementById('player');
    const videoTitle = document.getElementById('video-title');
    const likeCount = document.getElementById('like-count');
    const releaseDate = document.getElementById('release-date');
    const commentsSection = document.getElementById('comments');
    const commentForm = document.getElementById('comment-form');
    const backButton = document.getElementById('back-button');
    const categoryTitle = document.getElementById('category-title');
    let ytPlayer;
    let currentVideoId;
    let likedVideos = new Set(); // Pour stocker les vidéos likées par l'utilisateur

    // Fonction pour afficher les vidéos
    const displayVideos = (videos, category) => {
        videoList.innerHTML = '';
        categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <h3>${video.title}</h3>
                <div class="video-actions">
                    <div class="like-section">
                        <i class="fas fa-heart like-button ${likedVideos.has(video._id) ? 'liked' : ''}" data-id="${video._id}"></i>
                        <span class="like-count">${video.likes}</span>
                    </div>
                    <i class="fas fa-comment comment-button" data-id="${video._id}"></i>
                </div>
                <p>${video.description}</p>
                <p>Date de sortie: ${new Date(video.date).toLocaleDateString()}</p>
                <button class="watch-button" data-url="${video.url}" data-title="${video.title}" data-id="${video._id}" data-likes="${video.likes}">Regarder la vidéo</button>
            `;
            videoList.appendChild(videoItem);
        });

        // Ajouter un écouteur d'événements aux boutons "Regarder la vidéo"
        document.querySelectorAll('.watch-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const videoUrl = event.target.getAttribute('data-url');
                const videoTitleText = event.target.getAttribute('data-title');
                const videoId = event.target.getAttribute('data-id');
                const videoLikes = event.target.getAttribute('data-likes');
                loadVideo(videoUrl, videoTitleText, videoId, videoLikes);
            });
        });

        // Ajouter un écouteur d'événements aux icônes de like
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const videoId = event.target.getAttribute('data-id');
                toggleLike(videoId, event.target);
            });
        });

        // Ajouter un écouteur d'événements aux icônes de commentaire
        document.querySelectorAll('.comment-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const videoId = event.target.getAttribute('data-id');
                showComments(videoId);
            });
        });
    };

    // Fonction pour charger et lire une vidéo
    const loadVideo = (videoUrl, videoTitleText, videoId, videoLikes) => {
        currentVideoId = videoId;
        const videoIdParam = getVideoId(videoUrl);
        videoTitle.textContent = videoTitleText;
        likeCount.textContent = videoLikes;
        releaseDate.textContent = new Date(video.date).toLocaleDateString();
        videoPlayer.style.display = 'block';
        videoList.style.display = 'none';

        if (ytPlayer) {
            ytPlayer.loadVideoById(videoIdParam);
        } else {
            ytPlayer = new YT.Player('player', {
                height: '360',
                width: '640',
                videoId: videoIdParam,
                playerVars: {
                    'playsinline': 1
                },
                events: {
                    'onReady': onPlayerReady
                }
            });
        }

        // Récupérer et afficher les commentaires
        fetch(`/api/videos/${videoId}`)
            .then(response => response.json())
            .then(video => {
                commentsSection.innerHTML = '';
                video.comments.forEach(comment => {
                    const commentItem = document.createElement('div');
                    commentItem.className = 'comment-item';
                    commentItem.innerHTML = `
                        <strong>${comment.username}:</strong> ${comment.text}
                    `;
                    commentsSection.appendChild(commentItem);
                });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des commentaires:', error);
            });
    };

    // Fonction pour basculer le like d'une vidéo
    const toggleLike = (videoId, likeButton) => {
        if (likedVideos.has(videoId)) {
            // Déliker la vidéo
            fetch(`/api/videos/unlike/${videoId}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(video => {
                likeButton.classList.remove('liked');
                likeButton.style.color = 'gray';
                likeButton.nextElementSibling.textContent = video.likes;
                likedVideos.delete(videoId);
            })
            .catch(error => {
                console.error('Erreur lors du délike de la vidéo:', error);
            });
        } else {
            // Liker la vidéo
            fetch(`/api/videos/like/${videoId}`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(video => {
                likeButton.classList.add('liked');
                likeButton.style.color = 'red';
                likeButton.nextElementSibling.textContent = video.likes;
                likedVideos.add(videoId);
            })
            .catch(error => {
                console.error('Erreur lors du like de la vidéo:', error);
            });
        }
    };

    // Fonction pour afficher les commentaires d'une vidéo
    const showComments = (videoId) => {
        fetch(`/api/videos/${videoId}`)
            .then(response => response.json())
            .then(video => {
                commentsSection.innerHTML = '';
                video.comments.forEach(comment => {
                    const commentItem = document.createElement('div');
                    commentItem.className = 'comment-item';
                    commentItem.innerHTML = `
                        <strong>${comment.username}:</strong> ${comment.text}
                    `;
                    commentsSection.appendChild(commentItem);
                });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des commentaires:', error);
            });
    };

    // Fonction pour extraire l'ID de la vidéo YouTube à partir de l'URL
    const getVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Fonction appelée lorsque le lecteur est prêt
    const onPlayerReady = (event) => {
        event.target.playVideo();
    };

    // Récupérer et afficher les vidéos tendances
    const fetchTrendingVideos = async () => {
        try {
            const response = await fetch('/api/videos/trending');
            const videos = await response.json();
            displayVideos(videos, 'tendance');
        } catch (error) {
            console.error('Erreur lors de la récupération des vidéos tendances:', error);
        }
    };

    // Récupérer et afficher les nouvelles vidéos
    const fetchNewVideos = async () => {
        try {
            const response = await fetch('/api/videos/new');
            const videos = await response.json();
            displayVideos(videos, 'nouveautés');
        } catch (error) {
            console.error('Erreur lors de la récupération des nouvelles vidéos:', error);
        }
    };

    // Récupérer et afficher les vidéos par catégorie
    const fetchVideosByCategory = async (category) => {
        try {
            const response = await fetch(`/api/videos/category/${category}`);
            const videos = await response.json();
            displayVideos(videos, category);
        } catch (error) {
            console.error('Erreur lors de la récupération des vidéos par catégorie:', error);
        }
    };

    // Gérer la recherche de vidéos
    searchBar.addEventListener('input', (event) => {
        const query = event.target.value;
        if (query) {
            fetch(`/api/videos/search?q=${query}`)
                .then(response => response.json())
                .then(videos => {
                    displayVideos(videos, 'résultats de recherche');
                })
                .catch(error => {
                    console.error('Erreur lors de la recherche des vidéos:', error);
                });
        } else {
            // Si la barre de recherche est vide, afficher les vidéos tendances
            fetchTrendingVideos();
        }
    });

    // Gérer le clic sur les boutons de catégorie
    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const category = event.target.getAttribute('data-category');
            if (category === 'trending') {
                fetchTrendingVideos();
            } else if (category === 'new') {
                fetchNewVideos();
            } else {
                fetchVideosByCategory(category);
            }
        });
    });

    // Gérer le like d'une vidéo
    likeButton.addEventListener('click', () => {
        fetch(`/api/videos/like/${currentVideoId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(video => {
            likeCount.textContent = video.likes;
        })
        .catch(error => {
            console.error('Erreur lors du like de la vidéo:', error);
        });
    });

    // Gérer l'ajout d'un commentaire
    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('comment-username').value;
        const text = document.getElementById('comment-text').value;

        fetch(`/api/videos/comment/${currentVideoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, text })
        })
        .then(response => response.json())
        .then(video => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.innerHTML = `
                <strong>${username}:</strong> ${text}
            `;
            commentsSection.appendChild(commentItem);
            commentForm.reset();
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
        });
    });

    // Gérer le retour à la liste des vidéos
    backButton.addEventListener('click', () => {
        location.reload();
    });

    // Afficher les vidéos tendances par défaut
    fetchTrendingVideos();
});

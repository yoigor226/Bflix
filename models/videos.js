const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: String,
    text: String,
    date: { 
        type: Date, 
        default: Date.now 
    }
});
const videoSchema = new mongoose.Schema({

    title: { 
        type: String, 
        required: true 
    },

    description: { 
        type: String, 
        required: true 
    },

    url: { 
        type: String, 
        required: true 
    },

    thumbnail: { 
        type: String, 
        required: true 
    },

    isFreemium: { 
        type: Boolean, 
        default: false 
    },

    category: { 
        type: String, 
        required: true 
    },

    likes: { 
        type: Number, 
        default: 0 
    },

    comments: [commentSchema],

    date: { 
        type: Date, 
        default: Date.now 
    }

});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

// src/_data/books.js
// This creates a global data file that can be accessed as {{ books }} in templates

module.exports = async function() {
    try {
        console.log("📚 Fetching books from external API...");

        // Use dynamic import for fetch
        let fetch;
        try {
            fetch = globalThis.fetch;
        } catch (e) {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        }

        const response = await fetch('https://raw.githubusercontent.com/swe/jsoncsvdata/refs/heads/master/books.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get raw text and clean it
        let rawText = await response.text();
        rawText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        const booksData = JSON.parse(rawText);

        console.log(`📖 Successfully fetched ${booksData.length} books from API`);

        return booksData;

    } catch (error) {
        console.error("❌ Error fetching books from API:", error.message);
        console.log("📝 Using fallback local data");

        // Fallback to local data if API fails
        return [
            {
                "title": "Alice's Adventures in Wonderland",
                "author": "Lewis Carroll",
                "category": "Fiction",
                "rating": 5,
                "year": 2024,
                "link": "/library/alice",
                "description": "A timeless classic that continues to captivate readers with its whimsical characters and imaginative storytelling. Carroll's wordplay and logic puzzles make this a book that rewards multiple readings."
            },
            {
                "title": "Peter Super Pan",
                "author": "J.M. Barrie",
                "category": "Fiction",
                "rating": 4,
                "year": 2024,
                "link": "/library/peterpan",
                "description": "The tale of the boy who wouldn't grow up remains as enchanting today as when it was first written. Barrie's exploration of childhood, imagination, and the inevitable passage of time feels both magical and melancholic."
            },
            {
                "title": "Atomic Habits",
                "author": "James Clear",
                "category": "Productivity",
                "rating": 4,
                "year": 2024,
                "link": "/library/atomic-habits",
                "description": "Actually practical advice about building good habits and breaking bad ones. Less fluff than most productivity books."
            },
            {
                "title": "The Design of Everyday Things",
                "author": "Don Norman",
                "category": "Design",
                "rating": 5,
                "year": 2024,
                "link": "/library/design-everyday-things",
                "description": "Essential reading for anyone who creates things that people use. Norman's principles of good design are timeless and applicable far beyond traditional product design."
            },
            {
                "title": "Deep Work",
                "author": "Cal Newport",
                "category": "Productivity",
                "rating": 4,
                "year": 2024,
                "link": "/library/deep-work",
                "description": "In our age of constant distraction, Newport makes a compelling case for the value of sustained, focused work. The strategies are practical and the philosophy is sound."
            }
        ];
    }
};
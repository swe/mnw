module.exports = function(eleventyConfig) {
    // A reusable filter for switching languages
    eleventyConfig.addFilter("switchLang", function(url, currentLang, targetLang) {
        if (targetLang === 'en') {
            // Remove the current language prefix if it exists
            const langPrefixRegex = new RegExp(`^/(${Object.keys(require('./src/_data/site.js').languages).join('|')})/`);
            url = url.replace(langPrefixRegex, '/');
        } else {
            // Add the target language prefix
            url = `/${targetLang}${url}`;
        }
        return url;
    });

    // Passthrough static files
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/favicon.ico");

    // Configure permalinks for English content to remove /en/ from URLs
    eleventyConfig.addGlobalData("eleventyComputed.permalink", function() {
        return (data) => {
            // If permalink is already set in frontmatter, use it
            if (data.permalink) {
                return data.permalink;
            }

            // Only process files from the en directory
            if (data.page.inputPath.includes('/en/')) {
                // Remove /en/ from the output path for English content
                const newPath = data.page.filePathStem.replace('/en/', '/');

                // Special handling for index.html - it should be at root
                if (newPath === '/index') {
                    return '/index.html';
                }

                // For other pages, add trailing slash
                return `${newPath}/`;
            }
            // Return undefined to use default permalink for other files
            return data.permalink;
        };
    });

    // Set up collections for each language
    const languages = ['en', 'sv', 'fr'];

    // LIBRARY COLLECTION - USING GLOBAL DATA
    eleventyConfig.addCollection("library", function(collectionApi) {
        // Get the books data that will be loaded from src/_data/books.js
        const allData = collectionApi.getAll();
        const booksData = allData.length > 0 ? allData[0].data.books : [];

        if (!booksData || booksData.length === 0) {
            console.log("⚠️  No books data found in global data");
            return [];
        }

        // Transform the data to match template expectations
        const books = booksData.map(book => ({
            data: {
                title: book.title,
                author: book.author,
                category: book.category,
                rating: book.rating,
                year: book.year,
                link: book.link,
                permalink: false
            },
            content: book.description || '',
            url: book.link || '#',
            inputPath: `virtual-book-${book.title.toLowerCase().replace(/\s+/g, '-')}`
        }));

        // Sort by year (descending), then by rating (descending), then by title
        return books.sort((a, b) => {
            const yearA = a.data.year || 0;
            const yearB = b.data.year || 0;
            if (yearB !== yearA) {
                return yearB - yearA;
            }

            const ratingA = a.data.rating || 0;
            const ratingB = b.data.rating || 0;
            if (ratingB !== ratingA) {
                return ratingB - ratingA;
            }

            return (a.data.title || '').localeCompare(b.data.title || '');
        });
    });

    // English collections (from /en/ directory but accessible at root)
    eleventyConfig.addCollection("blog_en", function(collectionApi) {
        return collectionApi
            .getFilteredByGlob("src/en/blog/*.md")
            .sort((a, b) => b.date - a.date);
    });

    eleventyConfig.addCollection("books_en", function(collectionApi) {
        return collectionApi
            .getFilteredByGlob("src/en/books/*.md")
            .sort((a, b) => (a.data.title || '').localeCompare(b.data.title || ''));
    });

    eleventyConfig.addCollection("banners_en", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/en/banners/*.md");
    });

    eleventyConfig.addCollection("photos_en", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/en/photos/*.md");
    });

    // Other language collections (with language prefix in URL)
    ['sv', 'fr'].forEach(lang => {
        eleventyConfig.addCollection(`blog_${lang}`, function(collectionApi) {
            return collectionApi
                .getFilteredByGlob(`src/${lang}/blog/*.md`)
                .sort((a, b) => b.date - a.date);
        });

        eleventyConfig.addCollection(`books_${lang}`, function(collectionApi) {
            return collectionApi
                .getFilteredByGlob(`src/${lang}/books/*.md`)
                .sort((a, b) => (a.data.title || '').localeCompare(b.data.title || ''));
        });

        eleventyConfig.addCollection(`banners_${lang}`, function(collectionApi) {
            return collectionApi.getFilteredByGlob(`src/${lang}/banners/*.md`);
        });

        eleventyConfig.addCollection(`photos_${lang}`, function(collectionApi) {
            return collectionApi.getFilteredByGlob(`src/${lang}/photos/*.md`);
        });
    });

    // Date filter for blog posts
    eleventyConfig.addFilter("dateFormat", function(date, locale = 'en') {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const localeMap = {
            'en': 'en-US',
            'sv': 'sv-SE',
            'fr': 'fr-FR'
        };

        return new Date(date).toLocaleDateString(localeMap[locale] || 'en-US', options);
    });

    // Basic date filter (for "now" and simple dates)
    eleventyConfig.addFilter("date", function(date, format = "Y-m-d") {
        const d = new Date(date === "now" ? new Date() : date);

        if (format === "Y-m-d") {
            return d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
        }
        if (format === "Y") {
            return d.getFullYear();
        }

        // Default to ISO string
        return d.toISOString().split('T')[0];
    });

    // Get current language from URL
    eleventyConfig.addFilter("getCurrentLang", function(url) {
        if (!url) return 'en';
        const match = url.match(/^\/([a-z]{2})\//);
        return match ? match[1] : 'en';
    });

    // Add missing keys filter for debugging
    eleventyConfig.addFilter("keys", function(obj) {
        return Object.keys(obj || {});
    });

    // LIBRARY-SPECIFIC FILTERS

    // Filter to get unique categories from books
    eleventyConfig.addFilter("getUniqueCategories", function(books) {
        const categories = new Set();
        books.forEach(book => {
            if (book.data.category) {
                categories.add(book.data.category);
            }
        });
        return Array.from(categories).sort();
    });

    // Filter to count books by category
    eleventyConfig.addFilter("countByCategory", function(books, category) {
        return books.filter(book =>
            book.data.category &&
            book.data.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase().replace(/\s+/g, '-')
        ).length;
    });

    // Filter to create category slug
    eleventyConfig.addFilter("categorySlug", function(category) {
        return category.toLowerCase().replace(/\s+/g, '-');
    });

    // Filter to get top categories by count
    eleventyConfig.addFilter("getTopCategories", function(books, limit = 5) {
        const categoryCount = {};

        // Count books per category
        books.forEach(book => {
            if (book.data.category) {
                const category = book.data.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        });

        // Sort by count (descending), then by name
        const sortedCategories = Object.entries(categoryCount)
            .sort(([nameA, countA], [nameB, countB]) => {
                if (countB !== countA) return countB - countA;
                return nameA.localeCompare(nameB);
            })
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));

        return sortedCategories;
    });

    // Filter to truncate text
    eleventyConfig.addFilter("truncate", function(text, length = 200) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    });

    // Filter to strip HTML tags
    eleventyConfig.addFilter("striptags", function(text) {
        return text.replace(/<[^>]*>/g, '');
    });

    // Filter to group books by year
    eleventyConfig.addFilter("groupByYear", function(books) {
        const yearGroups = {};
        books.forEach(book => {
            const year = book.data.year || new Date().getFullYear();
            if (!yearGroups[year]) {
                yearGroups[year] = [];
            }
            yearGroups[year].push(book);
        });
        return yearGroups;
    });

    // Filter to get books for a specific year
    eleventyConfig.addFilter("getBooksByYear", function(books, year) {
        return books.filter(book => book.data.year === parseInt(year));
    });

    // Markdown configuration
    const markdownIt = require("markdown-it");
    const markdownItOptions = {
        html: true,
        breaks: true,
        linkify: true
    };

    eleventyConfig.setLibrary("md", markdownIt(markdownItOptions));

    return {
        dir: {
            input: "src",
            output: "dist",
            includes: "_includes",
            data: "_data"
        },
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
};
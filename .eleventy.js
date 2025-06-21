module.exports = function(eleventyConfig) {
    // Copy assets to output
    eleventyConfig.addPassthroughCopy("src/assets");

    // Set up collections for each language
    const languages = ['en', 'sv', 'fr'];

    // English collections (at root level)
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

    // Other language collections (with language prefix)
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

    // Language switcher filter
    eleventyConfig.addFilter("switchLang", function(url, fromLang, toLang) {
        if (!url) return toLang === 'en' ? '/' : `/${toLang}/`;

        // Handle root URL for English
        if (fromLang === 'en' && url === '/') {
            return toLang === 'en' ? '/' : `/${toLang}/`;
        }

        // Handle switching from other languages to English
        if (toLang === 'en') {
            return url.replace(`/${fromLang}/`, '/');
        }

        // Handle switching from English to other languages
        if (fromLang === 'en') {
            return `/${toLang}${url === '/' ? '' : url}`;
        }

        // Handle switching between non-English languages
        return url.replace(`/${fromLang}/`, `/${toLang}/`);
    });

    // Get current language from URL
    eleventyConfig.addFilter("getCurrentLang", function(url) {
        if (!url) return 'en';
        const match = url.match(/^\/([a-z]{2})\//);
        return match ? match[1] : 'en';
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
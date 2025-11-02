document.addEventListener('DOMContentLoaded', function () {
    let currentResult = '';
    let adultContentConfirmed = sessionStorage.getItem('adultContentConfirmed') === 'true';
    let generalWarningAcknowledged = sessionStorage.getItem('generalWarningAcknowledged') === 'true';
    let pendingFormData = null;

    // Global function for spice meter
    window.updateSpiceDisplay = function (value) {
        document.getElementById('spiceDisplay').textContent = value;
        const warning = document.getElementById('spiceWarning');
        const maxOptions = document.getElementById('maxSpiceOptions');

        // Show warning for spice levels above 100
        if (value > 100) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }

        // Show max spice options only at 700
        if (value == 700) {
            maxOptions.style.display = 'block';
        } else {
            maxOptions.style.display = 'none';
            // Reset checkboxes when not at max
            document.getElementById('enableHorrorContent').checked = false;
            document.getElementById('enableExtremeAdultContent').checked = false;
        }
    };

    // Global functions for intensity sliders
    window.updateGenreIntensity = function (value) {
        document.getElementById('genreIntensityDisplay').textContent = value;
    };

    window.updateSubGenreIntensity = function (value) {
        document.getElementById('subGenreIntensityDisplay').textContent = value;
    };

    function showGeneralWarning() {
        const overlay = document.getElementById('generalWarningOverlay');
        if (!overlay) {
            console.error('General warning overlay not found in DOM');
            return;
        }
        overlay.style.display = 'flex';
        overlay.classList.add('show');
    }

    function acknowledgeGeneralWarning() {
        generalWarningAcknowledged = true;
        sessionStorage.setItem('generalWarningAcknowledged', 'true');
        const overlay = document.getElementById('generalWarningOverlay');
        if (!overlay) {
            console.error('General warning overlay not found in DOM');
            return;
        }
        overlay.style.display = 'none';
        overlay.classList.remove('show');
    }

    function showAdultWarning(formData) {
        pendingFormData = formData;
        const overlay = document.getElementById('adultWarningOverlay');
        if (!overlay) {
            console.error('Adult warning overlay not found in DOM');
            // Continue anyway if overlay is missing
            if (pendingFormData) {
                generateFanFictionContent(pendingFormData);
                pendingFormData = null;
            }
            return;
        }
        overlay.style.display = 'flex';
        overlay.classList.add('show');
    }

    function acceptAdultContent() {
        adultContentConfirmed = true;
        sessionStorage.setItem('adultContentConfirmed', 'true');
        const overlay = document.getElementById('adultWarningOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('show');
        }

        if (pendingFormData) {
            generateFanFictionContent(pendingFormData);
            pendingFormData = null;
        }
    }

    function declineAdultContent() {
        const overlay = document.getElementById('adultWarningOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('show');
        }
        pendingFormData = null;
    }

    // Make functions globally available for inline onclick handlers
    window.showGeneralWarning = showGeneralWarning;
    window.acknowledgeGeneralWarning = acknowledgeGeneralWarning;
    window.acceptAdultContent = acceptAdultContent;
    window.declineAdultContent = declineAdultContent;

    async function generateFanFiction() {
        const apiKey = document.getElementById('ai-key').value.trim();
        const aiProvider = document.getElementById('ai-provider').value;
        const character1 = document.getElementById('character1').value.trim();
        const character2 = document.getElementById('character2').value.trim();
        const sourceMedia1 = document.getElementById('sourceMedia1').value.trim();
        const sourceMedia2 = document.getElementById('sourceMedia2').value.trim();
        const genre = document.getElementById('genre').value;
        const subGenre = document.getElementById('subGenre').value;
        const genreIntensity = document.getElementById('genreIntensity').value;
        const subGenreIntensity = document.getElementById('subGenreIntensity').value;
        const contentLevel = document.getElementById('contentLevel').value;
        const spiceLevel = document.getElementById('spiceMeter').value;
        const storyLength = document.getElementById('storyLength').value;
        const perspective = document.getElementById('perspective').value;
        const setting = document.getElementById('setting').value.trim();
        const prompt = document.getElementById('prompt').value.trim();
        const includeInternalThoughts = document.getElementById('includeInternalThoughts').checked;
        const includeBackstory = document.getElementById('includeBackstory').checked;
        const includeDialogue = document.getElementById('includeDialogue').checked;
        const includeEmotions = document.getElementById('includeEmotions').checked;
        const includeWorldBuilding = document.getElementById('includeWorldBuilding').checked;
        const includeConflict = document.getElementById('includeConflict').checked;
        const includeForeshadowing = document.getElementById('includeForeshadowing').checked;
        const includeSymbolism = document.getElementById('includeSymbolism').checked;
        const enableHorrorContent = document.getElementById('enableHorrorContent').checked;
        const enableExtremeAdultContent = document.getElementById('enableExtremeAdultContent').checked;

        // Validation
        if (!utils.validateApiKey(apiKey, aiProvider)) {
            const providerNames = { openai: 'OpenAI', deepseek: 'DeepSeek', anthropic: 'Anthropic' };
            utils.showError(document.getElementById('errorDiv'), `Please enter a valid ${providerNames[aiProvider]} API key`);
            document.getElementById('errorDiv').style.display = 'block';
            return;
        }

        if (!character1 || !character2) {
            utils.showError(document.getElementById('errorDiv'), 'Please enter both character names');
            document.getElementById('errorDiv').style.display = 'block';
            return;
        }

        if (!genre) {
            utils.showError(document.getElementById('errorDiv'), 'Please select a primary genre');
            document.getElementById('errorDiv').style.display = 'block';
            return;
        }

        const formData = {
            character1, character2, sourceMedia1, sourceMedia2, genre, subGenre,
            genreIntensity, subGenreIntensity, contentLevel, spiceLevel,
            storyLength, perspective, setting, prompt, includeInternalThoughts, includeBackstory,
            includeDialogue, includeEmotions, includeWorldBuilding, includeConflict,
            includeForeshadowing, includeSymbolism, enableHorrorContent, enableExtremeAdultContent,
            apiKey, aiProvider
        };        // Check for adult content warning
        if (contentLevel === 'nsfw' && !adultContentConfirmed) {
            showAdultWarning(formData);
            return;
        }

        generateFanFictionContent(formData);
    }

    async function generateFanFictionContent(formData) {
        const { character1, character2, sourceMedia1, sourceMedia2, genre, subGenre,
            genreIntensity, subGenreIntensity, contentLevel, spiceLevel,
            storyLength, perspective, setting, prompt, includeInternalThoughts,
            includeBackstory, includeDialogue, includeEmotions, includeWorldBuilding,
            includeConflict, includeForeshadowing, includeSymbolism, enableHorrorContent,
            enableExtremeAdultContent, apiKey, aiProvider } = formData;

        // Show loading
        document.getElementById('errorDiv').style.display = 'none';
        document.getElementById('resultDiv').style.display = 'none';
        document.getElementById('loadingDiv').style.display = 'block';

        try {
            const lengthInstructions = {
                'very-short': '200-400 words',
                'short': '500-800 words',
                'medium': '1000-1500 words',
                'long': '2000-3000 words'
            };

            const perspectiveInstructions = {
                'third-limited': 'Use third person limited perspective, focusing primarily on one character\'s point of view',
                'third-omniscient': 'Use third person omniscient, showing multiple characters\' thoughts and perspectives',
                'first-person': 'Use first person narrative ("I") from one character\'s perspective',
                'alternating': 'Alternate between both characters\' perspectives throughout the story'
            };

            const genreNames = {
                'romance': 'Romance',
                'friendship': 'Friendship',
                'adventure': 'Adventure',
                'drama': 'Drama',
                'comedy': 'Comedy',
                'angst': 'Angst',
                'hurt-comfort': 'Hurt/Comfort',
                'enemies-to-lovers': 'Enemies to Lovers',
                'mystery': 'Mystery',
                'thriller': 'Thriller',
                'slice-of-life': 'Slice of Life',
                'alternate-universe': 'Alternate Universe'
            };

            const subGenreNames = {
                'slow-burn': 'Slow Burn',
                'enemies-to-friends': 'Enemies to Friends',
                'found-family': 'Found Family',
                'hurt-comfort': 'Hurt/Comfort',
                'mutual-pining': 'Mutual Pining',
                'fake-dating': 'Fake Dating/Relationship',
                'soulmates': 'Soulmates',
                'time-travel': 'Time Travel',
                'amnesia': 'Amnesia/Memory Loss',
                'bodyswap': 'Body Swap',
                'coffee-shop': 'Coffee Shop AU',
                'college': 'College/University AU',
                'royalty': 'Royalty AU',
                'supernatural': 'Supernatural AU',
                'dystopian': 'Dystopian/Post-Apocalyptic'
            };

            const getIntensityDescription = (intensity) => {
                const level = parseInt(intensity);
                if (level <= 2) return "very subtle and understated";
                if (level <= 4) return "mild and gentle";
                if (level <= 6) return "moderate and balanced";
                if (level <= 8) return "strong and prominent";
                return "extremely intense and overwhelming";
            };

            const contentInstructions = {
                'general': 'Keep content appropriate for all ages with no mature themes. All characters are portrayed in age-appropriate situations.',
                'teen': 'Include mild mature themes and occasional mild language, appropriate for teens. All characters are portrayed in age-appropriate situations.',
                'mature': 'Include mature themes, strong language, and adult situations but no explicit sexual content. IMPORTANT: All characters are depicted as adults (18+ years old). Regardless of their age in source material, portray them as mature adults in this story.',
                'nsfw': 'Include explicit adult content, sexual themes, and mature language. CRITICAL: All characters are depicted as adults (18+ years old). This is a story featuring adult versions of these characters. Explicitly portray all characters as mature, consenting adults regardless of their age in source material.'
            };

            // Spice level instructions (1-700 scale) - INTENSIFIED
            const getSpiceInstructions = (level) => {
                const spice = parseInt(level);
                if (spice <= 25) return "Keep content completely innocent and family-friendly. All characters act age-appropriately.";
                if (spice <= 50) return "Include very light romantic tension or mild emotional moments. Characters portrayed age-appropriately.";
                if (spice <= 100) return "Add gentle romance, hand-holding, light kissing, or mild action. Characters portrayed age-appropriately.";
                if (spice <= 175) return "Include passionate kissing, moderate romantic tension, or action sequences. All characters are portrayed as adults (18+).";
                if (spice <= 250) return "Feature heated romance, intense emotional scenes, suggestive content, or violence. IMPORTANT: All characters are explicitly portrayed as adults (18+ years old).";
                if (spice <= 350) return "Include explicit sexual tension, detailed romantic scenes, graphic violence, or dark themes. CRITICAL: All characters are adults (18+). Portray them as mature, consenting adults regardless of source material age.";
                if (spice <= 450) return "Feature graphic sexual content, intense violence, disturbing psychological themes, or explicit language. MANDATORY: All characters are explicitly adults (18+ years old). Make their adult status clear in descriptions and interactions.";
                if (spice <= 550) return "Include extremely explicit sexual scenes, brutal violence, horror elements, or deeply disturbing content. ABSOLUTE REQUIREMENT: All characters are adults (18+). Explicitly describe them as mature adults with adult bodies, adult reasoning, and adult consent.";
                if (spice <= 650) return "Feature intensely graphic sexual content, gratuitous violence, extreme psychological horror, or taboo themes. NON-NEGOTIABLE: All characters are portrayed as fully mature adults (18+ years old) with explicit adult characteristics and behaviors.";

                // Maximum level (700) with optional enhancements
                let maxInstructions = "Create maximum intensity content with extremely explicit sexual material, extreme graphic violence, deeply disturbing psychological horror, taboo relationships, and all content restrictions removed. ABSOLUTE MANDATE: All characters are adults (18+ years old) - portray them explicitly as mature, consenting adults with adult physical characteristics, adult decision-making, and adult sexuality. Make their adult status unmistakable in every description.";

                if (enableHorrorContent) {
                    maxInstructions += " HORROR ENHANCEMENT: Include graphic descriptions of violence, gore, disfigurement, torture, psychological trauma, body horror, grotesque imagery, and deeply disturbing scenes that could cause nightmares. Show explicit details of wounds, blood, dismemberment, and horrific transformations. All characters experiencing or perpetrating these acts are adults (18+).";
                }

                if (enableExtremeAdultContent) {
                    maxInstructions += " ADULT ENHANCEMENT: Include extremely detailed and graphic sexual descriptions, explicit anatomical details, prolonged intimate scenes, multiple sexual acts in vivid detail, unconventional sexual practices, and leave nothing to imagination. Describe every sensation, movement, and physical response in explicit detail. CRITICAL: All characters are consenting adults (18+) with mature adult bodies and adult sexuality.";
                }

                return maxInstructions;
            };

            const char1Source = sourceMedia1 ? ` from ${sourceMedia1}` : '';
            const char2Source = sourceMedia2 ? ` from ${sourceMedia2}` : '';
            const settingInfo = setting ? `\nSetting: ${setting}` : '';
            const promptInfo = prompt ? `\nSpecific scenario: ${prompt}` : '';

            // Build story elements instructions based on checkboxes
            let storyElements = [];
            if (includeInternalThoughts) storyElements.push('Include rich internal thoughts and emotional depth');
            if (includeBackstory) storyElements.push('Weave in relevant character backstory and past experiences');
            if (includeDialogue) storyElements.push('Feature engaging, character-appropriate dialogue');
            if (includeEmotions) storyElements.push('Emphasize emotional depth and character feelings');
            if (includeWorldBuilding) storyElements.push('Include detailed world-building and setting descriptions');
            if (includeConflict) storyElements.push('Incorporate meaningful conflict and character development');
            if (includeForeshadowing) storyElements.push('Add subtle foreshadowing and narrative tension');
            if (includeSymbolism) storyElements.push('Include symbolic themes and deeper meaning');

            const elementsInfo = storyElements.length > 0 ? `\nStory Elements: ${storyElements.join('. ')}.` : '';
            const spiceInstructions = getSpiceInstructions(spiceLevel);

            // Build genre and sub-genre information
            const genreInfo = `${genreNames[genre]} (intensity: ${getIntensityDescription(genreIntensity)})`;
            const subGenreInfo = subGenre ? ` with ${subGenreNames[subGenre]} elements (intensity: ${getIntensityDescription(subGenreIntensity)})` : '';

            // Add age verification reminder for mature content
            let ageVerification = '';
            if (contentLevel === 'mature' || contentLevel === 'nsfw' || spiceLevel > 175) {
                ageVerification = `\n\n🔞 CRITICAL AGE REQUIREMENT 🔞
All characters in this story are explicitly portrayed as adults (18+ years old). Regardless of their age in source material, they are mature, consenting adults in this narrative. When describing characters:
- Portray them with adult physical characteristics and maturity
- Show adult reasoning, decision-making, and emotional intelligence
- If intimate content is included, emphasize adult consent and adult sexuality
- Make their adult status clear through descriptions, actions, and dialogue`;
            }

            const systemPrompt = `You are a skilled creative writer specializing in fan fiction. Create an engaging ${genreNames[genre]} story featuring the specified characters.

CHARACTERS:
- ${character1}${char1Source}
- ${character2}${char2Source}

STORY REQUIREMENTS:
- Primary Genre: ${genreInfo}${subGenreInfo}
- Length: ${lengthInstructions[storyLength]}
- Perspective: ${perspectiveInstructions[perspective]}
- Content Level: ${contentInstructions[contentLevel]}
- Spice Level (${spiceLevel}/700): ${spiceInstructions}${settingInfo}${promptInfo}${elementsInfo}${ageVerification}

WRITING STYLE:
- Create vivid descriptions and authentic dialogue
- Show character development and emotional depth
- Build tension and engaging plot progression
- Stay true to character personalities while exploring new dynamics
- Follow the selected story elements for enhanced narrative quality

Write a complete, engaging story that brings these characters together in a meaningful way. Focus on quality storytelling with strong character interactions.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Write a ${genreNames[genre]} fan fiction story featuring ${character1} and ${character2}.` }
            ];

            const response = await apiManager.makeRequest(messages, {
                provider: aiProvider,
                apiKey: apiKey,
                max_completion_tokens: storyLength === 'long' ? 4000 : storyLength === 'medium' ? 2500 : 1500,
                temperature: 0.8
            });

            currentResult = response;

            // Convert to HTML and display
            const htmlContent = utils.formatMarkdown(response);
            document.getElementById('resultContent').innerHTML = `
                <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 107, 53, 0.3); margin-bottom: 15px;">
                    <div style="line-height: 1.7; color: #e0e0e0;">${htmlContent}</div>
                </div>
            `;

            // Show result
            document.getElementById('loadingDiv').style.display = 'none';
            document.getElementById('resultDiv').style.display = 'block';

            // Scroll to result
            document.getElementById('resultDiv').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error generating fan fiction:', error);
            document.getElementById('loadingDiv').style.display = 'none';
            utils.showError(document.getElementById('errorDiv'), error.message || 'Failed to generate fan fiction. Please check your API key and try again.');
            document.getElementById('errorDiv').style.display = 'block';
        }
    }

    async function generateVariation() {
        if (!currentResult) return;

        const character1 = document.getElementById('character1').value.trim();
        const character2 = document.getElementById('character2').value.trim();
        const genre = document.getElementById('genre').value;
        const contentLevel = document.getElementById('contentLevel').value;

        if (contentLevel === 'nsfw' && !adultContentConfirmed) {
            const formData = { /* simplified for variation */ };
            showAdultWarning(formData);
            return;
        }

        const apiKey = document.getElementById('ai-key').value.trim();
        const aiProvider = document.getElementById('ai-provider').value;

        document.getElementById('loadingDiv').style.display = 'block';

        try {
            const systemPrompt = `Create an alternative version of the fan fiction story featuring ${character1} and ${character2}. Use the same genre (${genre}) and content level but explore different plot developments, character interactions, or emotional angles.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Write a new variation of the ${genre} story with ${character1} and ${character2}.` }
            ];

            const response = await apiManager.makeRequest(messages, {
                provider: aiProvider,
                apiKey: apiKey,
                max_completion_tokens: 2000,
                temperature: 0.9
            });

            currentResult = response;
            const htmlContent = utils.formatMarkdown(response);
            document.getElementById('resultContent').innerHTML = `
                <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 107, 53, 0.3); margin-bottom: 15px;">
                    <div style="line-height: 1.7; color: #e0e0e0;">${htmlContent}</div>
                </div>
            `;

            document.getElementById('loadingDiv').style.display = 'none';
            document.getElementById('resultDiv').style.display = 'block';

        } catch (error) {
            console.error('Error generating variation:', error);
            document.getElementById('loadingDiv').style.display = 'none';
            utils.showError(document.getElementById('errorDiv'), error.message || 'Failed to generate variation. Please try again.');
            document.getElementById('errorDiv').style.display = 'block';
        }
    }

    function copyResult(event) {
        utils.copyToClipboard(currentResult).then(success => {
            if (success && event) {
                const button = event.target;
                const originalText = button.innerHTML;
                button.innerHTML = '✅ Copied!';
                button.style.background = 'linear-gradient(135deg, #44ff44, #66ff66)';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = 'linear-gradient(135deg, #28a745, #34ce57)';
                }, 2000);
            }
        });
    }

    function downloadResult(format) {
        const character1 = document.getElementById('character1').value || 'character1';
        const character2 = document.getElementById('character2').value || 'character2';
        const filename = `fanfiction_${character1.replace(/[^a-zA-Z0-9]/g, '_')}_${character2.replace(/[^a-zA-Z0-9]/g, '_')}_${utils.getCurrentTimestamp()}`;
        downloadManager.setContent(currentResult, 'markdown');
        downloadManager.download(format, filename);
    }

    function resetForm() {
        document.getElementById('resultDiv').style.display = 'none';
        document.getElementById('character1').value = '';
        document.getElementById('character2').value = '';
        document.getElementById('sourceMedia1').value = '';
        document.getElementById('sourceMedia2').value = '';
        document.getElementById('setting').value = '';
        document.getElementById('prompt').value = '';
        document.getElementById('genre').value = '';
        document.getElementById('subGenre').value = '';
        document.getElementById('genreIntensity').value = '5';
        document.getElementById('genreIntensityDisplay').textContent = '5';
        document.getElementById('subGenreIntensity').value = '5';
        document.getElementById('subGenreIntensityDisplay').textContent = '5';
        document.getElementById('contentLevel').value = 'general';
        document.getElementById('spiceMeter').value = '1';
        document.getElementById('spiceDisplay').textContent = '1';
        document.getElementById('spiceWarning').style.display = 'none';
        document.getElementById('maxSpiceOptions').style.display = 'none';
        document.getElementById('enableHorrorContent').checked = false;
        document.getElementById('enableExtremeAdultContent').checked = false;
        document.getElementById('storyLength').value = 'medium';
        document.getElementById('perspective').value = 'third-limited';
        document.getElementById('includeInternalThoughts').checked = true;
        document.getElementById('includeBackstory').checked = false;
        document.getElementById('includeDialogue').checked = true;
        document.getElementById('includeEmotions').checked = true;
        document.getElementById('includeWorldBuilding').checked = false;
        document.getElementById('includeConflict').checked = true;
        document.getElementById('includeForeshadowing').checked = false;
        document.getElementById('includeSymbolism').checked = false;
    }

    // Make functions globally available for onclick handlers
    window.generateFanFiction = generateFanFiction;
    window.generateVariation = generateVariation;
    window.copyResult = copyResult;
    window.downloadResult = downloadResult;
    window.resetForm = resetForm;
    window.acceptAdultContent = acceptAdultContent;
    window.declineAdultContent = declineAdultContent;
    window.acknowledgeGeneralWarning = acknowledgeGeneralWarning;

    // Show general warning on first visit (after all functions are defined)
    if (!generalWarningAcknowledged) {
        setTimeout(() => {
            showGeneralWarning();
        }, 100);
    }
});
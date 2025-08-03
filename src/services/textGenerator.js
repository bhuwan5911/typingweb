// 1. First, create a text generation service
// File: services/textGenerator.js

class TextGenerator {
  constructor() {
    // Hugging Face API endpoint (FREE)
    this.apiUrl = 'https://api-inference.huggingface.co/models/gpt2';
    // You can also use: 'microsoft/DialoGPT-medium' or 'EleutherAI/gpt-neo-125M'
    
    // Fallback texts in case API fails
    this.fallbackTexts = [
      "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
      "Technology continues to revolutionize our daily lives, creating new opportunities for communication, learning, and innovation across all industries.",
      // Add more fallback texts...
    ];

    this.prompts = [
      "Write about the importance of education in modern society",
      "Describe the beauty of nature and its impact on human wellbeing",
      "Explain how technology has changed communication",
      "Discuss the benefits of reading books regularly",
      "Write about the role of creativity in problem solving",
      "Describe the process of learning a new skill",
      "Explain the importance of time management",
      "Write about the benefits of physical exercise",
      "Discuss the impact of music on human emotions",
      "Describe the value of friendship in life",
      "Write about the importance of environmental conservation",
      "Explain how travel broadens our perspective",
      "Discuss the role of leadership in organizations",
      "Write about the benefits of healthy eating",
      "Describe the importance of goal setting"
    ];
  }

  async generateText() {
    try {
      // Get random prompt
      const randomPrompt = this.prompts[Math.floor(Math.random() * this.prompts.length)];
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No API key needed for Hugging Face Inference API (free tier)
        },
        body: JSON.stringify({
          inputs: randomPrompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      let generatedText = result[0]?.generated_text || '';
      
      // Clean and format the text
      generatedText = this.cleanText(generatedText, randomPrompt);
      
      // Ensure minimum length
      if (generatedText.length < 100) {
        return this.getFallbackText();
      }
      
      return generatedText;
      
    } catch (error) {
      console.error('Text generation failed:', error);
      return this.getFallbackText();
    }
  }

  cleanText(text, prompt) {
    // Remove the prompt from the beginning if it's included
    text = text.replace(prompt, '').trim();
    
    // Clean up the text
    text = text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,;:!?()-]/g, '') // Remove special characters
      .trim();

    // Ensure it ends with proper punctuation
    if (!/[.!?]$/.test(text)) {
      text += '.';
    }

    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);

    return text;
  }

  getFallbackText() {
    const randomIndex = Math.floor(Math.random() * this.fallbackTexts.length);
    return this.fallbackTexts[randomIndex];
  }

  // Alternative: Use a simpler template-based generator
  generateTemplateText() {
    const templates = [
      "The art of {skill} requires {quality1} and {quality2}, leading to {outcome} that benefits both individuals and society.",
      "Throughout history, {subject} has influenced {area} in ways that continue to {impact} our modern world.",
      "Learning about {topic} helps us understand {concept} while developing {ability} that serves us well in {context}.",
      "The relationship between {element1} and {element2} demonstrates how {principle} affects {result} in {field}.",
      "Modern {technology} has transformed {industry} by enabling {capability} and creating {opportunity} for {beneficiary}."
    ];

    const variables = {
      skill: ['cooking', 'photography', 'writing', 'music', 'programming', 'gardening'],
      quality1: ['patience', 'creativity', 'dedication', 'precision', 'passion'],
      quality2: ['practice', 'knowledge', 'perseverance', 'attention to detail', 'innovation'],
      outcome: ['mastery', 'fulfillment', 'success', 'recognition', 'personal growth'],
      subject: ['science', 'art', 'literature', 'philosophy', 'technology'],
      area: ['education', 'culture', 'society', 'communication', 'innovation'],
      impact: ['shape', 'transform', 'influence', 'improve', 'revolutionize'],
      topic: ['nature', 'psychology', 'economics', 'history', 'astronomy'],
      concept: ['relationships', 'patterns', 'principles', 'systems', 'processes'],
      ability: ['critical thinking', 'problem solving', 'communication', 'analysis', 'creativity'],
      context: ['daily life', 'professional settings', 'academic pursuits', 'personal relationships', 'community involvement']
    };

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with random values
    let result = template;
    Object.keys(variables).forEach(key => {
      const values = variables[key];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      result = result.replace(new RegExp(`{${key}}`, 'g'), randomValue);
    });

    return result;
  }
}

// 2. Integration with your TypingTest component
// Add this to your TypingTest.tsx

// Import the text generator
const textGenerator = new TextGenerator();

// Add loading state
const [isLoadingNewText, setIsLoadingNewText] = useState(false);

// Replace the changeText function with this:
const changeText = useCallback(async () => {
  setIsLoadingNewText(true);
  
  try {
    // Try to generate new text from API
    const newText = await textGenerator.generateText();
    
    setCurrentText(newText);
    
    // Reset the test with new text
    resetTest();
    
  } catch (error) {
    console.error('Failed to generate new text:', error);
    // Fallback to template generation
    const fallbackText = textGenerator.generateTemplateText();
    setCurrentText(fallbackText);
    resetTest();
  } finally {
    setIsLoadingNewText(false);
  }
}, [resetTest]);

// Update the button to show loading state
<button
  onClick={changeText}
  disabled={isLoadingNewText}
  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
    isLoadingNewText
      ? 'bg-gray-400 cursor-not-allowed'
      : darkMode 
        ? 'bg-white/10 text-white hover:bg-white/20' 
        : 'bg-white/20 text-white hover:bg-white/30'
  }`}
  title="Generate New Text"
>
  {isLoadingNewText ? (
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  ) : (
    <RefreshCw size={20} />
  )}
</button>

// 3. Alternative: Use multiple free APIs with fallback
const BACKUP_APIS = [
  {
    name: 'huggingface',
    url: 'https://api-inference.huggingface.co/models/gpt2',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    name: 'quotable',
    url: 'https://api.quotable.io/quotes/random?minLength=100',
    headers: {}
  }
  // Add more free APIs
];

const generateWithFallback = async () => {
  for (const api of BACKUP_APIS) {
    try {
      const response = await fetch(api.url, {
        method: 'POST',
        headers: api.headers,
        body: JSON.stringify({
          inputs: "Write a paragraph about learning and growth",
          parameters: { max_length: 150 }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data[0]?.generated_text || data.content || data[0]?.content;
      }
    } catch (error) {
      console.log(`${api.name} failed, trying next...`);
      continue;
    }
  }
  
  // Final fallback to template
  return textGenerator.generateTemplateText();
};
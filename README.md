# Kimi K2 Instruct Chat

A modern, full-stack web application with an intelligent chat interface powered by Groq's Kimi-K2 Instruct model, built with the latest technologies for 2025.

## 🚀 Tech Stack

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework (no config needed)
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[SQLite](https://www.sqlite.org/)** - Lightweight database for chat history
- **[Groq API](https://groq.com/)** - Ultra-fast AI inference platform
- **[Kimi-2 Instruct](https://console.groq.com/docs/model/moonshotai/kimi-k2-instruct)** - 1T parameter model with 128K context window

## ✨ Features

- 🤖 **Kimi K2 AI Assistant** - Powered by Groq's lightning-fast inference (~250 tokens/sec)
- 🎯 **General Purpose AI** - Help with programming, writing, problem-solving, and more
- 💾 **Persistent Chat History** - SQLite database stores all conversations
- 🔄 **Conversation Management** - Create, view, and delete chat sessions
- ⚡ **Ultra-Fast Responses** - Groq's optimized inference infrastructure
- 🎯 **128K Context Window** - Maintains long conversation context
- ⚡ **Zero Configuration** - Tailwind CSS v4 requires no config file
- 🎨 **Modern UI Components** - Pre-built shadcn/ui components
- 🌙 **Dark Mode Support** - Built-in theme switching with system detection
- 📱 **Responsive Design** - Mobile-first approach with sticky input
- 🔧 **TypeScript Ready** - Full type safety
- 🚀 **Performance Optimized** - Next.js 15 optimizations
- 🎨 **Groq Branding** - Beautiful Groq-themed UI design
- 📝 **Markdown Support** - Rich text rendering with syntax highlighting
- 📊 **Mermaid Diagrams** - Interactive diagram rendering
- 🚫 **LaTeX Notice** - Clear messaging for unsupported LaTeX content

## 🛠️ Installation

### Prerequisites

1. **Node.js 18+** installed
2. **Groq API Key** - Get one from [Groq Console](https://console.groq.com/keys)

### Setup Steps

1. **Clone or download the project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🤖 Kimi K2 Instruct Model

### Model Specifications
- **Parameters**: 1T (32B active)
- **Context Window**: 128K tokens
- **Output Tokens**: Up to 16K
- **Specialization**: Agentic intelligence, coding, reasoning, multi-step workflows
- **Speed**: ~250 tokens/second via Groq

### AI Assistant Capabilities
- **Programming Help** - Code assistance, debugging, best practices
- **Problem Solving** - Multi-step reasoning and analysis
- **Creative Writing** - Stories, articles, brainstorming
- **General Knowledge** - Questions on various topics
- **Explanations** - Complex concepts made simple
- **Task Assistance** - Planning, organization, productivity

### Chat Interface Features
- **Conversation History** - All chats saved automatically
- **Message Threading** - Maintains context across messages
- **Ultra-Fast Responses** - Groq's optimized inference
- **Conversation Management** - Create, delete conversations
- **Responsive Design** - Works on desktop and mobile
- **Dark Mode Toggle** - Light, dark, and system theme options
- **Sticky Input** - Chat input stays visible while scrolling
- **Groq Branding** - Beautiful orange-themed design
- **Markdown Rendering** - Code syntax highlighting and formatting
- **Mermaid Diagrams** - Interactive diagram support

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── chat/               # Chat endpoint (Groq integration)
│   │   └── conversations/      # Conversation management
│   ├── globals.css             # Global styles with Tailwind
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Chat interface page
├── components/                  # React components
│   ├── chat/                   # Chat-specific components
│   │   ├── ChatInterface.tsx   # Main chat component
│   │   ├── ChatMessage.tsx     # Message display
│   │   ├── ChatInput.tsx       # Message input
│   │   ├── ConversationSidebar.tsx # Sidebar
│   │   └── MermaidDiagram.tsx  # Mermaid diagram renderer
│   ├── theme/                  # Theme management
│   │   ├── ThemeProvider.tsx   # Theme context provider
│   │   └── ThemeToggle.tsx     # Dark mode toggle
│   └── ui/                     # shadcn/ui components
├── lib/                        # Utility functions
│   ├── database.ts             # SQLite database utilities
│   ├── ai-service.ts           # Groq + Kimi-2 integration
│   └── utils.ts                # shadcn utilities
├── public/                     # Static assets
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── chat.db                    # SQLite database (auto-created)
└── ...config files
```

## 🎨 Adding Components

Add new shadcn/ui components easily:

```bash
# Add specific components
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog

# List all available components
npx shadcn@latest add
```

## 🔧 Groq Configuration

### Environment Variables

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional
NODE_ENV=development
```

### Kimi K2 Model Configuration

In [`lib/ai-service.ts`](lib/ai-service.ts):

```typescript
const completion = await this.groq.chat.completions.create({
  model: 'moonshotai/kimi-k2-instruct', // Kimi K2 Instruct model
  messages,
  temperature: 0.6,                     // Adjust creativity (0.0-2.0)
  max_tokens: 4000,                     // Response length (up to 16K)
  top_p: 0.9,                          // Nucleus sampling
});
```

### Customizing AI Responses

Edit [`lib/ai-service.ts`](lib/ai-service.ts) to:
- Modify the system prompt
- Change AI model settings
- Adjust response length
- Add custom behavior

## 💾 Database

The application uses SQLite for persistent storage:

- **Conversations** - Chat session metadata
- **Messages** - Individual chat messages with full context
- **Automatic Schema** - Database tables created on first run

### Database Schema

```sql
-- Conversations table
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id)
);
```

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables** in Vercel dashboard:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. **Deploy automatically**

### Other Platforms

```bash
npm run build
npm run start
```

**Note:** Ensure SQLite is supported on your deployment platform, or migrate to PostgreSQL for production.

## 🌟 Why Groq + Kimi K2?

### Performance Benefits
- **Ultra-Fast Inference** - ~250 tokens/second
- **Low Latency** - Optimized hardware acceleration
- **Cost Effective** - Competitive pricing vs GPT-4/Claude
- **High Throughput** - Handles concurrent requests efficiently

### Model Advantages
- **Large Context** - 128K token window for long conversations
- **Coding Expertise** - Specialized in development tasks
- **Reasoning** - Strong multi-step problem solving
- **Multilingual** - Excellent language capabilities

## 🎯 Example Questions to Ask the AI

- "Help me debug this JavaScript function"
- "Explain how machine learning works"
- "Write a creative story about space exploration"
- "What are the best practices for React development?"
- "How can I optimize my daily workflow?"
- "Explain quantum computing in simple terms"
- "Help me plan a project timeline"

## 🔗 Useful Links

- [Groq Console](https://console.groq.com/) - API keys and documentation
- [Kimi K2 Model Docs](https://console.groq.com/docs/model/moonshotai/kimi-k2-instruct) - Model specifications
- [Groq SDK](https://github.com/groq/groq-typescript) - TypeScript SDK
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for ultra-fast AI inference
- [Moonshot AI](https://www.moonshot.cn/) for the Kimi K2 Instruct model
- [Next.js Team](https://nextjs.org/) for the amazing framework
- [Tailwind CSS Team](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn](https://twitter.com/shadcn) for the beautiful component library
- [Vercel](https://vercel.com/) for the deployment platform

---

**Happy chatting with lightning-fast AI! ⚡🎉**

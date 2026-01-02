<div align="center">
  <a target="_blank" href="https://llm7.io">
   <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=LLM7.io&fontSize=50&fontAlignY=35&animation=fadeIn&fontColor=FFFFFF&descAlignY=55&descAlign=62" alt="Telegram MCP Server" width="100%" />
  </a>
</div>

This repository contains the source code for the landing page of [LLM7.io](https://llm7.io), a free, open endpoint for accessing top LLMs (Large Language Models) without requiring heavy hardware.

## Overview

LLM7.io provides:
- **Free access** to powerful LLMs (GPT-4-like, DeepSeek, Mistral, etc.)
- **Zero-token access**: Use immediately without any credentials
- **Optional free tokens**: Get higher rate limits via [token.llm7.io](https://token.llm7.io)
- **OpenAI-compatible API** for seamless integration with existing tools

The landing page highlights the core features, usage instructions, and goals of the service.

## Features

- **Zero-barrier entry**: Start using LLMs instantly without tokens or API keys
- **Token-powered upgrades**: Free tokens for enhanced rate limits ([Get tokens](https://token.llm7.io))
- **Responsive design**: Clean layout showcasing LLM7.io's benefits
- **Quick start guides**: Python, Node.js, and CLI examples
- **Documentation links**: Jumpstart your LLM integration

## Getting Started (Local Development)

1. **Clone the Repo**  
   ```bash
   git clone https://github.com/chigwell/llm7.io.git
   ```
2. **Install Dependencies**  
   ```bash
   cd llm7.io
   npm install
   ```
3. **Run Development Server**  
   ```bash
   npm run dev
   ```
   Access at http://localhost:3000

4. **Production Build**  
   ```bash
   npm run build
   npm run start
   ```

## Using LLM7.io API
### Without tokens (Basic):
```python
import openai
client = openai.OpenAI(base_url="https://api.llm7.io/v1", api_key="unused")
response = client.chat.completions.create(model="gpt-4", messages=[...])
```

### With tokens (Enhanced limits):
```python
import openai
client = openai.OpenAI(
    base_url="https://api.llm7.io/v1",
    api_key="YOUR_FREE_TOKEN"  # Get from https://token.llm7.io
)
```

## Contributing
We welcome contributions! Please:
- Report bugs via GitHub issues
- Suggest features with use cases
- Submit PRs with clear descriptions

## Powered By

This project is made possible thanks to the generous support and infrastructure provided by:

<table>
  <tr>
    <td align="center">
      <a href="https://azure.microsoft.com/en-us/products/ai-foundry/models/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/240px-Microsoft_Azure.svg.png&h=48&output=webp" alt="Azure" /><br/>
        <sub><b>Azure</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://cloudflare.com/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=cdn.prod.website-files.com/6640cd28f51f13175e577c05/664e007b3edcb1f1cd6c7871_7a675b16-95cc-5699-bd72-d4ab79b979bf.svg&h=48&output=webp" alt="Cloudflare" /><br/>
        <sub><b>Cloudflare</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://deepseek.ai/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/deepseek-color.png&h=48&output=webp" alt="DeepSeek" /><br/>
        <sub><b>DeepSeek</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://ollama.com/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=ollama.com/public/ollama.png&h=48&output=webp" alt="LLaMA / Ollama" /><br/>
        <sub><b>LLaMA / Ollama</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://mistral.ai/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mistral_AI_logo_%282025%E2%80%93%29.svg/500px-Mistral_AI_logo_%282025%E2%80%93%29.svg.png&h=48&output=webp" alt="Mistral" /><br/>
        <sub><b>Mistral</b></sub>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://nebius.com/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=https://cdn-1.webcatalog.io/catalog/nebius/nebius-icon-filled-256.webp&w=48&output=webp" alt="Nebius" /><br/>
        <sub><b>Nebius</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.nebulablock.com/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=https://i.ibb.co/Y7MKnWfT/nebula-block-logo.jpg&w=48&output=webp" alt="Nebula Block" /><br/>
        <sub><b>Nebula Block</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://openai.com/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/6/66/OpenAI_logo_2025_%28symbol%29.svg/330px-OpenAI_logo_2025_%28symbol%29.svg.png&h=48&output=webp" alt="OpenAI" /><br/>
        <sub><b>OpenAI</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://pollinations.ai/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=avatars.githubusercontent.com/u/86964862&h=48&output=webp" alt="Pollinations" /><br/>
        <sub><b>Pollinations</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.scaleway.com/?utm_source=llm7.io&utm_medium=llm7.io" target="_blank">
        <img src="https://wsrv.nl/?url=avatars.githubusercontent.com/u/5185491&h=48&output=webp" alt="Scaleway" /><br/>
        <sub><b>Scaleway</b></sub>
      </a>
    </td>
  </tr>
</table>


## License

This project is licensed under the [GNU AFFERO GENERAL PUBLIC LICENSE](LICENSE). 


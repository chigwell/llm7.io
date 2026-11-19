<div align="center">
  <a target="_blank" href="https://llm7.io/?utm_source=github&utm_medium=readme">
   <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=LLM7.io&fontSize=50&fontAlignY=35&animation=fadeIn&fontColor=FFFFFF&descAlignY=55&descAlign=62" alt="LLM7.io" width="100%" />
  </a>
</div>

[LLM7.io](https://llm7.io) provides an OpenAI-compatible API for text, image, and video generation.

## Quickstart

Get an API token from [dash.llm7.io](https://dash.llm7.io).

### Python

Install the OpenAI SDK:

```bash
pip install openai
```

Create a chat completion:

```python
import openai

client = openai.OpenAI(
    base_url="https://api.llm7.io/v1",
    api_key="YOUR_LLM7_API_TOKEN",
)

response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "Tell me a short story."}],
)

print(response.choices[0].message.content)
```

### curl

```bash
curl https://api.llm7.io/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LLM7_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"default","messages":[{"role":"user","content":"Tell me a short story."}]}'
```

## Documentation

- [Quickstart](https://docs.llm7.io/quickstart)
- [Available models](https://docs.llm7.io/guides/models) and [Models API](https://docs.llm7.io/guides/models-api)
- [Image generation and edits](https://docs.llm7.io/guides/image-generation)
- [Video generation](https://docs.llm7.io/guides/video-generation)
- [Full documentation](https://docs.llm7.io/)

## License

[GNU Affero General Public License](LICENSE)

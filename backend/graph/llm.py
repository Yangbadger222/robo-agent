from langchain_openai import ChatOpenAI

from config import settings


def get_chat_llm(temperature: float = 0.2) -> ChatOpenAI:
    """Return a ChatOpenAI instance configured for the active LLM provider.

    DeepSeek exposes an OpenAI-compatible API, so we reuse ChatOpenAI
    with a different base_url and credentials when the provider is "deepseek".
    """
    provider = settings.llm_provider.lower()

    if provider == "deepseek":
        return ChatOpenAI(
            model=settings.deepseek_model,
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            temperature=temperature,
        )

    kwargs = dict(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=temperature,
    )
    if settings.openai_base_url:
        kwargs["base_url"] = settings.openai_base_url
    return ChatOpenAI(**kwargs)

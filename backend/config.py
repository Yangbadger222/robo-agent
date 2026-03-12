from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    llm_provider: str = "openai"  # "openai" or "deepseek"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_base_url: str = ""
    embedding_model: str = "text-embedding-3-small"

    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    deepseek_base_url: str = "https://api.deepseek.com"

    nexar_client_id: str = ""
    nexar_client_secret: str = ""
    chroma_persist_dir: str = "./chroma_data"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

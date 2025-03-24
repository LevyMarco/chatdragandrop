# bitrix24.py
import requests
import logging
from typing import Optional, Dict

class Bitrix24:
    def __init__(self, webhook_url: str, client_id: Optional[str] = None):
        self.webhook_url = webhook_url.rstrip('/')
        self.client_id = client_id
        self.logger = logging.getLogger(__name__)
        self.active_conversations: Dict[str, dict] = {}

    def send_message(self, dialog_id: str, message: str) -> bool:
        endpoint = f"{self.webhook_url}/imbot.message.add.json"
        payload = {
            "BOT_ID": self.client_id,
            "DIALOG_ID": dialog_id,
            "MESSAGE": message
        }

        try:
            response = requests.post(endpoint, json=payload, timeout=10)
            response.raise_for_status()
            return True
        except Exception as e:
            self.logger.error(f"Erro ao enviar mensagem: {str(e)}")
            return False

    def update_crm(self, entity_type: str, entity_id: int, fields: dict) -> bool:
        endpoint = f"{self.webhook_url}/crm.{entity_type}.update.json"
        payload = {
            "id": entity_id,
            "fields": fields
        }

        try:
            response = requests.post(endpoint, json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            self.logger.error(f"Erro ao atualizar CRM: {str(e)}")
            return False

    def create_crm_record(self, entity_type: str, fields: dict) -> dict:
        endpoint = f"{self.webhook_url}/crm.{entity_type}.add.json"

        try:
            response = requests.post(endpoint, json={"fields": fields})
            response.raise_for_status()
            return response.json()
        except Exception as e:
            self.logger.error(f"Erro ao criar registro: {str(e)}")
            return {}
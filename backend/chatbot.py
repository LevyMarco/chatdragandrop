# chatbot.py
import logging
import os
from bitrix24 import Bitrix24
import json  # Import para lidar com dados JSON nos nós

# Exemplo de import da OpenAI (caso use GPT):
# from openai import OpenAI

class FlowProcessor:
    """
    Classe responsável por processar um nó do fluxo (um de cada vez).
    A função process_flow, que faz a lógica de percorrer todos os nós,
    está em app.py. Aqui, processamos apenas um nó individual.
    """
    def __init__(self, bitrix: Bitrix24, openai_api_key: str = ''):
        self.bitrix = bitrix
        # Se quiser usar GPT, instancie a API (exemplo fictício):
        # self.openai = OpenAI(api_key=openai_api_key)
        self.openai_api_key = openai_api_key

    def process_node(self, node: dict, dialog_id: str):
        node_type = node.get('type')

        try:
            if node_type == 'message':
                return self.process_message_node(node, dialog_id)
            elif node_type == 'question':
                return self.process_question_node(node, dialog_id)
            elif node_type == 'media':
                return self.process_media_node(node, dialog_id)
            elif node_type == 'condition':
                return self.process_condition_node(node, dialog_id)
            elif node_type == 'api':
                return self.process_api_node(node)
            elif node_type == 'updateCRM':
                return self.process_update_crm(node)
            elif node_type == 'createRecord':
                return self.process_create_record(node)
            elif node_type == 'interval':
                return self.process_interval_node(node, dialog_id)
            elif node_type == 'chatgpt':
                return self.process_chatgpt_node(node, dialog_id)
            else:
                raise ValueError(f"Tipo de nó inválido: {node_type}")
        except Exception as e:
            logging.error(f"Erro ao processar nó: {str(e)}")
            return None

    def process_message_node(self, node, dialog_id):
        message = node['data'].get('content', '')
        return self.bitrix.send_message(dialog_id, message)

    def process_question_node(self, node, dialog_id):
        question = node['data'].get('question', '')
        options_list = node['data'].get('options',)
        if not options_list:
            options_text = ''
        else:
            options_text = "\n".join(f"- {opt}" for opt in options_list)

        full_message = f"{question}\n{options_text}"
        return self.bitrix.send_message(dialog_id, full_message)

    def process_media_node(self, node, dialog_id):
        url = node['data'].get('url')
        if url:
            return self.bitrix.send_message(dialog_id, f"[Mídia] {url}")
        return False

    def process_condition_node(self, node, dialog_id):
        """
        Exemplo de lógica de condição:
        Retorna True ou False para decidir qual 'sourceHandle' seguir.
        """
        condition_type = node['data'].get('conditionType')
        if condition_type == 'cadastro':
            field = node['data'].get('field')
            # Aqui você precisaria buscar informações do usuário/contato
            # no Bitrix24 para verificar o campo.
            logging.info(f"Condição de cadastro: verificar campo '{field}' (lógica não implementada).")
            return True # Placeholder
        elif condition_type == 'valor':
            comparison = node['data'].get('comparison')
            logging.info(f"Condição de valor: comparar '{comparison}' (lógica não implementada).")
            return True # Placeholder
        return True

    def process_api_node(self, node):
        """
        Implementar lógica para chamadas a API externas.
        """
        method = node['data'].get('method', 'GET')
        url = node['data'].get('url', '')
        headers_raw = node['data'].get('headers', '{}')
        body_raw = node['data'].get('body', '{}')

        try:
            headers = json.loads(headers_raw)
            body = json.loads(body_raw)
            logging.info(f"Chamando API: {method} {url} com headers {headers} e body {body}")
            # Implemente a chamada HTTP aqui usando requests ou outra biblioteca
            # Você pode precisar tratar diferentes métodos (GET, POST, PUT, DELETE)
            # e lidar com a resposta da API.
            return True # Placeholder
        except json.JSONDecodeError as e:
            logging.error(f"Erro ao decodificar JSON para headers ou body da API: {e}")
            return False
        except Exception as e:
            logging.error(f"Erro ao chamar API externa: {e}")
            return False

    def process_update_crm(self, node):
        entity_type = node['data'].get('entity', 'lead')
        entity_id = node['data'].get('entity_id') # Você precisará obter o ID do CRM de alguma forma
        field = node['data'].get('field', '')
        value = node['data'].get('value', '')

        if entity_id:
            return self.bitrix.update_crm(
                entity_type,
                int(entity_id),
                {field: value}
            )
        else:
            logging.warning(f"ID da entidade CRM não fornecido para atualização ({entity_type}).")
            return False

    def process_create_record(self, node):
        entity_type = node['data'].get('entity', 'lead')
        fields_raw = node['data'].get('fields', '{}')
        try:
            fields = json.loads(fields_raw)
            return self.bitrix.create_crm_record(entity_type, fields)
        except json.JSONDecodeError as e:
            logging.error(f"Erro ao decodificar JSON para campos de criação de registro: {e}")
            return False

    def process_interval_node(self, node, dialog_id):
        duration = node['data'].get('duration', 300) # Default para 5 minutos
        message = f"Aguardando {duration} segundos..."
        logging.info(message)
        import time
        time.sleep(int(duration))
        logging.info("Intervalo concluído.")
        return True # Não envia mensagem, apenas pausa a execução

    def process_chatgpt_node(self, node, dialog_id):
        api_key = node['data'].get('apiKey')
        instructions = node['data'].get('instructions')
        if not api_key or not instructions:
            logging.warning("API Key ou instruções do ChatGPT não fornecidas.")
            return False

        if not self.openai_api_key:
            logging.error("A chave da API da OpenAI não foi configurada no backend.")
            return False

        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": instructions}],
            )
            if response.choices:
                gpt_message = response.choices[0].message.content
                return self.bitrix.send_message(dialog_id, gpt_message)
            else:
                logging.warning("Resposta do ChatGPT vazia.")
                return False
        except ImportError:
            logging.error("A biblioteca 'openai' não está instalada. Instale com 'pip install openai'.")
            return False
        except Exception as e:
            logging.error(f"Erro ao chamar a API do ChatGPT: {e}")
            return False